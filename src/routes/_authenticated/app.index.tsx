import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { getAnalyticsSummary, updateProfile } from "@/lib/analytics.functions";
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
  component: AppIndex,
});

function AppIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Server functions
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const updateProfileFn = useServerFn(updateProfile);
  const createThreadFn = useServerFn(createThread);

  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getSummaryFn(),
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
      <div className="h-full overflow-y-auto bg-background text-foreground p-6 md:p-8 scrollbar-thin">
        
        {/* Main Grid: Left Workspace (8/12) & Right AI Panel/Calendar (4/12) */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Welcome Section */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    Welcome back, {profile?.fullName || "Student"}!
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                    <Flame className="h-3.5 w-3.5 fill-emerald-500/20" /> {stats?.currentStreak || 12} Day Streak
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  "The beautiful thing about learning is that no one can take it away from you." — B.B. King
                </p>
                <div className="pt-2 text-xs text-foreground flex items-center gap-3">
                  <span className="font-semibold text-primary">Today's Schedule:</span>
                  <span className="text-muted-foreground">10:00 AM Distributed Systems Lecture · 02:00 PM Mock Viva Practicing</span>
                </div>
              </div>

              {/* Circular Progress Ring */}
              <div className="flex items-center gap-3 shrink-0 self-center md:self-auto">
                <div className="relative h-16 w-16">
                  {/* SVG background circle */}
                  <svg className="h-full w-full -rotate-90">
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="26" 
                      className="stroke-muted fill-transparent" 
                      strokeWidth="5" 
                    />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="26" 
                      className="stroke-primary fill-transparent transition-all duration-300" 
                      strokeWidth="5" 
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={2 * Math.PI * 26 * (1 - successScore / 100)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {successScore}%
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Success Index</h4>
                  <p className="text-[10px] text-muted-foreground">Placement & prep rate</p>
                </div>
              </div>
            </div>

            {/* Statistics Cards Grid */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              {[
                { label: "Attendance Rate", value: "93%", sub: "Required: 75%", icon: CheckCircle2, color: "text-emerald-500" },
                { label: "Upcoming CIAs", value: "3 exams", sub: "Starting in 6 days", icon: AlertTriangle, color: "text-amber-500" },
                { label: "Assignments Pending", value: "2 tasks", sub: "Due before Monday", icon: CalendarIcon, color: "text-blue-500" },
                { label: "Notes Created", value: "14 topics", sub: "4 cataloged recently", icon: BookOpen, color: "text-indigo-500" },
                { label: "AI Queries Used", value: "38 / 100", sub: "Resets in 12 days", icon: Sparkles, color: "text-teal-500" },
                { label: "Study Hours Weekly", value: "12.2h", sub: "Goal: 15 hours", icon: Clock, color: "text-purple-500" },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <Card key={idx} className="card-gradient shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                      <div className="text-xl font-bold text-foreground">{card.value}</div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions Panel */}
            <div className="p-5 rounded-2xl card-gradient shadow-sm">
              <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-4">Quick Work Actions</h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {[
                  { label: "Ask AI", icon: Sparkles, action: () => createThreadFn().then(t => navigate({ to: "/app/$threadId", params: { threadId: t.id } })) },
                  { label: "Generate Notes", icon: BookOpen, action: () => navigate({ to: "/app/notes" }) },
                  { label: "Create Resume", icon: FileCheck2, action: () => navigate({ to: "/app/resume-analyzer" }) },
                  { label: "Practice Viva", icon: Volume2, action: () => navigate({ to: "/app/viva-simulator" }) },
                  { label: "Open Planner", icon: CalendarIcon, action: () => navigate({ to: "/study-planner" }) },
                  { label: "Start Session", icon: Code, action: () => navigate({ to: "/app/lab-buddy" }) },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <Button
                      key={idx}
                      onClick={act.action}
                      variant="outline"
                      className="h-14 justify-start border-border text-foreground hover:bg-muted hover:border-primary/30 rounded-xl px-4 flex gap-3 group transition-all"
                    >
                      <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold">{act.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Study Analytics Charts Section */}
            <div className="p-6 rounded-2xl card-gradient shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">Study & Prep Analytics</h3>
                  <p className="text-[10px] text-muted-foreground">Review your weekly momentum and subject statistics</p>
                </div>
                <Button size="sm" variant="ghost" asChild className="text-xs font-semibold">
                  <Link to="/analytics">
                    Full Analytics <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              {/* Charts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* 1. Weekly Study Hours Area Chart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weekly Study Hours</h4>
                  <div className="h-48 border border-border/40 rounded-xl p-2 bg-muted/10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studyHoursData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="hours" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Attendance Trend Bar Chart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance Rate Trend (%)</h4>
                  <div className="h-48 border border-border/40 rounded-xl p-2 bg-muted/10">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis domain={[70, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="attendance" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Subject Performance Radar/Bar Chart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject Readiness Scores</h4>
                  <div className="h-48 border border-border/40 rounded-xl p-2 bg-muted/10">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectPerformanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                        <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis dataKey="subject" type="category" stroke="#64748B" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. AI Usage Distribution Pie Chart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Queries Distribution</h4>
                  <div className="h-48 border border-border/40 rounded-xl p-2 bg-muted/10 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={aiUsageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {aiUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 pr-4 shrink-0 text-left">
                      {aiUsageData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                          <span>{item.name} ({item.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="p-6 rounded-2xl card-gradient shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Recent Activity Feed</h3>
              
              <div className="relative pl-6 border-l border-border/60 space-y-5">
                {[
                  { title: "Smart Note Uploaded", desc: "Added lecture slides for 'Query Processing & Optimization' in DBMS.", time: "2 hours ago", icon: BookOpen, bg: "bg-blue-500/10 text-blue-500" },
                  { title: "AI Practice Interview", desc: "Simulated viva round completed on 'TCP/IP Model' with an 82% rating.", time: "1 day ago", icon: Volume2, bg: "bg-teal-500/10 text-teal-500" },
                  { title: "Syllabus Goal Finished", desc: "Completed 'Subnetting & Routing Algorithms' milestone in study timeline.", time: "2 days ago", icon: CheckCircle2, bg: "bg-emerald-500/10 text-emerald-500" },
                  { title: "Lab Workspace Compiled", desc: "Walkthrough generated for Lab Manual Exercise 3: 'Socket Programming'.", time: "3 days ago", icon: Code, bg: "bg-purple-500/10 text-purple-500" },
                  { title: "Resume ATS Score Audited", desc: "ATS rating improved to 92% after resolving 3 missing competency terms.", time: "5 days ago", icon: FileCheck2, bg: "bg-indigo-500/10 text-indigo-500" },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={idx} className="relative">
                      {/* Circle indicator */}
                      <span className={`absolute -left-9 top-1 grid h-6.5 w-6.5 place-items-center rounded-full border border-card ${act.bg} shadow-sm`}>
                        <Icon className="h-3 w-3" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{act.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{act.desc}</p>
                        <span className="text-[9px] text-muted-foreground/60 block mt-1">{act.time}</span>
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
            <div className="rounded-2xl card-gradient shadow-sm overflow-hidden flex flex-col h-[400px]">
              {/* Header */}
              <div className="bg-primary/5 px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">AcadSphere AI Copilot</h3>
                    <p className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active Mentor
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-muted/10">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-primary text-white ml-auto rounded-tr-none" 
                        : "bg-muted border border-border text-foreground mr-auto rounded-tl-none"
                    }`}
                  >
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>

              {/* Quick Prompts / Suggested Questions */}
              <div className="px-4 py-2 border-t border-border bg-muted/20 flex flex-wrap gap-1.5">
                {[
                  "Explain dynamic scoping",
                  "ATS improvements",
                  "Create study alerts"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiInput(prompt);
                    }}
                    className="text-[9px] bg-card border border-border hover:border-primary text-muted-foreground hover:text-primary px-2 py-0.5 rounded transition-all font-semibold"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAiMessage} className="p-3 border-t border-border bg-card flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="h-8.5 text-xs bg-muted/40 border-border focus:ring-1 focus:ring-primary rounded-lg"
                />
                <Button type="button" size="icon" variant="ghost" className="h-8.5 w-8.5 rounded-lg border border-border shrink-0 hover:bg-muted text-muted-foreground">
                  <Mic className="h-3.5 w-3.5" />
                </Button>
                <Button type="submit" size="icon" className="h-8.5 w-8.5 rounded-lg bg-primary hover:bg-blue-700 text-white shrink-0 shadow-sm">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>

            {/* Calendar Widget */}
            <div className="rounded-2xl card-gradient p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Deadlines Calendar</h3>
                <span className="text-[10px] text-muted-foreground font-semibold">July 2026</span>
              </div>

              {/* Monthly grid simulation */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Pad first week days */}
                <span className="p-1 text-muted-foreground/30">29</span>
                <span className="p-1 text-muted-foreground/30">30</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">1</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">2</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">3</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">4</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">5</span>
                
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">6</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">7</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">8</span>
                <span className="p-1 font-medium bg-primary text-white rounded cursor-pointer relative" title="Today">9</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">10</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">11</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">12</span>

                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer relative">
                  13
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-amber-500 rounded-full" />
                </span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">14</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer relative">
                  15
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-blue-500 rounded-full" />
                </span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">16</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">17</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">18</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">19</span>

                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">20</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">21</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">22</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">23</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">24</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">25</span>
                <span className="p-1 font-medium hover:bg-muted rounded cursor-pointer">26</span>
              </div>

              {/* Deadlines list */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold">July 13:</span>
                  <span className="text-muted-foreground truncate">CIA-1 DBMS Exam prep deadline</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-semibold">July 15:</span>
                  <span className="text-muted-foreground truncate">Resume revision submission</span>
                </div>
              </div>
            </div>

            {/* Profile configuration toggle card */}
            <Card className="card-gradient shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" /> Academic Profile Context
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-5">
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
