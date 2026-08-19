import { QueryClientProvider, useQueryClient, useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { useRouter, isRedirect, createRootRouteWithContext, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, useNavigate, useLocation, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "./client-h4N4kZKq.js";
import { Toaster as Toaster$1, toast } from "sonner";
import { streamText, convertToModelMessages } from "ai";
import { g as getAiModel } from "./ai-gateway.server-DLub9oIv.js";
import crypto$1 from "node:crypto";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "./server-CYaDwdxI.js";
import { r as requireSupabaseAuth } from "./auth-middleware-BnYhSKH5.js";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { X, LayoutDashboard, GraduationCap, Radio, TrendingUp, Megaphone, FileText, UserCog, ScrollText, Lock, Settings, Sparkles, Wand2, CheckCircle2, FileOutput, Users, User, Sun, Moon, LogOut, ChevronRight, ChevronLeft, Menu, Search, RefreshCw, AlertCircle, Flame, ArrowRight, Calendar, Clock, FileCheck2, BookOpen, Volume2, Code, Send, Wifi, MessageSquare, AlertTriangle, ChevronDown, ArrowUpRight, Check } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import gsap from "gsap";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar } from "recharts";
function useServerFn(serverFn) {
  const router2 = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router2.stores.location.get();
        return router2.navigate(router2.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router2, serverFn]);
}
const appCss = "/assets/styles-CoH-PPOf.css";
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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.fontshare.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700;800&display=swap"
      },
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
const $$splitComponentImporter$v = () => import("./auth-BtPQOwKV.js");
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
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./route-CWVz0N1a.js");
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
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./route-COGOA2qP.js");
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
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./index-BMDxfTmT.js");
const Route$w = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "AcadSphere — Premium AI Academic Operating System"
    }, {
      name: "description",
      content: "AcadSphere is a precision-built AI platform for engineering students: career roadmaps, smart notes, lab buddy, placement tracking, and more."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./index-DjkXP6lB.js");
const Route$v = createFileRoute("/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./auth.callback-DWfwg_cE.js");
const Route$u = createFileRoute("/auth/callback")({
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
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
const $$splitComponentImporter$p = () => import("./users-N7Y1_LTc.js");
const Route$r = createFileRoute("/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./students-BuG0j3dq.js");
const Route$q = createFileRoute("/admin/students")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./settings-CwG7MgUw.js");
const Route$p = createFileRoute("/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./security-BlEo8gWM.js");
const Route$o = createFileRoute("/admin/security")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./roles-BHE3od58.js");
const Route$n = createFileRoute("/admin/roles")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./reports-CJtPsjxX.js");
const Route$m = createFileRoute("/admin/reports")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./live-activity-4UceHP29.js");
const Route$l = createFileRoute("/admin/live-activity")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./audit-logs-44nnscFM.js");
const Route$k = createFileRoute("/admin/audit-logs")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./announcements-DN_07JLP.js");
const Route$j = createFileRoute("/admin/announcements")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./analytics-qRPPmLj5.js");
const Route$i = createFileRoute("/admin/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./academic-monitoring-DBH819Un.js");
const Route$h = createFileRoute("/admin/academic-monitoring")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./paper-simplifier-P3H8CQso.js");
const Route$g = createFileRoute("/_authenticated/paper-simplifier")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const listThreads = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("81f8d6ada944895e886fc9c1b3ea8c0e3fdfbdbcd7073b5a3e588f55517524dd"));
const createThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(120).optional(),
  module: z.string().max(80).optional()
}).parse(input ?? {})).handler(createSsrRpc("0e7b69b1d91bc88e34354aa34e93348913ee48b5657a1700135375a79d4eb416"));
const renameThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string(),
  title: z.string().min(1).max(120)
}).parse(input)).handler(createSsrRpc("152f66fb380cff85728c8839358f8222dd36daa7e513c551908a3b962311dbbc"));
const deleteThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string()
}).parse(input)).handler(createSsrRpc("e1c7e871a6ff3195deaf3eaa0b7cef206138273224933ee87c94a4e4f020e775"));
const saveMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().optional(),
  threadId: z.string(),
  role: z.enum(["user", "assistant"]),
  parts: z.any()
}).parse(input)).handler(createSsrRpc("818d84d8feb96f9e133b53f553d131a1a13d446631c853c0177ecb078188e07c"));
const getThreadMessages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  threadId: z.string()
}).parse(input)).handler(createSsrRpc("bc77fc2e18eb996fb643a2019ea9e4d22e813583b9affd0db1f7ed2849c1e317"));
const logo = "/assets/studentos-logo-CxuLY4XH.png";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      "border border-border",
      className
    ),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full object-cover", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full",
      "bg-muted",
      "font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
function ChatLayout({
  activeThreadId,
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  useServerFn(deleteThread);
  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn()
  });
  const userRole = typeof window !== "undefined" ? localStorage.getItem("demo_user_role") || "student" : "student";
  const isAdmin = userRole === "admin";
  const [sessionUser, setSessionUser] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || meta.name || u.email?.split("@")[0] || (isAdmin ? "Administrator" : "Student");
        const email = u.email || "";
        const avatar = meta.avatar_url || meta.picture || "";
        setSessionUser({ name, email, avatar });
        if (typeof window !== "undefined") {
          localStorage.setItem("demo_user_name", name);
          localStorage.setItem("demo_user_email", email);
          if (avatar) localStorage.setItem("demo_user_avatar", avatar);
          if (session.provider_token) localStorage.setItem("google_provider_token", session.provider_token);
        }
      }
    });
  }, [isAdmin]);
  const userName = sessionUser?.name || (typeof window !== "undefined" ? localStorage.getItem("demo_user_name") || (isAdmin ? "Administrator" : "Christ Student") : isAdmin ? "Administrator" : "Christ Student");
  const userEmail = sessionUser?.email || (typeof window !== "undefined" ? localStorage.getItem("demo_user_email") || "" : "");
  const userAvatar = sessionUser?.avatar || (typeof window !== "undefined" ? localStorage.getItem("demo_user_avatar") || "" : "");
  const userInitials = userName.split(" ").map((n) => n[0]).filter(Boolean).join("").substring(0, 2).toUpperCase() || "CS";
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };
  const create = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/app/$threadId", params: { threadId: t.id } });
      setMobileOpen(false);
    }
  });
  async function handleSignOut() {
    localStorage.removeItem("demo_session_token");
    localStorage.removeItem("demo_user_id");
    localStorage.removeItem("demo_user_email");
    localStorage.removeItem("demo_user_role");
    supabase.auth.signOut().catch(() => {
    });
    toast.success("Signed out");
    navigate({ to: "/" });
  }
  const studentNavItems = [
    { label: "Dashboard", to: "/app", icon: LayoutDashboard },
    { label: "AI Assistant", to: "/app/ai-assistant", icon: Sparkles },
    { label: "Classroom", to: "/app/classroom", icon: GraduationCap },
    { label: "Resume Tailorer", to: "/app/resume-builder", icon: Wand2 },
    { label: "Attendance", to: "/app/attendance", icon: CheckCircle2 },
    { label: "File Converter", to: "/app/conversions", icon: FileOutput },
    { label: "Community", to: "/app/community", icon: Users },
    { label: "Profile", to: "/app/profile", icon: User },
    { label: "Settings", to: "/app/settings", icon: Settings }
  ];
  const adminNavItems = [
    { label: "Command Center", to: "/admin", icon: LayoutDashboard },
    { label: "Student SIS", to: "/admin/students", icon: GraduationCap },
    { label: "Live Activity", to: "/admin/live-activity", icon: Radio },
    { label: "Analytics", to: "/admin/analytics", icon: TrendingUp },
    { label: "Announcements", to: "/admin/announcements", icon: Megaphone },
    { label: "Reports", to: "/admin/reports", icon: FileText },
    { label: "User Roles", to: "/admin/users", icon: UserCog },
    { label: "Audit Logs", to: "/admin/audit-logs", icon: ScrollText },
    { label: "Security", to: "/admin/security", icon: Lock },
    { label: "Settings", to: "/admin/settings", icon: Settings }
  ];
  const navItems = isAdmin ? adminNavItems : studentNavItems;
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans overflow-hidden selection:bg-zinc-200 dark:selection:bg-zinc-800", children: [
    /* @__PURE__ */ jsx(AnimatePresence, { children: mobileOpen && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden",
        onClick: () => setMobileOpen(false)
      }
    ) }),
    /* @__PURE__ */ jsxs(
      motion.aside,
      {
        animate: { width: collapsed ? 76 : 240 },
        transition: { type: "spring", stiffness: 350, damping: 30 },
        className: cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col shrink-0",
          "border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl",
          "md:static",
          mobileOpen ? "translate-x-0 !w-64" : "-translate-x-full md:translate-x-0"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex h-14 items-center justify-between px-4 border-b border-zinc-200/80 dark:border-zinc-800/80 shrink-0", children: [
            /* @__PURE__ */ jsxs(Link, { to: isAdmin ? "/admin" : "/app", className: "flex items-center gap-3 group min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-xs shrink-0 transition-transform group-hover:scale-105", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: logo,
                  alt: "AcadSphere",
                  className: "h-4.5 w-4.5 object-contain invert dark:invert-0"
                }
              ) }),
              !collapsed && /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  className: "flex flex-col min-w-0",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 truncate", children: "AcadSphere" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none", children: isAdmin ? "Enterprise Admin" : "Student OS" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setMobileOpen(false),
                className: "rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors md:hidden",
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto py-4 px-2.5 space-y-1 scrollbar-none", children: [
            !collapsed && /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 mb-2 font-medium", children: isAdmin ? "Navigation" : "Modules" }),
            /* @__PURE__ */ jsx("nav", { className: "space-y-1", children: navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return /* @__PURE__ */ jsx(
                Link,
                {
                  to: item.to,
                  onClick: () => setMobileOpen(false),
                  className: "block relative group",
                  children: /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      whileTap: { scale: 0.98 },
                      className: cn(
                        "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-150 relative",
                        isActive ? "text-zinc-900 dark:text-zinc-50 bg-zinc-100/90 dark:bg-zinc-800/80 font-semibold shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40"
                      ),
                      children: [
                        isActive && /* @__PURE__ */ jsx(
                          motion.div,
                          {
                            layoutId: "activeNavIndicator",
                            className: "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-zinc-900 dark:bg-zinc-100",
                            transition: { type: "spring", stiffness: 450, damping: 30 }
                          }
                        ),
                        /* @__PURE__ */ jsx(Icon, { className: cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100") }),
                        !collapsed && /* @__PURE__ */ jsx("span", { className: "truncate tracking-tight", children: item.label })
                      ]
                    }
                  )
                },
                item.label
              );
            }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-zinc-200/80 dark:border-zinc-800/80 p-2.5 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/40", children: /* @__PURE__ */ jsxs("div", { className: cn("flex items-center", collapsed ? "justify-center flex-col gap-2" : "justify-between px-1"), children: [
            /* @__PURE__ */ jsx(
              motion.button,
              {
                whileTap: { scale: 0.94 },
                onClick: toggleTheme,
                className: "p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 rounded-xl transition-colors",
                title: isDark ? "Light mode" : "Dark mode",
                children: isDark ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" })
              }
            ),
            !collapsed && /* @__PURE__ */ jsxs(
              motion.button,
              {
                whileTap: { scale: 0.96 },
                onClick: handleSignOut,
                className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 rounded-xl transition-colors",
                children: [
                  /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsx("span", { children: "Sign Out" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              motion.button,
              {
                whileTap: { scale: 0.94 },
                onClick: () => setCollapsed(!collapsed),
                className: "hidden md:flex p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 rounded-lg transition-colors",
                title: collapsed ? "Expand sidebar" : "Collapse sidebar",
                children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
              }
            )
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950", children: [
      /* @__PURE__ */ jsxs("header", { className: "flex h-14 items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl px-5 shrink-0 z-30", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMobileOpen(true),
              className: "rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors md:hidden",
              children: /* @__PURE__ */ jsx(Menu, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-[10px]", children: "Platform" }),
            /* @__PURE__ */ jsx("span", { className: "text-zinc-300 dark:text-zinc-700", children: "/" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-zinc-900 dark:text-zinc-100 tracking-tight", children: isAdmin ? "Enterprise Command Center" : "AcadSphere Academic Space" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 max-w-sm mx-4 hidden sm:block", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: isAdmin ? "Search students or records..." : "Search modules, courses, subjects...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full pl-9 pr-4 py-1.5 text-xs font-sans rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          !isAdmin ? /* @__PURE__ */ jsxs(
            motion.button,
            {
              whileTap: { scale: 0.96 },
              onClick: () => create.mutate(),
              className: "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity",
              children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Ask AI" })
              ]
            }
          ) : /* @__PURE__ */ jsxs(
            motion.button,
            {
              whileTap: { scale: 0.96 },
              onClick: () => navigate({ to: "/admin/students" }),
              className: "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity",
              children: [
                /* @__PURE__ */ jsx(GraduationCap, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Manage SIS" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              motion.button,
              {
                whileTap: { scale: 0.94 },
                onClick: () => setShowProfileMenu(!showProfileMenu),
                className: "flex items-center p-0.5 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all",
                children: /* @__PURE__ */ jsxs(Avatar, { className: "h-7 w-7", children: [
                  /* @__PURE__ */ jsx(AvatarImage, { src: userAvatar, alt: userName }),
                  /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-[10px]", children: userInitials })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(AnimatePresence, { children: showProfileMenu && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40", onClick: () => setShowProfileMenu(false) }),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 6, scale: 0.97 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  exit: { opacity: 0, y: 4, scale: 0.97 },
                  transition: { duration: 0.15, ease: "easeOut" },
                  className: "absolute right-0 top-full mt-2 w-56 z-50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl py-1.5 shadow-lg",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-1", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate", children: userName }),
                      /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] text-zinc-500 truncate mt-0.5", children: userEmail })
                    ] }),
                    /* @__PURE__ */ jsxs(
                      Link,
                      {
                        to: isAdmin ? "/admin" : "/app/profile",
                        onClick: () => setShowProfileMenu(false),
                        className: "flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors",
                        children: [
                          /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
                          isAdmin ? "Admin Center" : "Profile & Credentials"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Link,
                      {
                        to: isAdmin ? "/admin/settings" : "/app/settings",
                        onClick: () => setShowProfileMenu(false),
                        className: "flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors",
                        children: [
                          /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5" }),
                          "Preferences & Integrations"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1", children: /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => {
                          setShowProfileMenu(false);
                          handleSignOut();
                        },
                        className: "flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors",
                        children: [
                          /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }),
                          "Sign Out"
                        ]
                      }
                    ) })
                  ]
                }
              )
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children })
    ] })
  ] });
}
const LogActivitySchema = z.object({
  activityType: z.enum(["study_session", "milestone", "skill", "streak"]),
  subject: z.string().optional(),
  durationMinutes: z.number().optional(),
  score: z.number().optional(),
  details: z.string().optional()
});
const UpdateProfileSchema = z.object({
  fullName: z.string().min(1),
  degree: z.string().min(1),
  semester: z.string().min(1),
  targetRole: z.string().min(1),
  skills: z.string(),
  examDates: z.string().optional()
});
const getAnalyticsSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b005828a5a239862ffda1c30b4096f5f7146ab3d0881ae9cf70f9a6cdc227aee"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => LogActivitySchema.parse(input)).handler(createSsrRpc("ce937db2f34db99fad64c73d04b3330290ac3d36537bdb0ea521818c16327c0b"));
const updateProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => UpdateProfileSchema.parse(input)).handler(createSsrRpc("994bc8a09403ee2a686e19815cce4a5b077fb33187b520746fa2c12970b1459c"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("804027459f894fca22604d94977aa13b08f38152865659648ee67205dccab425"));
const syncAttendanceToLocalDb = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  userId: z.string().optional(),
  subjects: z.array(z.any())
})).handler(createSsrRpc("d772552b1bebca97f813c0b3e50d4285ad4358c04b792cc4f3eb0d9a542c76e0"));
const getAttendanceDashboardData = createServerFn({
  method: "GET"
}).inputValidator(z.object({
  userId: z.string().optional()
}).optional()).handler(createSsrRpc("122bef2cf6d933bceb9ed73f2b8c84032d7c384f0a49796cdb7afb2afa6ddce6"));
const updateSubjectAttendance = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  subjectId: z.string(),
  action: z.enum(["present", "absent", "reset"])
})).handler(createSsrRpc("88709e54f3739efe25d062a150d5c6b95e3273d0275843aeb2f0d81a386006e3"));
const markNotificationRead = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  notificationId: z.string()
})).handler(createSsrRpc("a83ea5f608e7f3035543c233e3129885c03a3448bb6e729bb5fa139700cc727d"));
const deleteNotification = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  notificationId: z.string()
})).handler(createSsrRpc("b55efa7a6209666175f7467c0f5ccf6fe5475d4a096adab3d742ffeda2156fc1"));
const buttonVariants = cva(
  // Base — Space Mono uppercase pill, no scale animation
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-full",
    "font-mono text-[11px] font-normal uppercase tracking-[0.08em]",
    "cursor-pointer",
    "transition-[opacity,background-color,border-color,color]",
    "duration-[120ms]",
    "ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ].join(" "),
  {
    variants: {
      variant: {
        // Filled black — primary action
        default: "bg-foreground text-background hover:opacity-80",
        // Outlined — secondary action
        outline: "border border-border bg-transparent text-foreground hover:bg-accent",
        // Ghost — tertiary / nav items
        ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        // Destructive — still monochrome (dark, not red)
        destructive: "bg-foreground text-background hover:opacity-70",
        // Secondary — muted fill
        secondary: "bg-muted text-foreground hover:bg-accent",
        // Link — underline only
        link: "underline-offset-4 hover:underline text-foreground bg-transparent p-0"
      },
      size: {
        default: "h-11 px-7",
        sm: "h-9 px-5 text-[10px]",
        lg: "h-12 px-8",
        xl: "h-14 px-10 text-[12px]",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const Route$f = createFileRoute("/_authenticated/app/")({
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("demo_user_role");
      if (role === "admin") {
        throw redirect({ to: "/admin" });
      }
    }
  },
  component: AppIndex
});
function AppIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const dashboardRef = useRef(null);
  const successNumberRef = useRef(null);
  const attendanceNumberRef = useRef(null);
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const getAttendanceFn = useServerFn(getAttendanceDashboardData);
  const updateProfileFn = useServerFn(updateProfile);
  const createThreadFn = useServerFn(createThread);
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getSummaryFn()
  });
  const { data: attendanceData } = useQuery({
    queryKey: ["attendanceDashboardData"],
    queryFn: () => getAttendanceFn()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    degree: "",
    semester: "",
    targetRole: "",
    skills: ""
  });
  const [sessionUser, setSessionUser] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || meta.name || u.email?.split("@")[0] || "Student";
        const email = u.email || "";
        setSessionUser({ name, email });
      }
    });
  }, []);
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello! I can help you analyze concept gaps, practice vivas, or customize your career roadmap. What's on your mind today?" }
  ]);
  const profile = analytics?.profile;
  const stats = analytics?.stats;
  const readiness = stats?.placementReadiness || 78;
  const successScore = Math.round((readiness * 0.6 + (analytics?.roadmap.percentage || 67) * 0.2 + (stats?.studyHoursThisWeek || 12.2) * 1.5) / 2);
  const overallAttendance = attendanceData?.overall?.percentage ?? 83;
  useEffect(() => {
    if (!isLoading && analytics && dashboardRef.current) {
      gsap.fromTo(
        ".bento-card",
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.05,
          ease: "power3.out",
          clearProps: "transform"
        }
      );
      if (successNumberRef.current) {
        const counterObj = { val: 0 };
        gsap.to(counterObj, {
          val: successScore,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            if (successNumberRef.current) {
              successNumberRef.current.innerText = Math.round(counterObj.val).toString();
            }
          }
        });
      }
      if (attendanceNumberRef.current) {
        const counterObj = { val: 0 };
        gsap.to(counterObj, {
          val: overallAttendance,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            if (attendanceNumberRef.current) {
              attendanceNumberRef.current.innerText = Math.round(counterObj.val).toString();
            }
          }
        });
      }
    }
  }, [isLoading, analytics, successScore, overallAttendance]);
  const startEdit = () => {
    if (analytics?.profile) {
      setProfileForm({
        fullName: analytics.profile.fullName,
        degree: analytics.profile.degree,
        semester: analytics.profile.semester,
        targetRole: analytics.profile.targetRole,
        skills: Array.isArray(analytics.profile.skills) ? analytics.profile.skills.join(", ") : ""
      });
      setIsEditing(true);
    }
  };
  const saveProfile = useMutation({
    mutationFn: (data) => updateProfileFn({ data }),
    onSuccess: () => {
      toast.success("Academic profile updated!");
      setIsEditing(false);
      refetch();
      qc.invalidateQueries({ queryKey: ["analyticsSummary"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    }
  });
  useMutation({
    mutationFn: () => createThreadFn({ data: {} }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/app/$threadId", params: { threadId: t.id } });
    }
  });
  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setAiInput("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: `I've noted your question: "${userMsg}". Launch an AI Mentoring session for deep syllabus breakdown!` }
      ]);
    }, 800);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-400", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "h-6 w-6 animate-spin text-zinc-900 dark:text-zinc-100" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono text-xs uppercase tracking-widest text-zinc-500", children: "Initializing Workspace..." })
    ] }) }) });
  }
  if (error || !analytics) {
    return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-xs", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-zinc-400 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-zinc-900 dark:text-zinc-100", children: "Unable to load workspace" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-zinc-500", children: error?.message || "Please check your network connection and session credentials." }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: /* @__PURE__ */ jsx(Button, { onClick: () => refetch(), className: "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs px-4 rounded-xl", children: "Retry" }) })
    ] }) }) });
  }
  const studyHoursData = [
    { name: "Mon", hours: 2.5 },
    { name: "Tue", hours: 3.8 },
    { name: "Wed", hours: 1.5 },
    { name: "Thu", hours: 4.2 },
    { name: "Fri", hours: 2 },
    { name: "Sat", hours: 5.5 },
    { name: "Sun", hours: 3 }
  ];
  const attendanceTrendData = [
    { month: "Jan", attendance: 88 },
    { month: "Feb", attendance: 90 },
    { month: "Mar", attendance: 86 },
    { month: "Apr", attendance: 92 },
    { month: "May", attendance: 94 },
    { month: "Jun", attendance: 93 }
  ];
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsx(
    motion.div,
    {
      ref: dashboardRef,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: "easeOut" },
      className: "h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8",
      children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-12 items-start max-w-7xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: "bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 md:p-7 shadow-xs", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsxs("h1", { className: "font-semibold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100", children: [
                  "Welcome back, ",
                  sessionUser?.name || profile?.fullName || "Student"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium", children: [
                  /* @__PURE__ */ jsx(Flame, { className: "h-3.5 w-3.5 text-amber-500" }),
                  stats?.currentStreak || 12,
                  " Day Streak"
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl", children: '"Precision in preparation creates certainty in execution."' }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-1 text-xs text-zinc-600 dark:text-zinc-300", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold", children: "Today:" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "10:00 AM Distributed Systems · 02:00 PM Mock Viva" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 shrink-0 bg-zinc-50/80 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative h-14 w-14", children: [
                /* @__PURE__ */ jsxs("svg", { className: "h-full w-full -rotate-90", viewBox: "0 0 64 64", children: [
                  /* @__PURE__ */ jsx("circle", { cx: "32", cy: "32", r: "26", stroke: "currentColor", className: "text-zinc-200 dark:text-zinc-800", fill: "transparent", strokeWidth: "4" }),
                  /* @__PURE__ */ jsx(
                    "circle",
                    {
                      cx: "32",
                      cy: "32",
                      r: "26",
                      stroke: "currentColor",
                      className: "text-zinc-900 dark:text-zinc-100",
                      fill: "transparent",
                      strokeWidth: "4",
                      strokeDasharray: 2 * Math.PI * 26,
                      strokeDashoffset: 2 * Math.PI * 26 * (1 - successScore / 100),
                      strokeLinecap: "round",
                      style: { transition: "stroke-dashoffset 1s ease-out" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex items-center justify-center font-bold text-xs text-zinc-900 dark:text-zinc-100", children: [
                  /* @__PURE__ */ jsx("span", { ref: successNumberRef, children: successScore }),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-xs text-zinc-900 dark:text-zinc-100", children: "Success Index" }),
                /* @__PURE__ */ jsx("p", { className: "font-mono text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5", children: "Readiness benchmark" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                whileHover: { y: -2 },
                transition: { type: "spring", stiffness: 400, damping: 25 },
                className: "bento-card bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between md:col-span-1",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-zinc-900 dark:text-zinc-100" }),
                      /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300", children: "Attendance Health" })
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100", children: [
                      /* @__PURE__ */ jsx("span", { ref: attendanceNumberRef, children: overallAttendance }),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 my-4 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-xs", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-zinc-400 font-mono text-[9px] uppercase tracking-wider", children: "At Risk" }),
                      /* @__PURE__ */ jsx("p", { className: "text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5", children: attendanceData?.overall?.subjectsAtRiskCount ?? 2 })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-zinc-400 font-mono text-[9px] uppercase tracking-wider", children: "Critical" }),
                      /* @__PURE__ */ jsx("p", { className: "text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5", children: attendanceData?.overall?.criticalSubjectsCount ?? 1 })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    Link,
                    {
                      to: "/app/attendance",
                      className: "flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:opacity-80 group pt-2 border-t border-zinc-100 dark:border-zinc-800",
                      children: [
                        /* @__PURE__ */ jsx("span", { children: "Attendance Ledger" }),
                        /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" })
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "bento-card md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
              { label: "Active Courses", value: "5 Subjects", sub: "Classroom Synced", icon: GraduationCap },
              { label: "Assignments", value: "2 Pending", sub: "Due by Friday", icon: Calendar },
              { label: "Attendance", value: `${overallAttendance}%`, sub: "CUE Synced", icon: CheckCircle2 },
              { label: "AI Quota", value: "38 / 100", sub: "Refreshes in 12d", icon: Sparkles },
              { label: "Weekly Study", value: "12.2 hrs", sub: "Target: 15.0h", icon: Clock },
              { label: "Resume Profiles", value: "3 Versions", sub: "ATS Optimized", icon: FileCheck2 }
            ].map((card, idx) => {
              const Icon = card.icon;
              return /* @__PURE__ */ jsxs(
                motion.div,
                {
                  whileHover: { y: -2 },
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                  className: "bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
                      /* @__PURE__ */ jsx("p", { className: "font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-semibold", children: card.label }),
                      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 text-zinc-400 shrink-0" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-base text-zinc-900 dark:text-zinc-100 tracking-tight mt-1", children: card.value }),
                    /* @__PURE__ */ jsx("p", { className: "font-mono text-[9px] text-zinc-400 mt-0.5", children: card.sub })
                  ]
                },
                idx
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-5 shadow-xs", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-3.5", children: "Quick Action Studio" }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-3 grid-cols-2 sm:grid-cols-3", children: [
              { label: "AI Study Assistant", icon: Sparkles, action: () => createThreadFn().then((t) => navigate({ to: "/app/$threadId", params: { threadId: t.id } })) },
              { label: "Resume Tailorer", icon: FileCheck2, action: () => navigate({ to: "/app/resume-builder" }) },
              { label: "Attendance Portal", icon: CheckCircle2, action: () => navigate({ to: "/app/attendance" }) }
            ].map((act, idx) => {
              const Icon = act.icon;
              return /* @__PURE__ */ jsxs(
                motion.button,
                {
                  whileHover: { y: -2 },
                  whileTap: { scale: 0.98 },
                  onClick: act.action,
                  className: "flex items-center gap-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 p-3 text-left transition-colors group",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" }) }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold tracking-tight text-zinc-800 dark:text-zinc-200", children: act.label })
                  ]
                },
                idx
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-6 md:p-7 space-y-6 shadow-xs", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5", children: "Study Performance" }),
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight", children: "Academic Analytics Matrix" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
                /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-medium", children: "Weekly Study Distribution (Hours)" }),
                /* @__PURE__ */ jsx("div", { className: "h-44 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-2.5", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: studyHoursData, children: [
                  /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorHours", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                    /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#71717a", stopOpacity: 0.25 }),
                    /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#71717a", stopOpacity: 0 })
                  ] }) }),
                  /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "rgba(113, 113, 122, 0.15)" }),
                  /* @__PURE__ */ jsx(XAxis, { dataKey: "name", stroke: "#a1a1aa", fontSize: 10, tickLine: false, axisLine: false }),
                  /* @__PURE__ */ jsx(YAxis, { stroke: "#a1a1aa", fontSize: 10, tickLine: false, axisLine: false }),
                  /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "rgba(24, 24, 27, 0.9)", border: "1px solid #3f3f46", borderRadius: "10px", color: "#fff", fontSize: 11 } }),
                  /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "hours", stroke: "#18181b", strokeWidth: 2, fillOpacity: 1, fill: "url(#colorHours)" })
                ] }) }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
                /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-medium", children: "Monthly Attendance Rate (%)" }),
                /* @__PURE__ */ jsx("div", { className: "h-44 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-2.5", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: attendanceTrendData, children: [
                  /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "rgba(113, 113, 122, 0.15)" }),
                  /* @__PURE__ */ jsx(XAxis, { dataKey: "month", stroke: "#a1a1aa", fontSize: 10, tickLine: false, axisLine: false }),
                  /* @__PURE__ */ jsx(YAxis, { domain: [70, 100], stroke: "#a1a1aa", fontSize: 10, tickLine: false, axisLine: false }),
                  /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "rgba(24, 24, 27, 0.9)", border: "1px solid #3f3f46", borderRadius: "10px", color: "#fff", fontSize: 11 } }),
                  /* @__PURE__ */ jsx(Bar, { dataKey: "attendance", fill: "#27272a", radius: [4, 4, 0, 0], barSize: 16 })
                ] }) }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-6 md:p-7 space-y-4 shadow-xs", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold", children: "Recent Activity Log" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800", children: [
              { title: "Smart Note Uploaded", desc: "Lecture notes processed for Query Optimization in DBMS.", time: "2h ago", icon: BookOpen },
              { title: "AI Practice Viva", desc: "Simulated viva round completed on TCP/IP Model.", time: "1d ago", icon: Volume2 },
              { title: "Syllabus Milestone Done", desc: "Completed Subnetting & Routing Algorithms module.", time: "2d ago", icon: CheckCircle2 },
              { title: "Lab Workspace Compiled", desc: "Walkthrough generated for Socket Programming Lab.", time: "3d ago", icon: Code },
              { title: "Resume Audited", desc: "ATS rating updated with verified project bullets.", time: "5d ago", icon: FileCheck2 }
            ].map((act, idx) => {
              const Icon = act.icon;
              return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950", children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 text-zinc-500" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate", children: act.title }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-zinc-400 shrink-0", children: act.time })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed", children: act.desc })
                ] })
              ] }, idx);
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 overflow-hidden flex flex-col h-[420px] shadow-xs", children: [
            /* @__PURE__ */ jsx("div", { className: "px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsx("div", { className: "h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-zinc-900 dark:text-zinc-100", children: "AI Study Copilot" }),
                /* @__PURE__ */ jsxs("p", { className: "font-mono text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" }),
                  " Ready"
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40", children: chatMessages.map((msg, idx) => /* @__PURE__ */ jsx(
              "div",
              {
                className: `flex flex-col max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.sender === "user" ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 ml-auto rounded-tr-sm" : "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 mr-auto rounded-tl-sm shadow-xs"}`,
                children: /* @__PURE__ */ jsx("span", { children: msg.text })
              },
              idx
            )) }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleSendAiMessage, className: "p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2 shrink-0", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Ask any syllabus question...",
                  value: aiInput,
                  onChange: (e) => setAiInput(e.target.value),
                  className: "flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                }
              ),
              /* @__PURE__ */ jsx(
                motion.button,
                {
                  whileTap: { scale: 0.92 },
                  type: "submit",
                  className: "h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center shadow-xs",
                  children: /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-6 space-y-4 shadow-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3", children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold", children: "Course Deadlines" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-zinc-500 font-medium", children: "Active Semester" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: [
              { date: "Aug 24", title: "DBMS Project Phase 1", tag: "Major Milestone", urgent: true },
              { date: "Aug 28", title: "OS Lab Viva Prep", tag: "Assessment", urgent: false },
              { date: "Sep 02", title: "Resume ATS Review", tag: "Career Placement", urgent: false }
            ].map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/40", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-zinc-900 dark:text-zinc-100", children: item.title }),
                /* @__PURE__ */ jsx("p", { className: "font-mono text-[9px] text-zinc-400", children: item.tag })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200", children: item.date })
            ] }, idx)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-5 space-y-3 shadow-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold", children: "Academic Profile" }),
              /* @__PURE__ */ jsx("button", { onClick: startEdit, className: "text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100", children: isEditing ? "Editing" : "Edit" })
            ] }),
            !isEditing ? /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Name" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-zinc-900 dark:text-zinc-100", children: profile?.fullName || "Student" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Degree" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-zinc-900 dark:text-zinc-100", children: profile?.degree || "MSc Data Science" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Target Role" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-zinc-900 dark:text-zinc-100", children: profile?.targetRole || "Software Engineer" })
              ] })
            ] }) : /* @__PURE__ */ jsxs(
              "form",
              {
                onSubmit: (e) => {
                  e.preventDefault();
                  saveProfile.mutate(profileForm);
                },
                className: "space-y-2.5 pt-1",
                children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      placeholder: "Full Name",
                      value: profileForm.fullName,
                      onChange: (e) => setProfileForm({ ...profileForm, fullName: e.target.value }),
                      className: "w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
                      required: true
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      placeholder: "Degree / Major",
                      value: profileForm.degree,
                      onChange: (e) => setProfileForm({ ...profileForm, degree: e.target.value }),
                      className: "w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
                      required: true
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saveProfile.isPending, className: "flex-1 h-7 text-xs bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-xl", children: "Save" }),
                    /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setIsEditing(false), variant: "outline", className: "flex-1 h-7 text-xs rounded-xl", children: "Cancel" })
                  ] })
                ]
              }
            )
          ] })
        ] })
      ] })
    }
  ) });
}
const $$splitComponentImporter$d = () => import("./app.students-CezG4_7A.js");
const Route$e = createFileRoute("/_authenticated/app/students")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./app.settings-CR-CWIPN.js");
const Route$d = createFileRoute("/_authenticated/app/settings")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./app.resume-builder-BLaGiEih.js");
const Route$c = createFileRoute("/_authenticated/app/resume-builder")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
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
const $$splitComponentImporter$a = () => import("./app.resume-analyzer-BW5bycI-.js");
const Route$b = createFileRoute("/_authenticated/app/resume-analyzer")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./app.profile-0MpGmJrV.js");
const Route$a = createFileRoute("/_authenticated/app/profile")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./app.extra-CAvGMo_b.js");
const Route$9 = createFileRoute("/_authenticated/app/extra")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./app.conversions-DbmqOGtV.js");
const Route$8 = createFileRoute("/_authenticated/app/conversions")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./app.community-DgLTRgPB.js");
const Route$7 = createFileRoute("/_authenticated/app/community")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const GetSubmissionsInputSchema = z.object({
  providerToken: z.string().optional()
}).optional();
const getClassroomSubmissions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => GetSubmissionsInputSchema.parse(input)).handler(createSsrRpc("d857efceb3cbcfd44d51141ec68e15e02862fa80f999cfbd0f80a14b83c7327f"));
const getCachedClassroomTasks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f767b0c2d1d2c73a2233a3e8ccdc7c004a58a50c840358803513546576b8d4c2"));
const Route$6 = createFileRoute("/_authenticated/app/classroom")({
  head: () => ({
    meta: [
      { title: "Classroom Submissions · AcadSphere" },
      { name: "description", content: "Track pending coursework, deadlines, and grades across all your subjects." }
    ]
  }),
  component: ClassroomPage
});
function ClassroomPage() {
  const fetchSubmissionsFn = useServerFn(getClassroomSubmissions);
  const fetchCachedTasksFn = useServerFn(getCachedClassroomTasks);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingDemoSms, setIsSendingDemoSms] = useState(false);
  const [reviewedMap, setReviewedMap] = useState({});
  const [showBanner, setShowBanner] = useState(true);
  const [hasToken, setHasToken] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("google_provider_token")
  );
  const tokenCheckRef = useRef(null);
  useEffect(() => {
    if (hasToken) return;
    let attempts = 0;
    tokenCheckRef.current = setInterval(() => {
      attempts++;
      const tok = typeof window !== "undefined" ? localStorage.getItem("google_provider_token") : null;
      if (tok) {
        setHasToken(true);
        clearInterval(tokenCheckRef.current);
      } else if (attempts >= 20) {
        clearInterval(tokenCheckRef.current);
      }
    }, 500);
    return () => {
      if (tokenCheckRef.current) clearInterval(tokenCheckRef.current);
    };
  }, [hasToken]);
  const { data: cachedData } = useQuery({
    queryKey: ["classroomCache"],
    queryFn: () => fetchCachedTasksFn(),
    staleTime: 30 * 1e3,
    gcTime: 5 * 60 * 1e3
  });
  const { data: liveData, isLoading: isLiveLoading, refetch } = useQuery({
    queryKey: ["classroomSubmissions", hasToken],
    queryFn: async () => {
      let googleToken = typeof window !== "undefined" ? localStorage.getItem("google_provider_token") || void 0 : void 0;
      if (!googleToken) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.provider_token) {
            googleToken = session.provider_token;
            if (typeof window !== "undefined") {
              localStorage.setItem("google_provider_token", session.provider_token);
              setHasToken(true);
            }
          }
        } catch (_) {
        }
      }
      return fetchSubmissionsFn({ data: { providerToken: googleToken } });
    },
    staleTime: 60 * 1e3,
    refetchInterval: 5 * 60 * 1e3,
    placeholderData: cachedData
  });
  const data = liveData ?? cachedData;
  const isShowingCache = !liveData && !!cachedData?.assignments?.length;
  const isLoading = isLiveLoading && !cachedData?.assignments?.length;
  const isBackgroundRefreshing = isLiveLoading && !!cachedData?.assignments?.length;
  const isConnected = liveData?.connected ?? false;
  const assignments = data?.assignments ?? [];
  const syncTasksToDb = async (items) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const pendingItems = items.filter(
        (a) => a.state === "PENDING" || a.state === "OVERDUE"
      );
      if (pendingItems.length === 0) return;
      const rows = pendingItems.map((a) => ({
        user_id: user.id,
        coursework_id: a.id,
        title: a.title,
        course_name: a.courseName || "",
        due_date: a.dueDate ? new Date(a.dueDate).toISOString() : null,
        status: "PENDING"
      }));
      await supabase.from("classroom_tasks").upsert(rows, {
        onConflict: "user_id,coursework_id",
        ignoreDuplicates: false
      });
    } catch (_) {
    }
  };
  const handleSync = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["classroomSubmissions"] });
      const result = await refetch();
      if (result.data?.assignments) {
        await syncTasksToDb(result.data.assignments);
        await queryClient.invalidateQueries({ queryKey: ["classroomCache"] });
      }
      toast.success("Classroom coursework synchronized!");
    } catch (err) {
      toast.error("Sync failed: " + (err?.message || "Could not reach Google Classroom."));
    } finally {
      setIsRefreshing(false);
    }
  };
  const handleDemoSms = async () => {
    setIsSendingDemoSms(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let phone;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("phone_number").eq("id", user.id).single();
        phone = profile?.phone_number || void 0;
      }
      const userName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
      const SUPABASE_URL = "https://jlyembaddiyakxuvaflq.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0";
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-demo-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          pending: counts.pending,
          overdue: counts.overdue,
          completed: counts.completed,
          total: counts.total,
          courses: counts.courses,
          phone,
          userName
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Demo SMS alert sent to phone!");
      } else {
        toast.error("SMS notification failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Failed to send Demo SMS: " + err.message);
    } finally {
      setIsSendingDemoSms(false);
    }
  };
  const handleConnectGoogle = async () => {
    try {
      toast.info("Connecting to Google Classroom...");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me",
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "consent",
            access_type: "offline"
          }
        }
      });
    } catch (err) {
      toast.error(err.message || "Failed to initiate Google OAuth");
    }
  };
  const toggleReviewed = (id) => {
    setReviewedMap((prev) => {
      const nextState = !prev[id];
      if (nextState) toast.success("Coursework marked as reviewed");
      return { ...prev, [id]: nextState };
    });
  };
  const coursesList = useMemo(() => {
    const activeSet = /* @__PURE__ */ new Set();
    const inactiveSet = /* @__PURE__ */ new Set();
    if (data?.courses) {
      for (const c of data.courses) {
        if (c.name) {
          if (c.isCurrentSemester !== false) activeSet.add(c.name);
          else inactiveSet.add(c.name);
        }
      }
    }
    for (const item of assignments) {
      if (item.courseName) {
        if (item.isCurrentSemester !== false) activeSet.add(item.courseName);
        else inactiveSet.add(item.courseName);
      }
    }
    if (activeTab === "INACTIVE") return Array.from(inactiveSet);
    return Array.from(activeSet);
  }, [assignments, data?.courses, activeTab]);
  const counts = useMemo(() => {
    let overdue = 0;
    let pending = 0;
    let completed = 0;
    let inactive = 0;
    const activeAssignments = assignments.filter((item) => item.isCurrentSemester !== false);
    const inactiveAssignments = assignments.filter((item) => item.isCurrentSemester === false);
    for (const item of activeAssignments) {
      if (item.state === "OVERDUE") overdue++;
      else if (item.state === "PENDING") pending++;
      else if (item.state === "SUBMITTED" || item.state === "GRADED") completed++;
    }
    inactive = inactiveAssignments.length;
    let activeSubjectsCount = data?.coursesCount ?? 0;
    if (data?.courses && data.courses.length > 0) {
      activeSubjectsCount = data.courses.filter((c) => c.isCurrentSemester !== false).length;
    } else if (isShowingCache) {
      activeSubjectsCount = new Set(activeAssignments.map((a) => a.courseName).filter(Boolean)).size;
    }
    return {
      total: activeAssignments.length,
      overdue,
      pending,
      completed,
      inactive,
      courses: activeSubjectsCount
    };
  }, [assignments, data, isShowingCache]);
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      if (activeTab === "INACTIVE") {
        if (item.isCurrentSemester !== false) return false;
      } else {
        if (item.isCurrentSemester === false) return false;
      }
      if (activeTab === "PENDING" && item.state !== "PENDING") return false;
      if (activeTab === "OVERDUE" && item.state !== "OVERDUE") return false;
      if (activeTab === "COMPLETED" && item.state !== "SUBMITTED" && item.state !== "GRADED") return false;
      if (selectedCourse !== "ALL" && item.courseName !== selectedCourse) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCourse = item.courseName.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchCourse && !matchDesc) return false;
      }
      return true;
    });
  }, [assignments, activeTab, selectedCourse, searchQuery]);
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, ease: "easeOut" },
      className: "h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-8 space-y-6 max-w-7xl mx-auto",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-1", children: [
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center shadow-xs", children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100", children: "Classroom Coursework Ledger" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 dark:text-zinc-400", children: "Track pending assignments, milestones, and grading across enrolled subjects." }),
              isBackgroundRefreshing ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse", children: [
                /* @__PURE__ */ jsx(Wifi, { className: "h-2.5 w-2.5" }),
                "Syncing…"
              ] }) : isConnected ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20", children: [
                /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" }),
                "Connected"
              ] }) : isShowingCache ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700", children: "Cached" }) : null
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxs(
              motion.button,
              {
                whileTap: { scale: 0.96 },
                onClick: handleSync,
                disabled: isRefreshing,
                className: "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors shadow-xs disabled:opacity-60",
                children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-zinc-900 dark:text-zinc-100" : ""}` }),
                  /* @__PURE__ */ jsx("span", { children: isRefreshing ? "Syncing..." : "Sync Live" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              motion.button,
              {
                whileTap: { scale: 0.96 },
                id: "demo-sms-btn",
                onClick: handleDemoSms,
                disabled: isSendingDemoSms,
                className: "flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs disabled:opacity-70",
                children: [
                  isSendingDemoSms ? /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5 animate-bounce" }) : /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsx("span", { children: isSendingDemoSms ? "Sending..." : "SMS Alert" })
                ]
              }
            ),
            !isConnected && /* @__PURE__ */ jsxs(
              motion.button,
              {
                whileTap: { scale: 0.96 },
                onClick: handleConnectGoogle,
                className: "flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs",
                children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsx("span", { children: "Connect Google" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4", children: [
          { label: "Action Needed", count: counts.overdue, desc: "Overdue Submissions", icon: AlertTriangle, color: "text-red-500" },
          { label: "Due Soon", count: counts.pending, desc: "Pending Coursework", icon: Clock, color: "text-amber-500" },
          { label: "Turned In", count: counts.completed, desc: "Submitted / Graded", icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Enrolled Courses", count: counts.courses, desc: "Active Classroom Subjects", icon: BookOpen, color: "text-zinc-600 dark:text-zinc-300" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return /* @__PURE__ */ jsxs(
            motion.div,
            {
              whileHover: { y: -2 },
              transition: { type: "spring", stiffness: 400, damping: 25 },
              className: "rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-4 shadow-xs flex flex-col justify-between",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-400", children: card.label }),
                  /* @__PURE__ */ jsx(Icon, { className: `h-3.5 w-3.5 ${card.color}` })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100", children: card.count }),
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] text-zinc-500 dark:text-zinc-400", children: card.desc })
                ] })
              ]
            },
            idx
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/90 dark:bg-zinc-900/90 p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 overflow-x-auto scrollbar-none p-0.5", children: [
            { id: "ALL", label: `Active (${counts.total})` },
            { id: "PENDING", label: `Pending (${counts.pending})` },
            { id: "OVERDUE", label: `Overdue (${counts.overdue})` },
            { id: "COMPLETED", label: `Completed (${counts.completed})` },
            { id: "INACTIVE", label: `Past (${counts.inactive})` }
          ].map((tab) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setActiveTab(tab.id);
                setSelectedCourse("ALL");
              },
              className: `relative px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${activeTab === tab.id ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`,
              children: tab.label
            },
            tab.id
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 max-w-md", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: selectedCourse,
                  onChange: (e) => setSelectedCourse(e.target.value),
                  className: "appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Subjects" }),
                    coursesList.map((course) => /* @__PURE__ */ jsx("option", { value: course, children: course }, course))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(ChevronDown, { className: "absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Filter coursework...",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  className: "w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                }
              )
            ] })
          ] })
        ] }),
        isLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" }, i)) }) : filteredAssignments.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 px-4 bg-white/90 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 text-center shadow-xs", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-6 w-6 text-zinc-900 dark:text-zinc-100" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-zinc-900 dark:text-zinc-100", children: !isConnected && !isShowingCache ? "Connect Google Classroom" : "No assignments found" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1 max-w-sm", children: !isConnected && !isShowingCache ? "Authorize your Google account above to load live deadlines and coursework." : "No coursework matches the active search and filter settings." })
        ] }) : /* @__PURE__ */ jsx(motion.div, { layout: true, className: "space-y-3", children: /* @__PURE__ */ jsx(AnimatePresence, { children: filteredAssignments.map((item) => {
          const isOverdue = item.state === "OVERDUE";
          const isSubmitted = item.state === "SUBMITTED";
          const isGraded = item.state === "GRADED";
          const isReviewed = reviewedMap[item.id] ?? false;
          let dueDisplay = "No Due Date";
          if (item.dueDate) {
            const d = new Date(item.dueDate);
            dueDisplay = d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
          }
          return /* @__PURE__ */ jsx(
            motion.div,
            {
              layout: true,
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, scale: 0.98 },
              whileHover: { y: -2 },
              transition: { type: "spring", stiffness: 400, damping: 30 },
              className: `group relative rounded-2xl border p-4 md:p-5 bg-white/90 dark:bg-zinc-900/90 transition-all shadow-xs ${isOverdue ? "border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10" : isReviewed ? "opacity-60 border-zinc-200 dark:border-zinc-800" : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300", children: item.courseName }),
                    isOverdue && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20", children: [
                      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3" }),
                      "Missing / Overdue"
                    ] }),
                    item.state === "PENDING" && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20", children: [
                      /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                      "Pending Submission"
                    ] }),
                    isSubmitted && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20", children: [
                      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
                      "Turned In"
                    ] }),
                    isGraded && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200", children: [
                      /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
                      "Graded"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug", children: item.title }),
                  item.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2", children: item.description }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-0.5", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 text-zinc-400" }),
                      /* @__PURE__ */ jsxs("span", { children: [
                        "Due: ",
                        /* @__PURE__ */ jsx("strong", { className: "text-zinc-800 dark:text-zinc-200 font-medium", children: dueDisplay })
                      ] })
                    ] }),
                    item.maxPoints != null && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-zinc-600 dark:text-zinc-300", children: isGraded && item.grade != null ? `Score: ${item.grade}/${item.maxPoints} pts` : `${item.maxPoints} pts possible` }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800", children: [
                  /* @__PURE__ */ jsxs(
                    motion.a,
                    {
                      whileTap: { scale: 0.96 },
                      href: item.alternateLink,
                      target: "_blank",
                      rel: "noreferrer",
                      className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity",
                      children: [
                        /* @__PURE__ */ jsx("span", { children: "Open in GCR" }),
                        /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    motion.button,
                    {
                      whileTap: { scale: 0.96 },
                      onClick: () => toggleReviewed(item.id),
                      className: `flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${isReviewed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"}`,
                      children: [
                        /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }),
                        /* @__PURE__ */ jsx("span", { children: isReviewed ? "Reviewed" : "Mark Reviewed" })
                      ]
                    }
                  )
                ] })
              ] })
            },
            item.id
          );
        }) }) })
      ]
    }
  ) });
}
const $$splitComponentImporter$5 = () => import("./app.career-roadmap-CUGN3opd.js");
const Route$5 = createFileRoute("/_authenticated/app/career-roadmap")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./app.attendance-BM0CrkWE.js");
const Route$4 = createFileRoute("/_authenticated/app/attendance")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./app.assignments-mQYKABMq.js");
const Route$3 = createFileRoute("/_authenticated/app/assignments")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./app.announcements-DL_Ao_Tq.js");
const Route$2 = createFileRoute("/_authenticated/app/announcements")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./app.ai-assistant-aBUTkjoX.js");
const Route$1 = createFileRoute("/_authenticated/app/ai-assistant")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./app._threadId-BOFsnk7b.js");
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
  Avatar as A,
  Button as B,
  ChatLayout as C,
  AvatarFallback as a,
  createSsrRpc as b,
  cn as c,
  updateProfile as d,
  AvatarImage as e,
  getAnalyticsSummary as f,
  generateATSResume as g,
  getAttendanceDashboardData as h,
  updateSubjectAttendance as i,
  deleteNotification as j,
  generateAcademicResponse as k,
  logo as l,
  markNotificationRead as m,
  listThreads as n,
  getThreadMessages as o,
  createThread as p,
  saveMessage as q,
  deleteThread as r,
  syncAttendanceToLocalDb as s,
  renameThread as t,
  useServerFn as u,
  router as v
};
