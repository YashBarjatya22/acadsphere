import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-CzYOcfyh.js";
import { C as ChatLayout } from "./ChatLayout-sTEV38C2.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { C as Card, b as CardHeader, a as CardContent, c as CardTitle, d as CardDescription } from "./card-Cwsrt9M1.js";
import { toast } from "sonner";
import { supabase } from "./client-h4N4kZKq.js";
import { g as getAttendanceDashboardData, u as updateSubjectAttendance, m as markNotificationRead, d as deleteNotification } from "./attendance.functions-BmLNHzjh.js";
import { ShieldAlert, RefreshCw, Wifi, WifiOff, Clock, Globe, Bell, Layers, BellRing, TrendingUp, CheckCircle2, Lock, ChevronDown, ShieldCheck, Check, AlertTriangle, Database, FlaskConical, BookOpen, Sparkles, Plus, Minus, TrendingDown, Trash2, X, LogIn, Copy } from "lucide-react";
import "@tanstack/react-router";
import "./server-CeiC96WD.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CZBfFAiY.js";
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
function AttendancePage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSubjectId, setSelectedSubjectId] = useState("sub1");
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({
      data
    }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, []);
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
  const [cueUsername, setCueUsername] = useState("");
  const [cuePassword, setCuePassword] = useState("");
  const [isSyncingCue, setIsSyncingCue] = useState(false);
  const [cueError, setCueError] = useState(null);
  const handleCueSync = async (e) => {
    e.preventDefault();
    if (!cueUsername || !cuePassword) {
      toast.error("Please enter both CUE username and password.");
      return;
    }
    setIsSyncingCue(true);
    setCueError(null);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("kp-scraper", {
        body: {
          username: cueUsername.trim(),
          password: cuePassword
        }
      });
      if (error || !data || data.error) {
        const errMsg = data?.error || error?.message || "Authentication failed. Please verify credentials.";
        setCueError(errMsg);
        toast.error(errMsg);
        setIsSyncingCue(false);
        return;
      }
      if (data.subjects && Array.isArray(data.subjects)) {
        const syncedAt = (/* @__PURE__ */ new Date()).toISOString();
        const sessionPayload = {
          subjects: data.subjects,
          lastSynced: syncedAt
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(CUE_SESSION_KEY, JSON.stringify(sessionPayload));
        }
        setCueData(data.subjects);
        setCueLastSynced(syncedAt);
        setShowCueModal(false);
        setCuePassword("");
        toast.success(`Successfully synced ${data.subjects.length} subjects from CUE Portal!`);
      } else {
        setCueError("No attendance subjects returned from CUE Portal.");
        toast.error("No attendance subjects returned from CUE Portal.");
      }
    } catch (err) {
      const errMsg = err?.message || "Could not connect to CUE sync service.";
      setCueError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSyncingCue(false);
    }
  };
  useEffect(() => {
    const purge = () => sessionStorage.removeItem(CUE_SESSION_KEY);
    window.addEventListener("beforeunload", purge);
    return () => window.removeEventListener("beforeunload", purge);
  }, []);
  const getDashboardFn = useServerFn(getAttendanceDashboardData);
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
    queryKey: ["attendanceDashboardData"],
    queryFn: () => getDashboardFn(),
    retry: 2,
    retryDelay: 1e3
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
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-foreground", children: "Sync via AcadSphere Chrome Extension" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: [
            "To update your attendance, open your CUE Portal (",
            /* @__PURE__ */ jsx("strong", { children: "cue.christuniversity.in" }),
            ") and click the AcadSphere Chrome Extension."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider shrink-0 hidden sm:inline-block", children: "Extension Sync Ready" })
    ] }),
    userId && /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-background/70 border border-border/80 text-xs gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "font-bold text-muted-foreground uppercase text-[10px]", children: "Your Sync User ID:" }),
        /* @__PURE__ */ jsx("code", { className: "font-mono text-primary font-bold text-xs select-all", children: userId })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => {
        navigator.clipboard.writeText(userId);
        toast.success("User ID copied to clipboard!");
      }, className: "px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] transition-all flex items-center gap-1 shrink-0", children: [
        /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
        " Copy User ID"
      ] })
    ] })
  ] });
  if (isLoading) {
    return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full bg-background flex flex-col items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground", children: "Loading Attendance Engine..." })
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
                    pct.toFixed(1),
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
          /* @__PURE__ */ jsx("p", { className: "text-[11px] opacity-90", children: overall.percentage <= 75 ? `Overall attendance has fallen to ${overall.percentage}%, below the mandatory 75% university limit.` : `${overall.criticalSubjectsCount} subject(s) are critically below 75%. Immediate recovery required!` })
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
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => refetch(), className: "flex items-center gap-1.5 bg-card border border-border hover:border-primary px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            " Sync"
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
      ] }) : /* @__PURE__ */ jsxs("div", { onClick: () => setShowCueModal(true), className: "flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 border-dashed cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5 text-blue-500" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-extrabold text-foreground", children: "Connect to CUE/KP Portal" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Enter your Christ University credentials to sync real-time attendance data. Credentials are never stored." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline", children: [
          /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5" }),
          " Secure Login ",
          /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3 -rotate-90" })
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
                  overall.percentage,
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
                    displayPct.toFixed(1),
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
                    sub.percentage,
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
    showCueModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowCueModal(false), className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-border/60 pb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5 text-blue-500" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-extrabold text-foreground", children: "Sync from CUE Portal" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Authenticates directly with cue.christuniversity.in internal API" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleCueSync, className: "space-y-4", children: [
        cueError && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(ShieldAlert, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsx("span", { children: cueError })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase", children: "CUE Register / Roll Number" }),
          /* @__PURE__ */ jsx("input", { type: "text", required: true, value: cueUsername, onChange: (e) => setCueUsername(e.target.value), placeholder: "e.g. 2340123", className: "w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase", children: "CUE Password" }),
          /* @__PURE__ */ jsx("input", { type: "password", required: true, value: cuePassword, onChange: (e) => setCuePassword(e.target.value), placeholder: "••••••••", className: "w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5 bg-muted/40 p-2.5 rounded-xl border border-border/40", children: [
          /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsx("span", { children: "Credentials are held strictly in memory for token extraction and never saved or logged." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setShowCueModal(false), disabled: isSyncingCue, className: "text-xs font-bold", children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", disabled: isSyncingCue, className: "bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2", children: isSyncingCue ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }),
            " Authenticating..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(LogIn, { className: "h-3.5 w-3.5" }),
            " Sync Live Attendance"
          ] }) })
        ] })
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
