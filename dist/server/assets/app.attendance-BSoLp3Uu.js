import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-BYlyULqi.js";
import { C as ChatLayout } from "./ChatLayout-C_4Dd4n9.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { C as Card, b as CardHeader, a as CardContent, c as CardTitle, d as CardDescription } from "./card-Cwsrt9M1.js";
import { toast } from "sonner";
import { supabase } from "./client-h4N4kZKq.js";
import { g as getAttendanceDashboardData, u as updateSubjectAttendance, m as markNotificationRead, d as deleteNotification, s as syncAttendanceToLocalDb } from "./attendance.functions-SJsEMYyt.js";
import { ShieldAlert, RefreshCw, Wifi, WifiOff, Clock, Globe, Bell, Layers, BellRing, TrendingUp, CheckCircle2, Database, Zap, ShieldCheck, Check, AlertTriangle, FlaskConical, BookOpen, Sparkles, Plus, Minus, TrendingDown, Trash2, X, EyeOff, Eye } from "lucide-react";
import "@tanstack/react-router";
import "./server-ClIdw9oM.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DcSfQrdP.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
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
function computeTarget(attended, total, R) {
  if (total === 0) {
    return { status: "SAFE", leavesAllowed: 0 };
  }
  const P = attended / total * 100;
  if (P >= R * 100) {
    const leavesAllowed = Math.max(0, Math.floor(attended / R - total));
    return { status: "SAFE", leavesAllowed };
  } else {
    const classesNeeded = Math.max(0, Math.ceil((R * total - attended) / (1 - R)));
    return { status: "CRITICAL", classesNeeded };
  }
}
function calculateAttendanceMargins(attended, total) {
  const currentPct = total > 0 ? attended / total * 100 : 100;
  return {
    currentPct,
    target85: computeTarget(attended, total, 0.85),
    target75: computeTarget(attended, total, 0.75)
  };
}
function marginColor(margin, target) {
  if (margin.status === "SAFE") {
    return target === 85 ? { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" } : { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
  }
  return target === 85 ? { text: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" } : { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
}
const CUE_SESSION_KEY = "cue_attendance_v1";
const SUPABASE_URL = "https://jlyembaddiyakxuvaflq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0";
function AttendancePage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSubjectId, setSelectedSubjectId] = useState("sub1");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSupabaseFetching, setIsSupabaseFetching] = useState(true);
  const [isCueSyncing, setIsCueSyncing] = useState(false);
  const [cueUsername, setCueUsername] = useState("");
  const [cuePassword, setCuePassword] = useState("");
  const [showCuePassword, setShowCuePassword] = useState(false);
  const [cueError, setCueError] = useState(null);
  const [showCredentialForm, setShowCredentialForm] = useState(true);
  const [syncTab, setSyncTab] = useState("server");
  const [captchaSession, setCaptchaSession] = useState(null);
  const [isFetchingSession, setIsFetchingSession] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [userId, setUserId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("demo_user_id") || "fa0beb35-7eec-482c-af0b-596dadeb0b79";
    }
    return "fa0beb35-7eec-482c-af0b-596dadeb0b79";
  });
  useEffect(() => {
    supabase.auth.getUser().then(({
      data
    }) => {
      if (data?.user?.id) setUserId(data.user.id);
      setIsSupabaseFetching(false);
    });
  }, []);
  useEffect(() => {
    if (!userId) return;
    setIsSupabaseFetching(true);
    supabase.from("student_attendance").select("*").eq("user_id", userId).order("last_synced_at", {
      ascending: false
    }).then(({
      data,
      error
    }) => {
      setIsSupabaseFetching(false);
      if (error) {
        console.error("[Attendance] Supabase fetch error:", error.message);
        return;
      }
      if (data && data.length > 0) {
        const mapped = data.map((row) => ({
          code: row.subject_code,
          name: row.subject_name,
          type: row.subject_type || "Theory",
          attended: row.attended_classes,
          total: row.total_classes,
          percentage: row.percentage
        }));
        setCueData(mapped);
        setCueLastSynced(data[0].last_synced_at || (/* @__PURE__ */ new Date()).toISOString());
        if (typeof window !== "undefined") {
          sessionStorage.setItem(CUE_SESSION_KEY, JSON.stringify({
            subjects: mapped,
            lastSynced: data[0].last_synced_at
          }));
        }
      }
    });
    const channel = supabase.channel(`attendance-live-${userId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "student_attendance",
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      supabase.from("student_attendance").select("*").eq("user_id", userId).order("last_synced_at", {
        ascending: false
      }).then(({
        data
      }) => {
        if (data && data.length > 0) {
          const mapped = data.map((row) => ({
            code: row.subject_code,
            name: row.subject_name,
            type: row.subject_type || "Theory",
            attended: row.attended_classes,
            total: row.total_classes,
            percentage: row.percentage
          }));
          setCueData(mapped);
          setCueLastSynced((/* @__PURE__ */ new Date()).toISOString());
          toast.success(`✅ Attendance synced! ${mapped.length} subjects updated in real-time.`);
        }
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  const [cueData, setCueData] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = sessionStorage.getItem(CUE_SESSION_KEY);
      return s ? JSON.parse(s).subjects : null;
    } catch {
      return null;
    }
  });
  const [cueLastSynced, setCueLastSynced] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = sessionStorage.getItem(CUE_SESSION_KEY);
      return s ? JSON.parse(s).lastSynced : null;
    } catch {
      return null;
    }
  });
  const [showCueModal, setShowCueModal] = useState(false);
  useEffect(() => {
    const purge = () => sessionStorage.removeItem(CUE_SESSION_KEY);
    window.addEventListener("beforeunload", purge);
    return () => window.removeEventListener("beforeunload", purge);
  }, []);
  const getDashboardFn = useServerFn(getAttendanceDashboardData);
  const syncAttendanceFn = useServerFn(syncAttendanceToLocalDb);
  const updateAttendanceFn = useServerFn(updateSubjectAttendance);
  const markReadFn = useServerFn(markNotificationRead);
  const deleteNotifFn = useServerFn(deleteNotification);
  const {
    data: dashboardData,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ["attendanceDashboardData", userId],
    queryFn: () => getDashboardFn({
      data: {
        userId
      }
    }),
    retry: 2,
    retryDelay: 1e3,
    // No auto-poll — Supabase realtime subscription handles live CUE sync updates
    refetchInterval: false
  });
  const updateMutation = useMutation({
    mutationFn: ({
      subjectId,
      action
    }) => updateAttendanceFn({
      data: {
        subjectId,
        action
      }
    }),
    onSuccess: (res) => {
      toast.success(`Updated ${res.subjectName}! New: ${res.newPercentage}%`);
      qc.invalidateQueries({
        queryKey: ["attendanceDashboardData"]
      });
    },
    onError: (err) => toast.error(err?.message || "Failed to update attendance")
  });
  const markReadMutation = useMutation({
    mutationFn: (id) => markReadFn({
      data: {
        notificationId: id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["attendanceDashboardData"]
    })
  });
  const deleteNotifMutation = useMutation({
    mutationFn: (id) => deleteNotifFn({
      data: {
        notificationId: id
      }
    }),
    onSuccess: () => {
      toast.success("Notification removed.");
      qc.invalidateQueries({
        queryKey: ["attendanceDashboardData"]
      });
    }
  });
  const handleCueClear = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(CUE_SESSION_KEY);
    }
    setCueData(null);
    setCueLastSynced(null);
    toast.info("CUE Portal session data cleared.");
  };
  const fetchCaptchaSession = async () => {
    setIsFetchingSession(true);
    setCueError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/get-captcha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY
        }
      });
      const data = await res.json();
      if (!data.reachable) {
        setCaptchaSession({
          reachable: false,
          hasCaptcha: false,
          captchaImage: null,
          formActionUrl: "",
          sessionCookie: "",
          codeVerifier: "",
          state: ""
        });
        setCueError(data.error || "Server cannot reach Christ University login portal (port 8010 is blocked).");
      } else if (data.success) {
        setCaptchaSession(data);
        setCaptchaText("");
        if (data.hasCaptcha) {
          toast.info("🔐 CAPTCHA required by portal. Please solve it below.");
        }
      } else {
        setCueError(data.error || "Failed to initialize login session.");
      }
    } catch (err) {
      setCueError(err?.message || "Failed to contact sync service.");
    } finally {
      setIsFetchingSession(false);
    }
  };
  useEffect(() => {
    if (showCueModal && syncTab === "server" && !captchaSession && !isFetchingSession) {
      fetchCaptchaSession();
    }
  }, [showCueModal, syncTab]);
  const handleCueSync = async (username, password) => {
    if (!username || !password) return;
    if (captchaSession?.hasCaptcha && !captchaText.trim()) {
      setCueError("Please enter the CAPTCHA text.");
      toast.error("Please enter the CAPTCHA code.");
      return;
    }
    setIsCueSyncing(true);
    setCueError(null);
    try {
      const payload = {
        username: username.trim(),
        password,
        user_id: userId
      };
      if (captchaSession?.reachable) {
        payload.formActionUrl = captchaSession.formActionUrl;
        payload.sessionCookie = captchaSession.sessionCookie;
        payload.codeVerifier = captchaSession.codeVerifier;
        payload.state = captchaSession.state;
        if (captchaText.trim()) {
          payload.captchaText = captchaText.trim();
        }
      }
      const kpRes = await fetch(`${SUPABASE_URL}/functions/v1/kp-scraper`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });
      const kpData = await kpRes.json();
      if (!kpData.success) {
        const msg = kpData.error || "Failed to fetch attendance from CUE portal.";
        setCueError(msg);
        if (kpData.isCaptchaError) {
          toast.error("❌ Invalid CAPTCHA code. Loading a new CAPTCHA...");
          fetchCaptchaSession();
        } else if (kpData.isCredentialError) {
          toast.error("❌ Invalid credentials — check your CUE username/password.");
        } else {
          toast.error(`❌ ${msg}`);
        }
        return;
      }
      if (!kpData.subjects || kpData.subjects.length === 0) {
        setCueError("No attendance data returned. Please try again later.");
        toast.error("No attendance data found on the CUE portal.");
        return;
      }
      try {
        await syncAttendanceFn({
          data: {
            userId,
            subjects: kpData.subjects
          }
        });
        qc.invalidateQueries({
          queryKey: ["attendanceDashboardData"]
        });
        refetch();
      } catch (saveErr) {
        console.warn("[app.attendance] Error saving to local DB:", saveErr);
      }
      toast.success(`✅ Synced ${kpData.count || kpData.subjects.length} subjects from CUE Portal!`);
      const mapped = kpData.subjects.map((sub) => ({
        code: sub.code,
        name: sub.name,
        type: sub.type || "Theory",
        attended: sub.attended,
        total: sub.total,
        percentage: sub.percentage
      }));
      setCueData(mapped);
      const syncedAt = (/* @__PURE__ */ new Date()).toISOString();
      setCueLastSynced(syncedAt);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(CUE_SESSION_KEY, JSON.stringify({
          subjects: mapped,
          lastSynced: syncedAt
        }));
      }
      setShowCueModal(false);
      setCueUsername("");
      setCuePassword("");
      setCaptchaText("");
      setCueError(null);
    } catch (err) {
      const msg = err?.message || "Sync failed. Please try again.";
      setCueError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setIsCueSyncing(false);
    }
  };
  const handleDemoSync = () => handleCueSync("demo", "demo");
  const lastSyncedLabel = useMemo(() => {
    if (!cueLastSynced) return null;
    const diff = Math.floor((Date.now() - new Date(cueLastSynced).getTime()) / 6e4);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)}h ago`;
  }, [cueLastSynced]);
  const cueOverall = useMemo(() => {
    if (!cueData || cueData.length === 0) return null;
    const totalAttended = cueData.reduce((s, sub) => s + sub.attended, 0);
    const totalTotal = cueData.reduce((s, sub) => s + sub.total, 0);
    return {
      attended: totalAttended,
      total: totalTotal,
      pct: totalTotal > 0 ? totalAttended / totalTotal * 100 : 100,
      margins: calculateAttendanceMargins(totalAttended, totalTotal)
    };
  }, [cueData]);
  const getBadgeStyle = (color) => {
    switch (color) {
      case "green":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "blue":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "yellow":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "red":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse";
    }
  };
  const getProgressColor = (color) => {
    switch (color) {
      case "green":
        return "bg-emerald-500";
      case "blue":
        return "bg-blue-500";
      case "yellow":
        return "bg-amber-500";
      case "red":
        return "bg-red-500";
    }
  };
  const pctColor = (pct) => {
    if (pct >= 85) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 75) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };
  const pctBadge = (pct) => {
    if (pct >= 85) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (pct >= 75) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  };
  const MarginFooter = ({
    attended,
    total
  }) => {
    const m = calculateAttendanceMargins(attended, total);
    const c85 = marginColor(m.target85, 85);
    const c75 = marginColor(m.target75, 75);
    return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 p-2.5 rounded-xl bg-muted/30 border border-border/60", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[10px]", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3 w-3 text-emerald-500" }),
          " 85% Target"
        ] }),
        /* @__PURE__ */ jsx("span", { className: `font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border ${c85.text} ${c85.bg} ${c85.border}`, children: m.target85.status === "SAFE" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Check, { className: "h-2.5 w-2.5" }),
          " Can skip ",
          m.target85.leavesAllowed,
          " hr",
          m.target85.leavesAllowed !== 1 ? "s" : ""
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "h-2.5 w-2.5" }),
          " Attend ",
          m.target85.classesNeeded,
          " hr",
          m.target85.classesNeeded !== 1 ? "s" : ""
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[10px] pt-1 border-t border-border/40", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(ShieldAlert, { className: "h-3 w-3 text-amber-500" }),
          " 75% Target"
        ] }),
        /* @__PURE__ */ jsx("span", { className: `font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border ${c75.text} ${c75.bg} ${c75.border}`, children: m.target75.status === "SAFE" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Check, { className: "h-2.5 w-2.5" }),
          " Can skip ",
          m.target75.leavesAllowed,
          " hr",
          m.target75.leavesAllowed !== 1 ? "s" : ""
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "h-2.5 w-2.5" }),
          " Attend ",
          m.target75.classesNeeded,
          " hr",
          m.target75.classesNeeded !== 1 ? "s" : ""
        ] }) })
      ] })
    ] });
  };
  const renderExtensionSyncBanner = () => /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-blue-500/20 shadow-sm space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shrink-0", children: /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-foreground", children: "Sync Live Attendance from CUE Portal" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: [
            "Enter your Christ University credentials to fetch live attendance from",
            " ",
            /* @__PURE__ */ jsx("strong", { children: "cue.christuniversity.in" }),
            " — no extension required."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0 hidden sm:inline-block", children: "Server Sync" })
    ] }),
    /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowCueModal(true), className: "w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all", children: [
      /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
      "Sync Attendance Now"
    ] })
  ] });
  if (isLoading || isSupabaseFetching) {
    return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full bg-background flex flex-col overflow-y-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 py-5 border-b border-border shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-2xl bg-muted animate-pulse" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 w-48 bg-muted rounded-lg animate-pulse" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 w-64 bg-muted/60 rounded-lg animate-pulse" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-3 w-56 bg-muted/60 rounded animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "h-28 rounded-2xl bg-muted/40 border border-border animate-pulse" }, i)) }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsx("div", { className: "h-44 rounded-2xl bg-muted/30 border border-border animate-pulse" }, i)) }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-center text-muted-foreground animate-pulse font-mono", children: "Fetching live attendance from Supabase..." })
      ] })
    ] }) });
  }
  if (isError || !dashboardData) {
    const errMsg = queryError?.message || "Could not load attendance data from the database.";
    return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full bg-background text-foreground flex flex-col overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "m-6 p-5 rounded-2xl border border-red-500/30 bg-red-500/5 flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "h-5 w-5 text-red-500" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-extrabold text-foreground", children: "Attendance Database Unavailable" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: errMsg }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "You can still sync live data directly from the CUE/KP Portal below." })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => refetch(), className: "flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-all shrink-0", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
          " Retry"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-6 pb-6 space-y-6", children: cueData && cueOverall ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl", children: [
          /* @__PURE__ */ jsx(Wifi, { className: "h-4 w-4" }),
          "CUE Portal data loaded · ",
          cueData.length,
          " subjects · ",
          lastSyncedLabel,
          /* @__PURE__ */ jsx("button", { onClick: handleCueClear, className: "ml-auto text-muted-foreground hover:text-red-500", children: /* @__PURE__ */ jsx(WifiOff, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "Overall (CUE)" }),
              /* @__PURE__ */ jsx("div", { className: "flex items-baseline justify-between mt-1", children: /* @__PURE__ */ jsxs("span", { className: `text-3xl font-extrabold ${pctColor(cueOverall.pct)}`, children: [
                cueOverall.pct.toFixed(2),
                "%"
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "pt-0 text-xs text-muted-foreground", children: [
              cueOverall.attended,
              " attended / ",
              cueOverall.total,
              " total hrs"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "85% Target" }),
              /* @__PURE__ */ jsx(CardTitle, { className: `text-xl font-extrabold mt-1 ${cueOverall.margins.target85.status === "SAFE" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`, children: cueOverall.margins.target85.status === "SAFE" ? `Skip ${cueOverall.margins.target85.leavesAllowed} hrs` : `Need ${cueOverall.margins.target85.classesNeeded} hrs` })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "pt-0 text-xs text-muted-foreground", children: cueOverall.margins.target85.status === "SAFE" ? "Above 85% target" : "Below 85% — attend to recover" })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "75% Mandatory" }),
              /* @__PURE__ */ jsx(CardTitle, { className: `text-xl font-extrabold mt-1 ${cueOverall.margins.target75.status === "SAFE" ? "text-blue-600 dark:text-blue-400" : "text-amber-500"}`, children: cueOverall.margins.target75.status === "SAFE" ? `Skip ${cueOverall.margins.target75.leavesAllowed} hrs` : `Need ${cueOverall.margins.target75.classesNeeded} hrs` })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "pt-0 text-xs text-muted-foreground", children: cueOverall.margins.target75.status === "SAFE" ? "Above mandatory 75%" : "Critical — below 75% limit" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: cueData.map((sub, i) => {
          calculateAttendanceMargins(sub.attended, sub.total);
          const pct = sub.total > 0 ? sub.attended / sub.total * 100 : 100;
          return /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-xs relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 right-0 h-1.5 ${pct >= 85 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}` }),
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 pt-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground", children: sub.code }),
                /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full border ${pctBadge(pct)}`, children: pct >= 85 ? "Safe" : pct >= 75 ? "Warning" : "Critical" })
              ] }),
              /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-extrabold mt-2", children: sub.name })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-1.5", children: [
                  /* @__PURE__ */ jsxs("span", { className: `text-2xl font-extrabold ${pctColor(pct)}`, children: [
                    pct.toFixed(2),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                    sub.attended,
                    " / ",
                    sub.total,
                    " hrs"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full ${pct >= 85 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}`, style: {
                  width: `${Math.min(100, pct)}%`
                } }) })
              ] }),
              /* @__PURE__ */ jsx(MarginFooter, { attended: sub.attended, total: sub.total })
            ] })
          ] }, i);
        }) })
      ] }) : (
        /* No CUE data — prompt to sync via Chrome Extension */
        renderExtensionSyncBanner()
      ) })
    ] }) });
  }
  const {
    overall,
    subjects,
    notifications,
    recentLogs
  } = dashboardData;
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full bg-background text-foreground flex flex-col overflow-y-auto scrollbar-thin transition-colors duration-200 relative", children: [
    (overall.percentage <= 75 || overall.criticalSubjectsCount > 0) && /* @__PURE__ */ jsxs("div", { className: "bg-red-500 text-white px-6 py-3 shrink-0 flex items-center justify-between shadow-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(ShieldAlert, { className: "h-5 w-5 animate-bounce shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-extrabold uppercase tracking-wider", children: "Mandatory Attendance Warning" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] opacity-90", children: overall.percentage <= 75 ? `Overall attendance has fallen to ${Number(overall.percentage).toFixed(2)}%, below the mandatory 75% university limit.` : `${overall.criticalSubjectsCount} subject(s) are critically below 75%. Immediate recovery required!` })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold shrink-0", onClick: () => setActiveTab("notifications"), children: [
        "View Alerts (",
        unreadNotifications.length,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden px-6 py-5 border-b border-border shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-500/10 via-amber-500/5 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20", children: /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("h1", { className: "text-base font-extrabold tracking-tight", children: "Intelligent Attendance Monitor" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-500/20", children: "AcadSphere Engine" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: "Live CUE sync · 85% & 75% margin analytics · Proactive alerts" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          cueData ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400", children: [
              /* @__PURE__ */ jsx(Wifi, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "CUE Synced · ",
                lastSyncedLabel
              ] })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowCueModal(true), className: "flex items-center gap-1.5 bg-card border border-border hover:border-blue-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all", title: "Re-sync from CUE Portal", children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5 text-blue-500" }),
              " Re-sync"
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: handleCueClear, className: "h-8 w-8 flex items-center justify-center rounded-xl border border-border hover:border-red-500/40 hover:text-red-500 text-muted-foreground transition-all", title: "Clear CUE session data", children: /* @__PURE__ */ jsx(WifiOff, { className: "h-3.5 w-3.5" }) })
          ] }) : /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowCueModal(true), className: "flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all", children: [
            /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5" }),
            "Sync from CUE Portal"
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("notifications"), className: "relative flex items-center gap-2 bg-card border border-border hover:border-primary px-3 py-2 rounded-xl shadow-xs text-xs font-bold transition-all cursor-pointer", children: [
            /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4 text-amber-500" }),
            /* @__PURE__ */ jsx("span", { children: "Alerts" }),
            unreadNotifications.length > 0 && /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse", children: unreadNotifications.length })
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: async () => {
            setIsSyncing(true);
            try {
              await refetch();
              toast.success("Dashboard synced with latest database records.");
            } catch {
              toast.error("Failed to refresh data.");
            } finally {
              setIsSyncing(false);
            }
          }, disabled: isSyncing, className: "flex items-center gap-1.5 bg-card border border-border hover:border-primary disabled:opacity-60 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer", title: "Refresh attendance data from database", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 text-muted-foreground ${isSyncing ? "animate-spin" : ""}` }),
            isSyncing ? "Syncing..." : "Sync"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative z-20 flex items-center gap-2 mt-4 pt-3 border-t border-border/40 overflow-x-auto scrollbar-none", children: ["dashboard", "simulator", "notifications", "faculty"].map((tab) => {
        const labels = {
          dashboard: {
            label: "Attendance Dashboard",
            Icon: CheckCircle2
          },
          simulator: {
            label: "Prediction Engine",
            Icon: TrendingUp
          },
          notifications: {
            label: "Notification Center",
            Icon: BellRing
          },
          faculty: {
            label: "Class Ledger",
            Icon: Layers
          }
        };
        const {
          label,
          Icon
        } = labels[tab];
        return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab(tab), className: `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 relative
                    ${activeTab === tab ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30" : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
          " ",
          label,
          tab === "notifications" && unreadNotifications.length > 0 && /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-red-500 animate-pulse" })
        ] }, tab);
      }) })
    ] }),
    activeTab === "dashboard" && /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 flex-1", children: [
      cueData ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400", children: [
          /* @__PURE__ */ jsx(Wifi, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Showing live data from CUE Portal · ",
            cueData.length,
            " subjects · Last synced: ",
            lastSyncedLabel
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setShowCueModal(true), className: "text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }),
          " Re-sync"
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 border-dashed", children: [
        /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md", children: /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-extrabold text-foreground", children: "No Attendance Data Synced Yet" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: [
            "Click ",
            /* @__PURE__ */ jsx("strong", { children: "Sync Now" }),
            " and enter your Christ University credentials to pull live attendance from ESPRO — directly, no Chrome Extension required."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setShowCueModal(true), className: "shrink-0 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20 transition-all flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
          " Sync Now"
        ] })
      ] }),
      cueData && cueOverall ? (
        /* ── CUE OVERALL SUMMARY ── */
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-gradient-to-br from-card to-card/80 shadow-sm relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 right-0 h-1.5 ${cueOverall.pct >= 85 ? "bg-emerald-500" : cueOverall.pct >= 75 ? "bg-amber-500" : "bg-red-500"}` }),
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "Overall (CUE Live)" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mt-1", children: [
                /* @__PURE__ */ jsxs("span", { className: `text-3xl font-extrabold tracking-tight ${pctColor(cueOverall.pct)}`, children: [
                  cueOverall.pct.toFixed(2),
                  "%"
                ] }),
                /* @__PURE__ */ jsx("span", { className: `text-xs font-bold px-2 py-0.5 rounded-full border ${pctBadge(cueOverall.pct)}`, children: cueOverall.pct >= 85 ? "Safe" : cueOverall.pct >= 75 ? "Warning" : "Critical" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "pt-0 text-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-2 mt-2 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full transition-all duration-500 ${cueOverall.pct >= 85 ? "bg-emerald-500" : cueOverall.pct >= 75 ? "bg-amber-500" : "bg-red-500"}`, style: {
                width: `${Math.min(100, cueOverall.pct)}%`
              } }) }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground mt-2 font-medium", children: [
                cueOverall.attended,
                " attended / ",
                cueOverall.total,
                " total hrs"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "85% Target" }),
                /* @__PURE__ */ jsx(ShieldCheck, { className: `h-4 w-4 ${cueOverall.margins.target85.status === "SAFE" ? "text-emerald-500" : "text-red-500"}` })
              ] }),
              /* @__PURE__ */ jsx(CardTitle, { className: `text-2xl font-extrabold mt-1 ${cueOverall.margins.target85.status === "SAFE" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`, children: cueOverall.margins.target85.status === "SAFE" ? `Skip ${cueOverall.margins.target85.leavesAllowed} hr${cueOverall.margins.target85.leavesAllowed !== 1 ? "s" : ""}` : `Need ${cueOverall.margins.target85.classesNeeded} hr${cueOverall.margins.target85.classesNeeded !== 1 ? "s" : ""}` })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "pt-0 text-xs text-muted-foreground", children: cueOverall.margins.target85.status === "SAFE" ? /* @__PURE__ */ jsxs("span", { className: "text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }),
              " Above 85% university honours target"
            ] }) : /* @__PURE__ */ jsxs("span", { className: "text-red-600 dark:text-red-400 font-bold", children: [
              "Must attend next ",
              cueOverall.margins.target85.classesNeeded,
              " hrs consecutively to reach 85%"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "75% Target (Mandatory)" }),
                /* @__PURE__ */ jsx(ShieldAlert, { className: `h-4 w-4 ${cueOverall.margins.target75.status === "SAFE" ? "text-blue-500" : "text-amber-500"}` })
              ] }),
              /* @__PURE__ */ jsx(CardTitle, { className: `text-2xl font-extrabold mt-1 ${cueOverall.margins.target75.status === "SAFE" ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`, children: cueOverall.margins.target75.status === "SAFE" ? `Skip ${cueOverall.margins.target75.leavesAllowed} hr${cueOverall.margins.target75.leavesAllowed !== 1 ? "s" : ""}` : `Need ${cueOverall.margins.target75.classesNeeded} hr${cueOverall.margins.target75.classesNeeded !== 1 ? "s" : ""}` })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "pt-0 text-xs text-muted-foreground", children: cueOverall.margins.target75.status === "SAFE" ? /* @__PURE__ */ jsxs("span", { className: "text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }),
              " Above mandatory 75% limit"
            ] }) : /* @__PURE__ */ jsxs("span", { className: "text-amber-600 dark:text-amber-400 font-bold", children: [
              "Must attend ",
              cueOverall.margins.target75.classesNeeded,
              " hrs to avoid academic action"
            ] }) })
          ] })
        ] })
      ) : (
        /* ── SQLITE OVERALL SUMMARY (existing 4-card layout) ── */
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-xs relative overflow-hidden md:col-span-1", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 right-0 h-1.5 ${getProgressColor(overall.statusColor)}` }),
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "Overall Attendance" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mt-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-3xl font-extrabold tracking-tight text-foreground", children: [
                  Number(overall.percentage).toFixed(2),
                  "%"
                ] }),
                /* @__PURE__ */ jsx("span", { className: `text-xs font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(overall.statusColor)}`, children: overall.status })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "pt-0 text-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-2 mt-2 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full ${getProgressColor(overall.statusColor)} transition-all duration-500`, style: {
                width: `${overall.percentage}%`
              } }) }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground mt-2 font-medium", children: [
                overall.totalAttended,
                " attended / ",
                overall.totalConducted,
                " total"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 pt-2 border-t border-border/40", children: /* @__PURE__ */ jsx(MarginFooter, { attended: overall.totalAttended, total: overall.totalConducted }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-xs", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "Recovery Needed (75%)" }),
                /* @__PURE__ */ jsx(AlertTriangle, { className: `h-4 w-4 ${overall.requiredFor75 > 0 ? "text-red-500" : "text-emerald-500"}` })
              ] }),
              /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-extrabold text-foreground mt-1", children: overall.requiredFor75 === 0 ? "0 Classes" : `${overall.requiredFor75} Classes` })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "pt-0 text-xs text-muted-foreground", children: overall.requiredFor75 === 0 ? /* @__PURE__ */ jsxs("span", { className: "text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }),
              " Above 75% limit"
            ] }) : /* @__PURE__ */ jsxs("span", { className: "text-red-600 dark:text-red-400 font-bold", children: [
              "Attend next ",
              overall.requiredFor75,
              " classes to hit 75%"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-xs", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "Safe Bunks (75%)" }),
                /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-blue-500" })
              ] }),
              /* @__PURE__ */ jsxs(CardTitle, { className: "text-2xl font-extrabold text-foreground mt-1", children: [
                overall.safeMissesCount,
                " Classes"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "pt-0 text-xs text-muted-foreground", children: [
              "Can safely miss ",
              overall.safeMissesCount,
              " total lectures without crossing below 75%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-xs", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "Risk Monitor" }),
                /* @__PURE__ */ jsx(ShieldAlert, { className: "h-4 w-4 text-amber-500" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xl font-extrabold text-amber-600 dark:text-amber-400", children: overall.subjectsAtRiskCount }),
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground font-bold", children: "Warning (85%)" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-6 w-px bg-border" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xl font-extrabold text-red-600 dark:text-red-400", children: overall.criticalSubjectsCount }),
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground font-bold", children: "Critical (<75%)" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "pt-0 text-xs text-muted-foreground mt-1", children: "Keep subjects above 85% for university honours" })
          ] })
        ] })
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2", children: cueData ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Wifi, { className: "h-4 w-4 text-emerald-500" }),
            " CUE Portal — Live Subjects"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-blue-500" }),
            " Subject-Wise Monitoring (Manual Mode)"
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: cueData ? "Real data from Christ University portal. Dual-target margin analytics below each subject." : "Connect CUE Portal above for live data. Manual mode uses locally tracked attendance." })
        ] }) }),
        cueData ? /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: cueData.map((sub, i) => {
          calculateAttendanceMargins(sub.attended, sub.total);
          const pct = sub.total > 0 ? sub.attended / sub.total * 100 : 100;
          const displayPct = Math.round(pct * 100) / 100;
          return /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card hover:border-primary/40 transition-all shadow-xs relative overflow-hidden flex flex-col", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 right-0 h-1.5 ${pct >= 85 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}` }),
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 pt-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase", children: sub.code }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 border-border/60 text-muted-foreground", children: sub.type === "Practical" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(FlaskConical, { className: "h-2.5 w-2.5" }),
                    " Lab"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(BookOpen, { className: "h-2.5 w-2.5" }),
                    " Theory"
                  ] }) })
                ] }),
                /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pctBadge(pct)}`, children: pct >= 85 ? "Safe" : pct >= 75 ? "Warning" : "Critical" })
              ] }),
              /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-extrabold text-foreground mt-2 leading-tight", children: sub.name })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3 text-xs flex-1", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-1.5", children: [
                  /* @__PURE__ */ jsxs("span", { className: `text-2xl font-extrabold ${pctColor(pct)}`, children: [
                    displayPct.toFixed(2),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground font-medium", children: [
                    sub.attended,
                    " / ",
                    sub.total,
                    " hrs"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full transition-all duration-500 ${pct >= 85 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}`, style: {
                  width: `${Math.min(100, pct)}%`
                } }) }),
                /* @__PURE__ */ jsxs("div", { className: "relative mt-0.5 h-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute left-[75%] h-3 w-px bg-amber-400/60", title: "75%" }),
                  /* @__PURE__ */ jsx("div", { className: "absolute left-[85%] h-3 w-px bg-emerald-400/60", title: "85%" })
                ] })
              ] }),
              /* @__PURE__ */ jsx(MarginFooter, { attended: sub.attended, total: sub.total })
            ] })
          ] }, i);
        }) }) : (
          /* ── SQLite Subject Cards (manual mode) ── */
          /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: subjects.map((sub) => /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card hover:border-primary/40 transition-all shadow-xs relative overflow-hidden flex flex-col justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 right-0 h-1.5 ${getProgressColor(sub.statusColor)}` }),
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 pt-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase", children: sub.code }),
                /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(sub.statusColor)}`, children: sub.status })
              ] }),
              /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-extrabold text-foreground mt-2", children: sub.name })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-1.5", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-2xl font-extrabold text-foreground", children: [
                    Number(sub.percentage).toFixed(2),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground font-medium", children: [
                    sub.attended,
                    " / ",
                    sub.conducted,
                    " Classes"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full ${getProgressColor(sub.statusColor)} transition-all duration-500`, style: {
                  width: `${sub.percentage}%`
                } }) })
              ] }),
              /* @__PURE__ */ jsx(MarginFooter, { attended: sub.attended, total: sub.conducted }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider", children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                  " AI Suggestion"
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-foreground/90 leading-relaxed", children: sub.aiSuggestion })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-border/40", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase", children: "Manual Log" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-[10px] font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10", onClick: () => updateMutation.mutate({
                    subjectId: sub.id,
                    action: "present"
                  }), disabled: updateMutation.isPending, children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3 mr-0.5" }),
                    " Present"
                  ] }),
                  /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-[10px] font-bold text-red-600 border-red-500/30 hover:bg-red-500/10", onClick: () => updateMutation.mutate({
                    subjectId: sub.id,
                    action: "absent"
                  }), disabled: updateMutation.isPending, children: [
                    /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3 mr-0.5" }),
                    " Bunk"
                  ] })
                ] })
              ] })
            ] })
          ] }, sub.id)) })
        )
      ] })
    ] }),
    activeTab === "simulator" && /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-extrabold text-foreground uppercase tracking-wider", children: "Future Attendance Prediction Engine" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Simulate missing or attending future lectures to see exact percentage impact." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground", children: "Select Subject:" }),
          /* @__PURE__ */ jsx("select", { value: selectedSubjectId, onChange: (e) => setSelectedSubjectId(e.target.value), className: "bg-card border border-border px-3 py-1.5 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary", children: subjects.map((s) => /* @__PURE__ */ jsxs("option", { value: s.id, children: [
            s.name,
            " (",
            s.percentage,
            "%)"
          ] }, s.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-xs md:col-span-1", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground", children: "Selected Subject" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-extrabold text-foreground", children: activeSubject.name }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-muted-foreground", children: activeSubject.code })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-muted/30 border border-border space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Current:" }),
                /* @__PURE__ */ jsxs("span", { className: "text-2xl font-extrabold text-foreground", children: [
                  activeSubject.percentage,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
                /* @__PURE__ */ jsx("span", { children: "Attended:" }),
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-foreground", children: [
                  activeSubject.attended,
                  " / ",
                  activeSubject.conducted
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(MarginFooter, { attended: activeSubject.attended, total: activeSubject.conducted }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px]", children: [
              "💡 Missing 1 class in ",
              activeSubject.name,
              " will drop to ",
              /* @__PURE__ */ jsxs("strong", { children: [
                activeSubject.predictions.miss1,
                "%"
              ] }),
              "."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-xs md:col-span-2", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-bold text-foreground", children: "If You Miss / Attend Upcoming Classes" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-muted-foreground", children: "Predicted percentage table based on consecutive upcoming classes" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 bg-red-500/5 p-4 rounded-2xl border border-red-500/20", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(TrendingDown, { className: "h-4 w-4" }),
                  " Bunk Scenarios"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [["1 class", activeSubject.predictions.miss1], ["2 classes", activeSubject.predictions.miss2], ["3 classes", activeSubject.predictions.miss3]].map(([label, pct]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-2 rounded-xl bg-card border border-border", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "If you miss ",
                    /* @__PURE__ */ jsx("strong", { children: label })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "font-extrabold text-red-500", children: [
                    pct,
                    "%"
                  ] })
                ] }, label)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }),
                  " Attend Scenarios"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [["1 class", activeSubject.predictions.attend1], ["3 classes", activeSubject.predictions.attend3], ["5 classes", activeSubject.predictions.attend5]].map(([label, pct]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-2 rounded-xl bg-card border border-border", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "If you attend ",
                    /* @__PURE__ */ jsx("strong", { children: label })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "font-extrabold text-emerald-500", children: [
                    pct,
                    "%"
                  ] })
                ] }, label)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-muted/20 border border-border", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground mb-3 uppercase tracking-wider", children: "Recent Trend Curve" }),
              /* @__PURE__ */ jsx("div", { className: "flex items-end justify-between h-28 gap-2 pt-2 border-b border-border px-2", children: activeSubject.trend.map((pt, idx) => /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-1 group", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-extrabold text-primary opacity-0 group-hover:opacity-100 transition-opacity", children: [
                  pt.percentage,
                  "%"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "w-full max-w-[24px] bg-gradient-to-t from-primary/60 to-primary rounded-t-md transition-all duration-300 group-hover:brightness-125", style: {
                  height: `${pt.percentage * 0.8}%`
                } }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-muted-foreground mt-1", children: [
                  "C",
                  pt.classNum
                ] })
              ] }, idx)) })
            ] })
          ] })
        ] })
      ] })
    ] }),
    activeTab === "notifications" && /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 flex-1 max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-extrabold text-foreground uppercase tracking-wider", children: "Notification & Alert History" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Threshold reminders triggered when attendance crosses 85% or 75%." })
        ] }),
        unreadNotifications.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20", children: [
          unreadNotifications.length,
          " Unread"
        ] })
      ] }),
      notifications.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-2", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-10 w-10 text-emerald-500 mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: "No Attendance Alerts" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "All subjects are comfortably above university limits!" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: notifications.map((notif) => /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${!notif.isRead ? "bg-card border-amber-500/40 shadow-xs" : "bg-muted/20 border-border opacity-80"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3.5", children: [
          /* @__PURE__ */ jsx("div", { className: `h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${notif.level === "critical" ? "bg-red-500/10 text-red-500" : notif.level === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`, children: notif.level === "critical" ? /* @__PURE__ */ jsx(ShieldAlert, { className: "h-5 w-5" }) : notif.level === "warning" ? /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase", children: notif.subjectName }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground font-semibold", children: new Date(notif.sentAt).toLocaleString() })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground leading-relaxed", children: notif.message })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
          !notif.isRead && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", className: "h-8 px-2 text-xs text-primary font-bold hover:bg-primary/10", onClick: () => markReadMutation.mutate(notif.id), children: [
            /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 mr-1" }),
            " Read"
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10", onClick: () => deleteNotifMutation.mutate(notif.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }, notif.id)) })
    ] }),
    activeTab === "faculty" && /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-extrabold text-foreground uppercase tracking-wider", children: "Class Attendance Ledger" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Recent class execution logs and manual ledger sign-offs." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-border bg-muted/30 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-extrabold text-foreground uppercase tracking-wider", children: "Recent Attendance Logs" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-muted-foreground", children: [
            recentLogs.length,
            " Records"
          ] })
        ] }),
        recentLogs.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-xs text-muted-foreground", children: "No records yet. Mark attendance on subject cards to add entries!" }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: recentLogs.map((log) => /* @__PURE__ */ jsxs("div", { className: "p-4 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: `h-2.5 w-2.5 rounded-full ${log.status === "present" ? "bg-emerald-500" : "bg-red-500"}` }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-bold text-foreground", children: log.subjectName }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                "Logged on ",
                log.date
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${log.status === "present" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`, children: log.status })
        ] }, log.id)) })
      ] })
    ] }),
    showCueModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
        setShowCueModal(false);
        setCueError(null);
      }, className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 z-10 transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-border/60 pb-4 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-md", children: /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-extrabold text-foreground", children: "Sync from CUE Portal" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Direct server sync or browser-assisted integration" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/50 mb-5", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSyncTab("server"), className: `flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${syncTab === "server" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`, children: "⚡ Direct Sync" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSyncTab("extension"), className: `flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${syncTab === "extension" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`, children: "🧩 Extension" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSyncTab("bookmarklet"), className: `flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${syncTab === "bookmarklet" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`, children: "🔖 Bookmarklet" })
      ] }),
      syncTab === "server" && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: isFetchingSession ? /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border border-border bg-muted/20 text-center space-y-2", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-5 w-5 animate-spin mx-auto text-primary" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: "Connecting to Christ University Login Portal..." }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "Preparing secure PKCE session & CAPTCHA verification" })
      ] }) : captchaSession?.reachable === false ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 space-y-1.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-bold", children: [
            /* @__PURE__ */ jsx(ShieldAlert, { className: "h-4 w-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "External Cloud Restrictions Detected" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "leading-relaxed", children: [
            "Christ University's Keycloak server runs on non-standard port ",
            /* @__PURE__ */ jsx("code", { className: "px-1 py-0.2 rounded bg-amber-500/20 font-mono text-[11px]", children: "8010" }),
            " and blocks direct cloud API connections."
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "leading-relaxed font-semibold", children: [
            "Please use the ",
            /* @__PURE__ */ jsx("strong", { children: "Extension" }),
            " or ",
            /* @__PURE__ */ jsx("strong", { children: "Bookmarklet" }),
            " tab to sync seamlessly from your browser!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 pt-1", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setSyncTab("extension"), className: "text-xs font-bold", children: "🧩 Open Extension Guide" }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setSyncTab("bookmarklet"), className: "text-xs font-bold", children: "🔖 Open Bookmarklet Guide" })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "cue-username", className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "CUE Username / Register No." }),
          /* @__PURE__ */ jsx("input", { id: "cue-username", type: "text", value: cueUsername, onChange: (e) => setCueUsername(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleCueSync(cueUsername, cuePassword), placeholder: "e.g. 2547244", autoComplete: "username", disabled: isCueSyncing, className: "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/40 disabled:opacity-60 transition-all" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "cue-password", className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "CUE Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("input", { id: "cue-password", type: showCuePassword ? "text" : "password", value: cuePassword, onChange: (e) => setCuePassword(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleCueSync(cueUsername, cuePassword), placeholder: "Your CUE portal password", autoComplete: "current-password", disabled: isCueSyncing, className: "w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/40 disabled:opacity-60 transition-all" }),
            /* @__PURE__ */ jsx("button", { type: "button", tabIndex: -1, onClick: () => setShowCuePassword(!showCuePassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors", children: showCuePassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
          ] })
        ] }),
        captchaSession?.hasCaptcha && /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-xl border border-border bg-muted/30 space-y-2.5 animate-in fade-in duration-200", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "Security Verification (CAPTCHA)" }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: fetchCaptchaSession, disabled: isFetchingSession, className: "text-[11px] font-bold text-primary hover:underline flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: `h-3 w-3 ${isFetchingSession ? "animate-spin" : ""}` }),
              " Refresh"
            ] })
          ] }),
          captchaSession.captchaImage ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-1.5 bg-background rounded-lg border border-border inline-block", children: /* @__PURE__ */ jsx("img", { src: captchaSession.captchaImage, alt: "CAPTCHA Challenge", className: "h-10 w-auto rounded object-contain select-none" }) }),
            /* @__PURE__ */ jsx("input", { type: "text", value: captchaText, onChange: (e) => setCaptchaText(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleCueSync(cueUsername, cuePassword), placeholder: "Enter characters", disabled: isCueSyncing, className: "flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 uppercase" })
          ] }) : /* @__PURE__ */ jsx("input", { type: "text", value: captchaText, onChange: (e) => setCaptchaText(e.target.value), placeholder: "Enter CAPTCHA text shown on login page", disabled: isCueSyncing, className: "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40" })
        ] }),
        cueError && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-600 dark:text-red-400", children: [
          /* @__PURE__ */ jsx(ShieldAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsx("p", { className: "leading-relaxed", children: cueError })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", onClick: () => handleCueSync(cueUsername, cuePassword), disabled: isCueSyncing || !cueUsername.trim() || !cuePassword, className: "w-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-1.5 disabled:opacity-60 py-2.5", children: isCueSyncing ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }),
          " Authenticating & Syncing..."
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
          " Sync Live Attendance"
        ] }) })
      ] }) }),
      syncTab === "extension" && /* @__PURE__ */ jsxs("div", { className: "space-y-3.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20", children: "Automatic" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-extrabold text-foreground", children: "AcadSphere Chrome Extension" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
          "Auto-captures attendance whenever you view your attendance page on ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "cue.christuniversity.in" }),
          "."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 bg-background p-2.5 rounded-xl border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5", children: "1" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Go to ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "chrome://extensions" }),
              ", enable ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Developer mode" }),
              " (top right)."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 bg-background p-2.5 rounded-xl border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5", children: "2" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Click ",
                /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Load unpacked" }),
                " and select the folder:"
              ] }),
              /* @__PURE__ */ jsx("code", { className: "block mt-1 p-1.5 bg-muted rounded font-mono text-[10px] text-foreground select-all truncate", children: "c:\\Users\\Roy Mathew\\Desktop\\spd\\acadsphere-extension" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 bg-background p-2.5 rounded-xl border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5", children: "3" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Visit your CUE Portal Attendance page. Open the extension popup, paste your User ID once, and click ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Sync" }),
              "."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "Your AcadSphere User ID" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("code", { className: "flex-1 font-mono text-xs font-bold text-foreground bg-background px-3 py-1.5 rounded-lg border border-border/50 truncate select-all", children: userId || "Sign in to see your User ID" }),
            userId && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
              navigator.clipboard.writeText(userId);
              toast.success("User ID copied!");
            }, className: "shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold border border-primary/20 transition-all", children: "Copy" })
          ] })
        ] })
      ] }),
      syncTab === "bookmarklet" && /* @__PURE__ */ jsxs("div", { className: "space-y-3.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20", children: "No Install" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-extrabold text-foreground", children: "Browser Bookmarklet" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "A lightweight JavaScript bookmark you can run directly while viewing the CUE portal." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 bg-background p-2.5 rounded-xl border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5", children: "1" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Press ",
              /* @__PURE__ */ jsx("kbd", { className: "px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border", children: "Ctrl+Shift+B" }),
              " in Chrome/Edge, right-click bar → ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Add page" }),
              "."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 bg-background p-2.5 rounded-xl border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5", children: "2" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Name it ",
                /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "AcadSphere Sync" }),
                " and paste the URL from:"
              ] }),
              /* @__PURE__ */ jsx("code", { className: "block mt-1 p-1.5 bg-muted rounded font-mono text-[10px] text-foreground select-all truncate", children: "supabase/functions/bookmarklet/bookmarklet.url.txt" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 bg-background p-2.5 rounded-xl border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5", children: "3" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "On ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "cue.christuniversity.in/main/attendence" }),
              ", click the bookmark and enter your User ID."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "Your AcadSphere User ID" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("code", { className: "flex-1 font-mono text-xs font-bold text-foreground bg-background px-3 py-1.5 rounded-lg border border-border/50 truncate select-all", children: userId || "Sign in to see your User ID" }),
            userId && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
              navigator.clipboard.writeText(userId);
              toast.success("User ID copied!");
            }, className: "shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold border border-primary/20 transition-all", children: "Copy" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 mt-4 border-t border-border/40", children: [
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: handleDemoSync, disabled: isCueSyncing, className: "text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 flex items-center gap-1.5 px-3", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
          " Load Demo Data"
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => {
          setShowCueModal(false);
          setCueError(null);
        }, className: "text-xs font-bold", children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("style", { children: `
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        ` })
  ] }) });
}
export {
  AttendancePage as component
};
