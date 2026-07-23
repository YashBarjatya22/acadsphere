import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { getAnalyticsSummary, updateProfile } from "@/lib/analytics.functions";
import { getAttendanceDashboardData } from "@/lib/attendance.functions";
import { createThread } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  BookOpen,
  Target,
  Calendar as CalendarIcon,
  Compass,
  FileCheck2,
  LineChart,
  ArrowRight,
  Sparkles,
  Flame,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  Code,
  Volume2,
  Check,
  Send,
  Mic,
  Plus,
  Clock,
  Briefcase,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from "recharts";

export const Route = createFileRoute("/_authenticated/app/")({
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("demo_user_role");
      if (role === "admin") {
        throw redirect({ to: "/admin" });
      }
    }
  },
  component: AppIndex,
});

function AppIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Server functions
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const getAttendanceFn = useServerFn(getAttendanceDashboardData);
  const updateProfileFn = useServerFn(updateProfile);
  const createThreadFn = useServerFn(createThread);

  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getSummaryFn(),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendanceDashboardData"],
    queryFn: () => getAttendanceFn(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    degree: "",
    semester: "",
    targetRole: "",
    skills: "",
  });

  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I can help you analyze concept gaps, practice vivas, or customize your career roadmap. What's on your mind today?" }
  ]);

  const startEdit = () => {
    if (analytics?.profile) {
      setProfileForm({
        fullName: analytics.profile.fullName,
        degree: analytics.profile.degree,
        semester: analytics.profile.semester,
        targetRole: analytics.profile.targetRole,
        skills: Array.isArray(analytics.profile.skills) ? analytics.profile.skills.join(", ") : "",
      });
      setIsEditing(true);
    }
  };

  const saveProfile = useMutation({
    mutationFn: (data: typeof profileForm) => updateProfileFn({ data }),
    onSuccess: () => {
      toast.success("Academic profile updated!");
      setIsEditing(false);
      refetch();
      qc.invalidateQueries({ queryKey: ["analyticsSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    }
  });

  const launchChat = useMutation({
    mutationFn: () => createThreadFn({ data: {} }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/app/$threadId", params: { threadId: t.id } });
    },
  });

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setAiInput("");

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: "ai", text: `I've noted your question: "${userMsg}". Start a full AI Mentoring thread to get deep explanations and customized syllabus analysis!` }
      ]);
    }, 1000);
  };

  if (isLoading) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading AcadSphere Workspace...</span>
          </div>
        </div>
      </ChatLayout>
    );
  }

  if (error || !analytics) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-background px-4">
          <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
            <h2 className="text-lg font-bold text-foreground">Unable to load workspace</h2>
            <p className="mt-3 text-xs text-muted-foreground">
              {error?.message || "Please check your network connection and credentials and retry."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => refetch()} className="bg-primary hover:bg-blue-700 text-white text-xs px-4">
                Retry
              </Button>
              <Button
                onClick={async () => {
                  localStorage.removeItem("demo_session_token");
                  localStorage.removeItem("demo_user_id");
                  localStorage.removeItem("demo_user_email");
                  try { await supabase.auth.signOut(); } catch (_) {}
                  navigate({ to: "/auth", replace: true });
                }}
                variant="outline"
                className="text-xs px-4"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </ChatLayout>
    );
  }

  const profile = analytics.profile;
  const stats = analytics.stats;
  const readiness = stats?.placementReadiness || 78;
  const successScore = Math.round((readiness * 0.6 + (analytics?.roadmap.percentage || 67) * 0.2 + (stats?.studyHoursThisWeek || 12.2) * 1.5) / 2);

  // Mock study hours trend
  const studyHoursData = [
    { name: "Mon", hours: 2.5 },
    { name: "Tue", hours: 3.8 },
    { name: "Wed", hours: 1.5 },
    { name: "Thu", hours: 4.2 },
    { name: "Fri", hours: 2.0 },
    { name: "Sat", hours: 5.5 },
    { name: "Sun", hours: 3.0 }
  ];

  // Mock attendance trend
  const attendanceTrendData = [
    { month: "Jan", attendance: 88 },
    { month: "Feb", attendance: 90 },
    { month: "Mar", attendance: 86 },
    { month: "Apr", attendance: 92 },
    { month: "May", attendance: 94 },
    { month: "Jun", attendance: 93 }
  ];

  // Subject Performance Data
  const subjectPerformanceData = [
    { subject: "DBMS", score: 85 },
    { subject: "OS", score: 68 },
    { subject: "Networks", score: 78 },
    { subject: "DSA", score: 92 },
    { subject: "OOP", score: 80 }
  ];

  // AI Usage category distribution
  const aiUsageData = [
    { name: "Viva Prep", value: 35 },
    { name: "Code Debug", value: 45 },
    { name: "Notes Summary", value: 20 }
  ];
  const COLORS = ["#2563EB", "#14B8A6", "#F59E0B"];

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full overflow-y-auto bg-background text-foreground p-6 md:p-8">
        
        {/* Main Grid: Left Workspace (8/12) & Right AI Panel/Calendar (4/12) */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Welcome Section */}
            <div className="rounded-2xl border border-border bg-card p-7">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-sans font-extrabold text-foreground" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.03em" }}>
                      Welcome back, {profile?.fullName || "Student"}
                    </h1>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground">
                      <Flame className="inline h-3 w-3 mr-1" />{stats?.currentStreak || 12} Day Streak
                    </span>
                  </div>
                  <p className="font-sans text-[13px] text-muted-foreground italic leading-relaxed">
                    "The beautiful thing about learning is that no one can take it away from you." — B.B. King
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Today:</span>
                    <span className="font-sans text-[12px] text-foreground">10:00 AM Distributed Systems · 02:00 PM Mock Viva</span>
                  </div>
                </div>

                {/* Success ring — monochrome */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="relative h-16 w-16">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" stroke="var(--color-border)" fill="transparent" strokeWidth="4" />
                      <circle
                        cx="32" cy="32" r="26"
                        stroke="var(--color-foreground)" fill="transparent" strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - successScore / 100)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-sans font-bold text-sm text-foreground">
                      {successScore}%
                    </div>
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-[13px] text-foreground">Success Index</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground mt-0.5">Placement & prep</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Health & Statistics Cards Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Requirement 6: Attendance Health Compact Widget */}
              <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between md:col-span-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] font-extrabold text-foreground">
                      Attendance Health
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    (attendanceData?.overall?.percentage ?? 83) >= 85
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : (attendanceData?.overall?.percentage ?? 83) >= 75
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  }`}>
                    Overall {attendanceData?.overall?.percentage ?? 83}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 bg-muted/20 p-2.5 rounded-xl border border-border/60 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[9px] uppercase font-bold">Subjects at Risk</p>
                    <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                      {attendanceData?.overall?.subjectsAtRiskCount ?? 2}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[9px] uppercase font-bold">Critical Subjects</p>
                    <p className="text-sm font-extrabold text-red-600 dark:text-red-400 mt-0.5">
                      {attendanceData?.overall?.criticalSubjectsCount ?? 1}
                    </p>
                  </div>
                </div>

                <Link
                  to="/app/attendance"
                  className="flex items-center justify-between text-xs font-bold text-primary hover:underline group pt-1 border-t border-border/40"
                >
                  <span>View Details & Reminders</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Statistics Grid */}
              <div className="md:col-span-2 grid gap-px grid-cols-2 sm:grid-cols-3 border border-border rounded-2xl overflow-hidden bg-border">
                {[
                  { label: "Upcoming CIAs",   value: "3 exams", sub: "Starting in 6 days", icon: AlertTriangle },
                  { label: "Assignments",     value: "2 tasks", sub: "Due before Monday",  icon: CalendarIcon },
                  { label: "Notes Created",   value: "14",      sub: "4 added recently",   icon: BookOpen },
                  { label: "AI Queries",      value: "38/100",  sub: "Resets in 12 days",  icon: Sparkles },
                  { label: "Weekly Study",    value: "12.2h",   sub: "Goal: 15 hours",     icon: Clock },
                  { label: "Lab Projects",    value: "5/5",     sub: "Manuals verified",   icon: Code },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} className="bg-card p-4 hover:bg-accent transition-colors duration-[120ms]">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{card.label}</p>
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </div>
                      <p className="font-sans font-bold text-lg text-foreground" style={{ letterSpacing: "-0.03em" }}>{card.value}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground mt-1">{card.sub}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-5">Quick Actions</p>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                {[
                  { label: "Ask AI",     icon: Sparkles,   action: () => createThreadFn().then(t => navigate({ to: "/app/$threadId", params: { threadId: t.id } })) },
                  { label: "Smart Notes", icon: BookOpen,   action: () => navigate({ to: "/app/notes" }) },
                  { label: "Resume",     icon: FileCheck2, action: () => navigate({ to: "/app/resume-analyzer" }) },
                  { label: "Lab Helper", icon: Code,       action: () => navigate({ to: "/app/lab-buddy" }) },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={idx}
                      onClick={act.action}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-background hover:bg-accent text-foreground px-4 py-3 transition-colors duration-[120ms] group text-left"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Study Analytics Charts Section */}
            <div className="rounded-2xl border border-border bg-card p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1">Analytics</p>
                  <h3 className="font-sans font-semibold text-foreground">Study & Prep Overview</h3>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* 1. Weekly Study Hours Area Chart */}
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Weekly Study Hours</p>
                  <div className="h-44 rounded-xl border border-border p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studyHoursData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-foreground)" stopOpacity={0.08}/>
                            <stop offset="95%" stopColor="var(--color-foreground)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} fontFamily="Space Mono" />
                        <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} fontFamily="Space Mono" />
                        <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", boxShadow: "none", fontFamily: "Space Mono", fontSize: 10 }} />
                        <Area type="monotone" dataKey="hours" stroke="var(--color-foreground)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorHours)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Attendance Trend Bar Chart */}
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Attendance Rate (%)</p>
                  <div className="h-44 rounded-xl border border-border p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} fontFamily="Space Mono" />
                        <YAxis domain={[70, 100]} stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} fontFamily="Space Mono" />
                        <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", boxShadow: "none", fontFamily: "Space Mono", fontSize: 10 }} />
                        <Bar dataKey="attendance" fill="var(--color-foreground)" radius={[3, 3, 0, 0]} barSize={14} opacity={0.85} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Subject Performance Bar Chart */}
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Subject Readiness Scores</p>
                  <div className="h-44 rounded-xl border border-border p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectPerformanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                        <XAxis type="number" domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} fontFamily="Space Mono" />
                        <YAxis dataKey="subject" type="category" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} fontFamily="Space Mono" />
                        <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", boxShadow: "none", fontFamily: "Space Mono", fontSize: 10 }} />
                        <Bar dataKey="score" fill="var(--color-foreground)" radius={[0, 3, 3, 0]} barSize={10} opacity={0.85} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. AI Usage Distribution Pie Chart */}
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">AI Query Distribution</p>
                  <div className="h-44 rounded-xl border border-border p-2 flex items-center gap-4">
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie
                          data={aiUsageData}
                          cx="50%" cy="50%"
                          innerRadius={40} outerRadius={58}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {aiUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", boxShadow: "none", fontFamily: "Space Mono", fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 shrink-0">
                      {aiUsageData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{item.name}</span>
                          <span className="font-mono text-[10px] text-foreground">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="rounded-2xl border border-border bg-card p-7 space-y-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Recent Activity</p>
              
              <div className="space-y-0 divide-y divide-border">
                {[
                  { title: "Smart Note Uploaded",     desc: "Added lecture slides for 'Query Processing & Optimization' in DBMS.", time: "2h ago",   icon: BookOpen },
                  { title: "AI Practice Interview",   desc: "Simulated viva round on 'TCP/IP Model' — 82% rating.",                  time: "1d ago",   icon: Volume2 },
                  { title: "Syllabus Goal Finished",  desc: "Completed 'Subnetting & Routing Algorithms' in study timeline.",        time: "2d ago",   icon: CheckCircle2 },
                  { title: "Lab Workspace Compiled",  desc: "Walkthrough generated for Lab Exercise 3: 'Socket Programming'.",        time: "3d ago",   icon: Code },
                  { title: "Resume ATS Score Audited",desc: "ATS rating improved to 92% — 3 missing competency terms resolved.",     time: "5d ago",   icon: FileCheck2 },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-sans font-medium text-[13px] text-foreground truncate">{act.title}</p>
                          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground shrink-0">{act.time}</span>
                        </div>
                        <p className="font-sans text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{act.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: AI Assistant Panel & Calendar Widget */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Assistant Floating Panel */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-[400px]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg border border-border bg-background flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-[13px] text-foreground">AI Copilot</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-foreground rounded-full" /> Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[88%] rounded-xl px-3.5 py-2.5 text-[12px] font-sans leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-foreground text-background ml-auto"
                        : "bg-card border border-border text-foreground mr-auto"
                    }`}
                  >
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>

              {/* Quick prompts */}
              <div className="px-4 py-2.5 border-t border-border bg-card flex flex-wrap gap-1.5">
                {["Dynamic scoping", "ATS tips", "Study alerts"].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAiInput(prompt)}
                    className="font-mono text-[10px] uppercase tracking-[0.06em] px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-[120ms]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSendAiMessage} className="p-3 border-t border-border bg-card flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="h-9 text-[12px]"
                />
                <Button type="button" size="icon" variant="outline" className="h-9 w-9 shrink-0">
                  <Mic className="h-3.5 w-3.5" />
                </Button>
                <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>

            {/* Calendar Widget */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Deadlines Calendar</p>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">July 2026</span>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
                  <span key={d} className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground py-1">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                <span className="p-1.5 font-mono text-[11px] text-muted-foreground/30">29</span>
                <span className="p-1.5 font-mono text-[11px] text-muted-foreground/30">30</span>
                {[1,2,3,4,5,6,7,8].map(d => (
                  <span key={d} className="p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer transition-colors duration-[120ms]">{d}</span>
                ))}
                <span className="p-1.5 font-mono text-[11px] font-bold bg-foreground text-background rounded-md cursor-pointer">9</span>
                {[10,11,12].map(d => (
                  <span key={d} className="p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer transition-colors duration-[120ms]">{d}</span>
                ))}
                <span className="p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer relative transition-colors duration-[120ms]">
                  13
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-foreground rounded-full" />
                </span>
                <span className="p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer transition-colors duration-[120ms]">14</span>
                <span className="p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer relative transition-colors duration-[120ms]">
                  15
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-muted-foreground rounded-full" />
                </span>
                {[16,17,18,19,20,21,22,23,24,25,26].map(d => (
                  <span key={d} className="p-1.5 font-mono text-[11px] text-foreground hover:bg-accent rounded-md cursor-pointer transition-colors duration-[120ms]">{d}</span>
                ))}
              </div>

              {/* Deadlines list */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-foreground">July 13</span>
                  <span className="font-sans text-[12px] text-muted-foreground truncate">CIA-1 DBMS prep deadline</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-foreground">July 15</span>
                  <span className="font-sans text-[12px] text-muted-foreground truncate">Resume revision submission</span>
                </div>
              </div>
            </div>

            {/* Profile configuration toggle card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5" /> Academic Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                {!isEditing ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <span className="text-muted-foreground font-semibold">Full Name</span>
                      <span className="font-bold">{profile?.fullName || "Not set"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <span className="text-muted-foreground font-semibold">Degree / Major</span>
                      <span className="font-bold">{profile?.degree || "Not set"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <span className="text-muted-foreground font-semibold">Semester</span>
                      <span className="font-bold">{profile?.semester || "Not set"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <span className="text-muted-foreground font-semibold">Target Career Role</span>
                      <span className="font-bold">{profile?.targetRole || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold block mb-1">Acquired Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {profile?.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill: string) => (
                            <span key={skill} className="text-[9px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">No skills listed</span>
                        )}
                      </div>
                    </div>
                    <Button onClick={startEdit} variant="outline" className="w-full h-8 text-[11px] font-bold mt-3 border-border">
                      Edit Profile Parameters
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveProfile.mutate(profileForm);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="h-8 text-xs bg-muted/40 border-border mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="degree" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Degree & Major</Label>
                      <Input
                        id="degree"
                        value={profileForm.degree}
                        onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                        className="h-8 text-xs bg-muted/40 border-border mt-1"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="semester" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Semester</Label>
                        <Input
                          id="semester"
                          value={profileForm.semester}
                          onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                          className="h-8 text-xs bg-muted/40 border-border mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetRole" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Role</Label>
                        <Input
                          id="targetRole"
                          value={profileForm.targetRole}
                          onChange={(e) => setProfileForm({ ...profileForm, targetRole: e.target.value })}
                          className="h-8 text-xs bg-muted/40 border-border mt-1"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="skills" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Skills (Comma-separated)</Label>
                      <Input
                        id="skills"
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                        className="h-8 text-xs bg-muted/40 border-border mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button type="submit" disabled={saveProfile.isPending} className="flex-1 h-8 text-[11px] bg-primary hover:bg-blue-700 text-white font-bold">
                        {saveProfile.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="flex-1 h-8 text-[11px] border-border text-muted-foreground">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </ChatLayout>
  );
}
