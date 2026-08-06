import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateAttendanceMargins, marginLabel, marginColor } from "@/lib/attendance-margins";
import {
  getAttendanceDashboardData,
  updateSubjectAttendance,
  markNotificationRead,
  deleteNotification,
  SubjectAttendance,
} from "@/lib/attendance.functions";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Bell,
  BellRing,
  Trash2,
  Check,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Minus,
  RefreshCw,
  Layers,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Globe,
  X,
  Wifi,
  WifiOff,
  Database,
  Zap,
  ChevronDown,
  FlaskConical,
  Copy,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/attendance")({
  component: AttendancePage,
});

// ── Types ──────────────────────────────────────────────────────────────────────

interface CueSubject {
  name: string;
  code: string;
  type: string;
  attended: number;
  total: number;
  percentage: number;
}

const CUE_SESSION_KEY = "cue_attendance_v1";

// ── Component ──────────────────────────────────────────────────────────────────

function AttendancePage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "notifications" | "faculty">("dashboard");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("sub1");

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, []);

  // CUE data is cached in sessionStorage or updated via Chrome Extension
  // NOTE: must guard with typeof window check — this initializer runs during SSR on Node.js
  const [cueData, setCueData] = useState<CueSubject[] | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = sessionStorage.getItem(CUE_SESSION_KEY);
      return s ? JSON.parse(s).subjects : null;
    } catch { return null; }
  });
  const [cueLastSynced, setCueLastSynced] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = sessionStorage.getItem(CUE_SESSION_KEY);
      return s ? JSON.parse(s).lastSynced : null;
    } catch { return null; }
  });

  const [showCueModal, setShowCueModal] = useState(false);
  const [cueUsername, setCueUsername] = useState("");
  const [cuePassword, setCuePassword] = useState("");
  const [isSyncingCue, setIsSyncingCue] = useState(false);
  const [cueError, setCueError] = useState<string | null>(null);

  const handleCueSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cueUsername || !cuePassword) {
      toast.error("Please enter both CUE username and password.");
      return;
    }

    setIsSyncingCue(true);
    setCueError(null);

    try {
      const { data, error } = await supabase.functions.invoke("kp-scraper", {
        body: { username: cueUsername.trim(), password: cuePassword },
      });

      if (error || !data || data.error) {
        const errMsg = data?.error || error?.message || "Authentication failed. Please verify credentials.";
        setCueError(errMsg);
        toast.error(errMsg);
        setIsSyncingCue(false);
        return;
      }

      if (data.subjects && Array.isArray(data.subjects)) {
        const syncedAt = new Date().toISOString();
        const sessionPayload = {
          subjects: data.subjects,
          lastSynced: syncedAt,
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
    } catch (err: any) {
      const errMsg = err?.message || "Could not connect to CUE sync service.";
      setCueError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSyncingCue(false);
    }
  };

  // ── Purge sessionStorage when tab closes ──
  useEffect(() => {
    const purge = () => sessionStorage.removeItem(CUE_SESSION_KEY);
    window.addEventListener("beforeunload", purge);
    return () => window.removeEventListener("beforeunload", purge);
  }, []);

  // ── Server functions ──────────────────────────────────────────────────────────
  const getDashboardFn = useServerFn(getAttendanceDashboardData);
  const updateAttendanceFn = useServerFn(updateSubjectAttendance);
  const markReadFn = useServerFn(markNotificationRead);
  const deleteNotifFn = useServerFn(deleteNotification);

  const { data: dashboardData, isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ["attendanceDashboardData"],
    queryFn: () => getDashboardFn(),
    retry: 2,
    retryDelay: 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ subjectId, action }: { subjectId: string; action: "present" | "absent" | "reset" }) =>
      updateAttendanceFn({ data: { subjectId, action } }),
    onSuccess: (res) => {
      toast.success(`Updated ${res.subjectName}! New: ${res.newPercentage}%`);
      qc.invalidateQueries({ queryKey: ["attendanceDashboardData"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update attendance"),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markReadFn({ data: { notificationId: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendanceDashboardData"] }),
  });

  const deleteNotifMutation = useMutation({
    mutationFn: (id: string) => deleteNotifFn({ data: { notificationId: id } }),
    onSuccess: () => {
      toast.success("Notification removed.");
      qc.invalidateQueries({ queryKey: ["attendanceDashboardData"] });
    },
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
    const diff = Math.floor((Date.now() - new Date(cueLastSynced).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)}h ago`;
  }, [cueLastSynced]);

  // ── Computed CUE overall margins ──────────────────────────────────────────────
  const cueOverall = useMemo(() => {
    if (!cueData || cueData.length === 0) return null;
    const totalAttended = cueData.reduce((s, sub) => s + sub.attended, 0);
    const totalTotal = cueData.reduce((s, sub) => s + sub.total, 0);
    return {
      attended: totalAttended,
      total: totalTotal,
      pct: totalTotal > 0 ? (totalAttended / totalTotal) * 100 : 100,
      margins: calculateAttendanceMargins(totalAttended, totalTotal),
    };
  }, [cueData]);

  // ── Color helpers ─────────────────────────────────────────────────────────────
  const getBadgeStyle = (color: "green" | "blue" | "yellow" | "red") => {
    switch (color) {
      case "green": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "blue":  return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "yellow":return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "red":   return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse";
    }
  };

  const getProgressColor = (color: "green" | "blue" | "yellow" | "red") => {
    switch (color) {
      case "green":  return "bg-emerald-500";
      case "blue":   return "bg-blue-500";
      case "yellow": return "bg-amber-500";
      case "red":    return "bg-red-500";
    }
  };

  const pctColor = (pct: number) => {
    if (pct >= 85) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 75) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const pctBadge = (pct: number) => {
    if (pct >= 85) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (pct >= 75) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  };

  // ── Subject card — margin footer ──────────────────────────────────────────────
  const MarginFooter = ({ attended, total }: { attended: number; total: number }) => {
    const m = calculateAttendanceMargins(attended, total);
    const c85 = marginColor(m.target85, 85);
    const c75 = marginColor(m.target75, 75);
    return (
      <div className="space-y-1.5 p-2.5 rounded-xl bg-muted/30 border border-border/60">
        {/* 85% row */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> 85% Target
          </span>
          <span className={`font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border ${c85.text} ${c85.bg} ${c85.border}`}>
            {m.target85.status === "SAFE" ? (
              <><Check className="h-2.5 w-2.5" /> Can skip {m.target85.leavesAllowed} hr{m.target85.leavesAllowed !== 1 ? "s" : ""}</>
            ) : (
              <><AlertTriangle className="h-2.5 w-2.5" /> Attend {m.target85.classesNeeded} hr{m.target85.classesNeeded !== 1 ? "s" : ""}</>
            )}
          </span>
        </div>
        {/* 75% row */}
        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border/40">
          <span className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-amber-500" /> 75% Target
          </span>
          <span className={`font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border ${c75.text} ${c75.bg} ${c75.border}`}>
            {m.target75.status === "SAFE" ? (
              <><Check className="h-2.5 w-2.5" /> Can skip {m.target75.leavesAllowed} hr{m.target75.leavesAllowed !== 1 ? "s" : ""}</>
            ) : (
              <><AlertTriangle className="h-2.5 w-2.5" /> Attend {m.target75.classesNeeded} hr{m.target75.classesNeeded !== 1 ? "s" : ""}</>
            )}
          </span>
        </div>
      </div>
    );
  };

  // ── Render Extension Sync Banner ─────────────────────────────────────────────
  const renderExtensionSyncBanner = () => (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-blue-500/20 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Sync via AcadSphere Chrome Extension</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              To update your attendance, open your CUE Portal (<strong>cue.christuniversity.in</strong>) and click the AcadSphere Chrome Extension.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider shrink-0 hidden sm:inline-block">
          Extension Sync Ready
        </span>
      </div>

      {userId && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-background/70 border border-border/80 text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-muted-foreground uppercase text-[10px]">Your Sync User ID:</span>
            <code className="font-mono text-primary font-bold text-xs select-all">{userId}</code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(userId);
              toast.success("User ID copied to clipboard!");
            }}
            className="px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] transition-all flex items-center gap-1 shrink-0"
          >
            <Copy className="h-3 w-3" /> Copy User ID
          </button>
        </div>
      )}
    </div>
  );

  // ── CASE 1: Still fetching — show spinner ────────────────────────────────────
  if (isLoading) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="h-full bg-background flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Loading Attendance Engine...</p>
        </div>
      </ChatLayout>
    );
  }

  // ── CASE 2: Query failed or no data — show error banner + CUE portal usable ──
  if (isError || !dashboardData) {
    const errMsg = (queryError as any)?.message || "Could not load attendance data from the database.";
    return (
      <ChatLayout activeThreadId={null}>
        <div className="h-full bg-background text-foreground flex flex-col overflow-y-auto">
          {/* Error banner */}
          <div className="m-6 p-5 rounded-2xl border border-red-500/30 bg-red-500/5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-foreground">Attendance Database Unavailable</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{errMsg}</p>
              <p className="text-xs text-muted-foreground mt-1">You can still sync live data directly from the CUE/KP Portal below.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-all shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>

          {/* CUE portal section still fully usable */}
          <div className="px-6 pb-6 space-y-6">
            {cueData && cueOverall ? (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
                  <Wifi className="h-4 w-4" />
                  CUE Portal data loaded · {cueData.length} subjects · {lastSyncedLabel}
                  <button onClick={handleCueClear} className="ml-auto text-muted-foreground hover:text-red-500"><WifiOff className="h-3.5 w-3.5" /></button>
                </div>
                {/* CUE overall summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-2 pt-4">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">Overall (CUE)</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className={`text-3xl font-extrabold ${pctColor(cueOverall.pct)}`}>{cueOverall.pct.toFixed(2)}%</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 text-xs text-muted-foreground">{cueOverall.attended} attended / {cueOverall.total} total hrs</CardContent>
                  </Card>
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-2 pt-4">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">85% Target</span>
                      <CardTitle className={`text-xl font-extrabold mt-1 ${cueOverall.margins.target85.status === "SAFE" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                        {cueOverall.margins.target85.status === "SAFE" ? `Skip ${cueOverall.margins.target85.leavesAllowed} hrs` : `Need ${cueOverall.margins.target85.classesNeeded} hrs`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-xs text-muted-foreground">{cueOverall.margins.target85.status === "SAFE" ? "Above 85% target" : "Below 85% — attend to recover"}</CardContent>
                  </Card>
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-2 pt-4">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">75% Mandatory</span>
                      <CardTitle className={`text-xl font-extrabold mt-1 ${cueOverall.margins.target75.status === "SAFE" ? "text-blue-600 dark:text-blue-400" : "text-amber-500"}`}>
                        {cueOverall.margins.target75.status === "SAFE" ? `Skip ${cueOverall.margins.target75.leavesAllowed} hrs` : `Need ${cueOverall.margins.target75.classesNeeded} hrs`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-xs text-muted-foreground">{cueOverall.margins.target75.status === "SAFE" ? "Above mandatory 75%" : "Critical — below 75% limit"}</CardContent>
                  </Card>
                </div>
                {/* CUE subject cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cueData.map((sub, i) => {
                    const m = calculateAttendanceMargins(sub.attended, sub.total);
                    const pct = sub.total > 0 ? (sub.attended / sub.total) * 100 : 100;
                    return (
                      <Card key={i} className="border-border bg-card shadow-xs relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${pct >= 85 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}`} />
                        <CardHeader className="pb-3 pt-5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">{sub.code}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pctBadge(pct)}`}>{pct >= 85 ? "Safe" : pct >= 75 ? "Warning" : "Critical"}</span>
                          </div>
                          <CardTitle className="text-sm font-extrabold mt-2">{sub.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                          <div>
                            <div className="flex items-baseline justify-between mb-1.5">
                              <span className={`text-2xl font-extrabold ${pctColor(pct)}`}>{pct.toFixed(1)}%</span>
                              <span className="text-muted-foreground">{sub.attended} / {sub.total} hrs</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div className={`h-full ${pct >= 85 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                          </div>
                          <MarginFooter attended={sub.attended} total={sub.total} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              /* No CUE data — prompt to sync via Chrome Extension */
              renderExtensionSyncBanner()
            )}
          </div>
        </div>
      </ChatLayout>
    );
  }

  const { overall, subjects, notifications, recentLogs } = dashboardData;
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col overflow-y-auto scrollbar-thin transition-colors duration-200 relative">

        {/* ── Global Warning Banner ── */}
        {(overall.percentage <= 75 || overall.criticalSubjectsCount > 0) && (
          <div className="bg-red-500 text-white px-6 py-3 shrink-0 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 animate-bounce shrink-0" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider">Mandatory Attendance Warning</p>
                <p className="text-[11px] opacity-90">
                  {overall.percentage <= 75
                    ? `Overall attendance has fallen to ${overall.percentage}%, below the mandatory 75% university limit.`
                    : `${overall.criticalSubjectsCount} subject(s) are critically below 75%. Immediate recovery required!`}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold shrink-0"
              onClick={() => setActiveTab("notifications")}
            >
              View Alerts ({unreadNotifications.length})
            </Button>
          </div>
        )}

        {/* ── Header ── */}
        <div className="relative overflow-hidden px-6 py-5 border-b border-border shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-amber-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-tight">Intelligent Attendance Monitor</h1>
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-500/20">
                    AcadSphere Engine
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Live CUE sync · 85% &amp; 75% margin analytics · Proactive alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* CUE Sync Button */}
              {cueData ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Wifi className="h-3.5 w-3.5" />
                    <span>CUE Synced · {lastSyncedLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCueModal(true)}
                    className="flex items-center gap-1.5 bg-card border border-border hover:border-blue-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    title="Re-sync from CUE Portal"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-blue-500" /> Re-sync
                  </button>
                  <button
                    type="button"
                    onClick={handleCueClear}
                    className="h-8 w-8 flex items-center justify-center rounded-xl border border-border hover:border-red-500/40 hover:text-red-500 text-muted-foreground transition-all"
                    title="Clear CUE session data"
                  >
                    <WifiOff className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCueModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Sync from CUE Portal
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                className="relative flex items-center gap-2 bg-card border border-border hover:border-primary px-3 py-2 rounded-xl shadow-xs text-xs font-bold transition-all cursor-pointer"
              >
                <Bell className="h-4 w-4 text-amber-500" />
                <span>Alerts</span>
                {unreadNotifications.length > 0 && (
                  <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => refetch()}
                className="flex items-center gap-1.5 bg-card border border-border hover:border-primary px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /> Sync
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="relative z-20 flex items-center gap-2 mt-4 pt-3 border-t border-border/40 overflow-x-auto scrollbar-none">
            {(["dashboard", "simulator", "notifications", "faculty"] as const).map((tab) => {
              const labels: Record<string, { label: string; Icon: any }> = {
                dashboard:     { label: "Attendance Dashboard", Icon: CheckCircle2 },
                simulator:     { label: "Prediction Engine", Icon: TrendingUp },
                notifications: { label: "Notification Center", Icon: BellRing },
                faculty:       { label: "Class Ledger", Icon: Layers },
              };
              const { label, Icon } = labels[tab];
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 relative
                    ${activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                      : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                  {tab === "notifications" && unreadNotifications.length > 0 && (
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1 — DASHBOARD
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="p-6 space-y-6 flex-1">

            {/* ── CUE Data Source Banner ── */}
            {cueData ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Wifi className="h-4 w-4" />
                  <span>Showing live data from CUE Portal · {cueData.length} subjects · Last synced: {lastSyncedLabel}</span>
                </div>
                <button
                  onClick={() => setShowCueModal(true)}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Re-sync
                </button>
              </div>
            ) : (
              <div
                onClick={() => setShowCueModal(true)}
                className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 border-dashed cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-foreground">Connect to CUE/KP Portal</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Enter your Christ University credentials to sync real-time attendance data.
                      Credentials are never stored.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                  <Lock className="h-3.5 w-3.5" /> Secure Login <ChevronDown className="h-3 w-3 -rotate-90" />
                </div>
              </div>
            )}

            {/* ── Overall Summary Cards ── */}
            {cueData && cueOverall ? (
              /* ── CUE OVERALL SUMMARY ── */
              <div className="grid gap-4 md:grid-cols-3">
                {/* Card 1: Overall % */}
                <Card className="border-border bg-gradient-to-br from-card to-card/80 shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${cueOverall.pct >= 85 ? "bg-emerald-500" : cueOverall.pct >= 75 ? "bg-amber-500" : "bg-red-500"}`} />
                  <CardHeader className="pb-2 pt-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                      Overall (CUE Live)
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-3xl font-extrabold tracking-tight ${pctColor(cueOverall.pct)}`}>
                        {cueOverall.pct.toFixed(2)}%
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${pctBadge(cueOverall.pct)}`}>
                        {cueOverall.pct >= 85 ? "Safe" : cueOverall.pct >= 75 ? "Warning" : "Critical"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs">
                    <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${cueOverall.pct >= 85 ? "bg-emerald-500" : cueOverall.pct >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(100, cueOverall.pct)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                      {cueOverall.attended} attended / {cueOverall.total} total hrs
                    </p>
                  </CardContent>
                </Card>

                {/* Card 2: 85% Target margin */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                        85% Target
                      </span>
                      <ShieldCheck className={`h-4 w-4 ${cueOverall.margins.target85.status === "SAFE" ? "text-emerald-500" : "text-red-500"}`} />
                    </div>
                    <CardTitle className={`text-2xl font-extrabold mt-1 ${cueOverall.margins.target85.status === "SAFE" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {cueOverall.margins.target85.status === "SAFE"
                        ? `Skip ${cueOverall.margins.target85.leavesAllowed} hr${cueOverall.margins.target85.leavesAllowed !== 1 ? "s" : ""}`
                        : `Need ${cueOverall.margins.target85.classesNeeded} hr${cueOverall.margins.target85.classesNeeded !== 1 ? "s" : ""}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    {cueOverall.margins.target85.status === "SAFE"
                      ? <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Above 85% university honours target</span>
                      : <span className="text-red-600 dark:text-red-400 font-bold">Must attend next {cueOverall.margins.target85.classesNeeded} hrs consecutively to reach 85%</span>}
                  </CardContent>
                </Card>

                {/* Card 3: 75% Target margin */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                        75% Target (Mandatory)
                      </span>
                      <ShieldAlert className={`h-4 w-4 ${cueOverall.margins.target75.status === "SAFE" ? "text-blue-500" : "text-amber-500"}`} />
                    </div>
                    <CardTitle className={`text-2xl font-extrabold mt-1 ${cueOverall.margins.target75.status === "SAFE" ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {cueOverall.margins.target75.status === "SAFE"
                        ? `Skip ${cueOverall.margins.target75.leavesAllowed} hr${cueOverall.margins.target75.leavesAllowed !== 1 ? "s" : ""}`
                        : `Need ${cueOverall.margins.target75.classesNeeded} hr${cueOverall.margins.target75.classesNeeded !== 1 ? "s" : ""}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    {cueOverall.margins.target75.status === "SAFE"
                      ? <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Above mandatory 75% limit</span>
                      : <span className="text-amber-600 dark:text-amber-400 font-bold">Must attend {cueOverall.margins.target75.classesNeeded} hrs to avoid academic action</span>}
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* ── SQLITE OVERALL SUMMARY (existing 4-card layout) ── */
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border bg-card shadow-xs relative overflow-hidden md:col-span-1">
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${getProgressColor(overall.statusColor)}`} />
                  <CardHeader className="pb-2 pt-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">Overall Attendance</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-3xl font-extrabold tracking-tight text-foreground">{overall.percentage}%</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(overall.statusColor)}`}>{overall.status}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs">
                    <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                      <div className={`h-full ${getProgressColor(overall.statusColor)} transition-all duration-500`} style={{ width: `${overall.percentage}%` }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 font-medium">{overall.totalAttended} attended / {overall.totalConducted} total</p>
                    {/* Add dual margin badges to overall card */}
                    <div className="mt-3 pt-2 border-t border-border/40">
                      <MarginFooter attended={overall.totalAttended} total={overall.totalConducted} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-xs">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">Recovery Needed (75%)</span>
                      <AlertTriangle className={`h-4 w-4 ${overall.requiredFor75 > 0 ? "text-red-500" : "text-emerald-500"}`} />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-foreground mt-1">
                      {overall.requiredFor75 === 0 ? "0 Classes" : `${overall.requiredFor75} Classes`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    {overall.requiredFor75 === 0
                      ? <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Above 75% limit</span>
                      : <span className="text-red-600 dark:text-red-400 font-bold">Attend next {overall.requiredFor75} classes to hit 75%</span>}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-xs">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">Safe Bunks (75%)</span>
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-foreground mt-1">{overall.safeMissesCount} Classes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    Can safely miss {overall.safeMissesCount} total lectures without crossing below 75%
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-xs">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">Risk Monitor</span>
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div>
                        <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{overall.subjectsAtRiskCount}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">Warning (85%)</p>
                      </div>
                      <div className="h-6 w-px bg-border" />
                      <div>
                        <p className="text-xl font-extrabold text-red-600 dark:text-red-400">{overall.criticalSubjectsCount}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">Critical (&lt;75%)</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground mt-1">
                    Keep subjects above 85% for university honours
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Subject Cards ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    {cueData ? (
                      <><Wifi className="h-4 w-4 text-emerald-500" /> CUE Portal — Live Subjects</>
                    ) : (
                      <><Database className="h-4 w-4 text-blue-500" /> Subject-Wise Monitoring (Manual Mode)</>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {cueData
                      ? "Real data from Christ University portal. Dual-target margin analytics below each subject."
                      : "Connect CUE Portal above for live data. Manual mode uses locally tracked attendance."}
                  </p>
                </div>
              </div>

              {/* ── CUE Subject Cards ── */}
              {cueData ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cueData.map((sub, i) => {
                    const m = calculateAttendanceMargins(sub.attended, sub.total);
                    const pct = sub.total > 0 ? (sub.attended / sub.total) * 100 : 100;
                    const displayPct = Math.round(pct * 100) / 100;
                    return (
                      <Card key={i} className="border-border bg-card hover:border-primary/40 transition-all shadow-xs relative overflow-hidden flex flex-col">
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${pct >= 85 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}`} />
                        <CardHeader className="pb-3 pt-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                {sub.code}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 border-border/60 text-muted-foreground">
                                {sub.type === "Practical"
                                  ? <><FlaskConical className="h-2.5 w-2.5" /> Lab</>
                                  : <><BookOpen className="h-2.5 w-2.5" /> Theory</>}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pctBadge(pct)}`}>
                              {pct >= 85 ? "Safe" : pct >= 75 ? "Warning" : "Critical"}
                            </span>
                          </div>
                          <CardTitle className="text-sm font-extrabold text-foreground mt-2 leading-tight">
                            {sub.name}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3 text-xs flex-1">
                          {/* Percentage + progress bar */}
                          <div>
                            <div className="flex items-baseline justify-between mb-1.5">
                              <span className={`text-2xl font-extrabold ${pctColor(pct)}`}>
                                {displayPct.toFixed(1)}%
                              </span>
                              <span className="text-muted-foreground font-medium">
                                {sub.attended} / {sub.total} hrs
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${pct >= 85 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            {/* Threshold markers */}
                            <div className="relative mt-0.5 h-3">
                              <div className="absolute left-[75%] h-3 w-px bg-amber-400/60" title="75%" />
                              <div className="absolute left-[85%] h-3 w-px bg-emerald-400/60" title="85%" />
                            </div>
                          </div>

                          {/* Dual margin analytics */}
                          <MarginFooter attended={sub.attended} total={sub.total} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                /* ── SQLite Subject Cards (manual mode) ── */
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((sub) => (
                    <Card key={sub.id} className="border-border bg-card hover:border-primary/40 transition-all shadow-xs relative overflow-hidden flex flex-col justify-between">
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${getProgressColor(sub.statusColor)}`} />
                      <CardHeader className="pb-3 pt-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">{sub.code}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(sub.statusColor)}`}>{sub.status}</span>
                        </div>
                        <CardTitle className="text-base font-extrabold text-foreground mt-2">{sub.name}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4 text-xs">
                        <div>
                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-2xl font-extrabold text-foreground">{sub.percentage}%</span>
                            <span className="text-muted-foreground font-medium">{sub.attended} / {sub.conducted} Classes</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div className={`h-full ${getProgressColor(sub.statusColor)} transition-all duration-500`} style={{ width: `${sub.percentage}%` }} />
                          </div>
                        </div>

                        {/* ✅ Dual 85%/75% margin analytics */}
                        <MarginFooter attended={sub.attended} total={sub.conducted} />

                        {/* AI Suggestion */}
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                          <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
                            <Sparkles className="h-3.5 w-3.5" /> AI Suggestion
                          </div>
                          <p className="text-[11px] text-foreground/90 leading-relaxed">{sub.aiSuggestion}</p>
                        </div>

                        {/* Manual log buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Manual Log</span>
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline"
                              className="h-7 px-2 text-[10px] font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => updateMutation.mutate({ subjectId: sub.id, action: "present" })}
                              disabled={updateMutation.isPending}
                            >
                              <Plus className="h-3 w-3 mr-0.5" /> Present
                            </Button>
                            <Button size="sm" variant="outline"
                              className="h-7 px-2 text-[10px] font-bold text-red-600 border-red-500/30 hover:bg-red-500/10"
                              onClick={() => updateMutation.mutate({ subjectId: sub.id, action: "absent" })}
                              disabled={updateMutation.isPending}
                            >
                              <Minus className="h-3 w-3 mr-0.5" /> Bunk
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2 — PREDICTION SIMULATOR (unchanged, operates on SQLite)
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "simulator" && (
          <div className="p-6 space-y-6 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Future Attendance Prediction Engine</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Simulate missing or attending future lectures to see exact percentage impact.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Select Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-card border border-border px-3 py-1.5 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.percentage}%)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border bg-card shadow-xs md:col-span-1">
                <CardHeader>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">Selected Subject</span>
                  <CardTitle className="text-lg font-extrabold text-foreground">{activeSubject.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{activeSubject.code}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="text-2xl font-extrabold text-foreground">{activeSubject.percentage}%</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Attended:</span>
                      <span className="font-bold text-foreground">{activeSubject.attended} / {activeSubject.conducted}</span>
                    </div>
                  </div>
                  {/* Margin analytics for active subject */}
                  <MarginFooter attended={activeSubject.attended} total={activeSubject.conducted} />
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px]">
                    💡 Missing 1 class in {activeSubject.name} will drop to <strong>{activeSubject.predictions.miss1}%</strong>.
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-xs md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">If You Miss / Attend Upcoming Classes</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Predicted percentage table based on consecutive upcoming classes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 bg-red-500/5 p-4 rounded-2xl border border-red-500/20">
                      <h4 className="text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingDown className="h-4 w-4" /> Bunk Scenarios
                      </h4>
                      <div className="space-y-2 text-xs">
                        {[["1 class", activeSubject.predictions.miss1], ["2 classes", activeSubject.predictions.miss2], ["3 classes", activeSubject.predictions.miss3]].map(([label, pct]) => (
                          <div key={label as string} className="flex justify-between items-center p-2 rounded-xl bg-card border border-border">
                            <span>If you miss <strong>{label}</strong></span>
                            <span className="font-extrabold text-red-500">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                      <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" /> Attend Scenarios
                      </h4>
                      <div className="space-y-2 text-xs">
                        {[["1 class", activeSubject.predictions.attend1], ["3 classes", activeSubject.predictions.attend3], ["5 classes", activeSubject.predictions.attend5]].map(([label, pct]) => (
                          <div key={label as string} className="flex justify-between items-center p-2 rounded-xl bg-card border border-border">
                            <span>If you attend <strong>{label}</strong></span>
                            <span className="font-extrabold text-emerald-500">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                    <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Recent Trend Curve</p>
                    <div className="flex items-end justify-between h-28 gap-2 pt-2 border-b border-border px-2">
                      {activeSubject.trend.map((pt, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[10px] font-extrabold text-primary opacity-0 group-hover:opacity-100 transition-opacity">{pt.percentage}%</span>
                          <div className="w-full max-w-[24px] bg-gradient-to-t from-primary/60 to-primary rounded-t-md transition-all duration-300 group-hover:brightness-125"
                            style={{ height: `${pt.percentage * 0.8}%` }} />
                          <span className="text-[9px] font-mono text-muted-foreground mt-1">C{pt.classNum}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 3 — NOTIFICATIONS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <div className="p-6 space-y-6 flex-1 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Notification &amp; Alert History</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Threshold reminders triggered when attendance crosses 85% or 75%.</p>
              </div>
              {unreadNotifications.length > 0 && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {unreadNotifications.length} Unread
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-foreground">No Attendance Alerts</p>
                <p className="text-xs text-muted-foreground">All subjects are comfortably above university limits!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${!notif.isRead ? "bg-card border-amber-500/40 shadow-xs" : "bg-muted/20 border-border opacity-80"}`}>
                    <div className="flex items-start gap-3.5">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${notif.level === "critical" ? "bg-red-500/10 text-red-500" : notif.level === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {notif.level === "critical" ? <ShieldAlert className="h-5 w-5" /> : notif.level === "warning" ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">{notif.subjectName}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold">{new Date(notif.sentAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!notif.isRead && (
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-primary font-bold hover:bg-primary/10"
                          onClick={() => markReadMutation.mutate(notif.id)}>
                          <Check className="h-3.5 w-3.5 mr-1" /> Read
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => deleteNotifMutation.mutate(notif.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 4 — CLASS LEDGER
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "faculty" && (
          <div className="p-6 space-y-6 flex-1">
            <div>
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Class Attendance Ledger</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Recent class execution logs and manual ledger sign-offs.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">Recent Attendance Logs</span>
                <span className="text-xs font-bold text-muted-foreground">{recentLogs.length} Records</span>
              </div>
              {recentLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No records yet. Mark attendance on subject cards to add entries!</div>
              ) : (
                <div className="divide-y divide-border">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${log.status === "present" ? "bg-emerald-500" : "bg-red-500"}`} />
                        <div>
                          <p className="font-bold text-foreground">{log.subjectName}</p>
                          <p className="text-[10px] text-muted-foreground">Logged on {log.date}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${log.status === "present" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}



        {/* ── CUE Login Modal ── */}
        {showCueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setShowCueModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Lock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Sync from CUE Portal</h3>
                  <p className="text-xs text-muted-foreground">Authenticates directly with cue.christuniversity.in internal API</p>
                </div>
              </div>

              <form onSubmit={handleCueSync} className="space-y-4">
                {cueError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{cueError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">CUE Register / Roll Number</label>
                  <input
                    type="text"
                    required
                    value={cueUsername}
                    onChange={(e) => setCueUsername(e.target.value)}
                    placeholder="e.g. 2340123"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">CUE Password</label>
                  <input
                    type="password"
                    required
                    value={cuePassword}
                    onChange={(e) => setCuePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5 bg-muted/40 p-2.5 rounded-xl border border-border/40">
                  <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Credentials are held strictly in memory for token extraction and never saved or logged.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCueModal(false)}
                    disabled={isSyncingCue}
                    className="text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSyncingCue}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2"
                  >
                    {isSyncingCue ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Authenticating...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-3.5 w-3.5" /> Sync Live Attendance
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </ChatLayout>
  );
}
