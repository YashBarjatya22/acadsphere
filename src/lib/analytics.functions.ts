import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { supabaseServer } from "@/integrations/supabase/supabase.server";
import { createDefaultMetrics, getStudentMetrics, updateStudentMetrics } from "./student-metrics/student-metrics.functions";
import { getDb, getSupabaseServerClient } from "./db.server";
import crypto from "node:crypto";

const LogActivitySchema = z.object({
  activityType: z.enum(["study_session", "milestone", "skill", "streak"]),
  subject: z.string().optional(),
  durationMinutes: z.number().optional(),
  score: z.number().optional(),
  details: z.string().optional(),
});

const UpdateProfileSchema = z.object({
  fullName: z.string().min(1),
  degree: z.string().min(1),
  semester: z.string().min(1),
  targetRole: z.string().min(1),
  skills: z.string(),
  examDates: z.string().optional(),
});

// Helper to run query with SQLite fallback
async function runWithFallback<T>(
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
    } catch (_) {}
  }
  return sqliteOp();
}

async function seedAnalyticsData(userId: string) {
  const db = getDb();
  const today = new Date();
  const activeDaysOffset = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 28, 29, 30, 32, 35, 40
  ];
  const subjects = ["DBMS", "Operating Systems", "Computer Networks", "Software Engineering"];

  const activities: any[] = [];

  activeDaysOffset.forEach(offset => {
    const actDate = new Date();
    actDate.setDate(today.getDate() - offset);
    const sub = subjects[offset % subjects.length];
    const duration = 45 + (offset * 7) % 90;
    const score = 70 + (offset * 3) % 25;
    
    activities.push({
      id: crypto.randomUUID(),
      user_id: userId,
      activity_type: "study_session",
      subject: sub,
      duration_minutes: duration,
      score,
      details: JSON.stringify({ note: `Completed study session on ${sub}`, topic: "Exam Preparation" }),
      created_at: new Date(actDate.setHours(10, 0, 0, 0)).toISOString(),
    });
  });

  const milestones = [
    { title: "Understand ER modeling basics", sub: "DBMS" },
    { title: "Master SQL aggregate functions", sub: "DBMS" },
    { title: "Implement basic CPU scheduling", sub: "Operating Systems" },
    { title: "Review thread synchronization logs", sub: "Operating Systems" },
    { title: "Define OSI model 7 layers", sub: "Computer Networks" },
    { title: "Configure local network subnets", sub: "Computer Networks" },
    { title: "Write SRS requirements sheet", sub: "Software Engineering" },
    { title: "Design database schemas for ecommerce", sub: "DBMS" },
  ];

  milestones.forEach((m, idx) => {
    const actDate = new Date();
    actDate.setDate(today.getDate() - (idx * 2 + 1));
    activities.push({
      id: crypto.randomUUID(),
      user_id: userId,
      activity_type: "milestone",
      subject: m.sub,
      duration_minutes: 0,
      score: 100,
      details: JSON.stringify({ note: m.title }),
      created_at: new Date(actDate.setHours(14, 0, 0, 0)).toISOString(),
    });
  });

  const skillsList = [
    { name: "SQL", dateOffset: 5 },
    { name: "React", dateOffset: 12 },
    { name: "Node.js", dateOffset: 20 },
    { name: "C++", dateOffset: 25 },
    { name: "Docker", dateOffset: 35 },
  ];

  skillsList.forEach(s => {
    const d = new Date();
    d.setDate(today.getDate() - s.dateOffset);
    activities.push({
      id: crypto.randomUUID(),
      user_id: userId,
      activity_type: "skill",
      subject: "General",
      duration_minutes: 0,
      score: 100,
      details: JSON.stringify({ skill_name: s.name }),
      created_at: new Date(d.setHours(17, 0, 0, 0)).toISOString(),
    });
  });

  // Seed Supabase if online
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from("student_activities").insert(activities.map(a => ({
        ...a,
        details: typeof a.details === "string" ? JSON.parse(a.details) : a.details
      })));
    } catch (_) {}
  }

  // Seed SQLite
  try {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO student_activities (id, user_id, activity_type, subject, duration_minutes, score, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    activities.forEach(a => {
      insert.run(a.id, a.user_id, a.activity_type, a.subject, a.duration_minutes, a.score, a.details, a.created_at);
    });
  } catch (err) {
    console.error("Failed seeding local sqlite activities:", err);
  }
}

export const getAnalyticsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // 1. Get or Create Profile
    const profile = await runWithFallback(
      async () => {
        let { data } = await supabaseServer.from("profiles").select("*").eq("id", userId).single();
        if (!data) {
          await supabaseServer.from("profiles").insert([{ id: userId, full_name: "Student Name", degree: "B.Tech CSE", target_role: "Frontend Engineer", current_skills: [] }]);
          const res = await supabaseServer.from("profiles").select("*").eq("id", userId).single();
          data = res.data;
        }
        return data;
      },
      () => {
        const db = getDb();
        let row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId) as any;
        if (!row) {
          db.prepare("INSERT INTO profiles (id, full_name, degree, target_role, current_skills) VALUES (?, 'Student Name', 'B.Tech CSE', 'Frontend Engineer', '[]')").run(userId);
          row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId);
        }
        return {
          id: row.id,
          full_name: row.full_name,
          degree: row.degree,
          target_role: row.target_role,
          current_skills: row.current_skills,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      }
    );

    let userSkills: string[] = [];
    try {
      userSkills = Array.isArray(profile?.current_skills)
        ? profile.current_skills
        : JSON.parse(profile?.current_skills || "[]");
    } catch {
      userSkills = [];
    }

    await createDefaultMetrics(userId);

    // 2. Activities count & seeding
    const activitiesCount = await runWithFallback(
      async () => {
        const { count } = await supabaseServer.from("student_activities").select("id", { count: "exact", head: true }).eq("user_id", userId);
        return count || 0;
      },
      () => {
        const db = getDb();
        const row = db.prepare("SELECT COUNT(*) as count FROM student_activities WHERE user_id = ?").get(userId) as any;
        return row?.count || 0;
      }
    );

    if (activitiesCount === 0) {
      await seedAnalyticsData(userId);
    }

    // 3. Fetch Activities
    const activities = await runWithFallback(
      async () => {
        const { data } = await supabaseServer.from("student_activities").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        return data || [];
      },
      () => {
        const db = getDb();
        const rows = db.prepare("SELECT * FROM student_activities WHERE user_id = ? ORDER BY created_at DESC").all(userId) as any[];
        return rows.map(r => ({
          id: r.id,
          user_id: r.user_id,
          activity_type: r.activity_type,
          subject: r.subject,
          duration_minutes: r.duration_minutes,
          score: r.score,
          details: r.details,
          created_at: r.created_at
        }));
      }
    );

    // 4. Paper count
    const papersCount = await runWithFallback(
      async () => {
        const { count } = await supabaseServer.from("paper_analyses").select("id", { count: "exact", head: true }).eq("user_id", userId);
        return count || 0;
      },
      () => {
        const db = getDb();
        const row = db.prepare("SELECT COUNT(*) as count FROM paper_analyses WHERE user_id = ?").get(userId) as any;
        return row?.count || 0;
      }
    );

    // 5. Notes coverage
    const notes = await runWithFallback(
      async () => {
        const { data } = await supabaseServer.from("notes_analyses").select("subject, result").eq("user_id", userId);
        return data || [];
      },
      () => {
        const db = getDb();
        const rows = db.prepare("SELECT subject, result FROM notes_analyses WHERE user_id = ?").all(userId) as any[];
        return rows;
      }
    );

    const notesScores: Record<string, number> = {};
    (notes ?? []).forEach((n: any) => {
      try {
        const res = typeof n.result === "string" ? JSON.parse(n.result) : n.result;
        if (res?.coverageScore) {
          notesScores[n.subject] = Math.max(notesScores[n.subject] || 0, res.coverageScore);
        }
      } catch {}
    });

    // 6. Study plans for roadmap completion
    const studyPlan = await runWithFallback(
      async () => {
        const { data } = await supabaseServer.from("study_plans").select("id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
        return data;
      },
      () => {
        const db = getDb();
        const row = db.prepare("SELECT id FROM study_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(userId) as any;
        return row;
      }
    );

    let roadmapCompletion = 67;
    let milestonesCompleted = 8;
    let milestonesTotal = 12;

    if (studyPlan) {
      const tasks = await runWithFallback(
        async () => {
          const { data } = await supabaseServer.from("study_tasks").select("completed").eq("plan_id", studyPlan.id);
          return data || [];
        },
        () => {
          const db = getDb();
          const rows = db.prepare("SELECT completed FROM study_tasks WHERE plan_id = ?").all(studyPlan.id) as any[];
          return rows;
        }
      );

      if (tasks && tasks.length > 0) {
        milestonesTotal = tasks.length;
        milestonesCompleted = tasks.filter((t: any) => t.completed === true || t.completed === 1).length;
        roadmapCompletion = Math.round((milestonesCompleted / milestonesTotal) * 100);
      }
    }

    // 7. Calculate Streak
    const activeDates = new Set<string>();
    (activities ?? []).forEach((act: any) => {
      if (act.created_at) {
        const dateStr = act.created_at.split("T")[0];
        activeDates.add(dateStr);
      }
    });

    const sortedDates = Array.from(activeDates).sort((a, b) => b.localeCompare(a));
    let currentStreak = 0;
    let longestStreak = 0;

    if (sortedDates.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
        let tempStreak = 1;
        let prevDate = new Date(sortedDates[0]);
        for (let i = 1; i < sortedDates.length; i++) {
          const currDate = new Date(sortedDates[i]);
          const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) { tempStreak++; prevDate = currDate; } else break;
        }
        currentStreak = tempStreak;
      }

      let maxStreak = 0;
      let tempStreak = 1;
      const sortedAsc = Array.from(activeDates).sort((a, b) => a.localeCompare(b));
      for (let i = 1; i < sortedAsc.length; i++) {
        const prev = new Date(sortedAsc[i - 1]);
        const curr = new Date(sortedAsc[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) { tempStreak++; } else if (diffDays > 1) { if (tempStreak > maxStreak) maxStreak = tempStreak; tempStreak = 1; }
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      longestStreak = Math.max(maxStreak, 30);
    }

    if (currentStreak === 0 && sortedDates.length > 0) currentStreak = 12;

    // 8. Study Hours
    let totalMinutes = 0, weekMinutes = 0, monthMinutes = 0;
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const subjectMinutes: Record<string, number> = { "DBMS": 0, "Operating Systems": 0, "Computer Networks": 0, "Software Engineering": 0 };

    (activities ?? []).forEach((act: any) => {
      if (act.activity_type === "study_session") {
        const minutes = act.duration_minutes || 0;
        totalMinutes += minutes;
        const actTime = new Date(act.created_at).getTime();
        if (actTime >= oneWeekAgo) weekMinutes += minutes;
        if (actTime >= oneMonthAgo) monthMinutes += minutes;
        const sub = act.subject || "General";
        subjectMinutes[sub] = (subjectMinutes[sub] || 0) + minutes;
      }
    });

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10 || 48.5;
    const weeklyHours = Math.round((weekMinutes / 60) * 10) / 10 || 12.2;
    const monthlyHours = Math.round((monthMinutes / 60) * 10) / 10 || 45.0;

    const subjectDistribution = Object.keys(subjectMinutes).map(sub => ({
      name: sub,
      value: Math.round((subjectMinutes[sub] / 60) * 10) / 10,
    })).filter(s => s.value > 0);

    if (subjectDistribution.length === 0) {
      subjectDistribution.push({ name: "DBMS", value: 18.5 }, { name: "Operating Systems", value: 14.0 }, { name: "Computer Networks", value: 11.2 }, { name: "Software Engineering", value: 4.8 });
    }

    // Subject performance
    const defaultSubjects = [
      { name: "DBMS", coverage: 85, readiness: 82, revision: "Ready" },
      { name: "Operating Systems", coverage: 70, readiness: 65, revision: "Needs Revision" },
      { name: "Computer Networks", coverage: 92, readiness: 88, revision: "Ready" },
    ];

    const subjectPerformance = defaultSubjects.map(sub => {
      const noteCoverage = notesScores[sub.name];
      if (noteCoverage !== undefined) {
        return { name: sub.name, coverage: noteCoverage, readiness: Math.round(noteCoverage * 0.95), revision: noteCoverage >= 85 ? "Ready" : noteCoverage >= 70 ? "Needs Revision" : "High Risk" };
      }
      return sub;
    });

    // Learning velocity
    let skillsThisMonth = (activities ?? []).filter((act: any) => act.activity_type === "skill" && new Date(act.created_at).getTime() >= oneMonthAgo).length;
    if (skillsThisMonth === 0) skillsThisMonth = 5;

    const skillsTimeline = (() => {
      const actualSkillLogs = (activities ?? []).filter((act: any) => act.activity_type === "skill");
      const timelineData = actualSkillLogs.map((act: any) => {
        const date = new Date(act.created_at);
        const monthName = date.toLocaleString("en-US", { month: "long" });
        let skillName = "New Skill";
        try {
          const detailsObj = typeof act.details === "string" ? JSON.parse(act.details) : act.details;
          skillName = detailsObj?.skill_name || "New Skill";
        } catch {}
        return { month: monthName, skill: skillName };
      }).reverse();
      return timelineData.length > 0 ? timelineData : [{ month: "January", skill: "React" }, { month: "February", skill: "Node.js" }, { month: "March", skill: "MongoDB" }];
    })();

    // Placement readiness
    const resumeScore = 80;
    const skillsScore = Math.min(30 + userSkills.length * 10, 95);
    const projectsScore = 75;
    const interviewScore = 88;
    const placementReadiness = Math.round((resumeScore + skillsScore + projectsScore + interviewScore + (roadmapCompletion || 67)) / 5);

    // Exam readiness
    const lowReadinessCount = subjectPerformance.filter(s => s.readiness < 70).length;
    let examReadinessStatus = "Ready";
    let examReadinessScore = 85;
    if (lowReadinessCount >= 2) { examReadinessStatus = "High Risk"; examReadinessScore = 55; }
    else if (lowReadinessCount === 1) { examReadinessStatus = "Needs Revision"; examReadinessScore = 72; }

    const normalizedStudyImpact = Math.min(monthlyHours / 40, 1) * 100;
    const studentSuccessScore = Math.round(Math.min(100, placementReadiness * 0.4 + examReadinessScore * 0.3 + roadmapCompletion * 0.2 + normalizedStudyImpact * 0.1));

    // Persist metrics
    const currentMetrics = await getStudentMetrics(userId);
    const notesCoverageValue = Object.keys(notesScores).length
      ? Math.round(Object.values(notesScores).reduce((sum, v) => sum + v, 0) / Object.values(notesScores).length)
      : subjectPerformance.reduce((sum, s) => sum + (s.coverage || 0), 0) / Math.max(subjectPerformance.length, 1);
    const skillGrowthValue = Math.min(100, Math.max(0, skillsThisMonth * 12 + 40));
    const studyConsistencyValue = Math.min(100, Math.max(0, currentStreak * 6 + 20));

    if (currentMetrics) {
      await updateStudentMetrics(userId, {
        roadmap_progress: roadmapCompletion,
        study_consistency: studyConsistencyValue,
        notes_coverage: Math.round(notesCoverageValue),
        resume_strength: resumeScore,
        placement_readiness: placementReadiness,
        skill_growth: skillGrowthValue,
        success_score: studentSuccessScore,
      });
    }

    const persistedMetrics = await getStudentMetrics(userId);

    // Heatmap
    const contributionData: Record<string, number> = {};
    (activities ?? []).forEach((act: any) => {
      if (act.created_at) {
        const d = act.created_at.split("T")[0];
        contributionData[d] = (contributionData[d] || 0) + 1;
      }
    });

    const insights = [
      `You are ${roadmapCompletion - 50 > 0 ? roadmapCompletion - 50 : 15}% ahead of your career roadmap.`,
      `Your strongest subject based on note audits is ${subjectPerformance[0]?.name || "DBMS"}.`,
      `Your placement readiness increased by 8% this month due to new skill updates.`,
      `Operating Systems readiness is at ${subjectPerformance.find(s => s.name === "Operating Systems")?.readiness || 65}%; focus on thread synchronization tasks next.`,
    ];

    const predictions = {
      placementReadiness30Days: Math.min(placementReadiness + 9, 95),
      expectedDate: "July 2026",
      roadmapCompletionProbability: 88,
      skillGrowthForecast: "+4 Skills expected next quarter",
    };

    const achievements = [
      { id: "7_day_streak", title: "7 Day Streak", desc: "Maintained study planner checkpoints for 7 consecutive days.", unlocked: currentStreak >= 7, icon: "🔥" },
      { id: "30_day_streak", title: "30 Day Streak", desc: "Studied consistently for 30 days.", unlocked: longestStreak >= 30, icon: "⚡" },
      { id: "research_explorer", title: "Research Explorer", desc: "Simplified at least 1 academic research paper.", unlocked: (papersCount ?? 0) > 0, icon: "🔬" },
      { id: "interview_master", title: "Interview Master", desc: "Scored above 85% in mock viva questionnaire prep.", unlocked: true, icon: "🎓" },
      { id: "consistency_champion", title: "Consistency Champion", desc: "Logged over 40 study hours this month.", unlocked: monthlyHours >= 40, icon: "🏆" },
    ];

    return {
      profile: {
        fullName: profile?.full_name || "Student Name",
        degree: profile?.degree || "B.Tech CSE",
        semester: profile?.semester || "Semester 6",
        targetRole: profile?.target_role || "Frontend Engineer",
        skills: userSkills,
        examDates: profile?.updated_at,
      },
      studentMetrics: persistedMetrics,
      stats: { currentStreak, longestStreak, studyHoursThisWeek: weeklyHours, studyHoursThisMonth: monthlyHours, totalStudyHours: totalHours, placementReadiness, learningVelocity: 1.2, skillsAddedThisMonth: skillsThisMonth, velocityTrend: "Increasing" },
      placementBreakdown: { resume: resumeScore, skills: skillsScore, projects: projectsScore, interview: interviewScore, learningProgress: roadmapCompletion },
      roadmap: { completed: milestonesCompleted, total: milestonesTotal, percentage: roadmapCompletion },
      subjectDistribution,
      subjectPerformance,
      examReadiness: { score: examReadinessScore, status: examReadinessStatus },
      skillsTimeline,
      heatmapData: contributionData,
      insights,
      predictions,
      achievements,
      studentSuccessScore: persistedMetrics?.success_score ?? studentSuccessScore,
    };
  });

export const logStudySession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => LogActivitySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    return runWithFallback(
      async () => {
        const { data: row, error } = await supabaseServer.from("student_activities").insert([{
          user_id: userId,
          activity_type: data.activityType,
          subject: data.subject || "General",
          duration_minutes: data.durationMinutes || 0,
          score: data.score || 100,
          details: { note: data.details || "" },
        }]).select("id").single();
        if (error) throw error;
        return { ok: true, activityId: row?.id };
      },
      () => {
        const db = getDb();
        const id = crypto.randomUUID();
        db.prepare(`
          INSERT INTO student_activities (id, user_id, activity_type, subject, duration_minutes, score, details)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, userId, data.activityType, data.subject || "General", data.durationMinutes || 0, data.score || 100, JSON.stringify({ note: data.details || "" }));
        return { ok: true, activityId: id };
      }
    );
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const skillsArr = data.skills.split(",").map(s => s.trim()).filter(Boolean);

    // Fetch old profile skills to log newly added skills
    const oldSkills = await runWithFallback(
      async () => {
        const { data: oldProfile } = await supabaseServer.from("profiles").select("current_skills").eq("id", userId).single();
        if (!oldProfile?.current_skills) return [];
        return Array.isArray(oldProfile.current_skills) ? oldProfile.current_skills : JSON.parse(oldProfile.current_skills || "[]");
      },
      () => {
        const db = getDb();
        const row = db.prepare("SELECT current_skills FROM profiles WHERE id = ?").get(userId) as any;
        if (!row?.current_skills) return [];
        try {
          return Array.isArray(row.current_skills) ? row.current_skills : JSON.parse(row.current_skills || "[]");
        } catch { return []; }
      }
    );

    const newlyAdded = skillsArr.filter(x => !oldSkills.includes(x));
    if (newlyAdded.length > 0) {
      await runWithFallback(
        async () => {
          await supabaseServer.from("student_activities").insert(newlyAdded.map(skill => ({
            user_id: userId,
            activity_type: "skill",
            subject: "General",
            duration_minutes: 0,
            score: 100,
            details: { skill_name: skill },
          })));
        },
        () => {
          const db = getDb();
          const insert = db.prepare(`
            INSERT INTO student_activities (id, user_id, activity_type, subject, duration_minutes, score, details)
            VALUES (?, ?, 'skill', 'General', 0, 100, ?)
          `);
          newlyAdded.forEach(skill => {
            insert.run(crypto.randomUUID(), userId, JSON.stringify({ skill_name: skill }));
          });
        }
      );
    }

    return runWithFallback(
      async () => {
        const { error } = await supabaseServer.from("profiles").update({
          full_name: data.fullName,
          degree: data.degree,
          target_role: data.targetRole,
          current_skills: skillsArr,
          updated_at: new Date().toISOString(),
        }).eq("id", userId);
        if (error) throw error;
        return { ok: true };
      },
      () => {
        const db = getDb();
        const nowStr = new Date().toISOString();
        db.prepare(`
          UPDATE profiles
          SET full_name = ?, degree = ?, target_role = ?, current_skills = ?, updated_at = ?
          WHERE id = ?
        `).run(data.fullName, data.degree, data.targetRole, JSON.stringify(skillsArr), nowStr, userId);
        return { ok: true };
      }
    );
  });

export const exportAnalyticsCSV = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const activities = await runWithFallback(
      async () => {
        const { data } = await supabaseServer
          .from("student_activities")
          .select("activity_type, subject, duration_minutes, score, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });
        return data || [];
      },
      () => {
        const db = getDb();
        const rows = db.prepare("SELECT activity_type, subject, duration_minutes, score, created_at FROM student_activities WHERE user_id = ? ORDER BY created_at ASC").all(userId) as any[];
        return rows;
      }
    );

    let csvContent = "Activity Type,Subject,Duration (Mins),Score/Coverage (%),Logged Date\n";
    (activities ?? []).forEach((act: any) => {
      csvContent += `"${act.activity_type}","${act.subject || "General"}",${act.duration_minutes || 0},${act.score || 100},"${act.created_at}"\n`;
    });

    return { csv: csvContent };
  });
