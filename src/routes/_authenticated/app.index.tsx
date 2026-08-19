import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { getAnalyticsSummary, updateProfile } from "@/lib/analytics.functions";
import { getAttendanceDashboardData } from "@/lib/attendance.functions";
import { createThread } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import gsap from "gsap";
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
  AlertCircle,
  Activity,
  Layers,
  Zap,
  TrendingUp,
  FileText
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
  const dashboardRef = useRef<HTMLDivElement>(null);
  const successNumberRef = useRef<HTMLSpanElement>(null);
  const attendanceNumberRef = useRef<HTMLSpanElement>(null);

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

  const [sessionUser, setSessionUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
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
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I can help you analyze concept gaps, practice vivas, or customize your career roadmap. What's on your mind today?" }
  ]);

  const profile = analytics?.profile;
  const stats = analytics?.stats;
  const readiness = stats?.placementReadiness || 78;
  const successScore = Math.round((readiness * 0.6 + (analytics?.roadmap.percentage || 67) * 0.2 + (stats?.studyHoursThisWeek || 12.2) * 1.5) / 2);
  const overallAttendance = attendanceData?.overall?.percentage ?? 83;

  // GSAP Staggered reveals & number counting animations
  useEffect(() => {
    if (!isLoading && analytics && dashboardRef.current) {
      // 1. Bento cards entrance stagger
      gsap.fromTo(
        ".bento-card",
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.05,
          ease: "power3.out",
          clearProps: "transform",
        }
      );

      // 2. Success Score counter
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
          },
        });
      }

      // 3. Attendance counter
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
          },
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
        { sender: "ai", text: `I've noted your question: "${userMsg}". Launch an AI Mentoring session for deep syllabus breakdown!` }
      ]);
    }, 800);
  };

  if (isLoading) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-400">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-zinc-900 dark:text-zinc-100" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Initializing Workspace...</span>
          </div>
        </div>
      </ChatLayout>
    );
  }

  if (error || !analytics) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
          <div className="max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-xs">
            <AlertCircle className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Unable to load workspace</h2>
            <p className="mt-2 text-xs text-zinc-500">
              {error?.message || "Please check your network connection and session credentials."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => refetch()} className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs px-4 rounded-xl">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </ChatLayout>
    );
  }

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
  const COLORS = ["#18181b", "#71717a", "#a1a1aa"];

  return (
    <ChatLayout activeThreadId={null}>
      <motion.div
        ref={dashboardRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8"
      >
        {/* Main Bento Box Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-start max-w-7xl mx-auto">
          
          {/* Left Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Bento Card: Welcome & Success Dial Header */}
            <div className="bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 md:p-7 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-semibold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100">
                      Welcome back, {sessionUser?.name || profile?.fullName || "Student"}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      {stats?.currentStreak || 12} Day Streak
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                    "Precision in preparation creates certainty in execution."
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-xs text-zinc-600 dark:text-zinc-300">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Today:</span>
                    <span className="font-medium">10:00 AM Distributed Systems · 02:00 PM Mock Viva</span>
                  </div>
                </div>

                {/* Animated Circular Success Index */}
                <div className="flex items-center gap-4 shrink-0 bg-zinc-50/80 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="relative h-14 w-14">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" fill="transparent" strokeWidth="4" />
                      <circle
                        cx="32" cy="32" r="26"
                        stroke="currentColor"
                        className="text-zinc-900 dark:text-zinc-100"
                        fill="transparent" strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - successScore / 100)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      <span ref={successNumberRef}>{successScore}</span>%
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-zinc-900 dark:text-zinc-100">Success Index</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5">Readiness benchmark</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Bento Grid: Compact Attendance Health & Metric Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              
              {/* Attendance Health Card */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="bento-card bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between md:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">
                      Attendance Health
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <span ref={attendanceNumberRef}>{overallAttendance}</span>%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-xs">
                  <div>
                    <p className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider">At Risk</p>
                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {attendanceData?.overall?.subjectsAtRiskCount ?? 2}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider">Critical</p>
                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {attendanceData?.overall?.criticalSubjectsCount ?? 1}
                    </p>
                  </div>
                </div>

                <Link
                  to="/app/attendance"
                  className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:opacity-80 group pt-2 border-t border-zinc-100 dark:border-zinc-800"
                >
                  <span>Attendance Ledger</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>

              {/* Matrix Stat Grid */}
              <div className="bento-card md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Active Courses",  value: "5 Subjects", sub: "Classroom Synced",   icon: GraduationCap },
                  { label: "Assignments",     value: "2 Pending",  sub: "Due by Friday",     icon: CalendarIcon },
                  { label: "Attendance",      value: `${overallAttendance}%`,  sub: "CUE Synced", icon: CheckCircle2 },
                  { label: "AI Quota",        value: "38 / 100",   sub: "Refreshes in 12d",  icon: Sparkles },
                  { label: "Weekly Study",    value: "12.2 hrs",   sub: "Target: 15.0h",     icon: Clock },
                  { label: "Resume Profiles", value: "3 Versions", sub: "ATS Optimized",     icon: FileCheck2 },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">{card.label}</p>
                        <Icon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      </div>
                      <p className="font-semibold text-base text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">{card.value}</p>
                      <p className="font-mono text-[9px] text-zinc-400 mt-0.5">{card.sub}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 3. Bento Card: Quick Action Studio */}
            <div className="bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-5 shadow-xs">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-3.5">Quick Action Studio</p>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {[
                  { label: "AI Study Assistant", icon: Sparkles,    action: () => createThreadFn().then(t => navigate({ to: "/app/$threadId", params: { threadId: t.id } })) },
                  { label: "Resume Tailorer",   icon: FileCheck2,  action: () => navigate({ to: "/app/resume-builder" }) },
                  { label: "Attendance Portal", icon: CheckCircle2,action: () => navigate({ to: "/app/attendance" }) },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={act.action}
                      className="flex items-center gap-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 p-3 text-left transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                        <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                      </div>
                      <span className="text-xs font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">{act.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 4. Bento Card: Analytics Overview */}
            <div className="bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-6 md:p-7 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">Study Performance</p>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">Academic Analytics Matrix</h3>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Weekly Study Hours */}
                <div className="space-y-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Weekly Study Distribution (Hours)</p>
                  <div className="h-44 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-2.5">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studyHoursData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#71717a" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(113, 113, 122, 0.15)" />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "rgba(24, 24, 27, 0.9)", border: "1px solid #3f3f46", borderRadius: "10px", color: "#fff", fontSize: 11 }} />
                        <Area type="monotone" dataKey="hours" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Attendance Rate Trend */}
                <div className="space-y-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Monthly Attendance Rate (%)</p>
                  <div className="h-44 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-2.5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(113, 113, 122, 0.15)" />
                        <XAxis dataKey="month" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis domain={[70, 100]} stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "rgba(24, 24, 27, 0.9)", border: "1px solid #3f3f46", borderRadius: "10px", color: "#fff", fontSize: 11 }} />
                        <Bar dataKey="attendance" fill="#27272a" radius={[4, 4, 0, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Bento Card: Recent Activity Timeline */}
            <div className="bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-6 md:p-7 space-y-4 shadow-xs">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Recent Activity Log</p>
              
              <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                {[
                  { title: "Smart Note Uploaded",     desc: "Lecture notes processed for Query Optimization in DBMS.", time: "2h ago",   icon: BookOpen },
                  { title: "AI Practice Viva",        desc: "Simulated viva round completed on TCP/IP Model.",       time: "1d ago",   icon: Volume2 },
                  { title: "Syllabus Milestone Done", desc: "Completed Subnetting & Routing Algorithms module.",      time: "2d ago",   icon: CheckCircle2 },
                  { title: "Lab Workspace Compiled",  desc: "Walkthrough generated for Socket Programming Lab.",      time: "3d ago",   icon: Code },
                  { title: "Resume Audited",          desc: "ATS rating updated with verified project bullets.",      time: "5d ago",   icon: FileCheck2 },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                        <Icon className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{act.title}</p>
                          <span className="font-mono text-[10px] text-zinc-400 shrink-0">{act.time}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{act.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Assistant Copilot Panel */}
            <div className="bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 overflow-hidden flex flex-col h-[420px] shadow-xs">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AI Study Copilot</h3>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ready
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 ml-auto rounded-tr-sm"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 mr-auto rounded-tl-sm shadow-xs"
                    }`}
                  >
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAiMessage} className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Ask any syllabus question..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="submit"
                  className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                </motion.button>
              </form>
            </div>

            {/* Academic Deadlines Calendar */}
            <div className="bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Course Deadlines</p>
                <span className="font-mono text-[10px] text-zinc-500 font-medium">Active Semester</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { date: "Aug 24", title: "DBMS Project Phase 1", tag: "Major Milestone", urgent: true },
                  { date: "Aug 28", title: "OS Lab Viva Prep", tag: "Assessment", urgent: false },
                  { date: "Sep 02", title: "Resume ATS Review", tag: "Career Placement", urgent: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/40">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                      <p className="font-mono text-[9px] text-zinc-400">{item.tag}</p>
                    </div>
                    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Parameters Card */}
            <div className="bento-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Academic Profile</p>
                <button onClick={startEdit} className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100">
                  {isEditing ? "Editing" : "Edit"}
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">Name</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{profile?.fullName || "Student"}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">Degree</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{profile?.degree || "MSc Data Science"}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">Target Role</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{profile?.targetRole || "Software Engineer"}</span>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveProfile.mutate(profileForm);
                  }}
                  className="space-y-2.5 pt-1"
                >
                  <input
                    placeholder="Full Name"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                  <input
                    placeholder="Degree / Major"
                    value={profileForm.degree}
                    onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saveProfile.isPending} className="flex-1 h-7 text-xs bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-xl">
                      Save
                    </Button>
                    <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="flex-1 h-7 text-xs rounded-xl">
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>
      </motion.div>
    </ChatLayout>
  );
}
export default AppIndex;
