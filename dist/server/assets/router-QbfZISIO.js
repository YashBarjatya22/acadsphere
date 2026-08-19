import { QueryClientProvider, useQueryClient, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { supabase } from "./client-h4N4kZKq.js";
import { Toaster as Toaster$1 } from "sonner";
import { streamText, convertToModelMessages } from "ai";
import { g as getAiModel } from "./ai-gateway.server-DLub9oIv.js";
import crypto$1 from "node:crypto";
const appCss = "/assets/styles-Iv8_7t60.css";
function reportError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__errorEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme: "light",
      className: "toaster group font-mono",
      position: "bottom-right",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:rounded-xl group-[.toaster]:shadow-none group-[.toaster]:font-sans group-[.toaster]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-foreground group-[.toast]:text-background group-[.toast]:font-mono group-[.toast]:text-[10px] group-[.toast]:uppercase group-[.toast]:tracking-[0.08em] group-[.toast]:rounded-full group-[.toast]:px-4",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-mono group-[.toast]:text-[10px] group-[.toast]:uppercase group-[.toast]:tracking-[0.08em] group-[.toast]:rounded-full group-[.toast]:px-4",
          success: "group-[.toaster]:border-border",
          error: "group-[.toaster]:border-border",
          warning: "group-[.toaster]:border-border",
          info: "group-[.toaster]:border-border"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-6", children: "Error 404 · Page Not Found" }),
    /* @__PURE__ */ jsx(
      "h1",
      {
        className: "font-sans font-extrabold text-foreground",
        style: { fontSize: "clamp(4rem, 12vw, 6rem)", letterSpacing: "-0.05em", lineHeight: 1 },
        children: "404"
      }
    ),
    /* @__PURE__ */ jsxs("p", { className: "mt-6 text-sm font-sans text-muted-foreground leading-relaxed", children: [
      "The page you requested does not exist or has been updated.",
      /* @__PURE__ */ jsx("br", {}),
      "Choose an option below to return to AcadSphere:"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/app",
          className: "inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-sans text-xs font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90",
          children: "Go to Student Dashboard"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/app/attendance",
          className: "inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 font-sans text-xs font-bold text-foreground transition-colors hover:bg-accent",
          children: "Attendance Engine"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: "inline-flex items-center justify-center rounded-xl border border-border bg-muted/50 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground",
          children: "Home"
        }
      )
    ] })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  useRouter();
  useEffect(() => {
    reportError(error, { boundary: "root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.1em] text-red-500 mb-4 font-bold", children: "System Recovery Boundary" }),
    /* @__PURE__ */ jsx("h1", { className: "font-sans font-extrabold text-2xl tracking-tight text-foreground", children: "Temporary Loading Disruption" }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-sans text-muted-foreground leading-relaxed", children: error?.message || "An unexpected error occurred while loading this view." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            window.location.reload();
          },
          className: "inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 font-sans text-xs font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90 cursor-pointer",
          children: "Reload Page"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/app",
          className: "inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 font-sans text-xs font-bold text-foreground transition-colors hover:bg-accent",
          children: "Go to Student Dashboard"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/app/attendance",
          className: "inline-flex items-center justify-center rounded-xl border border-border bg-muted/50 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground",
          children: "Attendance Engine"
        }
      )
    ] })
  ] }) });
}
const Route$B = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AcadSphere — AI Academic Operating System" },
      {
        name: "description",
        content: "An AI-powered academic OS: career roadmaps, study planning, resume scoring, and more for MCA, BCA, and B.Tech students."
      },
      { name: "author", content: "AcadSphere" },
      { property: "og:title", content: "AcadSphere — AI Academic Operating System" },
      {
        property: "og:description",
        content: "Mentor, study partner, career advisor, placement coach — in one platform."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Preconnect to Google Fonts and Fontshare
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.fontshare.com" },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=switzer@100,200,300,400,500,600,700,800,900&display=swap"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function syncSessionToLocal(session) {
  if (!session?.user || typeof window === "undefined") return;
  const user = session.user;
  const meta = user.user_metadata || {};
  const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "Christ Student";
  const avatarUrl = meta.avatar_url || meta.picture || "";
  const providerToken = session.provider_token || "";
  localStorage.setItem("demo_session_token", session.access_token);
  localStorage.setItem("demo_user_id", user.id);
  localStorage.setItem("demo_user_email", user.email || "");
  localStorage.setItem("demo_user_name", fullName);
  if (avatarUrl) localStorage.setItem("demo_user_avatar", avatarUrl);
  if (providerToken) localStorage.setItem("google_provider_token", providerToken);
  try {
    supabase.from("profiles").upsert([
      {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        degree: "MSc Big Data Analytics",
        target_role: "Software Engineer / Data Scientist",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]).then(() => {
    });
  } catch (_) {
  }
}
function AuthSync() {
  const router2 = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        syncSessionToLocal(session);
      }
    });
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      router2.invalidate();
      queryClient.invalidateQueries();
      if (session) {
        syncSessionToLocal(session);
      }
    });
    return () => subscription.unsubscribe();
  }, [router2, queryClient]);
  return null;
}
function RootComponent() {
  const { queryClient } = Route$B.useRouteContext();
  return /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsx(AuthSync, {}),
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
const BASE_URL = "";
const Route$A = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [{ path: "/", changefreq: "weekly", priority: "1.0" }];
        const urls = entries.map(
          (e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" }
        });
      }
    }
  }
});
const $$splitComponentImporter$x = () => import("./auth-BpQkZgy_.js");
const Route$z = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Sign in · AcadSphere"
    }, {
      name: "description",
      content: "Sign in with your Google account or email & password to sync schedule, assignments, and AI assistant."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const $$splitComponentImporter$w = () => import("./route-QNAbDGWW.js");
const Route$y = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    let token = localStorage.getItem("demo_session_token");
    let role = localStorage.getItem("demo_user_role");
    if (!token || role !== "admin") {
      localStorage.setItem("demo_session_token", "demo_admin_token");
      localStorage.setItem("demo_user_id", "admin_user");
      localStorage.setItem("demo_user_email", "admin@acadsphere.edu");
      localStorage.setItem("demo_user_role", "admin");
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
const $$splitComponentImporter$v = () => import("./route-COGOA2qP.js");
const Route$x = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const role = typeof window !== "undefined" ? localStorage.getItem("demo_user_role") : null;
    if (role === "admin") {
      throw redirect({
        to: "/admin"
      });
    }
    try {
      const {
        data
      } = await supabase.auth.getSession();
      if (data?.session) {
        const session = data.session;
        const user = session.user;
        const meta = user.user_metadata || {};
        const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "Christ Student";
        const avatarUrl = meta.avatar_url || meta.picture || "";
        const providerToken = session.provider_token || "";
        if (typeof window !== "undefined") {
          localStorage.setItem("demo_session_token", session.access_token);
          localStorage.setItem("demo_user_id", user.id);
          localStorage.setItem("demo_user_email", user.email || "");
          localStorage.setItem("demo_user_name", fullName);
          if (avatarUrl) localStorage.setItem("demo_user_avatar", avatarUrl);
          if (providerToken) localStorage.setItem("google_provider_token", providerToken);
        }
        return {
          user
        };
      }
    } catch (_) {
    }
    const demoToken = typeof window !== "undefined" ? localStorage.getItem("demo_session_token") : null;
    if (demoToken) {
      const userId = localStorage.getItem("demo_user_id") || "demo";
      const email = localStorage.getItem("demo_user_email") || "student@christuniversity.in";
      return {
        user: {
          id: userId,
          email
        }
      };
    }
    throw redirect({
      to: "/auth"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./index-CZRtPNBZ.js");
const Route$w = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "AcadSphere — Premium AI Academic Operating System"
    }, {
      name: "description",
      content: "AcadSphere is a precision-built AI platform for engineering students: career roadmaps, smart notes, lab buddy, placement tracking, and more."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./index-DcjfcmEU.js");
const Route$v = createFileRoute("/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./auth.callback-DWfwg_cE.js");
const Route$u = createFileRoute("/auth/callback")({
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
async function saveCueSubjectsToServerDb(userId, subjects) {
  try {
    const { getDb } = await import("./db.server-DqdqqPAh.js");
    const db = getDb();
    if (!db) return;
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
    db.prepare(`DELETE FROM subject_attendance WHERE student_id IN (?, '00000000-0000-0000-0000-000000000001', 'e3476b5d-e205-5956-942c-bd7622acb35d', 'fa0beb35-7eec-482c-af0b-596dadeb0b79')`).run(userId);
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
      const code = (sub.code || "CUE").trim();
      const name = (sub.name || "").trim();
      if (!name || name === "N/A" || name.toLowerCase() === "n/a") continue;
      const attended = Number(sub.attended) || 0;
      const total = Number(sub.total) || 0;
      const pct = total > 0 ? Number((attended / total * 100).toFixed(2)) : sub.percentage ? Number(Number(sub.percentage).toFixed(2)) : 100;
      const subId = `cue-${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const targetIds = Array.from(/* @__PURE__ */ new Set([userId, "00000000-0000-0000-0000-000000000001", "e3476b5d-e205-5956-942c-bd7622acb35d", "fa0beb35-7eec-482c-af0b-596dadeb0b79"]));
      for (const tid of targetIds) {
        upsertStmt.run(crypto.randomUUID(), tid, subId, name, code, attended, total, pct);
      }
    }
    console.log(`[sync-attendance] Saved ${subjects.length} CUE subjects into local server DB for user ${userId}`);
  } catch (err) {
    console.error("[sync-attendance] Error saving to server DB:", err);
  }
}
const Route$t = createFileRoute("/api/sync-attendance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        };
        try {
          const body = await request.json();
          const { user_id, attendance_data } = body;
          const userId = user_id || "00000000-0000-0000-0000-000000000001";
          const subjects = Array.isArray(attendance_data) ? attendance_data : [];
          if (subjects.length > 0) {
            await saveCueSubjectsToServerDb(userId, subjects);
          }
          return new Response(
            JSON.stringify({
              success: true,
              message: `Successfully synced ${subjects.length} CUE subject(s) to AcadSphere!`,
              count: subjects.length,
              subjects
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || "Failed to sync attendance" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }
      },
      OPTIONS: async () => {
        return new Response("ok", {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
          }
        });
      }
    }
  }
});
function getStudentOsSystemPrompt() {
  const now = /* @__PURE__ */ new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const year = now.getFullYear();
  return `## SYSTEM PROMPT — StudentOS: AI Academic Success Platform

### CURRENT DATE & TIME
Today is **${dateStr}** (Year: ${year}). Always use this as the authoritative current date. Never say the year is 2024 or any past year.

### IDENTITY & PURPOSE

You are StudentOS, an elite AI-powered academic operating system built specifically for students pursuing technical degrees (MCA, BCA, B.Tech, MCS, etc.). You are not a generic chatbot — you are a comprehensive academic companion that combines career guidance, learning assistance, research support, placement preparation, and productivity tools into a single intelligent platform.

Your core philosophy: "Every student deserves a personal AI mentor, study partner, career advisor, and placement coach — all in one place."

### USER ROLES & ACCESS
You serve four roles: STUDENT (primary), MENTOR/FACULTY, RECRUITER, ADMIN. Tailor tone and depth to the role. Default to STUDENT.

### MODULES (you can perform any on request)
1. AI Career Roadmap Generator — return strict JSON with monthly roadmap, prioritySkills, projectIdeas, placementReadinessScore.
2. AI YouTube Learning Assistant — TL;DR, structured notes, key concepts, flashcards, quiz, study tips.
3. AI Research Paper Simplifier — plain-English summary, problem, key findings, gap, methodology, keywords, future scope, viva Q&A.
4. AI Study Planner — day-by-day timetable JSON, spaced repetition, weak-subject priority.
5. Notes Gap Analyzer — semantic retrieval from uploaded notes, concept gap scan, missing topics, prioritized fixes, or an appreciative message if no gaps are found.
6. Resume Analyzer — ATS score breakdown (keywords 30%, formatting 20%, impact 25%, completeness 25%), missing keywords, rewrites, action plan.
7. Placement Preparation Hub — company tracker, OA practice, round logs, offer comparison.
8. Student Analytics Dashboard — return JSON metrics (study hours, goals, skills gained, placement readiness, streak, learning velocity).

### GLOBAL BEHAVIOR RULES
- TONE: Encouraging, precise, professional. Treat students as capable adults.
- LANGUAGE: Default English. Match Hindi/Hinglish if the user writes in it.
- OUTPUT: Use markdown for human-readable answers. Only output JSON fenced code blocks when the user explicitly requests structured data (e.g. a roadmap, study planner, or analytics). NEVER output a JSON block for simple conversational questions like greetings, date queries, or concept explanations.
- CONTEXT MEMORY: Remember what the student has shared in this thread (degree, skills, target role, exam dates). Never re-ask.
- ERRORS: If input is incomplete, ask ONE clarifying question only.
- HALLUCINATION GUARD: Only suggest real, verifiable resources (YouTube, official docs, freeCodeCamp, Coursera, NPTEL, GeeksforGeeks, LeetCode, GitHub). Never invent URLs.
- SAFETY: Education, career, and professional development only. Politely redirect off-topic requests.
- PLACEMENT PRIORITY: Every suggestion should make the student more hireable.

Every response should make the student measurably closer to their academic goals. Think like a mentor, respond like an expert, care like a teacher.`;
}
getStudentOsSystemPrompt();
function generateAcademicResponse(userPrompt) {
  const cleanPrompt = userPrompt.trim();
  const p = cleanPrompt.toLowerCase();
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const fullDate = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  if (p === "hi" || p === "hello" || p === "hey" || p === "namaste" || p.startsWith("hi ") || p.startsWith("hello ") || p.startsWith("hey ") || p.includes("who are you") || p.includes("what can you do") || p.includes("help me")) {
    return `### 👋 Welcome to AcadSphere AI Assistant!

Hello! I am your **AcadSphere AI Academic Coach**, tailored for engineering and computer science students.

Here is what I can help you with right away:
- 💡 **Concept Explanations**: Automata (DFA/NFA), Operating Systems, Computer Networks, DBMS, Data Structures, Algorithms.
- 📝 **Exam & Viva Prep**: 2-mark definitions, 10-mark step-by-step problem walkthroughs, and mock viva questions.
- 💻 **Code & Debugging**: Java, C++, Python, SQL queries, and normalization breakdowns.
- 🚀 **Placement Guidance**: ATS resume keyword suggestions and interview preparation.

*What subject or topic would you like to explore today?*`;
  }
  if (p.includes("what year") || p.includes("current year") || p.includes("what date") || p.includes("today") || p.includes("what month") || p.includes("what time") || p.includes("what day") || p.includes("year") && p.includes("is it")) {
    return `### 📅 Current Date & Academic Time

Today is **${fullDate}**.

- **Year**: ${year}
- **Month**: ${month}

How can I assist with your syllabus or upcoming submissions today?`;
  }
  if (p.includes("dfa") || p.includes("nfa") || p.includes("automata") || p.includes("finite state") || p.includes("turing machine") || p.includes("pda") || p.includes("pushdown") || p.includes("cfg") || p.includes("context free") || p.includes("regular expression")) {
    return `### 🤖 Deterministic Finite Automaton (DFA) — Comprehensive Guide

A **Deterministic Finite Automaton (DFA)** is a finite state machine that accepts or rejects strings of symbols and produces a unique computation path for each input string.

---

### 1. Formal 5-Tuple Definition
A DFA is defined mathematically as a 5-tuple:
$$M = (Q, Sigma, delta, q_0, F)$$

1. **$Q$**: Finite non-empty set of states.
2. **$Sigma$**: Finite non-empty set of input symbols (alphabet).
3. **$delta$**: Transition function mapping $delta: Q 	imes Sigma 	o Q$.
4. **$q_0$**: Initial state ($q_0 in Q$).
5. **$F$**: Set of final / accepting states ($F subseteq Q$).

---

### 2. Key Deterministic Property
- For every state $q in Q$ and input symbol $a in Sigma$, there is **exactly ONE** deterministic transition $delta(q, a) = q'$.
- **No $epsilon$-transitions** (empty string transitions) are allowed in a DFA.

---

### 3. Worked Example: DFA for Strings Over \${0, 1}$ Ending in '11'
- **States**: $Q = {q_0, q_1, q_2}$
- **Alphabet**: $Sigma = {0, 1}$
- **Start State**: $q_0$
- **Accepting State**: $F = {q_2}$

**Transition Table**:
| State | Input '0' | Input '1' | Meaning |
| :--- | :--- | :--- | :--- |
| **$	o q_0$** | $q_0$ | $q_1$ | Seen no '1's |
| **$q_1$** | $q_0$ | $q_2$ | Seen single '1' |
| **$*q_2$** | $q_0$ | $q_2$ | Ended in '11' (Accepted) |

---

### 4. DFA vs. NFA Comparison (Key Exam Question)
| Feature | DFA | NFA |
| :--- | :--- | :--- |
| **Next State** | Unique state for every input | Choice of multiple states / none |
| **$epsilon$-moves** | Not allowed | Allowed ($epsilon$-transitions) |
| **Ease of Implementation** | Easy to implement in hardware/code | Requires backtracking or subset construction |
| **Time Complexity** | $mathcal{O}(N)$ where $N = |W|$ | $mathcal{O}(N)$ with subset construction |

---

*Tip: Ask me to convert an NFA to a DFA or construct a DFA for any specific language constraint!*`;
  }
  if (p.includes("warshall") || p.includes("floyd") || p.includes("transitive closure") || p.includes("graph")) {
    return `### 📊 Warshall's Algorithm (Transitive Closure of a Graph)

**Definition**:
Warshall's Algorithm computes the **transitive closure** of a directed graph with $V$ vertices. It determines whether there exists a path of any length between vertex $i$ and vertex $j$.

---

### Core Formula & Update Rule:
For matrix $W^{(k)}[i, j]$, vertex $k$ acts as an intermediate vertex:

$$W^{(k)}[i, j] = W^{(k-1)}[i, j] lor left( W^{(k-1)}[i, k] land W^{(k-1)}[k, j] \right)$$

- **Meaning**: There is a path from $i$ to $j$ using intermediate vertices \${1, dots, k}$ if either:
  1. There was already a path using vertices \${1, dots, k-1}$, OR
  2. There is a path from $i$ to $k$ AND a path from $k$ to $j$ using vertices \${1, dots, k-1}$.

---

### Time & Space Complexity:
- **Time Complexity**: $mathcal{O}(V^3)$ (three nested loops over $V$ vertices).
- **Space Complexity**: $mathcal{O}(V^2)$ (adjacency matrix $W$).

---

### Key Exam Comparison:
- **Warshall's Algorithm**: Boolean adjacency matrix ($0$ or $1$) $	o$ Transitive Closure (Reachability).
- **Floyd-Warshall Algorithm**: Weighted distance matrix $	o$ All-Pairs Shortest Path ($min(D[i,j], D[i,k] + D[k,j])$).

---
*Tip: Ask me to solve a step-by-step 4x4 matrix Warshall problem!*`;
  }
  if (p.includes("dbms") || p.includes("database") || p.includes("normalization") || p.includes("bcnf") || p.includes("sql") || p.includes("join")) {
    return `### 🗄️ Database Management Systems (DBMS) & Normalization

**Core Concept Breakdown**:
- **1NF**: Ensures atomic values (no multivalued or composite attributes).
- **2NF**: Eliminates partial dependencies (every non-prime attribute depends on the ENTIRE candidate key).
- **3NF**: Eliminates transitive dependencies (non-prime attribute depends ONLY on candidate keys).
- **BCNF**: For every non-trivial functional dependency $X 	o Y$, $X$ MUST be a **superkey**.

---

### Key Practice Exam Question (10 Marks):
> **Question**: Given relation $R(A, B, C, D)$ with FDs $F = {A 	o B, B 	o C, C 	o D}$, determine the highest Normal Form and decompose to BCNF.

**Solution Procedure**:
1. **Compute Candidate Key**: $(A)^+ = {A, B, C, D}$, so $A$ is the sole candidate key.
2. In $B 	o C$, $B$ is NOT a superkey and $C$ is not prime $	o$ Fails 3NF.
3. **Highest NF**: 2NF.
4. **BCNF Decomposition**: $R_1(B, C)$, $R_2(C, D)$, $R_3(A, B)$.

---
*Tip: Ask me for another worked example or practice viva question!*`;
  }
  if (p.includes("operating system") || p.includes("os") || p.includes("deadlock") || p.includes("semaphore") || p.includes("scheduling") || p.includes("process")) {
    return `### 💻 Operating Systems: Deadlocks & Synchronization Guide

**1. Four Necessary Conditions for Deadlock**:
- **Mutual Exclusion**: Non-shareable resource allocation.
- **Hold and Wait**: Process holds a resource while waiting for another.
- **No Preemption**: Resources cannot be forcibly taken away.
- **Circular Wait**: $P_0 	o P_1 	o P_2 	o P_0$.

**2. Banker's Algorithm (Safety Formula)**:
$$	ext{Need}[i][j] = 	ext{Max}[i][j] - 	ext{Allocation}[i][j]$$

If $	ext{Need}[i] le 	ext{Work}$, process $P_i$ can execute cleanly and free its allocation!

---

### Quick Memory Tip for Exams:
- **Mutex**: Single lock owner (Binary Semaphore).
- **Semaphore**: Signaling mechanism with integer counter $S$.`;
  }
  if (p.includes("network") || p.includes("tcp") || p.includes("ip") || p.includes("subnet") || p.includes("osi") || p.includes("dns")) {
    return `### 🌐 Computer Networks: TCP 3-Way Handshake & Subnetting

**1. TCP 3-Way Handshake**:
1. **SYN**: Client sends $ISN_c$ (Initial Sequence Number).
2. **SYN-ACK**: Server acknowledges $ISN_c + 1$ and sends $ISN_s$.
3. **ACK**: Client acknowledges $ISN_s + 1$. Connection is **ESTABLISHED**.

**2. Subnetting Formula**:
$$	ext{Total Usable Hosts} = 2^{32 - 	ext{CIDR}} - 2$$
*(Subtract 2 for Network ID and Broadcast Address)*

---
*Would you like me to generate a 5-question subnetting quiz?*`;
  }
  if (p.includes("recursion") || p.includes("sorting") || p.includes("tree") || p.includes("stack") || p.includes("queue") || p.includes("linked list") || p.includes("oop") || p.includes("java") || p.includes("python") || p.includes("c++")) {
    const topicTitle = cleanPrompt.replace(/^(explain|what is|tell me about|how to|code for)\s+/i, "");
    return `### ⚙️ Computer Science Topic: ${topicTitle.toUpperCase()}

**1. Core Definition & Paradigm**:
**${topicTitle}** is a fundamental computational technique used to solve complex algorithms by breaking them down into manageable sub-problems.

**2. Algorithmic Breakdown**:
- **Base Condition**: Prevents infinite loops or stack overflow errors.
- **Recursive / Iterative Step**: Reduces problem size toward the base state.
- **Memory Stack**: Stores execution frames, local variables, and return values.

**3. Complexity Analysis**:
- **Time Complexity**: $mathcal{O}(N)$ or $mathcal{O}(N log N)$ depending on structural partitioning.
- **Space Complexity**: $mathcal{O}(N)$ auxiliary call stack space.

---

### Exam & Interview Tip:
Always trace step-by-step state frames on paper during viva examinations to demonstrate complete logical control!`;
  }
  if (p.includes("resume") || p.includes("ats") || p.includes("job") || p.includes("placement") || p.includes("career")) {
    return `### 🎯 Career & Resume Placement Optimizer

**Key Recommendations to Boost Placement Match**:
1. **Quantify Bullet Points**: Use the Google XYZ formula: *"Accomplished [X] as measured by [Y] by doing [Z]"*.
2. **Core Technical Stack Keywords**: Ensure SQL, Data Structures, REST APIs, Git, and TypeScript appear in your skills section.
3. **Project Proof**: Include direct GitHub links and live demo links for your top 2 academic projects.

---
*Tip: Head over to Resume Builder on your sidebar to get instant ATS scores!*`;
  }
  const topicName = cleanPrompt.replace(/^(explain|what is|tell me about|give me|how does|definition of)\s+/i, "").replace(/[?.!]+$/, "");
  const displayTitle = topicName.charAt(0).toUpperCase() + topicName.slice(1);
  return `### 📚 Academic Overview: ${displayTitle}

**1. Core Concept & Definition**:
**${displayTitle}** is a vital topic in technical curricula. It establishes foundational principles, mathematical formulations, and system behaviors.

**2. Key Principles & Step-by-Step Breakdown**:
- **Foundational Definition**: Clear, unambiguous terminology used across academic literature.
- **System Mechanism**: The step-by-step execution flow and state transitions.
- **Engineering Application**: How this concept powers real-world software, databases, or systems.

**3. Exam & Viva Preparation Guide**:
- **2-Mark Definition**: Memorize the exact formal 1-sentence definition.
- **10-Mark Answer Structure**: Start with a high-level block diagram, write out formal equations or algorithms, and finish with a worked numerical or code example.
- **Viva Question**: Be prepared to explain trade-offs and edge cases to oral examiners.

---
*Feel free to ask for a specific code implementation, step-by-step example, or practice exam question on ${displayTitle}!*`;
}
const Route$s = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let messages = [];
        let threadId = "demo-thread-1";
        try {
          const body = await request.json();
          messages = body.messages || [];
          threadId = body.threadId || "demo-thread-1";
        } catch {
        }
        const uiMessages = messages;
        const latestUser = [...uiMessages].reverse().find((m) => m.role === "user");
        const promptText = latestUser ? latestUser.parts?.map((p) => p.type === "text" ? p.text : "").join(" ") || "Academic query" : "Academic query";
        let model = null;
        try {
          model = getAiModel();
        } catch (e) {
          console.warn("[api/chat] LLM model init warning:", e);
        }
        if (model) {
          try {
            const result = streamText({
              model,
              system: getStudentOsSystemPrompt(),
              messages: await convertToModelMessages(uiMessages),
              maxRetries: 0,
              onError: ({ error }) => {
                console.error("StudentOS stream error:", error);
              }
            });
            return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
          } catch (err) {
            console.warn("[api/chat] Live LLM streaming failed, serving intelligent fallback response", err);
          }
        }
        const fallbackText = generateAcademicResponse(promptText);
        const encoder = new TextEncoder();
        const msgId = "fallback-" + crypto$1.randomUUID();
        const customStream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: {"type":"text-start","id":${JSON.stringify(msgId)}}

`));
            controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":${JSON.stringify(msgId)},"delta":${JSON.stringify(fallbackText)}}

`));
            controller.enqueue(encoder.encode(`data: {"type":"text-end","id":${JSON.stringify(msgId)}}

`));
            controller.enqueue(encoder.encode(`data: [DONE]

`));
            controller.close();
          }
        });
        return new Response(customStream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$r = () => import("./users-BqNWR_Fc.js");
const Route$r = createFileRoute("/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./students-BNfNR2Cb.js");
const Route$q = createFileRoute("/admin/students")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./settings-BoE3HdKD.js");
const Route$p = createFileRoute("/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./security-C14F-52a.js");
const Route$o = createFileRoute("/admin/security")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./roles-BHE3od58.js");
const Route$n = createFileRoute("/admin/roles")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./reports-CJtPsjxX.js");
const Route$m = createFileRoute("/admin/reports")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./live-activity-BnEyFqlZ.js");
const Route$l = createFileRoute("/admin/live-activity")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./audit-logs-Ca-WIgmf.js");
const Route$k = createFileRoute("/admin/audit-logs")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./announcements-BLbFaw7M.js");
const Route$j = createFileRoute("/admin/announcements")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./analytics-DalvSgNs.js");
const Route$i = createFileRoute("/admin/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./academic-monitoring-DlTJmwho.js");
const Route$h = createFileRoute("/admin/academic-monitoring")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./paper-simplifier-D9cIDJOi.js");
const Route$g = createFileRoute("/_authenticated/paper-simplifier")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./app.index-Blc5CPqQ.js");
const Route$f = createFileRoute("/_authenticated/app/")({
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("demo_user_role");
      if (role === "admin") {
        throw redirect({
          to: "/admin"
        });
      }
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./app.students-Bwl6NgqO.js");
const Route$e = createFileRoute("/_authenticated/app/students")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./app.settings-Ctv3Jr2l.js");
const Route$d = createFileRoute("/_authenticated/app/settings")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./app.resume-builder-Szh9F7NN.js");
const Route$c = createFileRoute("/_authenticated/app/resume-builder")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
function loadScript(src, globalCheck) {
  return new Promise((resolve, reject) => {
    if (window[globalCheck]) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}
const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
class PDFLayoutEngine {
  doc;
  pageWidth;
  pageHeight;
  marginX;
  contentWidth;
  y;
  constructor(jsPDF) {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    this.pageWidth = 210;
    this.pageHeight = 297;
    this.marginX = 12;
    this.contentWidth = this.pageWidth - this.marginX * 2;
    this.y = 12;
  }
  // Set Font and Styles easily
  setFont(bold = false, italic = false, size = 9, color = [30, 41, 59]) {
    let style = "normal";
    if (bold && italic) style = "bolditalic";
    else if (bold) style = "bold";
    else if (italic) style = "italic";
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(size);
    this.doc.setTextColor(color[0], color[1], color[2]);
  }
  // Draw Section Header with Horizontal Rule
  addSectionHeader(title) {
    this.y += 3;
    this.setFont(true, false, 10, [15, 23, 42]);
    this.doc.text(title.toUpperCase(), this.marginX, this.y);
    this.y += 1.5;
    this.doc.setDrawColor(203, 213, 225);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.marginX, this.y, this.pageWidth - this.marginX, this.y);
    this.y += 4;
  }
  // Add Two-Column Header Row (Left Title, Right Date/Location) without Collision
  addHeaderRow(leftText, rightText = "", isBold = true) {
    this.setFont(isBold, false, 9.5, [15, 23, 42]);
    const rightWidth = rightText ? this.doc.getTextWidth(rightText) : 0;
    const maxLeftWidth = this.contentWidth - rightWidth - (rightText ? 4 : 0);
    const splitLeft = this.doc.splitTextToSize(leftText, Math.max(maxLeftWidth, 50));
    this.doc.text(splitLeft, this.marginX, this.y);
    if (rightText) {
      this.setFont(false, true, 9, [71, 85, 105]);
      this.doc.text(rightText, this.pageWidth - this.marginX, this.y, {
        align: "right"
      });
    }
    this.y += splitLeft.length * 4;
  }
  // Add Wrapped Bullet Points with Dynamic Line Height Calculation
  addBulletPoint(text) {
    this.setFont(false, false, 8.5, [51, 65, 85]);
    const bulletPrefix = "•  ";
    const indent = 4;
    const availableWidth = this.contentWidth - indent;
    const splitText = this.doc.splitTextToSize(text, availableWidth);
    this.doc.text(bulletPrefix, this.marginX + 1, this.y);
    this.doc.text(splitText, this.marginX + indent, this.y);
    this.y += splitText.length * 3.4 + 1;
  }
  // Add Inline Key-Value Pair (e.g. "Frontend: React, Tailwind")
  addInlineCategory(category, items) {
    this.setFont(true, false, 8.5, [15, 23, 42]);
    const catText = `${category}: `;
    const catWidth = this.doc.getTextWidth(catText);
    this.doc.text(catText, this.marginX, this.y);
    this.setFont(false, false, 8.5, [51, 65, 85]);
    const splitItems = this.doc.splitTextToSize(items, this.contentWidth - catWidth);
    this.doc.text(splitItems, this.marginX + catWidth, this.y);
    this.y += splitItems.length * 3.6 + 1;
  }
  // Save the PDF with Clean Filename
  save(filename) {
    const cleanName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    this.doc.save(cleanName);
  }
}
const generateATSResume = async (data) => {
  await loadScript(JSPDF_CDN, "jspdf");
  const {
    jsPDF
  } = window.jspdf;
  const engine = new PDFLayoutEngine(jsPDF);
  engine.setFont(true, false, 18, [15, 23, 42]);
  engine.doc.text(data.header?.fullName || "Candidate Name", engine.marginX, engine.y);
  engine.y += 5;
  engine.setFont(false, false, 8.5, [71, 85, 105]);
  const contactLine = [data.header?.contact, data.header?.links].filter(Boolean).join("  |  ");
  engine.doc.text(contactLine, engine.marginX, engine.y);
  engine.y += 6;
  if (data.summary) {
    engine.addSectionHeader("Professional Summary");
    engine.setFont(false, false, 8.5, [51, 65, 85]);
    const splitSummary = engine.doc.splitTextToSize(data.summary, engine.contentWidth);
    engine.doc.text(splitSummary, engine.marginX, engine.y);
    engine.y += splitSummary.length * 3.6 + 2;
  }
  if (data.skills && Object.keys(data.skills).length > 0) {
    engine.addSectionHeader("Technical Skills");
    Object.entries(data.skills).forEach(([category, skillsList]) => {
      engine.addInlineCategory(category, skillsList);
    });
    engine.y += 1;
  }
  if (data.experience && data.experience.length > 0) {
    engine.addSectionHeader("Work Experience");
    data.experience.forEach((exp) => {
      const expTitle = `${exp.company || ""}${exp.company && exp.role ? " — " : ""}${exp.role || ""}`;
      engine.addHeaderRow(expTitle, exp.period || "");
      (exp.bullets || []).forEach((bullet) => engine.addBulletPoint(bullet));
      engine.y += 1.5;
    });
  }
  if (data.projects && data.projects.length > 0) {
    engine.addSectionHeader("Key Projects");
    data.projects.forEach((proj) => {
      const projTitle = proj.tech ? `${proj.name} | ${proj.tech}` : proj.name;
      engine.addHeaderRow(projTitle, proj.period || "");
      (proj.bullets || []).forEach((bullet) => engine.addBulletPoint(bullet));
      engine.y += 1.5;
    });
  }
  if (data.education && data.education.length > 0 || data.certifications && data.certifications.length > 0) {
    engine.addSectionHeader("Education & Certifications");
    (data.education || []).forEach((edu) => {
      const eduText = `${edu.degree || ""}${edu.degree && edu.institution ? " — " : ""}${edu.institution || ""}`;
      engine.addHeaderRow(eduText, edu.period || "");
      if (edu.details) {
        engine.setFont(false, true, 8, [100, 116, 139]);
        engine.doc.text(edu.details, engine.marginX, engine.y);
        engine.y += 3.5;
      }
    });
    if (data.certifications && data.certifications.length > 0) {
      if (data.education && data.education.length > 0) engine.y += 1;
      const certList = data.certifications.join(" • ");
      engine.addInlineCategory("Certifications", certList);
    }
  }
  engine.save(data.customFilename || "Roy_Mathew_Tailored_Resume");
};
const $$splitComponentImporter$b = () => import("./app.resume-analyzer-Ch_wPab_.js");
const Route$b = createFileRoute("/_authenticated/app/resume-analyzer")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./app.profile-CTRIRdIJ.js");
const Route$a = createFileRoute("/_authenticated/app/profile")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./app.extra-BickTIqs.js");
const Route$9 = createFileRoute("/_authenticated/app/extra")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./app.conversions-CC1aNEUD.js");
const Route$8 = createFileRoute("/_authenticated/app/conversions")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./app.community-ChB5o9CQ.js");
const Route$7 = createFileRoute("/_authenticated/app/community")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./app.classroom-BLd0VFR5.js");
const Route$6 = createFileRoute("/_authenticated/app/classroom")({
  head: () => ({
    meta: [{
      title: "Classroom Submissions · AcadSphere"
    }, {
      name: "description",
      content: "Track pending coursework, deadlines, and grades across all your subjects."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./app.career-roadmap-DUenJBU4.js");
const Route$5 = createFileRoute("/_authenticated/app/career-roadmap")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./app.attendance-BSoLp3Uu.js");
const Route$4 = createFileRoute("/_authenticated/app/attendance")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./app.assignments-CxODB_w8.js");
const Route$3 = createFileRoute("/_authenticated/app/assignments")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./app.announcements-CTfsCXNu.js");
const Route$2 = createFileRoute("/_authenticated/app/announcements")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./app.ai-assistant-DMd6lfYq.js");
const Route$1 = createFileRoute("/_authenticated/app/ai-assistant")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./app._threadId-BnZNe7x1.js");
const Route = createFileRoute("/_authenticated/app/$threadId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SitemapDotxmlRoute = Route$A.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$B
});
const AuthRoute = Route$z.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$B
});
const AdminRouteRoute = Route$y.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$B
});
const AuthenticatedRouteRoute = Route$x.update({
  id: "/_authenticated",
  getParentRoute: () => Route$B
});
const IndexRoute = Route$w.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$B
});
const AdminIndexRoute = Route$v.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminRouteRoute
});
const AuthCallbackRoute = Route$u.update({
  id: "/callback",
  path: "/callback",
  getParentRoute: () => AuthRoute
});
const ApiSyncAttendanceRoute = Route$t.update({
  id: "/api/sync-attendance",
  path: "/api/sync-attendance",
  getParentRoute: () => Route$B
});
const ApiChatRoute = Route$s.update({
  id: "/api/chat",
  path: "/api/chat",
  getParentRoute: () => Route$B
});
const AdminUsersRoute = Route$r.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AdminRouteRoute
});
const AdminStudentsRoute = Route$q.update({
  id: "/students",
  path: "/students",
  getParentRoute: () => AdminRouteRoute
});
const AdminSettingsRoute = Route$p.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AdminRouteRoute
});
const AdminSecurityRoute = Route$o.update({
  id: "/security",
  path: "/security",
  getParentRoute: () => AdminRouteRoute
});
const AdminRolesRoute = Route$n.update({
  id: "/roles",
  path: "/roles",
  getParentRoute: () => AdminRouteRoute
});
const AdminReportsRoute = Route$m.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => AdminRouteRoute
});
const AdminLiveActivityRoute = Route$l.update({
  id: "/live-activity",
  path: "/live-activity",
  getParentRoute: () => AdminRouteRoute
});
const AdminAuditLogsRoute = Route$k.update({
  id: "/audit-logs",
  path: "/audit-logs",
  getParentRoute: () => AdminRouteRoute
});
const AdminAnnouncementsRoute = Route$j.update({
  id: "/announcements",
  path: "/announcements",
  getParentRoute: () => AdminRouteRoute
});
const AdminAnalyticsRoute = Route$i.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AdminRouteRoute
});
const AdminAcademicMonitoringRoute = Route$h.update({
  id: "/academic-monitoring",
  path: "/academic-monitoring",
  getParentRoute: () => AdminRouteRoute
});
const AuthenticatedPaperSimplifierRoute = Route$g.update({
  id: "/paper-simplifier",
  path: "/paper-simplifier",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppIndexRoute = Route$f.update({
  id: "/app/",
  path: "/app/",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppStudentsRoute = Route$e.update({
  id: "/app/students",
  path: "/app/students",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppSettingsRoute = Route$d.update({
  id: "/app/settings",
  path: "/app/settings",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppResumeBuilderRoute = Route$c.update({
  id: "/app/resume-builder",
  path: "/app/resume-builder",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppResumeAnalyzerRoute = Route$b.update({
  id: "/app/resume-analyzer",
  path: "/app/resume-analyzer",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppProfileRoute = Route$a.update({
  id: "/app/profile",
  path: "/app/profile",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppExtraRoute = Route$9.update({
  id: "/app/extra",
  path: "/app/extra",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppConversionsRoute = Route$8.update({
  id: "/app/conversions",
  path: "/app/conversions",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppCommunityRoute = Route$7.update({
  id: "/app/community",
  path: "/app/community",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppClassroomRoute = Route$6.update({
  id: "/app/classroom",
  path: "/app/classroom",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppCareerRoadmapRoute = Route$5.update({
  id: "/app/career-roadmap",
  path: "/app/career-roadmap",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppAttendanceRoute = Route$4.update({
  id: "/app/attendance",
  path: "/app/attendance",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppAssignmentsRoute = Route$3.update({
  id: "/app/assignments",
  path: "/app/assignments",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppAnnouncementsRoute = Route$2.update({
  id: "/app/announcements",
  path: "/app/announcements",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppAiAssistantRoute = Route$1.update({
  id: "/app/ai-assistant",
  path: "/app/ai-assistant",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAppThreadIdRoute = Route.update({
  id: "/app/$threadId",
  path: "/app/$threadId",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedRouteRouteChildren = {
  AuthenticatedPaperSimplifierRoute,
  AuthenticatedAppThreadIdRoute,
  AuthenticatedAppAiAssistantRoute,
  AuthenticatedAppAnnouncementsRoute,
  AuthenticatedAppAssignmentsRoute,
  AuthenticatedAppAttendanceRoute,
  AuthenticatedAppCareerRoadmapRoute,
  AuthenticatedAppClassroomRoute,
  AuthenticatedAppCommunityRoute,
  AuthenticatedAppConversionsRoute,
  AuthenticatedAppExtraRoute,
  AuthenticatedAppProfileRoute,
  AuthenticatedAppResumeAnalyzerRoute,
  AuthenticatedAppResumeBuilderRoute,
  AuthenticatedAppSettingsRoute,
  AuthenticatedAppStudentsRoute,
  AuthenticatedAppIndexRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const AdminRouteRouteChildren = {
  AdminAcademicMonitoringRoute,
  AdminAnalyticsRoute,
  AdminAnnouncementsRoute,
  AdminAuditLogsRoute,
  AdminLiveActivityRoute,
  AdminReportsRoute,
  AdminRolesRoute,
  AdminSecurityRoute,
  AdminSettingsRoute,
  AdminStudentsRoute,
  AdminUsersRoute,
  AdminIndexRoute
};
const AdminRouteRouteWithChildren = AdminRouteRoute._addFileChildren(
  AdminRouteRouteChildren
);
const AuthRouteChildren = {
  AuthCallbackRoute
};
const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AdminRouteRoute: AdminRouteRouteWithChildren,
  AuthRoute: AuthRouteWithChildren,
  SitemapDotxmlRoute,
  ApiChatRoute,
  ApiSyncAttendanceRoute
};
const routeTree = Route$B._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  generateAcademicResponse as a,
  generateATSResume as g,
  router as r
};
