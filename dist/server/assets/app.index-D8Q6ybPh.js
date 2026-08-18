import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-CQTokSDO.js";
import { supabase } from "./client-h4N4kZKq.js";
import { C as ChatLayout, c as createThread } from "./ChatLayout-HmtBFy90.js";
import { g as getAnalyticsSummary, u as updateProfile } from "./analytics.functions-CZIKmuX9.js";
import { g as getAttendanceDashboardData } from "./attendance.functions-C9ja2fKo.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-Cwsrt9M1.js";
import { I as Input } from "./input-poeoKceV.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { toast } from "sonner";
import { RefreshCw, Flame, CheckCircle2, ArrowRight, GraduationCap, Calendar, Sparkles, Clock, FileCheck2, BookOpen, Volume2, Code, Mic, Send, User } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import "./server-DkTRikc9.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
import "./auth-middleware-C_UiqRP9.js";
import "./supabase.server-BXfiGlvE.js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "./studentos-logo-CCLo3MN1.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
function AppIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const getAttendanceFn = useServerFn(getAttendanceDashboardData);
  const updateProfileFn = useServerFn(updateProfile);
  const createThreadFn = useServerFn(createThread);
  const {
    data: analytics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getSummaryFn()
  });
  const {
    data: attendanceData
  } = useQuery({
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
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || meta.name || u.email?.split("@")[0] || "Student";
        const email = u.email || "";
        setSessionUser({
          name,
          email
        });
      }
    });
  }, []);
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState([{
    sender: "ai",
    text: "Hello! I can help you analyze concept gaps, practice vivas, or customize your career roadmap. What's on your mind today?"
  }]);
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
    mutationFn: (data) => updateProfileFn({
      data
    }),
    onSuccess: () => {
      toast.success("Academic profile updated!");
      setIsEditing(false);
      refetch();
      qc.invalidateQueries({
        queryKey: ["analyticsSummary"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    }
  });
  useMutation({
    mutationFn: () => createThreadFn({
      data: {}
    }),
    onSuccess: (t) => {
      qc.invalidateQueries({
        queryKey: ["threads"]
      });
      navigate({
        to: "/app/$threadId",
        params: {
          threadId: t.id
        }
      });
    }
  });
  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setChatMessages((prev) => [...prev, {
      sender: "user",
      text: userMsg
    }]);
    setAiInput("");
    setTimeout(() => {
      setChatMessages((prev) => [...prev, {
        sender: "ai",
        text: `I've noted your question: "${userMsg}". Start a full AI Mentoring thread to get deep explanations and customized syllabus analysis!`
      }]);
    }, 1e3);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center bg-background text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Loading AcadSphere Workspace..." })
    ] }) }) });
  }
  if (error || !analytics) {
    return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-foreground", children: "Unable to load workspace" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: error?.message || "Please check your network connection and credentials and retry." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [
        /* @__PURE__ */ jsx(Button, { onClick: () => refetch(), className: "bg-primary hover:bg-blue-700 text-white text-xs px-4", children: "Retry" }),
        /* @__PURE__ */ jsx(Button, { onClick: async () => {
          localStorage.removeItem("demo_session_token");
          localStorage.removeItem("demo_user_id");
          localStorage.removeItem("demo_user_email");
          try {
            await supabase.auth.signOut();
          } catch (_) {
          }
          navigate({
            to: "/auth",
            replace: true
          });
        }, variant: "outline", className: "text-xs px-4", children: "Sign out" })
      ] })
    ] }) }) });
  }
  const profile = analytics.profile;
  const stats = analytics.stats;
  const readiness = stats?.placementReadiness || 78;
  const successScore = Math.round((readiness * 0.6 + (analytics?.roadmap.percentage || 67) * 0.2 + (stats?.studyHoursThisWeek || 12.2) * 1.5) / 2);
  const studyHoursData = [{
    name: "Mon",
    hours: 2.5
  }, {
    name: "Tue",
    hours: 3.8
  }, {
    name: "Wed",
    hours: 1.5
  }, {
    name: "Thu",
    hours: 4.2
  }, {
    name: "Fri",
    hours: 2
  }, {
    name: "Sat",
    hours: 5.5
  }, {
    name: "Sun",
    hours: 3
  }];
  const attendanceTrendData = [{
    month: "Jan",
    attendance: 88
  }, {
    month: "Feb",
    attendance: 90
  }, {
    month: "Mar",
    attendance: 86
  }, {
    month: "Apr",
    attendance: 92
  }, {
    month: "May",
    attendance: 94
  }, {
    month: "Jun",
    attendance: 93
  }];
  const subjectPerformanceData = [{
    subject: "DBMS",
    score: 85
  }, {
    subject: "OS",
    score: 68
  }, {
    subject: "Networks",
    score: 78
  }, {
    subject: "DSA",
    score: 92
  }, {
    subject: "OOP",
    score: 80
  }];
  const aiUsageData = [{
    name: "Viva Prep",
    value: 35
  }, {
    name: "Code Debug",
    value: 45
  }, {
    name: "Notes Summary",
    value: 20
  }];
  const COLORS = ["#2563EB", "#14B8A6", "#F59E0B"];
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsx("div", { className: "h-full overflow-y-auto bg-background text-foreground p-6 md:p-8", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-12 items-start", children: [
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-border bg-card p-7", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxs("h1", { className: "font-sans font-extrabold text-foreground", style: {
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              letterSpacing: "-0.03em"
            }, children: [
              "Welcome back, ",
              sessionUser?.name || profile?.fullName || "Student"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Flame, { className: "inline h-3 w-3 mr-1" }),
              stats?.currentStreak || 12,
              " Day Streak"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-sans text-[13px] text-muted-foreground italic leading-relaxed", children: '"The beautiful thing about learning is that no one can take it away from you." — B.B. King' }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "Today:" }),
            /* @__PURE__ */ jsx("span", { className: "font-sans text-[12px] text-foreground", children: "10:00 AM Distributed Systems · 02:00 PM Mock Viva" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative h-16 w-16", children: [
            /* @__PURE__ */ jsxs("svg", { className: "h-full w-full -rotate-90", viewBox: "0 0 64 64", children: [
              /* @__PURE__ */ jsx("circle", { cx: "32", cy: "32", r: "26", stroke: "var(--color-border)", fill: "transparent", strokeWidth: "4" }),
              /* @__PURE__ */ jsx("circle", { cx: "32", cy: "32", r: "26", stroke: "var(--color-foreground)", fill: "transparent", strokeWidth: "4", strokeDasharray: 2 * Math.PI * 26, strokeDashoffset: 2 * Math.PI * 26 * (1 - successScore / 100), strokeLinecap: "round", style: {
                transition: "stroke-dashoffset 0.5s ease-out"
              } })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex items-center justify-center font-sans font-bold text-sm text-foreground", children: [
              successScore,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-sans font-semibold text-[13px] text-foreground", children: "Success Index" }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground mt-0.5", children: "Placement & prep" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between md:col-span-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.1em] font-extrabold text-foreground", children: "Attendance Health" })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full border ${(attendanceData?.overall?.percentage ?? 83) >= 85 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : (attendanceData?.overall?.percentage ?? 83) >= 75 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"}`, children: [
              "Overall ",
              attendanceData?.overall?.percentage ?? 83,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 my-4 bg-muted/20 p-2.5 rounded-xl border border-border/60 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-[9px] uppercase font-bold", children: "Subjects at Risk" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-0.5", children: attendanceData?.overall?.subjectsAtRiskCount ?? 2 })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-[9px] uppercase font-bold", children: "Critical Subjects" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-extrabold text-red-600 dark:text-red-400 mt-0.5", children: attendanceData?.overall?.criticalSubjectsCount ?? 1 })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Link, { to: "/app/attendance", className: "flex items-center justify-between text-xs font-bold text-primary hover:underline group pt-1 border-t border-border/40", children: [
            /* @__PURE__ */ jsx("span", { children: "View Details & Reminders" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "md:col-span-2 grid gap-px grid-cols-2 sm:grid-cols-3 border border-border rounded-2xl overflow-hidden bg-border", children: [{
          label: "Active Courses",
          value: "5 Subjects",
          sub: "Classroom Synced",
          icon: GraduationCap
        }, {
          label: "Assignments",
          value: "2 tasks",
          sub: "Due before Monday",
          icon: Calendar
        }, {
          label: "Attendance",
          value: "87.94%",
          sub: "CUE Synced",
          icon: CheckCircle2
        }, {
          label: "AI Queries",
          value: "38/100",
          sub: "Resets in 12 days",
          icon: Sparkles
        }, {
          label: "Weekly Study",
          value: "12.2h",
          sub: "Goal: 15 hours",
          icon: Clock
        }, {
          label: "Resume Tailored",
          value: "3 versions",
          sub: "ATS Optimized",
          icon: FileCheck2
        }].map((card, idx) => {
          const Icon = card.icon;
          return /* @__PURE__ */ jsxs("div", { className: "bg-card p-4 hover:bg-accent transition-colors duration-[120ms]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: card.label }),
              /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "font-sans font-bold text-lg text-foreground", style: {
              letterSpacing: "-0.03em"
            }, children: card.value }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground mt-1", children: card.sub })
          ] }, idx);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-5", children: "Quick Actions" }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-2 grid-cols-2 sm:grid-cols-3", children: [{
          label: "Ask AI",
          icon: Sparkles,
          action: () => createThreadFn().then((t) => navigate({
            to: "/app/$threadId",
            params: {
              threadId: t.id
            }
          }))
        }, {
          label: "Resume Tailorer",
          icon: FileCheck2,
          action: () => navigate({
            to: "/app/resume-builder"
          })
        }, {
          label: "Attendance",
          icon: CheckCircle2,
          action: () => navigate({
            to: "/app/attendance"
          })
        }].map((act, idx) => {
          const Icon = act.icon;
          return /* @__PURE__ */ jsxs("button", { onClick: act.action, className: "flex items-center gap-2.5 rounded-xl border border-border bg-background hover:bg-accent text-foreground px-4 py-3 transition-colors duration-[120ms] group text-left", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card", children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-foreground", children: act.label })
          ] }, idx);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-7 space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between border-b border-border pb-5", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1", children: "Analytics" }),
          /* @__PURE__ */ jsx("h3", { className: "font-sans font-semibold text-foreground", children: "Study & Prep Overview" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "Weekly Study Hours" }),
            /* @__PURE__ */ jsx("div", { className: "h-44 rounded-xl border border-border p-2", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: studyHoursData, children: [
              /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorHours", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "var(--color-foreground)", stopOpacity: 0.08 }),
                /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "var(--color-foreground)", stopOpacity: 0 })
              ] }) }),
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "var(--color-border)" }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "name", stroke: "var(--color-muted-foreground)", fontSize: 10, tickLine: false, axisLine: false, fontFamily: "Space Mono" }),
              /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 10, tickLine: false, axisLine: false, fontFamily: "Space Mono" }),
              /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                boxShadow: "none",
                fontFamily: "Space Mono",
                fontSize: 10
              } }),
              /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "hours", stroke: "var(--color-foreground)", strokeWidth: 1.5, fillOpacity: 1, fill: "url(#colorHours)" })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "Attendance Rate (%)" }),
            /* @__PURE__ */ jsx("div", { className: "h-44 rounded-xl border border-border p-2", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: attendanceTrendData, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "var(--color-border)" }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "month", stroke: "var(--color-muted-foreground)", fontSize: 10, tickLine: false, axisLine: false, fontFamily: "Space Mono" }),
              /* @__PURE__ */ jsx(YAxis, { domain: [70, 100], stroke: "var(--color-muted-foreground)", fontSize: 10, tickLine: false, axisLine: false, fontFamily: "Space Mono" }),
              /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                boxShadow: "none",
                fontFamily: "Space Mono",
                fontSize: 10
              } }),
              /* @__PURE__ */ jsx(Bar, { dataKey: "attendance", fill: "var(--color-foreground)", radius: [3, 3, 0, 0], barSize: 14, opacity: 0.85 })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "Subject Readiness Scores" }),
            /* @__PURE__ */ jsx("div", { className: "h-44 rounded-xl border border-border p-2", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: subjectPerformanceData, layout: "vertical", children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false, stroke: "var(--color-border)" }),
              /* @__PURE__ */ jsx(XAxis, { type: "number", domain: [0, 100], stroke: "var(--color-muted-foreground)", fontSize: 10, tickLine: false, axisLine: false, fontFamily: "Space Mono" }),
              /* @__PURE__ */ jsx(YAxis, { dataKey: "subject", type: "category", stroke: "var(--color-muted-foreground)", fontSize: 10, tickLine: false, axisLine: false, fontFamily: "Space Mono" }),
              /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                boxShadow: "none",
                fontFamily: "Space Mono",
                fontSize: 10
              } }),
              /* @__PURE__ */ jsx(Bar, { dataKey: "score", fill: "var(--color-foreground)", radius: [0, 3, 3, 0], barSize: 10, opacity: 0.85 })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "AI Query Distribution" }),
            /* @__PURE__ */ jsxs("div", { className: "h-44 rounded-xl border border-border p-2 flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(ResponsiveContainer, { width: "60%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
                /* @__PURE__ */ jsx(Pie, { data: aiUsageData, cx: "50%", cy: "50%", innerRadius: 40, outerRadius: 58, paddingAngle: 2, dataKey: "value", children: aiUsageData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`)) }),
                /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  boxShadow: "none",
                  fontFamily: "Space Mono",
                  fontSize: 10
                } })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 shrink-0", children: aiUsageData.map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full shrink-0", style: {
                  backgroundColor: COLORS[idx]
                } }),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground", children: item.name }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-foreground", children: [
                  item.value,
                  "%"
                ] })
              ] }, idx)) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-7 space-y-5", children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground", children: "Recent Activity" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-0 divide-y divide-border", children: [{
          title: "Smart Note Uploaded",
          desc: "Added lecture slides for 'Query Processing & Optimization' in DBMS.",
          time: "2h ago",
          icon: BookOpen
        }, {
          title: "AI Practice Interview",
          desc: "Simulated viva round on 'TCP/IP Model' — 82% rating.",
          time: "1d ago",
          icon: Volume2
        }, {
          title: "Syllabus Goal Finished",
          desc: "Completed 'Subnetting & Routing Algorithms' in study timeline.",
          time: "2d ago",
          icon: CheckCircle2
        }, {
          title: "Lab Workspace Compiled",
          desc: "Walkthrough generated for Lab Exercise 3: 'Socket Programming'.",
          time: "3d ago",
          icon: Code
        }, {
          title: "Resume ATS Score Audited",
          desc: "ATS rating improved to 92% — 3 missing competency terms resolved.",
          time: "5d ago",
          icon: FileCheck2
        }].map((act, idx) => {
          const Icon = act.icon;
          return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 py-4 first:pt-0 last:pb-0", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background", children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("p", { className: "font-sans font-medium text-[13px] text-foreground truncate", children: act.title }),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground shrink-0", children: act.time })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "font-sans text-[12px] text-muted-foreground mt-0.5 leading-relaxed", children: act.desc })
            ] })
          ] }, idx);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-[400px]", children: [
        /* @__PURE__ */ jsx("div", { className: "px-5 py-4 border-b border-border flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx("div", { className: "h-7 w-7 rounded-lg border border-border bg-background flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-sans font-semibold text-[13px] text-foreground", children: "AI Copilot" }),
            /* @__PURE__ */ jsxs("p", { className: "font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 bg-foreground rounded-full" }),
              " Active"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-background", children: chatMessages.map((msg, idx) => /* @__PURE__ */ jsx("div", { className: `flex flex-col max-w-[88%] rounded-xl px-3.5 py-2.5 text-[12px] font-sans leading-relaxed ${msg.sender === "user" ? "bg-foreground text-background ml-auto" : "bg-card border border-border text-foreground mr-auto"}`, children: /* @__PURE__ */ jsx("span", { children: msg.text }) }, idx)) }),
        /* @__PURE__ */ jsx("div", { className: "px-4 py-2.5 border-t border-border bg-card flex flex-wrap gap-1.5", children: ["Dynamic scoping", "ATS tips", "Study alerts"].map((prompt, idx) => /* @__PURE__ */ jsx("button", { onClick: () => setAiInput(prompt), className: "font-mono text-[10px] uppercase tracking-[0.06em] px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-[120ms]", children: prompt }, idx)) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSendAiMessage, className: "p-3 border-t border-border bg-card flex gap-2", children: [
          /* @__PURE__ */ jsx(Input, { placeholder: "Ask a question...", value: aiInput, onChange: (e) => setAiInput(e.target.value), className: "h-9 text-[12px]" }),
          /* @__PURE__ */ jsx(Button, { type: "button", size: "icon", variant: "outline", className: "h-9 w-9 shrink-0", children: /* @__PURE__ */ jsx(Mic, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", size: "icon", className: "h-9 w-9 shrink-0", children: /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border pb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground", children: "Deadlines Calendar" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "July 2026" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1 text-center", children: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground py-1", children: d }, d)) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-1 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "p-1.5 font-mono text-[11px] text-muted-foreground/30", children: "29" }),
          /* @__PURE__ */ jsx("span", { className: "p-1.5 font-mono text-[11px] text-muted-foreground/30", children: "30" }),
          [1, 2, 3, 4, 5, 6, 7, 8].map((d) => /* @__PURE__ */ jsx("span", { className: "p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer transition-colors duration-[120ms]", children: d }, d)),
          /* @__PURE__ */ jsx("span", { className: "p-1.5 font-mono text-[11px] font-bold bg-foreground text-background rounded-md cursor-pointer", children: "9" }),
          [10, 11, 12].map((d) => /* @__PURE__ */ jsx("span", { className: "p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer transition-colors duration-[120ms]", children: d }, d)),
          /* @__PURE__ */ jsxs("span", { className: "p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer relative transition-colors duration-[120ms]", children: [
            "13",
            /* @__PURE__ */ jsx("span", { className: "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-foreground rounded-full" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer transition-colors duration-[120ms]", children: "14" }),
          /* @__PURE__ */ jsxs("span", { className: "p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer relative transition-colors duration-[120ms]", children: [
            "15",
            /* @__PURE__ */ jsx("span", { className: "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-muted-foreground rounded-full" })
          ] }),
          [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map((d) => /* @__PURE__ */ jsx("span", { className: "p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer transition-colors duration-[120ms]", children: d }, d))
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-4 border-t border-border", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-foreground shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.06em] text-foreground", children: "July 13" }),
            /* @__PURE__ */ jsx("span", { className: "font-sans text-[12px] text-muted-foreground truncate", children: "DBMS Project Milestone 1" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.06em] text-foreground", children: "July 15" }),
            /* @__PURE__ */ jsx("span", { className: "font-sans text-[12px] text-muted-foreground truncate", children: "Resume revision submission" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
          " Academic Profile"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "pb-5", children: !isEditing ? /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/40 pb-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-semibold", children: "Full Name" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: profile?.fullName || "Not set" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/40 pb-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-semibold", children: "Degree / Major" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: profile?.degree || "Not set" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/40 pb-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-semibold", children: "Semester" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: profile?.semester || "Not set" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/40 pb-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-semibold", children: "Target Career Role" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: profile?.targetRole || "Not set" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-semibold block mb-1", children: "Acquired Skills" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: profile?.skills && profile.skills.length > 0 ? profile.skills.map((skill) => /* @__PURE__ */ jsx("span", { className: "text-[9px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded font-bold", children: skill }, skill)) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground italic", children: "No skills listed" }) })
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: startEdit, variant: "outline", className: "w-full h-8 text-[11px] font-bold mt-3 border-border", children: "Edit Profile Parameters" })
        ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          saveProfile.mutate(profileForm);
        }, className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "fullName", className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Full Name" }),
            /* @__PURE__ */ jsx(Input, { id: "fullName", value: profileForm.fullName, onChange: (e) => setProfileForm({
              ...profileForm,
              fullName: e.target.value
            }), className: "h-8 text-xs bg-muted/40 border-border mt-1", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "degree", className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Degree & Major" }),
            /* @__PURE__ */ jsx(Input, { id: "degree", value: profileForm.degree, onChange: (e) => setProfileForm({
              ...profileForm,
              degree: e.target.value
            }), className: "h-8 text-xs bg-muted/40 border-border mt-1", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "semester", className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Semester" }),
              /* @__PURE__ */ jsx(Input, { id: "semester", value: profileForm.semester, onChange: (e) => setProfileForm({
                ...profileForm,
                semester: e.target.value
              }), className: "h-8 text-xs bg-muted/40 border-border mt-1", required: true })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "targetRole", className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Target Role" }),
              /* @__PURE__ */ jsx(Input, { id: "targetRole", value: profileForm.targetRole, onChange: (e) => setProfileForm({
                ...profileForm,
                targetRole: e.target.value
              }), className: "h-8 text-xs bg-muted/40 border-border mt-1", required: true })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "skills", className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Skills (Comma-separated)" }),
            /* @__PURE__ */ jsx(Input, { id: "skills", value: profileForm.skills, onChange: (e) => setProfileForm({
              ...profileForm,
              skills: e.target.value
            }), className: "h-8 text-xs bg-muted/40 border-border mt-1" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saveProfile.isPending, className: "flex-1 h-8 text-[11px] bg-primary hover:bg-blue-700 text-white font-bold", children: saveProfile.isPending ? "Saving..." : "Save" }),
            /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setIsEditing(false), variant: "outline", className: "flex-1 h-8 text-[11px] border-border text-muted-foreground", children: "Cancel" })
          ] })
        ] }) })
      ] })
    ] })
  ] }) }) });
}
export {
  AppIndex as component
};
