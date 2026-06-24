import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { supabaseServer } from "@/integrations/supabase/supabase.server";
import crypto from "node:crypto";

const SubjectSchema = z.object({
  name: z.string(),
  examDate: z.string(),
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

function generateLocalStudyPlan(data: z.infer<typeof StudyPlanInputSchema>) {
  const sortedSubjects = [...data.subjects].sort((a, b) => {
    const aIsWeak = data.weakSubjects.toLowerCase().includes(a.name.toLowerCase());
    const bIsWeak = data.weakSubjects.toLowerCase().includes(b.name.toLowerCase());
    if (aIsWeak !== bIsWeak) return aIsWeak ? -1 : 1;
    const aDays = calculateCountdown(a.examDate);
    const bDays = calculateCountdown(b.examDate);
    if (aDays !== bDays) return aDays - bDays;
    const difficultyMap = { High: 3, Medium: 2, Low: 1 };
    return difficultyMap[b.difficulty] - difficultyMap[a.difficulty];
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timetable: Record<string, any[]> = {};

  daysOfWeek.forEach(day => {
    const dailySessions = [];
    const hours = data.studyHoursPerDay;
    let currentHour = 18;
    for (let i = 0; i < Math.min(hours, 4); i++) {
      const sub = sortedSubjects[i % sortedSubjects.length];
      if (!sub) break;
      dailySessions.push({ time: `${currentHour}:00 PM - ${currentHour + 1}:00 PM`, subject: sub.name, activity: sub.difficulty === "High" ? "In-depth Topic Study" : "Problem Solving" });
      currentHour += 1;
    }
    dailySessions.push({ time: `${currentHour}:00 PM - ${currentHour + 1}:00 PM`, subject: "General Revision", activity: "Spaced Repetition Review" });
    timetable[day] = dailySessions;
  });

  const spacedRepetition = sortedSubjects.flatMap(sub => {
    const topicsMap: Record<string, string[]> = {
      DBMS: ["Normalization", "SQL Joins", "ER Diagram", "Transactions"],
      "Operating Systems": ["CPU Scheduling", "Deadlocks", "Paging", "Semaphores"],
      "Computer Networks": ["IP Addressing", "OSI Model", "Routing Protocols", "TCP/UDP Handshake"],
    };
    const topics = topicsMap[sub.name] || ["Core Fundamentals", "Important Question Sets"];
    return topics.map(topic => ({ topic, subject: sub.name, rev1: "Tomorrow", rev2: "3 Days Later", rev3: "7 Days Later", rev4: "14 Days Later" }));
  });

  const weeklyGoals = sortedSubjects.map(sub => ({ title: `Complete 1 Unit of ${sub.name}`, progress: 10 }));
  const subjectProgress = sortedSubjects.map(sub => {
    const topicsMap: Record<string, string[]> = {
      DBMS: ["Normalization", "SQL Joins", "ER Diagram", "Transactions"],
      "Operating Systems": ["CPU Scheduling", "Deadlocks", "Paging", "Semaphores"],
    };
    const all = topicsMap[sub.name] || ["Unit 1 Theory", "Unit 2 Practical", "Previous Papers"];
    return { subject: sub.name, percent: sub.difficulty === "Low" ? 40 : 15, covered: [all[0]], remaining: all.slice(1), revisionStatus: "Revision 1 Scheduled" };
  });

  const recommendations = [];
  if (sortedSubjects.length > 0) {
    recommendations.push(`"${sortedSubjects[0].name}" requires additional revision as it is your primary focus subject.`);
  }
  recommendations.push("You have revision sessions scheduled tomorrow. Complete them to maintain consistency.");
  recommendations.push("Focus on solving last year's papers for your highest difficulty subjects.");

  const tasks = sortedSubjects.flatMap(sub => [`Complete core assignments for ${sub.name}`, `Solve 5 practice problems on ${sub.name}`]);

  return { timetable, spacedRepetition, weeklyGoals, subjectProgress, recommendations, tasks };
}

export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => StudyPlanInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

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
          model = createOpenAICompatible({ name: "openai", baseURL: "https://api.openai.com/v1", headers: { Authorization: `Bearer ${customKey}` } })("gpt-4o-mini");
        } else if (data.provider === "Gemini" && customKey) {
          model = createOpenAICompatible({ name: "gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", headers: { Authorization: `Bearer ${customKey}` } })("gemini-1.5-flash");
        } else if (systemLovableKey) {
          model = createLovableAiGatewayProvider(systemLovableKey)("google/gemini-3-flash-preview");
        } else if (systemGeminiKey) {
          model = createOpenAICompatible({ name: "gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", headers: { Authorization: `Bearer ${systemGeminiKey}` } })("gemini-1.5-flash");
        } else if (systemOpenaiKey) {
          model = createOpenAICompatible({ name: "openai", baseURL: "https://api.openai.com/v1", headers: { Authorization: `Bearer ${systemOpenaiKey}` } })("gpt-4o-mini");
        }

        const prompt = `You are a premium AI Academic Coach. Generate a comprehensive Study Plan as valid JSON (no markdown blocks). Student: Degree=${data.degree}, Semester=${data.semester}, Hours=${data.studyHoursPerDay}/day, Weak=${data.weakSubjects}, Strong=${data.strongSubjects}, StudyTime=${data.preferredStudyTime}, Target=${data.targetGrade}, Subjects=${JSON.stringify(data.subjects)}. Schema: {"timetable":{"Monday":[{"time":"","subject":"","activity":""}]},"spacedRepetition":[],"weeklyGoals":[],"subjectProgress":[],"recommendations":[],"tasks":[]}`;

        const response = await generateText({ model, prompt });
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

    // Save plan to Supabase
    const { data: plan, error: planError } = await supabaseServer
      .from("study_plans")
      .insert([{
        user_id: userId,
        degree: data.degree,
        semester: data.semester,
        subjects: data.subjects,
        result: planResult,
      }])
      .select("id")
      .single();

    if (planError || !plan) {
      throw new Error("Failed to save study plan: " + planError?.message);
    }

    const planId = plan.id;

    // Save tasks to Supabase
    const tasksToInsert = (planResult.tasks || []).map((title: string) => ({
      user_id: userId,
      plan_id: planId,
      title,
      completed: false,
    }));

    if (tasksToInsert.length > 0) {
      await supabaseServer.from("study_tasks").insert(tasksToInsert);
    }

    return { id: planId, degree: data.degree, semester: data.semester, subjects: data.subjects, result: planResult };
  });

export const listStudyPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await supabaseServer
      .from("study_plans")
      .select("id, degree, semester, subjects, result, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listing study plans:", error);
      return [];
    }

    return (data ?? []).map((r: any) => ({
      id: r.id,
      degree: r.degree,
      semester: r.semester,
      subjects: typeof r.subjects === "string" ? JSON.parse(r.subjects) : r.subjects,
      result: typeof r.result === "string" ? JSON.parse(r.result) : r.result,
      created_at: r.created_at,
    }));
  });

export const deleteStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabaseServer.from("study_plans").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error("Failed to delete study plan: " + error.message);
    return { ok: true };
  });

export const listStudyTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ planId: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: tasks, error } = await supabaseServer
      .from("study_tasks")
      .select("id, plan_id, title, completed, created_at")
      .eq("plan_id", data.planId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error listing study tasks:", error);
      return [];
    }

    return tasks ?? [];
  });

export const createStudyTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ planId: z.string(), title: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: task, error } = await supabaseServer
      .from("study_tasks")
      .insert([{ user_id: userId, plan_id: data.planId, title: data.title, completed: false }])
      .select()
      .single();

    if (error || !task) throw new Error("Failed to create task: " + error?.message);
    return task;
  });

export const updateStudyTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string(), title: z.string().optional(), completed: z.boolean().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const updatePayload: Record<string, any> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.completed !== undefined) updatePayload.completed = data.completed;

    const { error } = await supabaseServer.from("study_tasks").update(updatePayload).eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error("Failed to update task: " + error.message);
    return { ok: true };
  });

export const deleteStudyTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabaseServer.from("study_tasks").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error("Failed to delete task: " + error.message);
    return { ok: true };
  });
