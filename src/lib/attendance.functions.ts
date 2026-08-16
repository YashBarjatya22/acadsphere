import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Dynamic server-side DB accessor to prevent node:sqlite leakage into browser bundle
async function getServerDb() {
  try {
    const { getDb } = await import("./db.server");
    return getDb();
  } catch (err) {
    console.error("[attendance.functions] Failed to load server db:", err);
    return null;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface SubjectAttendance {
  id: string;
  name: string;
  code: string;
  attended: number;
  conducted: number;
  percentage: number;
  status: "Excellent" | "Safe" | "Warning" | "Critical";
  statusColor: "green" | "blue" | "yellow" | "red";
  safeBunks: number;
  recoveryNeeded: number;
  aiSuggestion: string;
  trend: Array<{ classNum: number; percentage: number }>;
  predictions: {
    miss1: number;
    miss2: number;
    miss3: number;
    attend1: number;
    attend3: number;
    attend5: number;
  };
}

export interface AttendanceNotification {
  id: string;
  studentId: string;
  subjectId?: string;
  subjectName?: string;
  threshold: number;
  level: "warning" | "critical" | "restored" | "recovery";
  message: string;
  sentAt: string;
  isRead: boolean;
  lastPercentage: number;
}

export interface AttendanceDashboardData {
  overall: {
    percentage: number;
    totalAttended: number;
    totalConducted: number;
    requiredFor75: number;
    safeMissesCount: number;
    status: "Excellent" | "Safe" | "Warning" | "Critical";
    statusColor: "green" | "blue" | "yellow" | "red";
    subjectsAtRiskCount: number;
    criticalSubjectsCount: number;
  };
  subjects: SubjectAttendance[];
  notifications: AttendanceNotification[];
  recentLogs: Array<{
    id: string;
    subjectName: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
  }>;
}

// ─── Helper Functions ───────────────────────────────────────────────────────
function calculateStatus(pct: number): {
  status: "Excellent" | "Safe" | "Warning" | "Critical";
  color: "green" | "blue" | "yellow" | "red";
} {
  if (pct >= 90) return { status: "Excellent", color: "green" };
  if (pct >= 85) return { status: "Safe", color: "blue" };
  if (pct >= 75) return { status: "Warning", color: "yellow" };
  return { status: "Critical", color: "red" };
}

function calculateSafeBunks(attended: number, conducted: number): number {
  if (conducted === 0) return 0;
  const currentPct = (attended / conducted) * 100;
  if (currentPct < 75) return 0;
  const safe = Math.floor((4 * attended - 3 * conducted) / 3);
  return Math.max(0, safe);
}

function calculateRecoveryNeeded(attended: number, conducted: number): number {
  if (conducted === 0) return 0;
  const currentPct = (attended / conducted) * 100;
  if (currentPct >= 75) return 0;
  const needed = Math.ceil(3 * conducted - 4 * attended);
  return Math.max(0, needed);
}

function generateAiSuggestion(name: string, attended: number, conducted: number): string {
  if (conducted === 0) return `Start attending lectures regularly to establish your attendance baseline in ${name}.`;
  const pct = Math.round((attended / conducted) * 100);
  const recovery = calculateRecoveryNeeded(attended, conducted);
  const safe = calculateSafeBunks(attended, conducted);

  if (pct >= 95) {
    return `Outstanding record! You have ${safe} safe bunks buffer for ${name}. Keep up the top tier momentum!`;
  }
  if (pct >= 90) {
    return `Strong performance in ${name}. You can safely miss up to ${safe} lectures without dropping below the 75% limit.`;
  }
  if (pct >= 85) {
    return `Good standing. Your attendance is in the safe zone (${pct}%). Maintain regular attendance to build up your bunk buffer.`;
  }
  if (pct >= 75) {
    return `Heads up! Attendance is ${pct}%. Attend the next ${Math.max(3, recovery + 2)} classes continuously to comfortably cross into the 85% safe zone.`;
  }
  return `Critical Alert! Your attendance is ${pct}%. You must attend at least ${recovery} upcoming classes continuously without missing any to restore eligibility above 75%.`;
}

function generateTrendData(attended: number, conducted: number): Array<{ classNum: number; percentage: number }> {
  if (conducted === 0) return [{ classNum: 1, percentage: 100 }];
  const steps = 6;
  const history: Array<{ classNum: number; percentage: number }> = [];
  const startConducted = Math.max(5, conducted - 5);

  for (let i = 0; i <= steps; i++) {
    const c = Math.round(startConducted + (i / steps) * (conducted - startConducted));
    const ratio = attended / conducted;
    const approxAttended = Math.min(c, Math.round(c * ratio));
    const p = Math.round((approxAttended / Math.max(1, c)) * 100);
    history.push({ classNum: i + 1, percentage: p });
  }

  return history;
}

// ─── Internal Server DB Initialization ─────────────────────────────────────
async function initAttendanceDbInternal(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS subject_attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      subject_code TEXT NOT NULL,
      classes_attended INTEGER DEFAULT 0,
      classes_conducted INTEGER DEFAULT 0,
      attendance_percentage REAL DEFAULT 100.0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, subject_id)
    );

    CREATE TABLE IF NOT EXISTS attendance_reminders (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject_id TEXT,
      subject_name TEXT,
      threshold INTEGER NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      is_read INTEGER DEFAULT 0,
      last_percentage REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Note: Dummy seed data removed. Real attendance data flows from Supabase via the CUE extension sync.
// The SQLite DB is still used for manual attendance tracking (+/- buttons) but starts empty.

function evaluateReminderRulesInternal(
  db: any,
  studentId: string,
  subjectId: string | null,
  subjectName: string | null,
  previousPct: number,
  currentPct: number
) {
  if (currentPct < 85 && previousPct >= 85) {
    const active85 = db.prepare(`
      SELECT id FROM attendance_reminders 
      WHERE student_id = ? AND (subject_id = ? OR (subject_id IS NULL AND ? IS NULL)) 
        AND threshold = 85 AND is_active = 1
    `).get(studentId, subjectId, subjectId);

    if (!active85) {
      const message = subjectName
        ? `⚠️ Heads Up: Your attendance in ${subjectName} has fallen to ${currentPct}%. Maintain regular attendance to stay above the university requirement.`
        : `⚠️ Overall attendance has dropped to ${currentPct}%. Keep attending classes regularly to remain in the safe zone.`;

      db.prepare(`
        INSERT INTO attendance_reminders 
        (id, student_id, subject_id, subject_name, threshold, level, message, last_percentage, is_active, is_read)
        VALUES (?, ?, ?, ?, 85, 'warning', ?, ?, 1, 0)
      `).run(crypto.randomUUID(), studentId, subjectId, subjectName, message, currentPct);
    }
  } else if (currentPct >= 85 && previousPct < 85) {
    db.prepare(`
      UPDATE attendance_reminders SET is_active = 0 
      WHERE student_id = ? AND (subject_id = ? OR (subject_id IS NULL AND ? IS NULL)) AND threshold = 85
    `).run(studentId, subjectId, subjectId);

    const targetName = subjectName || "Overall Attendance";
    db.prepare(`
      INSERT INTO attendance_reminders 
      (id, student_id, subject_id, subject_name, threshold, level, message, last_percentage, is_active, is_read)
      VALUES (?, ?, ?, ?, 85, 'restored', ?, ?, 0, 0)
    `).run(
      crypto.randomUUID(), studentId, subjectId, subjectName,
      `✅ Safe Zone Restored: Your attendance in ${targetName} is now ${currentPct}%!`,
      currentPct
    );
  }

  if (currentPct <= 75 && previousPct > 75) {
    const active75 = db.prepare(`
      SELECT id FROM attendance_reminders 
      WHERE student_id = ? AND (subject_id = ? OR (subject_id IS NULL AND ? IS NULL)) 
        AND threshold = 75 AND is_active = 1
    `).get(studentId, subjectId, subjectId);

    if (!active75) {
      const message = subjectName
        ? `🚨 Attendance Alert: Your attendance in ${subjectName} is ${currentPct}%. You are now below the mandatory 75% attendance requirement. Attend upcoming classes immediately.`
        : `🚨 Critical Overall Alert: Overall attendance is ${currentPct}%, which is below the mandatory 75% threshold!`;

      db.prepare(`
        INSERT INTO attendance_reminders 
        (id, student_id, subject_id, subject_name, threshold, level, message, last_percentage, is_active, is_read)
        VALUES (?, ?, ?, ?, 75, 'critical', ?, ?, 1, 0)
      `).run(crypto.randomUUID(), studentId, subjectId, subjectName, message, currentPct);
    }
  } else if (currentPct > 75 && previousPct <= 75) {
    db.prepare(`
      UPDATE attendance_reminders SET is_active = 0 
      WHERE student_id = ? AND (subject_id = ? OR (subject_id IS NULL AND ? IS NULL)) AND threshold = 75
    `).run(studentId, subjectId, subjectId);

    const targetName = subjectName || "Overall Attendance";
    db.prepare(`
      INSERT INTO attendance_reminders 
      (id, student_id, subject_id, subject_name, threshold, level, message, last_percentage, is_active, is_read)
      VALUES (?, ?, ?, ?, 75, 'restored', ?, ?, 0, 0)
    `).run(
      crypto.randomUUID(), studentId, subjectId, subjectName,
      `🎉 Recovery Complete: Your attendance in ${targetName} has risen back to ${currentPct}%!`,
      currentPct
    );
  }
}

// ─── Server Function: Sync Attendance Directly to Server DB ────────────────
export const syncAttendanceToLocalDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string().optional(),
      subjects: z.array(z.any()),
    })
  )
  .handler(async ({ data }) => {
    const db = await getServerDb();
    if (!db) throw new Error("Database unavailable");
    const userId = data.userId || "00000000-0000-0000-0000-000000000001";
    const subjects = data.subjects || [];

    db.exec(`
      CREATE TABLE IF NOT EXISTS subject_attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        subject_name TEXT NOT NULL,
        subject_code TEXT NOT NULL,
        classes_attended INTEGER DEFAULT 0,
        classes_conducted INTEGER DEFAULT 0,
        attendance_percentage REAL DEFAULT 100.0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, subject_id)
      );
    `);

    db.prepare(`DELETE FROM subject_attendance WHERE student_id IN (?, '00000000-0000-0000-0000-000000000001')`).run(userId);

    const upsertStmt = db.prepare(`
      INSERT INTO subject_attendance 
      (id, student_id, subject_id, subject_name, subject_code, classes_attended, classes_conducted, attendance_percentage, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(student_id, subject_id) DO UPDATE SET
        subject_name = excluded.subject_name,
        classes_attended = excluded.classes_attended,
        classes_conducted = excluded.classes_conducted,
        attendance_percentage = excluded.attendance_percentage,
        last_updated = CURRENT_TIMESTAMP
    `);

    for (const sub of subjects) {
      const code = (sub.code || "N/A").trim();
      const name = (sub.name || code).trim();
      const attended = Number(sub.attended) || 0;
      const total = Number(sub.total) || 0;
      const pct =
        total > 0
          ? Number(((attended / total) * 100).toFixed(2))
          : sub.percentage
          ? Number(Number(sub.percentage).toFixed(2))
          : 100;
      const subId = `cue-${code.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      upsertStmt.run(crypto.randomUUID(), userId, subId, name, code, attended, total, pct);
      if (userId !== "00000000-0000-0000-0000-000000000001") {
        upsertStmt.run(crypto.randomUUID(), "00000000-0000-0000-0000-000000000001", subId, name, code, attended, total, pct);
      }
    }

    return { success: true, count: subjects.length };
  });

// ─── Server Function: Get Full Attendance Dashboard ───────────────────────
export const getAttendanceDashboardData = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string().optional() }).optional())
  .handler(async ({ data, context }): Promise<AttendanceDashboardData> => {
    const studentId = data?.userId || (context as any)?.userId || "00000000-0000-0000-0000-000000000001";
    const db = await getServerDb();

    if (!db) {
      return {
        overall: {
          percentage: 0,
          totalAttended: 0,
          totalConducted: 0,
          requiredFor75: 0,
          safeMissesCount: 0,
          status: "Safe",
          statusColor: "blue",
          subjectsAtRiskCount: 0,
          criticalSubjectsCount: 0,
        },
        subjects: [],
        notifications: [],
        recentLogs: [],
      };
    }

    // Query subjects for active studentId and default fallback, ordered by newest last_updated first
    const allSubjectsRaw = db.prepare(`
      SELECT * FROM subject_attendance 
      WHERE student_id = ? OR student_id = '00000000-0000-0000-0000-000000000001'
      ORDER BY last_updated DESC
    `).all(studentId) as any[];

    // Deduplicate by subject_id keeping the most recently updated row
    const seenIds = new Set<string>();
    let subjectsRaw: any[] = [];
    for (const s of allSubjectsRaw) {
      if (!seenIds.has(s.subject_id)) {
        seenIds.add(s.subject_id);
        subjectsRaw.push(s);
      }
    }
    subjectsRaw.sort((a, b) => a.subject_name.localeCompare(b.subject_name));

    // No seed — return empty subjects if none exist (user must sync via CUE extension)

    let totalAttended = 0;
    let totalConducted = 0;

    const subjects: SubjectAttendance[] = subjectsRaw.map((s) => {
      const attended = Number(s.classes_attended) || 0;
      const conducted = Number(s.classes_conducted) || 0;
      const pct =
        conducted > 0
          ? Number(((attended / conducted) * 100).toFixed(2))
          : Number(s.attendance_percentage)
          ? Number(Number(s.attendance_percentage).toFixed(2))
          : 100;
      totalAttended += attended;
      totalConducted += conducted;

      const { status, color } = calculateStatus(pct);
      const safeBunks = calculateSafeBunks(attended, conducted);
      const recoveryNeeded = calculateRecoveryNeeded(attended, conducted);
      const aiSuggestion = generateAiSuggestion(s.subject_name, attended, conducted);
      const trend = generateTrendData(attended, conducted);

      const miss1 = Number(((attended / (conducted + 1)) * 100).toFixed(2));
      const miss2 = Number(((attended / (conducted + 2)) * 100).toFixed(2));
      const miss3 = Number(((attended / (conducted + 3)) * 100).toFixed(2));
      const attend1 = Number((((attended + 1) / (conducted + 1)) * 100).toFixed(2));
      const attend3 = Number((((attended + 3) / (conducted + 3)) * 100).toFixed(2));
      const attend5 = Number((((attended + 5) / (conducted + 5)) * 100).toFixed(2));

      return {
        id: s.subject_id,
        name: s.subject_name,
        code: s.subject_code,
        attended,
        conducted,
        percentage: pct,
        status,
        statusColor: color,
        safeBunks,
        recoveryNeeded,
        aiSuggestion,
        trend,
        predictions: { miss1, miss2, miss3, attend1, attend3, attend5 },
      };
    });

    const overallPct =
      totalConducted > 0
        ? Number(((totalAttended / totalConducted) * 100).toFixed(2))
        : 100;
    const overallStatus = calculateStatus(overallPct);
    const requiredFor75 = calculateRecoveryNeeded(totalAttended, totalConducted);
    const safeMissesCount = calculateSafeBunks(totalAttended, totalConducted);

    const subjectsAtRiskCount = subjects.filter((s) => s.percentage >= 75 && s.percentage < 85).length;
    const criticalSubjectsCount = subjects.filter((s) => s.percentage < 75).length;

    const notificationsRaw = db.prepare(`
      SELECT * FROM attendance_reminders 
      WHERE student_id = ? 
      ORDER BY sent_at DESC LIMIT 20
    `).all(studentId) as any[];

    const notifications: AttendanceNotification[] = notificationsRaw.map((n) => ({
      id: n.id,
      studentId: n.student_id,
      subjectId: n.subject_id,
      subjectName: n.subject_name || "Overall Attendance",
      threshold: n.threshold,
      level: n.level,
      message: n.message,
      sentAt: n.sent_at,
      isRead: Boolean(n.is_read),
      lastPercentage: n.last_percentage,
    }));

    const logsRaw = db.prepare(`
      SELECT l.*, s.subject_name 
      FROM attendance_logs l
      LEFT JOIN subject_attendance s ON l.subject_id = s.subject_id AND l.student_id = s.student_id
      WHERE l.student_id = ? 
      ORDER BY l.created_at DESC LIMIT 10
    `).all(studentId) as any[];

    const recentLogs = logsRaw.map((l) => ({
      id: l.id,
      subjectName: l.subject_name || "Subject",
      date: l.date,
      status: l.status as any,
    }));

    return {
      overall: {
        percentage: overallPct,
        totalAttended,
        totalConducted,
        requiredFor75,
        safeMissesCount,
        status: overallStatus.status,
        statusColor: overallStatus.color,
        subjectsAtRiskCount,
        criticalSubjectsCount,
      },
      subjects,
      notifications,
      recentLogs,
    };
  });

// ─── Server Function: Update Subject Attendance (Mark Present / Absent) ────
export const updateSubjectAttendance = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      subjectId: z.string(),
      action: z.enum(["present", "absent", "reset"]),
    })
  )
  .handler(async ({ data, context }) => {
    const studentId = (context as any)?.userId || "00000000-0000-0000-0000-000000000001";
    const db = await getServerDb();
    if (!db) throw new Error("Database unavailable");

    const current = db.prepare(`
      SELECT * FROM subject_attendance WHERE student_id = ? AND subject_id = ?
    `).get(studentId, data.subjectId) as any;

    if (!current) {
      throw new Error("Subject attendance record not found.");
    }

    const prevAttended = Number(current.classes_attended);
    const prevConducted = Number(current.classes_conducted);
    const prevPct = prevConducted > 0 ? Math.round((prevAttended / prevConducted) * 100) : 100;

    let newAttended = prevAttended;
    let newConducted = prevConducted;

    if (data.action === "present") {
      newAttended += 1;
      newConducted += 1;
    } else if (data.action === "absent") {
      newConducted += 1;
    } else if (data.action === "reset") {
      newAttended = 45;
      newConducted = 50;
    }

    const newPct = newConducted > 0 ? Math.round((newAttended / newConducted) * 100) : 100;

    db.prepare(`
      UPDATE subject_attendance 
      SET classes_attended = ?, classes_conducted = ?, attendance_percentage = ?, last_updated = CURRENT_TIMESTAMP
      WHERE student_id = ? AND subject_id = ?
    `).run(newAttended, newConducted, newPct, studentId, data.subjectId);

    db.prepare(`
      INSERT INTO attendance_logs (id, student_id, subject_id, date, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      studentId,
      data.subjectId,
      new Date().toISOString().split("T")[0],
      data.action === "present" ? "present" : "absent"
    );

    evaluateReminderRulesInternal(db, studentId, data.subjectId, current.subject_name, prevPct, newPct);

    const allRaw = db.prepare(`
      SELECT classes_attended, classes_conducted FROM subject_attendance WHERE student_id = ?
    `).all(studentId) as any[];

    let sumAttended = 0;
    let sumConducted = 0;
    for (const r of allRaw) {
      sumAttended += Number(r.classes_attended);
      sumConducted += Number(r.classes_conducted);
    }
    const overallNewPct = sumConducted > 0 ? Math.round((sumAttended / sumConducted) * 100) : 100;
    const overallPrevPct = (sumConducted - 1) > 0 ? Math.round((sumAttended - (data.action === "present" ? 1 : 0)) / (sumConducted - 1) * 100) : 100;

    evaluateReminderRulesInternal(db, studentId, null, null, overallPrevPct, overallNewPct);

    return {
      success: true,
      subjectName: current.subject_name,
      newPercentage: newPct,
      newAttended,
      newConducted,
    };
  });

// ─── Server Function: Notification Panel Actions ───────────────────────────
export const markNotificationRead = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(async ({ data, context }) => {
    const studentId = (context as any)?.userId || "00000000-0000-0000-0000-000000000001";
    const db = await getServerDb();
    if (db) {
      db.prepare(`
        UPDATE attendance_reminders SET is_read = 1 WHERE id = ? AND student_id = ?
      `).run(data.notificationId, studentId);
    }
    return { success: true };
  });

export const deleteNotification = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notificationId: z.string() }))
  .handler(async ({ data, context }) => {
    const studentId = (context as any)?.userId || "00000000-0000-0000-0000-000000000001";
    const db = await getServerDb();
    if (db) {
      db.prepare(`
        DELETE FROM attendance_reminders WHERE id = ? AND student_id = ?
      `).run(data.notificationId, studentId);
    }
    return { success: true };
  });
