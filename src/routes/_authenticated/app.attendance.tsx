import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
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
  Calendar,
  User,
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
  Info,
  ChevronRight,
  RefreshCw,
  Award,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "notifications" | "faculty">("dashboard");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("sub1");
  const [simulatedMisses, setSimulatedMisses] = useState<number>(1);
  const [simulatedAttends, setSimulatedAttends] = useState<number>(0);

  // Server functions
  const getDashboardFn = useServerFn(getAttendanceDashboardData);
  const updateAttendanceFn = useServerFn(updateSubjectAttendance);
  const markReadFn = useServerFn(markNotificationRead);
  const deleteNotifFn = useServerFn(deleteNotification);

  // Queries
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ["attendanceDashboardData"],
    queryFn: () => getDashboardFn(),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ subjectId, action }: { subjectId: string; action: "present" | "absent" | "reset" }) =>
      updateAttendanceFn({ data: { subjectId, action } }),
    onSuccess: (res) => {
      toast.success(`Updated attendance for ${res.subjectName}! New percentage: ${res.newPercentage}%`);
      qc.invalidateQueries({ queryKey: ["attendanceDashboardData"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update attendance");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markReadFn({ data: { notificationId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendanceDashboardData"] });
    },
  });

  const deleteNotifMutation = useMutation({
    mutationFn: (notificationId: string) => deleteNotifFn({ data: { notificationId } }),
    onSuccess: () => {
      toast.success("Notification removed.");
      qc.invalidateQueries({ queryKey: ["attendanceDashboardData"] });
    },
  });

  if (isLoading || !dashboardData) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="h-full bg-background flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Loading Intelligent Attendance Engine...</p>
        </div>
      </ChatLayout>
    );
  }

  const { overall, subjects, notifications, recentLogs } = dashboardData;
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Helper color map
  const getBadgeStyle = (color: "green" | "blue" | "yellow" | "red") => {
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

  const getProgressColor = (color: "green" | "blue" | "yellow" | "red") => {
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

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col overflow-y-auto scrollbar-thin transition-colors duration-200">
        
        {/* Global Warning Banner if Overall or Any Subject is Critical */}
        {(overall.percentage <= 75 || overall.criticalSubjectsCount > 0) && (
          <div className="bg-red-500 text-white px-6 py-3 shrink-0 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 animate-bounce shrink-0" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider">Mandatory Attendance Warning Alert</p>
                <p className="text-[11px] opacity-90">
                  {overall.percentage <= 75
                    ? `Overall attendance has fallen to ${overall.percentage}%, which is below the mandatory university limit (75%).`
                    : `You have ${overall.criticalSubjectsCount} subject(s) in critical condition (<75%). Immediate recovery required!`}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold shrink-0"
              onClick={() => setActiveTab("notifications")}
            >
              View Urgent Actions ({unreadNotifications.length})
            </Button>
          </div>
        )}

        {/* Header Section */}
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
                    AcadSphere AI Engine
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Proactive shortage alerts, safe bunk calculators, and automated recovery suggestions
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
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

          {/* Sub Navigation Tabs */}
          <div className="relative z-20 flex items-center gap-2 mt-4 pt-3 border-t border-border/40 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "dashboard"
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" /> Overall Attendance Health
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "simulator"
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Safe Bunk & Prediction Engine
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 relative ${
                activeTab === "notifications"
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <BellRing className="h-4 w-4" /> Notification Center
              {unreadNotifications.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("faculty")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "faculty"
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Layers className="h-4 w-4" /> Class Attendance Ledger
            </button>
          </div>
        </div>

        {/* Tab 1: Overall Dashboard View */}
        {activeTab === "dashboard" && (
          <div className="p-6 space-y-6 flex-1">
            {/* Top Cards: Overall Health Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              {/* Card 1: Overall Percentage Gauge */}
              <Card className="border-border bg-card shadow-xs relative overflow-hidden md:col-span-1">
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${getProgressColor(overall.statusColor)}`} />
                <CardHeader className="pb-2 pt-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                    Overall Attendance
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      {overall.percentage}%
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(overall.statusColor)}`}>
                      {overall.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 text-xs">
                  <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(overall.statusColor)} transition-all duration-500`}
                      style={{ width: `${overall.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                    {overall.totalAttended} attended out of {overall.totalConducted} total lectures
                  </p>
                </CardContent>
              </Card>

              {/* Card 2: Required to reach 75% */}
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                      Recovery Needed
                    </span>
                    <AlertTriangle className={`h-4 w-4 ${overall.requiredFor75 > 0 ? "text-red-500" : "text-emerald-500"}`} />
                  </div>
                  <CardTitle className="text-2xl font-extrabold text-foreground mt-1">
                    {overall.requiredFor75 === 0 ? "0 Classes" : `${overall.requiredFor75} Classes`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground">
                  {overall.requiredFor75 === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Above 75% limit
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      Must attend next {overall.requiredFor75} classes to hit 75%
                    </span>
                  )}
                </CardContent>
              </Card>

              {/* Card 3: Safe Bunks Allowed */}
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                      Safe Bunks Buffer
                    </span>
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl font-extrabold text-foreground mt-1">
                    {overall.safeMissesCount} Classes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground">
                  Can safely miss {overall.safeMissesCount} total lectures without crossing below 75%
                </CardContent>
              </Card>

              {/* Card 4: At Risk & Critical Subjects */}
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                      Risk Monitor
                    </span>
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
                  Keep subjects above 85% for university honors
                </CardContent>
              </Card>
            </div>

            {/* Subject-Wise Monitoring Cards Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                    Subject-Wise Attendance Monitoring
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Real-time status, safe bunk counts, and AI recovery advice per subject
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map((sub) => (
                  <Card key={sub.id} className="border-border bg-card hover:border-primary/40 transition-all shadow-xs relative overflow-hidden flex flex-col justify-between">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${getProgressColor(sub.statusColor)}`} />
                    
                    <CardHeader className="pb-3 pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                          {sub.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(sub.statusColor)}`}>
                          {sub.status}
                        </span>
                      </div>
                      <CardTitle className="text-base font-extrabold text-foreground mt-2">
                        {sub.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 text-xs">
                      {/* Attendance % & Conducted Bar */}
                      <div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-2xl font-extrabold text-foreground">{sub.percentage}%</span>
                          <span className="text-muted-foreground font-medium">
                            {sub.attended} / {sub.conducted} Classes
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(sub.statusColor)} transition-all duration-500`}
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics: Safe Bunks & Recovery Needed */}
                      <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/60 text-[11px]">
                        <div>
                          <p className="text-muted-foreground font-bold uppercase text-[9px]">Safe Bunks</p>
                          <p className="font-extrabold text-foreground mt-0.5">{sub.safeBunks} Lectures</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold uppercase text-[9px]">Recovery Needed</p>
                          <p className={`font-extrabold mt-0.5 ${sub.recoveryNeeded > 0 ? "text-red-500" : "text-emerald-500"}`}>
                            {sub.recoveryNeeded === 0 ? "0 Classes" : `${sub.recoveryNeeded} Continuous`}
                          </p>
                        </div>
                      </div>

                      {/* AI Suggestion Box */}
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                        <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles className="h-3.5 w-3.5" /> AI Suggestion
                        </div>
                        <p className="text-[11px] text-foreground/90 leading-relaxed">
                          {sub.aiSuggestion}
                        </p>
                      </div>

                      {/* Quick Interactive Log Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Log Class</span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[10px] font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={() => updateMutation.mutate({ subjectId: sub.id, action: "present" })}
                            disabled={updateMutation.isPending}
                          >
                            <Plus className="h-3 w-3 mr-0.5" /> Present (+1)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[10px] font-bold text-red-600 border-red-500/30 hover:bg-red-500/10"
                            onClick={() => updateMutation.mutate({ subjectId: sub.id, action: "absent" })}
                            disabled={updateMutation.isPending}
                          >
                            <Minus className="h-3 w-3 mr-0.5" /> Bunk (-1)
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Safe Bunk & Attendance Prediction Simulator */}
        {activeTab === "simulator" && (
          <div className="p-6 space-y-6 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                  Future Attendance Prediction & Trend Engine
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Simulate missing or attending future lectures to see exact percentage impact before taking a decision.
                </p>
              </div>

              {/* Subject Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Select Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-card border border-border px-3 py-1.5 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.percentage}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Subject Prediction Display */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Subject Current Status Card */}
              <Card className="border-border bg-card shadow-xs md:col-span-1">
                <CardHeader>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                    Selected Subject
                  </span>
                  <CardTitle className="text-lg font-extrabold text-foreground">{activeSubject.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{activeSubject.code}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-muted-foreground">Current Attendance:</span>
                      <span className="text-2xl font-extrabold text-foreground">{activeSubject.percentage}%</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Classes Attended:</span>
                      <span className="font-bold text-foreground">{activeSubject.attended} / {activeSubject.conducted}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Safe Bunk Allowance:</span>
                      <span className="font-bold text-emerald-500">{activeSubject.safeBunks} Lectures</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-foreground">
                    💡 <strong>Pro Tip:</strong> Missing 1 lecture in {activeSubject.name} will drop your attendance to <strong>{activeSubject.predictions.miss1}%</strong>.
                  </div>
                </CardContent>
              </Card>

              {/* Prediction Matrix Table */}
              <Card className="border-border bg-card shadow-xs md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">
                    If You Miss / Attend Upcoming Classes
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Predicted percentage table based on consecutive upcoming classes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Bunk Scenarios */}
                    <div className="space-y-2 bg-red-500/5 p-4 rounded-2xl border border-red-500/20">
                      <h4 className="text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingDown className="h-4 w-4" /> Bunk Scenarios
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 rounded-xl bg-card border border-border">
                          <span>If you miss <strong>1 class</strong></span>
                          <span className="font-extrabold text-red-500">{activeSubject.predictions.miss1}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl bg-card border border-border">
                          <span>If you miss <strong>2 classes</strong></span>
                          <span className="font-extrabold text-red-500">{activeSubject.predictions.miss2}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl bg-card border border-border">
                          <span>If you miss <strong>3 classes</strong></span>
                          <span className="font-extrabold text-red-500">{activeSubject.predictions.miss3}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Scenarios */}
                    <div className="space-y-2 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                      <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" /> Attendance Scenarios
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 rounded-xl bg-card border border-border">
                          <span>If you attend <strong>1 class</strong></span>
                          <span className="font-extrabold text-emerald-500">{activeSubject.predictions.attend1}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl bg-card border border-border">
                          <span>If you attend <strong>3 classes</strong></span>
                          <span className="font-extrabold text-emerald-500">{activeSubject.predictions.attend3}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl bg-card border border-border">
                          <span>If you attend <strong>5 classes</strong></span>
                          <span className="font-extrabold text-emerald-500">{activeSubject.predictions.attend5}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trend Graph Visualizer */}
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                    <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
                      Recent Attendance Trend Curve
                    </p>
                    <div className="flex items-end justify-between h-28 gap-2 pt-2 border-b border-border px-2">
                      {activeSubject.trend.map((pt, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[10px] font-extrabold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            {pt.percentage}%
                          </span>
                          <div
                            className="w-full max-w-[24px] bg-gradient-to-t from-primary/60 to-primary rounded-t-md transition-all duration-300 group-hover:brightness-125"
                            style={{ height: `${pt.percentage * 0.8}%` }}
                          />
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

        {/* Tab 3: Notification Panel */}
        {activeTab === "notifications" && (
          <div className="p-6 space-y-6 flex-1 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                  Attendance Notification & Alert History
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Threshold reminders triggered automatically when attendance crosses 85% or 75%.
                </p>
              </div>

              {unreadNotifications.length > 0 && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {unreadNotifications.length} Unread Warning(s)
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-foreground">No Attendance Alerts</p>
                <p className="text-xs text-muted-foreground">All your subjects are comfortably above the university limits!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      !notif.isRead
                        ? "bg-card border-amber-500/40 shadow-xs"
                        : "bg-muted/20 border-border opacity-80"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.level === "critical"
                          ? "bg-red-500/10 text-red-500"
                          : notif.level === "warning"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {notif.level === "critical" ? (
                          <ShieldAlert className="h-5 w-5" />
                        ) : notif.level === "warning" ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <ShieldCheck className="h-5 w-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                            {notif.subjectName}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {new Date(notif.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!notif.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-primary font-bold hover:bg-primary/10"
                          onClick={() => markReadMutation.mutate(notif.id)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => deleteNotifMutation.mutate(notif.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Faculty Ledger Mark Attendance */}
        {activeTab === "faculty" && (
          <div className="p-6 space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                  Class Attendance Ledger
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recent class execution logs and manual ledger sign-offs.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">Recent Attendance Logs</span>
                <span className="text-xs font-bold text-muted-foreground">{recentLogs.length} Records Logged</span>
              </div>

              {recentLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No manual ledger records logged yet. Mark attendance on subject cards to add entries!
                </div>
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

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        log.status === "present"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </ChatLayout>
  );
}
