import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { c as createSsrRpc, u as useServerFn } from "./createSsrRpc-CzYOcfyh.js";
import { C as ChatLayout } from "./ChatLayout-sTEV38C2.js";
import { a as createServerFn } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
import { supabase } from "./client-h4N4kZKq.js";
import { toast } from "sonner";
import { useState, useRef, useEffect, useMemo } from "react";
import { GraduationCap, RefreshCw, Send, MessageSquare, Sparkles, Info, X, AlertTriangle, Clock, CheckCircle2, BookOpen, ChevronDown, Search, Calendar, ExternalLink, Check } from "lucide-react";
import "@tanstack/react-router";
import "./button-CUmEMVhO.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./studentos-logo-CCLo3MN1.js";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
const GetSubmissionsInputSchema = z.object({
  providerToken: z.string().optional()
}).optional();
const getClassroomSubmissions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => GetSubmissionsInputSchema.parse(input)).handler(createSsrRpc("d857efceb3cbcfd44d51141ec68e15e02862fa80f999cfbd0f80a14b83c7327f"));
function ClassroomPage() {
  const fetchSubmissionsFn = useServerFn(getClassroomSubmissions);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingDemoSms, setIsSendingDemoSms] = useState(false);
  const [reviewedMap, setReviewedMap] = useState({});
  const [showBanner, setShowBanner] = useState(true);
  const [hasToken, setHasToken] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("google_provider_token"));
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
  const {
    data,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["classroomSubmissions", hasToken],
    queryFn: async () => {
      let googleToken = typeof window !== "undefined" ? localStorage.getItem("google_provider_token") || void 0 : void 0;
      if (!googleToken) {
        try {
          const {
            data: {
              session
            }
          } = await supabase.auth.getSession();
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
      return fetchSubmissionsFn({
        data: {
          providerToken: googleToken
        }
      });
    },
    refetchInterval: 6e4
  });
  const isConnected = data?.connected ?? false;
  const assignments = data?.assignments ?? [];
  const syncTasksToDb = async (items) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const pendingItems = items.filter((a) => a.state === "PENDING" || a.state === "OVERDUE");
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
        // update due_date/title if changed
      });
    } catch (_) {
    }
  };
  const handleSync = async () => {
    setIsRefreshing(true);
    const result = await refetch();
    if (result.data?.assignments) {
      await syncTasksToDb(result.data.assignments);
    }
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Classroom assignments synchronized!");
    }, 600);
  };
  const handleDemoSms = async () => {
    setIsSendingDemoSms(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      let phone;
      if (user) {
        const {
          data: profile
        } = await supabase.from("profiles").select("phone_number").eq("id", user.id).single();
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
        toast.success("📱 Demo SMS sent to your phone!", {
          description: "Check your messages — live classroom stats delivered."
        });
      } else {
        toast.error("SMS failed: " + (result.error || "Unknown error"), {
          description: "Make sure your phone number is saved in Settings."
        });
      }
    } catch (err) {
      toast.error("Failed to send Demo SMS", {
        description: err.message
      });
    } finally {
      setIsSendingDemoSms(false);
    }
  };
  const handleConnectGoogle = async () => {
    try {
      toast.info("Redirecting to Google Classroom OAuth...");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me",
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "consent"
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
      if (nextState) toast.success("Assignment marked as reviewed");
      return {
        ...prev,
        [id]: nextState
      };
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
    if (activeTab === "INACTIVE") {
      return Array.from(inactiveSet);
    }
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
    let activeSubjectsCount = data?.coursesCount ?? 4;
    if (data?.courses && data.courses.length > 0) {
      activeSubjectsCount = data.courses.filter((c) => c.isCurrentSemester !== false).length;
    }
    return {
      total: activeAssignments.length,
      overdue,
      pending,
      completed,
      inactive,
      courses: activeSubjectsCount
    };
  }, [assignments, data]);
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
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-[#FAFAF8] dark:bg-background text-[#0A0A0A] dark:text-foreground p-4 md:p-8 space-y-6 scrollbar-thin", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E0DDD4] pb-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold font-sans tracking-tight text-[#0A0A0A]", children: "Classroom Submissions" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-sans max-w-xl leading-relaxed", children: "Track pending coursework, upcoming deadlines, and submission history across all your subjects." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxs("button", { onClick: handleSync, disabled: isRefreshing, className: "flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E0DDD4] bg-[#F4F2EC] hover:bg-[#EAE7DC] text-xs font-semibold text-[#0A0A0A] transition-all duration-150 shadow-sm active:scale-95 disabled:opacity-60", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}` }),
          /* @__PURE__ */ jsx("span", { children: isRefreshing ? "Syncing..." : "Sync Live Data" })
        ] }),
        /* @__PURE__ */ jsxs("button", { id: "demo-sms-btn", onClick: handleDemoSms, disabled: isSendingDemoSms, className: "relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-70 overflow-hidden", style: {
          background: isSendingDemoSms ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "linear-gradient(135deg, #059669, #0d9488)",
          color: "white"
        }, children: [
          !isSendingDemoSms && /* @__PURE__ */ jsxs("span", { className: "absolute top-1.5 right-1.5 flex h-2 w-2", children: [
            /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" }),
            /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-white opacity-80" })
          ] }),
          isSendingDemoSms ? /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5 animate-bounce" }) : /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsx("span", { children: isSendingDemoSms ? "Sending SMS..." : "Demo SMS" })
        ] }),
        !isConnected && /* @__PURE__ */ jsxs("button", { onClick: handleConnectGoogle, className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0A0A] text-white text-xs font-semibold hover:opacity-90 transition-all duration-150 shadow-sm active:scale-95", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-amber-300" }),
          /* @__PURE__ */ jsx("span", { children: "Connect Google Classroom" })
        ] })
      ] })
    ] }),
    !isConnected && showBanner && /* @__PURE__ */ jsx("div", { className: "relative rounded-2xl border border-amber-300/60 bg-amber-500/10 p-4 md:p-5 shadow-sm transition-all duration-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3.5", children: [
        /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5", children: /* @__PURE__ */ jsx(Info, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-amber-900 dark:text-amber-200", children: "Connect Google Classroom Account" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed mt-0.5 max-w-2xl", children: "Sync your live university assignments, deadlines, and grades. Demonstration MCA coursework is currently active below for reference." }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-3", children: [
            /* @__PURE__ */ jsx("button", { onClick: handleConnectGoogle, className: "px-3.5 py-1.5 rounded-lg bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-black transition-colors", children: "Authorize Google Account" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setShowBanner(false), className: "text-xs font-medium text-amber-900/70 hover:underline", children: "Dismiss Banner" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => setShowBanner(false), className: "text-amber-700/60 hover:text-amber-900 p-1 rounded-lg", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm transition-all duration-150 hover:border-red-400/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400", children: "Action Needed" }),
          /* @__PURE__ */ jsx("div", { className: "h-7 w-7 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-extrabold text-[#0A0A0A]", children: counts.overdue }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Overdue Submissions" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm transition-all duration-150 hover:border-amber-400/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400", children: "Due Soon" }),
          /* @__PURE__ */ jsx("div", { className: "h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-extrabold text-[#0A0A0A]", children: counts.pending }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Pending Coursework" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm transition-all duration-150 hover:border-emerald-400/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400", children: "Turned In" }),
          /* @__PURE__ */ jsx("div", { className: "h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-extrabold text-[#0A0A0A]", children: counts.completed }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Submitted / Graded" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm transition-all duration-150 hover:border-blue-400/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400", children: "Subjects" }),
          /* @__PURE__ */ jsx("div", { className: "h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(BookOpen, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-extrabold text-[#0A0A0A]", children: counts.courses }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Active Classroom Subjects" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#F4F2EC] p-2 rounded-2xl border border-[#E0DDD4]", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 overflow-x-auto scrollbar-none p-0.5", children: [{
        id: "ALL",
        label: `Active (${counts.total})`
      }, {
        id: "PENDING",
        label: `Pending (${counts.pending})`
      }, {
        id: "OVERDUE",
        label: `Overdue (${counts.overdue})`
      }, {
        id: "COMPLETED",
        label: `Completed (${counts.completed})`
      }, {
        id: "INACTIVE",
        label: `Past Semesters (${counts.inactive})`
      }].map((tab) => /* @__PURE__ */ jsx("button", { onClick: () => {
        setActiveTab(tab.id);
        setSelectedCourse("ALL");
      }, className: `px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${activeTab === tab.id ? "bg-[#0A0A0A] text-white shadow-sm" : "text-muted-foreground hover:bg-[#EAE7DC] hover:text-[#0A0A0A]"}`, children: tab.label }, tab.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 max-w-md", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
          /* @__PURE__ */ jsxs("select", { value: selectedCourse, onChange: (e) => setSelectedCourse(e.target.value), className: "appearance-none bg-background border border-[#E0DDD4] rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-primary transition-all", children: [
            /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Subjects" }),
            coursesList.map((course) => /* @__PURE__ */ jsx("option", { value: course, children: course }, course))
          ] }),
          /* @__PURE__ */ jsx(ChevronDown, { className: "absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search coursework...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E0DDD4] bg-background text-[#0A0A0A] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" })
        ] })
      ] })
    ] }),
    isLoading ? (
      /* Loading Skeleton State */
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "h-32 rounded-2xl bg-[#F4F2EC] border border-[#E0DDD4] animate-pulse" }, i)) })
    ) : filteredAssignments.length === 0 ? (
      /* Empty State */
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 px-4 bg-[#F4F2EC] rounded-2xl border border-[#E0DDD4] text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-[#0A0A0A]", children: "You're all caught up!" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 max-w-sm", children: searchQuery || selectedCourse !== "ALL" || activeTab !== "ALL" ? "No submissions match your selected filter criteria." : "No pending or overdue assignments found across your Classroom subjects." })
      ] })
    ) : (
      /* Cards Grid */
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: filteredAssignments.map((item) => {
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
        return /* @__PURE__ */ jsx("div", { className: `group relative rounded-2xl border p-5 bg-[#F4F2EC] transition-all duration-150 hover:shadow-md ${isOverdue ? "border-red-300 dark:border-red-900/50" : isReviewed ? "opacity-60 border-[#E0DDD4]" : "border-[#E0DDD4] hover:border-[#0A0A0A]/30"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0A0A0A]/10 text-[#0A0A0A]", children: item.courseName }),
              isOverdue && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-700 dark:text-red-400", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3" }),
                "Missing / Overdue"
              ] }),
              item.state === "PENDING" && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                "Pending Submission"
              ] }),
              isSubmitted && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
                "Turned In"
              ] }),
              isGraded && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
                "Graded"
              ] })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-[#0A0A0A] leading-snug group-hover:text-primary transition-colors", children: item.title }),
            item.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed line-clamp-2", children: item.description }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Due: ",
                  /* @__PURE__ */ jsx("strong", { className: "text-[#0A0A0A]", children: dueDisplay })
                ] })
              ] }),
              item.maxPoints != null && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] font-semibold text-[#0A0A0A]", children: isGraded && item.grade != null ? `Score: ${item.grade}/${item.maxPoints} pts` : `${item.maxPoints} pts possible` }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 border-t md:border-t-0 border-[#E0DDD4] pt-3 md:pt-0", children: [
            /* @__PURE__ */ jsxs("a", { href: item.alternateLink, target: "_blank", rel: "noreferrer", className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A0A0A] text-white text-xs font-semibold hover:opacity-90 transition-all active:scale-95 shadow-sm", children: [
              /* @__PURE__ */ jsx("span", { children: "Open in Classroom" }),
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" })
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => toggleReviewed(item.id), className: `flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${isReviewed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" : "bg-background border-[#E0DDD4] text-muted-foreground hover:text-[#0A0A0A]"}`, children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: isReviewed ? "Reviewed" : "Mark Reviewed" })
            ] })
          ] })
        ] }) }, item.id);
      }) })
    )
  ] }) });
}
export {
  ClassroomPage as component
};
