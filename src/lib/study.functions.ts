import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { getDb } from "./db.server";
import crypto from "node:crypto";

const SubjectSchema = z.object({
  name: z.string(),
  examDate: z.string(), // YYYY-MM-DD
  difficulty: z.enum(["High", "Medium", "Low"]),
});

const StudyPlanInputSchema = z.object({
  degree: z.string(),
  semester: z.string(),
  subjects: z.array(SubjectSchema),
  studyHoursPerDay: z.number(),
  weakSubjects: z.string(),
  strongSubjects: z.string(),
  preferredStudyTime: z.string(),
  targetGrade: z.string(),
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional(),
});

function calculateCountdown(examDateStr: string): number {
  try {
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : Math.max(0, diffDays);
  } catch {
    return 0;
  }
}

// Local Heuristic fallback
function generateLocalStudyPlan(data: z.infer<typeof StudyPlanInputSchema>) {
  const sortedSubjects = [...data.subjects].sort((a, b) => {
    // 1. Prioritize weak subjects
    const aIsWeak = data.weakSubjects.toLowerCase().includes(a.name.toLowerCase());
    const bIsWeak = data.weakSubjects.toLowerCase().includes(b.name.toLowerCase());
    if (aIsWeak !== bIsWeak) return aIsWeak ? -1 : 1;

    // 2. Prioritize nearest exams
    const aDays = calculateCountdown(a.examDate);
    const bDays = calculateCountdown(b.examDate);
    if (aDays !== bDays) return aDays - bDays;

    // 3. Prioritize high difficulty
    const difficultyMap = { High: 3, Medium: 2, Low: 1 };
    return difficultyMap[b.difficulty] - difficultyMap[a.difficulty];
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timetable: Record<string, any[]> = {};
  
  // Build a basic daily study grid based on hours and sorted subjects
  daysOfWeek.forEach(day => {
    const dailySessions = [];
    const hours = data.studyHoursPerDay;
    let currentHour = 18; // default starting at 6:00 PM
    
    for (let i = 0; i < Math.min(hours, 4); i++) {
      const sub = sortedSubjects[i % sortedSubjects.length];
      if (!sub) break;
      
      const startTime = `${currentHour}:00 PM`;
      const endTime = `${currentHour + 1}:00 PM`;
      dailySessions.push({
        time: `${startTime} - ${endTime}`,
        subject: sub.name,
        activity: sub.difficulty === "High" ? "In-depth Topic Study" : "Problem Solving"
      });
      currentHour += 1;
    }
    
    // Add revision slot
    dailySessions.push({
      time: `${currentHour}:00 PM - ${currentHour + 1}:00 PM`,
      subject: "General Revision",
      activity: "Spaced Repetition Review"
    });
    
    timetable[day] = dailySessions;
  });

  // Build spaced repetition intervals
  const spacedRepetition = sortedSubjects.flatMap(sub => {
    const topicsMap: Record<string, string[]> = {
      DBMS: ["Normalization", "SQL Joins", "ER Diagram", "Transactions"],
      "Operating Systems": ["CPU Scheduling", "Deadlocks", "Paging", "Semaphores"],
      "Computer Networks": ["IP Addressing", "OSI Model", "Routing Protocols", "TCP/UDP Handshake"],
    };
    const topics = topicsMap[sub.name] || ["Core Fundamentals", "Important Question Sets"];
    return topics.map(topic => ({
      topic,
      subject: sub.name,
      rev1: "Tomorrow",
      rev2: "3 Days Later",
      rev3: "7 Days Later",
      rev4: "14 Days Later"
    }));
  });

  // Build weekly goals
  const weeklyGoals = sortedSubjects.map(sub => ({
    title: `Complete 1 Unit of ${sub.name}`,
    progress: 10
  }));

  // Build progress checklist
  const subjectProgress = sortedSubjects.map(sub => {
    const topicsMap: Record<string, string[]> = {
      DBMS: ["Normalization", "SQL Joins", "ER Diagram", "Transactions"],
      "Operating Systems": ["CPU Scheduling", "Deadlocks", "Paging", "Semaphores"],
      "Computer Networks": ["IP Addressing", "OSI Model", "Routing Protocols", "TCP/UDP Handshake"],
    };
    const all = topicsMap[sub.name] || ["Unit 1 Theory", "Unit 2 Practical", "Previous Papers"];
    return {
      subject: sub.name,
      percent: sub.difficulty === "Low" ? 40 : 15,
      covered: [all[0]],
      remaining: all.slice(1),
      revisionStatus: "Revision 1 Scheduled"
    };
  });

  // Smart Recommendations
  const recommendations = [];
  if (sortedSubjects.length > 0) {
    const mainWeak = sortedSubjects[0];
    recommendations.push(`"${mainWeak.name}" requires additional revision as it is your primary focus subject.`);
  }
  recommendations.push("You have revision sessions scheduled tomorrow. Complete them to maintain consistency.");
  recommendations.push("Focus on solving last year's papers for your highest difficulty subjects.");

  // Prepopulated tasks list
  const tasks = sortedSubjects.flatMap(sub => [
    `Complete core assignments for ${sub.name}`,
    `Solve 5 practice problems on ${sub.name}`
  ]);

  return {
    timetable,
    spacedRepetition,
    weeklyGoals,
    subjectProgress,
    recommendations,
    tasks
  };
}

export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => StudyPlanInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const customKey = data.custom_key?.trim();
    const systemLovableKey = process.env.LOVABLE_API_KEY;
    const systemGeminiKey = process.env.GEMINI_API_KEY;
    const systemOpenaiKey = process.env.OPENAI_API_KEY;
    
    const hasKeys = !!(customKey || systemLovableKey || systemGeminiKey || systemOpenaiKey);
    
    let planResult: any;

    if (!hasKeys) {
      planResult = generateLocalStudyPlan(data);
    } else {
      let model: any;
      try {
        if (data.provider === "OpenAI" && customKey) {
          const provider = createOpenAICompatible({
            name: "openai",
            baseURL: "https://api.openai.com/v1",
            headers: { Authorization: `Bearer ${customKey}` },
          });
          model = provider("gpt-4o-mini");
        } else if (data.provider === "Gemini" && customKey) {
          const provider = createOpenAICompatible({
            name: "gemini",
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
            headers: { Authorization: `Bearer ${customKey}` },
          });
          model = provider("gemini-1.5-flash");
        } else if (systemLovableKey) {
          const gateway = createLovableAiGatewayProvider(systemLovableKey);
          model = gateway("google/gemini-3-flash-preview");
        } else if (systemGeminiKey) {
          const provider = createOpenAICompatible({
            name: "gemini",
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
            headers: { Authorization: `Bearer ${systemGeminiKey}` },
          });
          model = provider("gemini-1.5-flash");
        } else if (systemOpenaiKey) {
          const provider = createOpenAICompatible({
            name: "openai",
            baseURL: "https://api.openai.com/v1",
            headers: { Authorization: `Bearer ${systemOpenaiKey}` },
          });
          model = provider("gpt-4o-mini");
        }

        const subjectsStr = JSON.stringify(data.subjects);
        const prompt = `
        You are a premium AI Academic Coach. Generate a comprehensive Study Plan in a valid JSON object.
        Maximize exam grades using Spaced Repetition techniques.

        Student Info:
        - Degree: ${data.degree}
        - Semester: ${data.semester}
        - Available Study Hours: ${data.studyHoursPerDay} hrs/day
        - Weak Areas: ${data.weakSubjects}
        - Strong Areas: ${data.strongSubjects}
        - Preferred Study Time: ${data.preferredStudyTime}
        - Target Grade: ${data.targetGrade}
        - Subjects & Exams Info: ${subjectsStr}

        Planning Priority Rules:
        1. Prioritize weak subjects.
        2. Prioritize nearest exam dates.
        3. Prioritize High difficulty subjects.

        Format response strictly as a JSON object (no markdown block tags, prefix, or suffix). Use this structure:
        {
          "timetable": {
            "Monday": [
              { "time": "6:00 PM - 7:00 PM", "subject": "DBMS", "activity": "Study ER Diagrams" },
              { "time": "7:00 PM - 8:00 PM", "subject": "OS", "activity": "CPU Scheduling" }
            ],
            "Tuesday": [...],
            "Wednesday": [...],
            "Thursday": [...],
            "Friday": [...],
            "Saturday": [...],
            "Sunday": [...]
          },
          "spacedRepetition": [
            { "topic": "Normalization", "subject": "DBMS", "rev1": "Tomorrow", "rev2": "3 Days Later", "rev3": "7 Days Later", "rev4": "14 Days Later" }
          ],
          "weeklyGoals": [
            { "title": "Complete DBMS Unit 2", "progress": 0 }
          ],
          "subjectProgress": [
            { "subject": "DBMS", "percent": 15, "covered": ["ER Diagrams"], "remaining": ["SQL queries", "Normal Forms", "Indexing"], "revisionStatus": "Revision 1 Scheduled" }
          ],
          "recommendations": [
            "DBMS requires more time as it is marked High difficulty and you listed it as a weak subject."
          ],
          "tasks": [
            "Complete ER Diagram practice sheets",
            "Solve SQL joins quiz"
          ]
        }
        `;

        const response = await generateText({
          model,
          prompt,
        });

        let text = response.text.trim();
        if (text.startsWith("```")) {
          text = text.replace(/^```(?:json)?/im, "").replace(/```$/m, "").trim();
        }

        planResult = JSON.parse(text);
      } catch (err) {
        console.error("AI study plan generation failed, falling back to heuristics:", err);
        planResult = generateLocalStudyPlan(data);
      }
    }

    const planId = crypto.randomUUID();

    // Save plan to SQLite
    const planStmt = db.prepare(`
      INSERT INTO study_plans (id, user_id, degree, semester, subjects, result)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    planStmt.run(planId, userId, data.degree, data.semester, JSON.stringify(data.subjects), JSON.stringify(planResult));

    // Save tasks to SQLite
    const taskStmt = db.prepare(`
      INSERT INTO study_tasks (id, user_id, plan_id, title, completed)
      VALUES (?, ?, ?, ?, 0)
    `);
    
    const tasksToInsert = planResult.tasks || [];
    for (const tTitle of tasksToInsert) {
      const taskId = crypto.randomUUID();
      taskStmt.run(taskId, userId, planId, tTitle);
    }

    return {
      id: planId,
      degree: data.degree,
      semester: data.semester,
      subjects: data.subjects,
      result: planResult
    };
  });

// List past study plans
export const listStudyPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      SELECT id, degree, semester, subjects, result, created_at
      FROM study_plans
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId) || [];
    return rows.map((r: any) => ({
      id: r.id,
      degree: r.degree,
      semester: r.semester,
      subjects: JSON.parse(r.subjects),
      result: JSON.parse(r.result),
      created_at: r.created_at
    }));
  });

// Delete study plan
export const deleteStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      DELETE FROM study_plans
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(data.id, userId);
    return { ok: true };
  });

// List study tasks for plan
export const listStudyTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ planId: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      SELECT id, plan_id, title, completed, created_at
      FROM study_tasks
      WHERE plan_id = ? AND user_id = ?
      ORDER BY created_at ASC
    `);
    return stmt.all(data.planId, userId) || [];
  });

// Create study task
export const createStudyTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ planId: z.string(), title: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO study_tasks (id, user_id, plan_id, title, completed)
      VALUES (?, ?, ?, ?, 0)
    `);
    stmt.run(id, userId, data.planId, data.title);
    return { id, title: data.title, completed: 0 };
  });

// Update study task completed/title status
export const updateStudyTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    id: z.string(),
    title: z.string().optional(),
    completed: z.number().optional()
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    if (data.title !== undefined && data.completed !== undefined) {
      const stmt = db.prepare(`
        UPDATE study_tasks
        SET title = ?, completed = ?
        WHERE id = ? AND user_id = ?
      `);
      stmt.run(data.title, data.completed, data.id, userId);
    } else if (data.completed !== undefined) {
      const stmt = db.prepare(`
        UPDATE study_tasks
        SET completed = ?
        WHERE id = ? AND user_id = ?
      `);
      stmt.run(data.completed, data.id, userId);
    } else if (data.title !== undefined) {
      const stmt = db.prepare(`
        UPDATE study_tasks
        SET title = ?
        WHERE id = ? AND user_id = ?
      `);
      stmt.run(data.title, data.id, userId);
    }
    return { ok: true };
  });

// Delete study task
export const deleteStudyTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      DELETE FROM study_tasks
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(data.id, userId);
    return { ok: true };
  });
