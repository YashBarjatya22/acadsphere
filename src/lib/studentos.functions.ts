import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getDb, getSupabaseServerClient } from "./db.server";
import crypto from "node:crypto";

// Helper to check if a table exists in Supabase, else throw error to trigger SQLite fallback
async function executeWithFallback<T>(
  supabaseOp: () => Promise<{ data: T | null; error: any }>,
  sqliteOp: () => T
): Promise<T> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabaseOp();
      if (!error && data !== null) {
        return data;
      }
      if (error) {
        console.warn("[Supabase Query Error] Falling back to SQLite:", error.message);
      }
    } catch (e: any) {
      console.warn("[Supabase Call Exception] Falling back to SQLite:", e.message || e);
    }
  }
  return sqliteOp();
}

// 1. PROFILE & ROLE SIMULATOR
export const getProfileAndRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        return supabase.from("profiles").select("*").eq("id", userId).single();
      },
      () => {
        const stmt = db.prepare("SELECT * FROM profiles WHERE id = ?");
        const row = stmt.get(userId);
        if (!row) {
          // Create default profile
          const insert = db.prepare("INSERT INTO profiles (id, full_name, role) VALUES (?, ?, ?)");
          insert.run(userId, "Student User", "student");
          return { id: userId, full_name: "Student User", role: "student" };
        }
        return {
          id: row.id,
          full_name: row.full_name,
          degree: row.degree,
          target_role: row.target_role,
          role: row.role || "student",
          avatar_url: row.avatar_url,
        };
      }
    );
  });

export const updateProfileRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ role: z.enum(["student", "faculty", "admin"]) }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        return supabase.from("profiles").update({ role: data.role }).eq("id", userId).select().single();
      },
      () => {
        const stmt = db.prepare("UPDATE profiles SET role = ? WHERE id = ?");
        stmt.run(data.role, userId);
        return { ok: true, role: data.role };
      }
    );
  });

// 2. STUDENT REGISTRY (CRUD)
const StudentInputSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  department: z.string(),
  semester: z.string(),
  section: z.string(),
  cgpa: z.number().optional(),
  attendancePercentage: z.number().optional(),
});

export const listStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    search: z.string().optional(),
    department: z.string().optional(),
    semester: z.string().optional(),
  }).optional())
  .handler(async ({ data, context }) => {
    const db = getDb();
    const search = data?.search || "";
    const dept = data?.department || "";
    const sem = data?.semester || "";

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        let query = supabase.from("students").select(`
          *,
          profiles:id (full_name, avatar_url)
        `);
        if (dept) query = query.eq("department", dept);
        if (sem) query = query.eq("semester", sem);
        const { data: list, error } = await query;
        if (error) throw error;
        // Filter by name on client side if search is active
        let filtered = list || [];
        if (search) {
          filtered = filtered.filter((s: any) => 
            s.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.student_id?.toLowerCase().includes(search.toLowerCase())
          );
        }
        return filtered.map((s: any) => ({
          id: s.id,
          studentId: s.student_id,
          name: s.profiles?.full_name || "Unknown",
          phone: s.phone,
          department: s.department,
          semester: s.semester,
          section: s.section,
          cgpa: Number(s.cgpa || 0),
          attendancePercentage: Number(s.attendance_percentage || 100),
          avatarUrl: s.profiles?.avatar_url,
        }));
      },
      () => {
        let sql = `
          SELECT s.*, p.full_name, p.avatar_url 
          FROM students s
          JOIN profiles p ON s.id = p.id
          WHERE 1=1
        `;
        const params: any[] = [];
        if (dept) {
          sql += " AND s.department = ?";
          params.push(dept);
        }
        if (sem) {
          sql += " AND s.semester = ?";
          params.push(sem);
        }
        if (search) {
          sql += " AND (p.full_name LIKE ? OR s.student_id LIKE ?)";
          params.push(`%${search}%`, `%${search}%`);
        }

        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) || [];
        return rows.map((r: any) => ({
          id: r.id,
          studentId: r.student_id,
          name: r.full_name,
          phone: r.phone,
          department: r.department,
          semester: r.semester,
          section: r.section,
          cgpa: r.cgpa || 0,
          attendancePercentage: r.attendance_percentage || 100,
          avatarUrl: r.avatar_url,
        }));
      }
    );
  });

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(StudentInputSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const id = data.id || crypto.randomUUID();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        // Insert profile first (if not exists)
        await supabase.from("profiles").upsert({ id, full_name: data.name, role: "student" });
        const { data: res, error } = await supabase.from("students").insert({
          id,
          student_id: data.studentId,
          phone: data.phone,
          department: data.department,
          semester: data.semester,
          section: data.section,
          cgpa: data.cgpa || 0,
          attendance_percentage: data.attendancePercentage || 100,
        }).select().single();
        if (error) throw error;
        return res;
      },
      () => {
        // SQLite
        try {
          const profileStmt = db.prepare("INSERT OR IGNORE INTO profiles (id, full_name, role) VALUES (?, ?, 'student')");
          profileStmt.run(id, data.name);
          const studentStmt = db.prepare(`
            INSERT INTO students (id, student_id, phone, department, semester, section, cgpa, attendance_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          studentStmt.run(id, data.studentId, data.phone || "", data.department, data.semester, data.section, data.cgpa || 0, data.attendancePercentage || 100);
          return { id, success: true };
        } catch (e: any) {
          throw new Error(e.message || "Failed to create local student record");
        }
      }
    );
  });

export const updateStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(StudentInputSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    if (!data.id) throw new Error("Missing Student profile ID for update");

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        await supabase.from("profiles").update({ full_name: data.name }).eq("id", data.id);
        const { data: res, error } = await supabase.from("students").update({
          student_id: data.studentId,
          phone: data.phone,
          department: data.department,
          semester: data.semester,
          section: data.section,
          cgpa: data.cgpa,
          attendance_percentage: data.attendancePercentage,
        }).eq("id", data.id).select().single();
        if (error) throw error;
        return res;
      },
      () => {
        const pStmt = db.prepare("UPDATE profiles SET full_name = ? WHERE id = ?");
        pStmt.run(data.name, data.id);
        const sStmt = db.prepare(`
          UPDATE students 
          SET student_id = ?, phone = ?, department = ?, semester = ?, section = ?, cgpa = ?, attendance_percentage = ?
          WHERE id = ?
        `);
        sStmt.run(data.studentId, data.phone || "", data.department, data.semester, data.section, data.cgpa || 0, data.attendancePercentage || 100, data.id);
        return { id: data.id, success: true };
      }
    );
  });

export const deleteStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getDb();
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { error } = await supabase.from("students").delete().eq("id", data.id);
        if (error) throw error;
        return { success: true };
      },
      () => {
        const stmt = db.prepare("DELETE FROM students WHERE id = ?");
        stmt.run(data.id);
        return { success: true };
      }
    );
  });

// 3. SUBJECTS & ATTENDANCE MODULE
export const listSubjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const db = getDb();
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.from("subjects").select("*");
        if (error) throw error;
        return data || [];
      },
      () => {
        const stmt = db.prepare("SELECT * FROM subjects");
        const list = stmt.all() || [];
        if (list.length === 0) {
          // Seed standard subjects for testing if empty
          const seed = [
            { id: "sub1", name: "Database Management Systems", code: "CS301", semester: "Semester 6", department: "Computer Science" },
            { id: "sub2", name: "Operating Systems", code: "CS302", semester: "Semester 6", department: "Computer Science" },
            { id: "sub3", name: "Computer Networks", code: "CS303", semester: "Semester 6", department: "Computer Science" },
            { id: "sub4", name: "Artificial Intelligence", code: "CS304", semester: "Semester 6", department: "Computer Science" },
          ];
          const insert = db.prepare("INSERT INTO subjects (id, name, code, semester, department) VALUES (?, ?, ?, ?, ?)");
          for (const s of seed) {
            insert.run(s.id, s.name, s.code, s.semester, s.department);
          }
          return seed;
        }
        return list;
      }
    );
  });

export const markAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    records: z.array(z.object({
      studentId: z.string(),
      subjectId: z.string(),
      date: z.string(), // YYYY-MM-DD
      status: z.enum(["present", "absent", "late", "excused"]),
    }))
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const toInsert = data.records.map(r => ({
          student_id: r.studentId,
          subject_id: r.subjectId,
          date: r.date,
          status: r.status,
          marked_by: userId,
        }));
        const { data: res, error } = await supabase.from("attendance").upsert(toInsert, {
          onConflict: "student_id,subject_id,date"
        }).select();
        if (error) throw error;

        // Trigger updates on students overall attendance percentages
        for (const record of data.records) {
          const { data: att } = await supabase.from("attendance").select("status").eq("student_id", record.studentId);
          if (att) {
            const pres = att.filter((a: any) => a.status === "present" || a.status === "late").length;
            const percentage = Math.round((pres / att.length) * 100);
            await supabase.from("students").update({ attendance_percentage: percentage }).eq("id", record.studentId);
          }
        }
        return res;
      },
      () => {
        const insertStmt = db.prepare(`
          INSERT INTO attendance (id, student_id, subject_id, date, status, marked_by)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(student_id, subject_id, date) DO UPDATE SET status = excluded.status
        `);
        for (const r of data.records) {
          const aid = crypto.randomUUID();
          insertStmt.run(aid, r.studentId, r.subjectId, r.date, r.status, userId);

          // Update student percentage locally
          const checkStmt = db.prepare("SELECT status FROM attendance WHERE student_id = ?");
          const allStatus = checkStmt.all(r.studentId) || [];
          const present = allStatus.filter((s: any) => s.status === "present" || s.status === "late").length;
          const percentage = allStatus.length > 0 ? Math.round((present / allStatus.length) * 100) : 100;

          const updateStmt = db.prepare("UPDATE students SET attendance_percentage = ? WHERE id = ?");
          updateStmt.run(percentage, r.studentId);
        }
        return { success: true };
      }
    );
  });

export const listAttendanceLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ studentId: z.string().optional() }))
  .handler(async ({ data }) => {
    const db = getDb();
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        let query = supabase.from("attendance").select(`
          *,
          subjects:subject_id (name, code)
        `);
        if (data.studentId) query = query.eq("student_id", data.studentId);
        const { data: res, error } = await query.order("date", { ascending: false });
        if (error) throw error;
        return res.map((r: any) => ({
          id: r.id,
          studentId: r.student_id,
          subjectId: r.subject_id,
          subjectName: r.subjects?.name || "Unknown",
          subjectCode: r.subjects?.code || "",
          date: r.date,
          status: r.status,
        }));
      },
      () => {
        let sql = `
          SELECT a.*, s.name as subject_name, s.code as subject_code
          FROM attendance a
          JOIN subjects s ON a.subject_id = s.id
        `;
        const params: any[] = [];
        if (data.studentId) {
          sql += " WHERE a.student_id = ?";
          params.push(data.studentId);
        }
        sql += " ORDER BY a.date DESC";
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) || [];
        return rows.map((r: any) => ({
          id: r.id,
          studentId: r.student_id,
          subjectId: r.subject_id,
          subjectName: r.subject_name,
          subjectCode: r.subject_code,
          date: r.date,
          status: r.status,
        }));
      }
    );
  });

// 4. ASSIGNMENTS MODULE
export const listAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const db = getDb();
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.from("assignments").select(`
          *,
          subjects:subject_id (name, code)
        `).order("due_date", { ascending: true });
        if (error) throw error;
        return data.map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          subjectId: a.subject_id,
          subjectName: a.subjects?.name || "General",
          subjectCode: a.subjects?.code || "",
          dueDate: a.due_date,
          fileUrl: a.file_url,
          createdBy: a.created_by,
        }));
      },
      () => {
        const stmt = db.prepare(`
          SELECT a.*, s.name as subject_name, s.code as subject_code
          FROM assignments a
          LEFT JOIN subjects s ON a.subject_id = s.id
          ORDER BY a.due_date ASC
        `);
        const rows = stmt.all() || [];
        if (rows.length === 0) {
          // Seed mock assignments if empty
          const seed = [
            { id: "a1", title: "Normalization Practice Sheet", description: "Complete normalization up to BCNF for the given relational schemas.", subject_id: "sub1", due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), file_url: "" },
            { id: "a2", title: "CPU Scheduling Algorithms Simulation", description: "Write a program simulating SJF, FCFS and Round Robin scheduling algorithms.", subject_id: "sub2", due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), file_url: "" },
          ];
          const insert = db.prepare("INSERT INTO assignments (id, title, description, subject_id, due_date, file_url) VALUES (?, ?, ?, ?, ?, ?)");
          for (const a of seed) {
            insert.run(a.id, a.title, a.description, a.subject_id, a.due_date, a.file_url);
          }
          return seed.map(a => ({
            id: a.id,
            title: a.title,
            description: a.description,
            subjectId: a.subject_id,
            subjectName: a.id === "a1" ? "Database Management Systems" : "Operating Systems",
            subjectCode: a.id === "a1" ? "CS301" : "CS302",
            dueDate: a.due_date,
            fileUrl: a.file_url,
          }));
        }
        return rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          subjectId: r.subject_id,
          subjectName: r.subject_name || "General",
          subjectCode: r.subject_code || "",
          dueDate: r.due_date,
          fileUrl: r.file_url,
          createdBy: r.created_by,
        }));
      }
    );
  });

export const createAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    subjectId: z.string(),
    dueDate: z.string(),
    fileUrl: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const aid = crypto.randomUUID();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("assignments").insert({
          id: aid,
          title: data.title,
          description: data.description,
          subject_id: data.subjectId,
          due_date: data.dueDate,
          file_url: data.fileUrl,
          created_by: userId,
        }).select().single();
        if (error) throw error;

        // Auto trigger notifications for all students
        const { data: studs } = await supabase.from("students").select("id");
        if (studs) {
          const notices = studs.map((s: any) => ({
            user_id: s.id,
            title: "New Assignment Posted",
            content: `Assignment "${data.title}" was added. Due on ${new Date(data.dueDate).toLocaleString()}`,
            type: "assignment",
          }));
          await supabase.from("notifications").insert(notices);
        }
        return res;
      },
      () => {
        const stmt = db.prepare(`
          INSERT INTO assignments (id, title, description, subject_id, due_date, file_url, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(aid, data.title, data.description || "", data.subjectId, data.dueDate, data.fileUrl || "", userId);

        // Notify local students
        const sList = db.prepare("SELECT id FROM students").all() || [];
        const nStmt = db.prepare("INSERT INTO notifications (id, user_id, title, content, type) VALUES (?, ?, ?, ?, ?)");
        for (const s of sList) {
          nStmt.run(crypto.randomUUID(), s.id, "New Assignment Posted", `Assignment "${data.title}" was added.`, "assignment");
        }

        return { id: aid, success: true };
      }
    );
  });

export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ assignmentId: z.string().optional(), studentId: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const db = getDb();
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        let query = supabase.from("submissions").select(`
          *,
          profiles:student_id (full_name),
          assignments:assignment_id (title)
        `);
        if (data?.assignmentId) query = query.eq("assignment_id", data.assignmentId);
        if (data?.studentId) query = query.eq("student_id", data.studentId);
        const { data: res, error } = await query;
        if (error) throw error;
        return res.map((s: any) => ({
          id: s.id,
          assignmentId: s.assignment_id,
          assignmentTitle: s.assignments?.title || "",
          studentId: s.student_id,
          studentName: s.profiles?.full_name || "Unknown",
          submittedAt: s.submitted_at,
          fileUrl: s.file_url,
          grade: s.grade,
          feedback: s.feedback,
          status: s.status,
        }));
      },
      () => {
        let sql = `
          SELECT s.*, p.full_name as student_name, a.title as assignment_title
          FROM submissions s
          JOIN profiles p ON s.student_id = p.id
          JOIN assignments a ON s.assignment_id = a.id
          WHERE 1=1
        `;
        const params: any[] = [];
        if (data?.assignmentId) {
          sql += " AND s.assignment_id = ?";
          params.push(data.assignmentId);
        }
        if (data?.studentId) {
          sql += " AND s.student_id = ?";
          params.push(data.studentId);
        }
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) || [];
        return rows.map((r: any) => ({
          id: r.id,
          assignmentId: r.assignment_id,
          assignmentTitle: r.assignment_title,
          studentId: r.student_id,
          studentName: r.student_name,
          submittedAt: r.submitted_at,
          fileUrl: r.file_url,
          grade: r.grade,
          feedback: r.feedback,
          status: r.status,
        }));
      }
    );
  });

export const createSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    assignmentId: z.string(),
    fileUrl: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const subId = crypto.randomUUID();

    // Check if late
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: assign } = await supabase.from("assignments").select("due_date").eq("id", data.assignmentId).single();
        const isLate = assign ? new Date() > new Date(assign.due_date) : false;

        const { data: res, error } = await supabase.from("submissions").upsert({
          id: subId,
          assignment_id: data.assignmentId,
          student_id: userId,
          file_url: data.fileUrl || "simulated-upload.pdf",
          status: isLate ? "late" : "submitted",
        }, { onConflict: "assignment_id,student_id" }).select().single();
        if (error) throw error;
        return res;
      },
      () => {
        const assign = db.prepare("SELECT due_date FROM assignments WHERE id = ?").get(data.assignmentId);
        const isLate = assign ? new Date() > new Date(assign.due_date) : false;

        const stmt = db.prepare(`
          INSERT INTO submissions (id, assignment_id, student_id, file_url, status)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(assignment_id, student_id) DO UPDATE SET 
            file_url = excluded.file_url, 
            status = excluded.status,
            submitted_at = CURRENT_TIMESTAMP
        `);
        stmt.run(subId, data.assignmentId, userId, data.fileUrl || "simulated-upload.pdf", isLate ? "late" : "submitted");
        return { id: subId, success: true };
      }
    );
  });

export const gradeSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string(),
    grade: z.string(),
    feedback: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const db = getDb();
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("submissions").update({
          grade: data.grade,
          feedback: data.feedback,
          status: "graded",
        }).eq("id", data.id).select().single();
        if (error) throw error;

        // Notify student of grading
        if (res) {
          const { data: assign } = await supabase.from("assignments").select("title").eq("id", res.assignment_id).single();
          await supabase.from("notifications").insert({
            user_id: res.student_id,
            title: "Grade Released",
            content: `Your submission for "${assign?.title || "Assignment"}" has been graded: ${data.grade}`,
            type: "grade",
          });
        }
        return res;
      },
      () => {
        const stmt = db.prepare(`
          UPDATE submissions 
          SET grade = ?, feedback = ?, status = 'graded'
          WHERE id = ?
        `);
        stmt.run(data.grade, data.feedback || "", data.id);

        const sub = db.prepare("SELECT assignment_id, student_id FROM submissions WHERE id = ?").get(data.id);
        if (sub) {
          const assign = db.prepare("SELECT title FROM assignments WHERE id = ?").get(sub.assignment_id);
          db.prepare("INSERT INTO notifications (id, user_id, title, content, type) VALUES (?, ?, ?, ?, ?)")
            .run(crypto.randomUUID(), sub.student_id, "Grade Released", `Your submission for "${assign?.title || "Assignment"}" has been graded: ${data.grade}`, "grade");
        }
        return { id: data.id, success: true };
      }
    );
  });

// 5. NOTES & STUDY MATERIALS
export const listStudyMaterials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ subjectId: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        let query = supabase.from("study_materials").select(`
          *,
          subjects:subject_id (name, code),
          favorites (id)
        `);
        if (data?.subjectId) query = query.eq("subject_id", data.subjectId);
        const { data: list, error } = await query;
        if (error) throw error;

        // Map checks for favorites
        const { data: favs } = await supabase.from("favorites").select("material_id").eq("user_id", userId);
        const favIds = new Set((favs || []).map((f: any) => f.material_id));

        return list.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          subjectId: m.subject_id,
          subjectName: m.subjects?.name || "General",
          subjectCode: m.subjects?.code || "",
          fileUrl: m.file_url,
          uploadedBy: m.uploaded_by,
          category: m.category,
          isFavorite: favIds.has(m.id),
          createdAt: m.created_at,
        }));
      },
      () => {
        let sql = `
          SELECT m.*, s.name as subject_name, s.code as subject_code,
                 EXISTS(SELECT 1 FROM favorites f WHERE f.material_id = m.id AND f.user_id = ?) as is_favorite
          FROM study_materials m
          LEFT JOIN subjects s ON m.subject_id = s.id
        `;
        const params: any[] = [userId];
        if (data?.subjectId) {
          sql += " WHERE m.subject_id = ?";
          params.push(data.subjectId);
        }
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) || [];
        if (rows.length === 0) {
          // Seed standard notes if empty
          const seed = [
            { id: "note1", title: "Normalization in Relational Databases Lecture Notes", description: "Covers 1NF, 2NF, 3NF and BCNF with step-by-step examples.", subject_id: "sub1", file_url: "normalization-notes.pdf", category: "Lecture Slides" },
            { id: "note2", title: "CPU Scheduling Guide & Cheat Sheet", description: "Quick summary of Gantt charts, turn-around times, and scheduling algorithms.", subject_id: "sub2", file_url: "scheduling-guide.pdf", category: "Cheat Sheets" },
          ];
          const insert = db.prepare("INSERT INTO study_materials (id, title, description, subject_id, file_url, category) VALUES (?, ?, ?, ?, ?, ?)");
          for (const n of seed) {
            insert.run(n.id, n.title, n.description, n.subject_id, n.file_url, n.category);
          }
          return seed.map(n => ({
            id: n.id,
            title: n.title,
            description: n.description,
            subjectId: n.subject_id,
            subjectName: n.id === "note1" ? "Database Management Systems" : "Operating Systems",
            subjectCode: n.id === "note1" ? "CS301" : "CS302",
            fileUrl: n.file_url,
            category: n.category,
            isFavorite: false,
            createdAt: new Date().toISOString(),
          }));
        }
        return rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          subjectId: r.subject_id,
          subjectName: r.subject_name || "General",
          subjectCode: r.subject_code || "",
          fileUrl: r.file_url,
          uploadedBy: r.uploaded_by,
          category: r.category,
          isFavorite: Boolean(r.is_favorite),
          createdAt: r.created_at,
        }));
      }
    );
  });

export const createStudyMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    subjectId: z.string(),
    fileUrl: z.string(),
    category: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const mid = crypto.randomUUID();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("study_materials").insert({
          id: mid,
          title: data.title,
          description: data.description,
          subject_id: data.subjectId,
          file_url: data.fileUrl,
          uploaded_by: userId,
          category: data.category || "lecture",
        }).select().single();
        if (error) throw error;
        return res;
      },
      () => {
        const stmt = db.prepare(`
          INSERT INTO study_materials (id, title, description, subject_id, file_url, uploaded_by, category)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(mid, data.title, data.description || "", data.subjectId, data.fileUrl, userId, data.category || "lecture");
        return { id: mid, success: true };
      }
    );
  });

export const toggleFavoriteMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ materialId: z.string() }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: existing } = await supabase.from("favorites")
          .select("*")
          .eq("user_id", userId)
          .eq("material_id", data.materialId)
          .single();

        if (existing) {
          await supabase.from("favorites").delete().eq("id", existing.id);
          return { favorited: false };
        } else {
          await supabase.from("favorites").insert({
            user_id: userId,
            material_id: data.materialId,
          });
          return { favorited: true };
        }
      },
      () => {
        const stmt = db.prepare("SELECT id FROM favorites WHERE user_id = ? AND material_id = ?");
        const existing = stmt.get(userId, data.materialId);

        if (existing) {
          db.prepare("DELETE FROM favorites WHERE id = ?").run(existing.id);
          return { favorited: false };
        } else {
          const fid = crypto.randomUUID();
          db.prepare("INSERT INTO favorites (id, user_id, material_id) VALUES (?, ?, ?)")
            .run(fid, userId, data.materialId);
          return { favorited: true };
        }
      }
    );
  });

// 6. ANNOUNCEMENTS MODULE
export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const db = getDb();
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      },
      () => {
        const stmt = db.prepare("SELECT * FROM announcements ORDER BY created_at DESC");
        const list = stmt.all() || [];
        if (list.length === 0) {
          const seed = [
            { id: "not1", title: "Semester Practical Examinations Schedule", content: "The practical exams for CS301, CS302 and CS303 will be held from July 5th to July 10th. Check notices dashboard for timings.", priority: "high", category: "academic", created_at: new Date().toISOString() },
            { id: "not2", title: "Google Cloud Career Readiness Program Open", content: "Students in Sem 6 can apply for the cloud learning path. Complete modules to claim cert vouchers.", priority: "medium", category: "placement", created_at: new Date().toISOString() },
          ];
          const insert = db.prepare("INSERT INTO announcements (id, title, content, priority, category) VALUES (?, ?, ?, ?, ?)");
          for (const n of seed) {
            insert.run(n.id, n.title, n.content, n.priority, n.category);
          }
          return seed;
        }
        return list;
      }
    );
  });

export const createAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    priority: z.enum(["high", "medium", "low"]),
    category: z.enum(["academic", "event", "placement", "general"]),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const annId = crypto.randomUUID();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("announcements").insert({
          id: annId,
          title: data.title,
          content: data.content,
          priority: data.priority,
          category: data.category,
          created_by: userId,
        }).select().single();
        if (error) throw error;

        // Trigger notification to all users
        const { data: users } = await supabase.from("profiles").select("id");
        if (users) {
          const list = users.map((u: any) => ({
            user_id: u.id,
            title: `New Notice: ${data.title}`,
            content: data.content.slice(0, 100) + (data.content.length > 100 ? "..." : ""),
            type: "announcement",
          }));
          await supabase.from("notifications").insert(list);
        }
        return res;
      },
      () => {
        const stmt = db.prepare(`
          INSERT INTO announcements (id, title, content, priority, category, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(annId, data.title, data.content, data.priority, data.category, userId);

        const users = db.prepare("SELECT id FROM profiles").all() || [];
        const notStmt = db.prepare("INSERT INTO notifications (id, user_id, title, content, type) VALUES (?, ?, ?, ?, ?)");
        for (const u of users) {
          notStmt.run(crypto.randomUUID(), u.id, `New Notice: ${data.title}`, data.content.substring(0, 60), "announcement");
        }
        return { id: annId, success: true };
      }
    );
  });

// 7. NOTIFICATIONS
export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      },
      () => {
        const stmt = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
        return (stmt.all(userId) || []).map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          title: r.title,
          content: r.content,
          type: r.type,
          is_read: Boolean(r.is_read),
          created_at: r.created_at,
        }));
      }
    );
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("notifications")
          .update({ is_read: true })
          .eq("id", data.id)
          .eq("user_id", userId)
          .select();
        if (error) throw error;
        return res;
      },
      () => {
        const stmt = db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        stmt.run(data.id, userId);
        return { success: true };
      }
    );
  });

// 8. DYNAMIC TIMETABLE
export const getStudentTimetable = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.from("timetables").select("*").eq("student_id", userId);
        if (error) throw error;
        return data || [];
      },
      () => {
        const stmt = db.prepare("SELECT * FROM timetables WHERE student_id = ?");
        const list = stmt.all(userId) || [];
        if (list.length === 0) {
          // Prepopulate a sample timetable locally if none exists
          const sample = [
            { id: "t1", student_id: userId, day_of_week: "Monday", start_time: "09:00 AM", end_time: "10:30 AM", subject_name: "Database Management Systems", room: "Room 402" },
            { id: "t2", student_id: userId, day_of_week: "Monday", start_time: "11:00 AM", end_time: "12:30 PM", subject_name: "Operating Systems", room: "Lab 2" },
            { id: "t3", student_id: userId, day_of_week: "Tuesday", start_time: "09:00 AM", end_time: "10:30 AM", subject_name: "Computer Networks", room: "Room 402" },
            { id: "t4", student_id: userId, day_of_week: "Wednesday", start_time: "11:00 AM", end_time: "12:30 PM", subject_name: "Artificial Intelligence", room: "Seminar Hall" },
          ];
          const insert = db.prepare(`
            INSERT INTO timetables (id, student_id, day_of_week, start_time, end_time, subject_name, room)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          for (const item of sample) {
            insert.run(item.id, item.student_id, item.day_of_week, item.start_time, item.end_time, item.subject_name, item.room);
          }
          return sample;
        }
        return list;
      }
    );
  });

// 9. PLACEMENT TRACKER
export const listPlacements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.from("placements").select("*").eq("student_id", userId);
        if (error) throw error;
        return data || [];
      },
      () => {
        const stmt = db.prepare("SELECT * FROM placements WHERE student_id = ?");
        const list = stmt.all(userId) || [];
        if (list.length === 0) {
          const seed = [
            { id: "p1", student_id: userId, company: "Google", role: "Software Engineer Intern", status: "interviewing", applied_date: new Date().toISOString().split("T")[0], notes: "Completed Online Assessment. Technical interview scheduled next week." },
            { id: "p2", student_id: userId, company: "Stripe", role: "Frontend Developer", status: "applied", applied_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], notes: "Applied through referral. Resume under review." },
          ];
          const insert = db.prepare("INSERT INTO placements (id, student_id, company, role, status, applied_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
          for (const item of seed) {
            insert.run(item.id, item.student_id, item.company, item.role, item.status, item.applied_date, item.notes);
          }
          return seed;
        }
        return list;
      }
    );
  });

export const createPlacement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    company: z.string().min(1),
    role: z.string().min(1),
    status: z.enum(["applied", "interviewing", "offered", "rejected"]),
    notes: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const pid = crypto.randomUUID();
    const date = new Date().toISOString().split("T")[0];

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("placements").insert({
          id: pid,
          student_id: userId,
          company: data.company,
          role: data.role,
          status: data.status,
          applied_date: date,
          notes: data.notes,
        }).select().single();
        if (error) throw error;
        return res;
      },
      () => {
        const stmt = db.prepare(`
          INSERT INTO placements (id, student_id, company, role, status, applied_date, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(pid, userId, data.company, data.role, data.status, date, data.notes || "");
        return { id: pid, success: true };
      }
    );
  });

export const updatePlacement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string(),
    status: z.enum(["applied", "interviewing", "offered", "rejected"]),
    notes: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("placements").update({
          status: data.status,
          notes: data.notes,
        }).eq("id", data.id).eq("student_id", userId).select().single();
        if (error) throw error;
        return res;
      },
      () => {
        const stmt = db.prepare("UPDATE placements SET status = ?, notes = ? WHERE id = ? AND student_id = ?");
        stmt.run(data.status, data.notes || "", data.id, userId);
        return { id: data.id, success: true };
      }
    );
  });

// 10. ATS RESUME PROFILE
export const getResumeProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.from("resume_profiles").select("*").eq("id", userId).single();
        if (error) throw error;
        return data;
      },
      () => {
        const stmt = db.prepare("SELECT * FROM resume_profiles WHERE id = ?");
        const row = stmt.get(userId);
        if (!row) {
          return {
            id: userId,
            summary: "Aspiring computer science graduate with projects in web development and cloud systems.",
            skills: ["React", "TypeScript", "Node.js", "SQL", "Git"],
            education: JSON.stringify([
              { school: "State Technical University", degree: "Bachelor of Technology, CSE", year: "2023-2027" }
            ]),
            experience: JSON.stringify([
              { company: "Devcorp Systems", role: "Software Developer Intern", duration: "Summer 2025", points: "Assisted in building responsive frontend dashboards; improved load speeds by 15%." }
            ]),
            projects: JSON.stringify([
              { title: "StudentOS Academic Command Center", tech: "React, Vite, Node.js", description: "Built an AI-guided student dashboard assisting homework schedules." }
            ]),
            ats_score: 75,
            suggestions: JSON.stringify([
              "Add metrics to your experience items to highlight technical business impact.",
              "Incorporate more cloud-infrastructure related keywords like Docker or AWS."
            ]),
          };
        }
        return {
          id: row.id,
          summary: row.summary,
          skills: typeof row.skills === "string" ? JSON.parse(row.skills) : row.skills,
          education: typeof row.education === "string" ? JSON.parse(row.education) : row.education,
          experience: typeof row.experience === "string" ? JSON.parse(row.experience) : row.experience,
          projects: typeof row.projects === "string" ? JSON.parse(row.projects) : row.projects,
          ats_score: row.ats_score || 0,
          suggestions: typeof row.suggestions === "string" ? JSON.parse(row.suggestions) : row.suggestions,
        };
      }
    );
  });

export const saveResumeProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    summary: z.string(),
    skills: z.array(z.string()),
    education: z.array(z.object({ school: z.string(), degree: z.string(), year: z.string() })),
    experience: z.array(z.object({ company: z.string(), role: z.string(), duration: z.string(), points: z.string() })),
    projects: z.array(z.object({ title: z.string(), tech: z.string(), description: z.string() })),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    // Custom algorithm to calculate ATS score dynamically based on checklist completeness
    let score = 55;
    const suggestions: string[] = [];

    if (data.summary.length > 100) score += 10;
    else suggestions.push("Extend summary description beyond 100 characters to state professional interests.");

    if (data.skills.length >= 6) score += 10;
    else suggestions.push("List at least 6 technical skills to optimize search indexing matching.");

    if (data.experience.length > 0) {
      score += 15;
      const pointsStr = data.experience.map(e => e.points).join(" ");
      if (/\d+%/.test(pointsStr) || /saved|reduced|optimized|built/i.test(pointsStr)) {
        score += 10;
      } else {
        suggestions.push("Describe experiences with key action verbs (e.g. 'Optimized', 'Architected') and measurable achievements (e.g. 'improved efficiency by 20%').");
      }
    } else {
      suggestions.push("Add a work history block to establish career experience.");
    }

    if (data.projects.length >= 2) score += 10;
    else suggestions.push("List at least 2 software projects showing real-world application building skills.");

    score = Math.min(100, score);

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("resume_profiles").upsert({
          id: userId,
          summary: data.summary,
          skills: data.skills,
          education: data.education,
          experience: data.experience,
          projects: data.projects,
          ats_score: score,
          suggestions,
        }).select().single();
        if (error) throw error;
        return res;
      },
      () => {
        const stmt = db.prepare(`
          INSERT INTO resume_profiles (id, summary, skills, education, experience, projects, ats_score, suggestions)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET 
            summary = excluded.summary,
            skills = excluded.skills,
            education = excluded.education,
            experience = excluded.experience,
            projects = excluded.projects,
            ats_score = excluded.ats_score,
            suggestions = excluded.suggestions
        `);
        stmt.run(
          userId,
          data.summary,
          JSON.stringify(data.skills),
          JSON.stringify(data.education),
          JSON.stringify(data.experience),
          JSON.stringify(data.projects),
          score,
          JSON.stringify(suggestions)
        );
        return { success: true, atsScore: score, suggestions };
      }
    );
  });

// 11. POMODORO FOCUS LOG
export const logActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    type: z.string(),
    duration: z.number(), // in minutes
    details: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const lid = crypto.randomUUID();

    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: res, error } = await supabase.from("student_activity_logs").insert({
          id: lid,
          user_id: userId,
          activity_type: data.type,
          duration_minutes: data.duration,
          details: data.details,
        }).select().single();
        if (error) throw error;

        // Auto trigger streak update checks locally / in public profiles
        return res;
      },
      () => {
        const stmt = db.prepare(`
          INSERT INTO student_activity_logs (id, user_id, activity_type, duration_minutes, details)
          VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(lid, userId, data.type, data.duration, data.details || "");
        return { success: true };
      }
    );
  });

// 12. UNIFIED DASHBOARD ANALYTICS
export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();

    // Gathers statistics across all tables to present beautiful dashboards
    return executeWithFallback(
      async () => {
        const supabase = getSupabaseServerClient();
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
        const role = profile?.role || "student";

        // Student Specific details
        const { data: student } = await supabase.from("students").select("*").eq("id", userId).maybeSingle();
        const { data: schedule } = await supabase.from("timetables").select("*").eq("student_id", userId);
        const { data: submiss } = await supabase.from("submissions").select("*").eq("student_id", userId);
        const { data: activeLogs } = await supabase.from("student_activity_logs").select("*").eq("user_id", userId);

        // Class distribution lists (Admin / Faculty)
        const { count: totalStudents } = await supabase.from("students").select("*", { count: "exact", head: true });
        const { count: totalFaculty } = await supabase.from("faculty").select("*", { count: "exact", head: true });
        const { data: allStuds } = await supabase.from("students").select("department, attendance_percentage, cgpa");

        return calculateDashboardPayload(role, student, schedule, submiss, activeLogs, totalStudents || 0, totalFaculty || 0, allStuds || []);
      },
      () => {
        const profile = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId);
        const role = profile?.role || "student";

        const student = db.prepare("SELECT * FROM students WHERE id = ?").get(userId);
        const schedule = db.prepare("SELECT * FROM timetables WHERE student_id = ?").all(userId) || [];
        const submiss = db.prepare("SELECT * FROM submissions WHERE student_id = ?").all(userId) || [];
        const activeLogs = db.prepare("SELECT * FROM student_activity_logs WHERE user_id = ?").all(userId) || [];

        const totalStudents = (db.prepare("SELECT COUNT(*) as count FROM students").get() || { count: 0 }).count;
        const totalFaculty = (db.prepare("SELECT COUNT(*) as count FROM faculty").get() || { count: 0 }).count;
        const allStuds = db.prepare("SELECT department, attendance_percentage, cgpa FROM students").all() || [];

        return calculateDashboardPayload(role, student, schedule, submiss, activeLogs, totalStudents, totalFaculty, allStuds);
      }
    );
  });

// Core logic to process raw metrics into dashboard objects
function calculateDashboardPayload(
  role: string,
  student: any,
  schedule: any[],
  submiss: any[],
  activeLogs: any[],
  totalStudents: number,
  totalFaculty: number,
  allStudentsList: any[]
) {
  // Streaks & focus hours
  const pomodoros = activeLogs.filter(l => l.activity_type === "pomodoro" || l.activity_type === "study_session");
  const focusMinutes = pomodoros.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
  const studyStreak = activeLogs.filter(l => l.activity_type === "study_streak").length || 12;

  // Grade logs
  const grades = submiss.filter(s => s.grade).map(s => {
    const map: Record<string, number> = { "A+": 10, "A": 9, "B": 8, "C": 7, "D": 6, "F": 0 };
    return map[s.grade] !== undefined ? map[s.grade] : 8;
  });
  const avgGradePoint = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : "8.5";

  // Timetable
  const todayClasses = schedule.length > 0 ? schedule.slice(0, 3).map(s => ({
    time: `${s.start_time} - ${s.end_time}`,
    subject: s.subject_name,
    room: s.room || "Room 101",
  })) : [
    { time: "09:00 AM - 10:30 AM", subject: "Database Management Systems", room: "Room 402" },
    { time: "11:00 AM - 12:30 PM", subject: "Operating Systems", room: "Lab 2" },
  ];

  // Placements and applications count
  const mockPlacements = [
    { company: "Google", role: "SWE", status: "interviewing" },
    { company: "Stripe", role: "Frontend", status: "applied" }
  ];

  // Calculate department distributions
  const depts: Record<string, { count: number; sumGpa: number; sumAtt: number }> = {};
  allStudentsList.forEach(s => {
    const d = s.department || "Computer Science";
    if (!depts[d]) depts[d] = { count: 0, sumGpa: 0, sumAtt: 0 };
    depts[d].count += 1;
    depts[d].sumGpa += Number(s.cgpa || 0);
    depts[d].sumAtt += Number(s.attendance_percentage || 0);
  });

  const departmentAnalytics = Object.keys(depts).map(d => ({
    department: d,
    studentsCount: depts[d].count,
    avgCgpa: Number((depts[d].sumGpa / depts[d].count).toFixed(2)),
    avgAttendance: Number((depts[d].sumAtt / depts[d].count).toFixed(1)),
  }));

  if (departmentAnalytics.length === 0) {
    departmentAnalytics.push(
      { department: "Computer Science", studentsCount: Math.max(1, totalStudents), avgCgpa: 8.4, avgAttendance: 85.5 },
      { department: "Information Technology", studentsCount: 0, avgCgpa: 7.9, avgAttendance: 80.2 }
    );
  }

  // Activity stream logs
  const activityLogs = activeLogs.slice(0, 5).map(l => ({
    id: l.id,
    type: l.activity_type,
    time: l.created_at || new Date().toISOString(),
    details: l.details || `Logged ${l.duration_minutes} minutes study session`,
  }));
  if (activityLogs.length === 0) {
    activityLogs.push(
      { id: "log1", type: "study_streak", time: new Date().toISOString(), details: "Maintained 12-day study streak" },
      { id: "log2", type: "pomodoro", time: new Date(Date.now() - 3600000).toISOString(), details: "Completed 25m study slot: Normalization theory" }
    );
  }

  return {
    role,
    gpa: student?.cgpa || 8.64,
    attendance: student?.attendance_percentage || 88.5,
    streak: studyStreak,
    focusHours: Number((focusMinutes / 60).toFixed(1)),
    avgGradePoint: Number(avgGradePoint),
    todayClasses,
    placements: mockPlacements,
    activityLogs,
    // Admin metrics
    systemMetrics: {
      totalStudents: totalStudents || 24,
      totalFaculty: totalFaculty || 8,
      activeUsersDaily: Math.max(2, Math.round(totalStudents * 0.4)),
      systemUptime: "99.98%",
      departmentAnalytics,
    }
  };
}
