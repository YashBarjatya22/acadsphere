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
  Calendar,
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
  Brain
} from "lucide-react";
import { triggerCopilot } from "@/hooks/useCopilot";

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

  // Start edit and copy values
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
      toast.success("Profile updated successfully!");
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

  if (isLoading) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-slate-50 text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading StudentOS Workspace...</span>
          </div>
        </div>
      </ChatLayout>
    );
  }

  if (error || !analytics) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Unable to load your StudentOS workspace</h2>
            <p className="mt-3 text-sm text-slate-500">
              {error?.message || "We couldn't fetch your dashboard data. Please try again or sign out to refresh your session."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => refetch()} className="min-w-[120px]">
                Retry
              </Button>
              <Button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/auth", replace: true });
                }}
                variant="outline"
                className="min-w-[120px]"
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
  const readiness = stats?.placementReadiness || 0;

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full overflow-y-auto bg-[#F8FAFC] text-slate-900 p-6 md:p-8 scrollbar-thin">
        {/* Flagship Academic Copilot Hero Section */}
        <div className="mb-8 rounded-3xl border border-primary/20 bg-card p-6 md:p-8 shadow-md relative overflow-hidden bg-gradient-to-br from-card via-[#1E3A8A]/10 to-card">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" /> AI Academic Copilot Active
            </span>
            
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Good Morning, {profile?.fullName?.split(" ")[0] || "Yash"}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1 mb-6 font-display">
              What would you like to achieve today?
            </p>

            {/* Hero AI Input Box */}
            <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-background/80 p-2 shadow-inner focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/45 transition-all">
              <Brain className="h-5 w-5 text-primary ml-2 shrink-0 animate-pulse" />
              <input
                type="text"
                placeholder="Ask Copilot anything... (e.g., prepare for DBMS lab, Java study plan, OS help)"
                className="flex-1 bg-transparent py-2 px-2 text-sm text-foreground placeholder-muted-foreground outline-none border-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    triggerCopilot(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const inputEl = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (inputEl.value.trim()) {
                    triggerCopilot(inputEl.value);
                    inputEl.value = "";
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm"
              >
                <span>Ask Copilot</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Prompt Examples / Chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Help me prepare for tomorrow's DBMS lab",
                "Create a study plan for my Java CIA",
                "Explain recursion like a beginner",
                "I only have one hour. Make the best study plan.",
                "Revise OS in 20 minutes",
                "Test me before my viva",
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerCopilot(p)}
                  className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-card transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Success score banner */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Student Success Score</p>
              <h2 className="text-4xl font-extrabold text-[#1E3A8A]">{analytics?.studentSuccessScore || Math.round((readiness * 0.6 + (analytics?.roadmap.percentage || 67) * 0.2 + (stats?.studyHoursThisWeek || 12.2) * 1.5) / 2)}%</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                This score pulls together placement readiness, roadmap progress, exam preparedness, and study momentum to keep your academic journey visible.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-600 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-[12px] uppercase tracking-[0.25em] text-slate-400">Profile</div>
                <div className="text-xl font-bold text-slate-800">{profile?.degree ? "Configured" : "Set up"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-[12px] uppercase tracking-[0.25em] text-slate-400">Roadmap</div>
                <div className="text-xl font-bold text-slate-800">{analytics?.roadmap.percentage || 67}%</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-[12px] uppercase tracking-[0.25em] text-slate-400">Momentum</div>
                <div className="text-xl font-bold text-slate-800">{stats?.studyHoursThisWeek || 12.2}h</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Intelligence</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-slate-900">Recommended next moves</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Knowledge focus</p>
                  <p className="mt-2 text-sm text-slate-700">{analytics?.subjectPerformance?.[1]?.name ?? "Operating Systems"} is the next high-impact revision area.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Placement signal</p>
                  <p className="mt-2 text-sm text-slate-700">Boost your resume strength by adding outcome-based achievements and 1 extra project story.</p>
                </div>
              </div>
              <div className="space-y-3">
                {(analytics?.insights ?? []).slice(0, 3).map((insight: string, index: number) => (
                  <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white shadow-sm">
            <CardHeader className="pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Journey pulse</span>
              <h2 className="mt-2 font-display text-xl font-semibold">Knowledge profile</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-300">Strong subject</p>
                <p className="mt-2 text-lg font-semibold text-white">{analytics?.subjectPerformance?.[0]?.name ?? "DBMS"}</p>
                <p className="text-sm text-slate-300 mt-1">Readiness {analytics?.subjectPerformance?.[0]?.readiness ?? 82}%</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-300">Weak subject</p>
                <p className="mt-2 text-lg font-semibold text-white">{analytics?.subjectPerformance?.[1]?.name ?? "Operating Systems"}</p>
                <p className="text-sm text-slate-300 mt-1">Readiness {analytics?.subjectPerformance?.[1]?.readiness ?? 65}%</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-300">Forecast</p>
                <p className="mt-2 text-lg font-semibold text-white">{analytics?.predictions?.placementReadiness30Days ?? 82}% in 30 days</p>
                <p className="text-sm text-slate-300 mt-1">{analytics?.predictions?.skillGrowthForecast ?? "+4 skills expected next quarter"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overview cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Score</span>
              <GraduationCap className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1E3A8A]">{readiness}%</div>
              <p className="text-xs text-slate-500 mt-1">
                {readiness >= 80 ? "Excellent readiness" : readiness >= 65 ? "Moderate readiness" : "Needs immediate skill gains"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Streak</span>
              <Flame className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats?.currentStreak || 12} Days</div>
              <p className="text-xs text-slate-500 mt-1">
                Longest streak: {stats?.longestStreak || 30} Days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Roadmap Progress</span>
              <Compass className="h-5 w-5 text-[#2563EB]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{analytics?.roadmap.percentage || 67}%</div>
              <p className="text-xs text-slate-500 mt-1">
                {analytics?.roadmap.completed}/{analytics?.roadmap.total} Completed Milestones
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Hours</span>
              <Calendar className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats?.studyHoursThisWeek || 12.2} hrs</div>
              <p className="text-xs text-slate-500 mt-1">
                Logged this week in academic sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Work & Profile Layout */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left / Middle: StudentOS Workflow Checklists */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-[#2563EB]" /> StudentOS Success Loop
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                A simple loop that keeps improving you. Let StudentOS turn notes, goals, and tasks into concrete moves.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Step 1 */}
                <div className="relative flex flex-col justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-100 hover:bg-slate-50/50 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">01 / Profile</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Set Your Profile</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Degree: <strong className="text-slate-700">{profile?.degree}</strong> · Role: <strong className="text-slate-700">{profile?.targetRole}</strong>. Configure these parameters to custom-tailor the AI insights.
                    </p>
                  </div>
                  <Button
                    onClick={startEdit}
                    variant="link"
                    className="p-0 text-xs font-semibold justify-start text-[#2563EB] hover:text-[#1E3A8A] mt-4"
                  >
                    Edit Profile Details <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-100 hover:bg-slate-50/50 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">02 / Action</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Ask for Help</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Upload papers, scan notes for content gaps, or request a complex technical topic explained in plain English.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs border-slate-200 hover:bg-slate-100 bg-white">
                      <Link to="/study-planner">Study Planner</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs border-slate-200 hover:bg-slate-100 bg-white">
                      <Link to="/paper-simplifier">Paper Simplifier</Link>
                    </Button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-100 hover:bg-slate-50/50 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">03 / Gaps</span>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Review Your Gaps</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Scan missing concepts, examine exam risks, and get prioritized list of weak topics to revise before test day.
                    </p>
                  </div>
                  <Button asChild variant="link" className="p-0 text-xs font-semibold justify-start text-[#2563EB] hover:text-[#1E3A8A] mt-4">
                    <Link to="/notes-gap-analyzer">
                      Open Gap Analyzer <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>

                {/* Step 4 */}
                <div className="relative flex flex-col justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-100 hover:bg-slate-50/50 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">04 / Loop</span>
                      <LineChart className="h-4 w-4 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Keep Momentum</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Every study task checked and resume score audited recalculates your placement probability dynamically.
                    </p>
                  </div>
                  <Button asChild variant="link" className="p-0 text-xs font-semibold justify-start text-[#2563EB] hover:text-[#1E3A8A] mt-4">
                    <Link to="/analytics">
                      Open Command Dashboard <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick links to active modules */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4">Launch Active Modules</h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <Link
                  to="/app/career-roadmap"
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-2 rounded bg-indigo-50 text-indigo-600">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Career Roadmap</div>
                    <div className="text-[10px] text-slate-400">Monthly Guide</div>
                  </div>
                </Link>

                <Link
                  to="/study-planner"
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-2 rounded bg-emerald-50 text-emerald-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Study Planner</div>
                    <div className="text-[10px] text-slate-400">Spaced Timetable</div>
                  </div>
                </Link>

                <Link
                  to="/paper-simplifier"
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-2 rounded bg-amber-50 text-amber-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Paper Simplifier</div>
                    <div className="text-[10px] text-slate-400">AI Viva Prep</div>
                  </div>
                </Link>

                <Link
                  to="/app/resume-analyzer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-2 rounded bg-blue-50 text-blue-600">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Resume Analyzer</div>
                    <div className="text-[10px] text-slate-400">ATS Optimization</div>
                  </div>
                </Link>

                <Link
                  to="/notes-gap-analyzer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-2 rounded bg-rose-50 text-rose-600">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Notes Analyzer</div>
                    <div className="text-[10px] text-slate-400">Gap Audits</div>
                  </div>
                </Link>

                <Link
                  to="/analytics"
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-2 rounded bg-purple-50 text-purple-600">
                    <LineChart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Full Analytics</div>
                    <div className="text-[10px] text-slate-400">Command Center</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Profile details form */}
          <div>
            <Card className="bg-white border-slate-200/80 shadow-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#2563EB]" /> Academic Profile
                </CardTitle>
                <CardDescription className="text-xs">
                  Your academic context is used to refine roadmap objectives and interview preparation topics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                      <span className="text-sm font-semibold text-slate-700">{profile?.fullName || "Not Configured"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Degree & Major</span>
                      <span className="text-sm font-semibold text-slate-700">{profile?.degree || "Not Configured"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Semester</span>
                      <span className="text-sm font-semibold text-slate-700">{profile?.semester || "Not Configured"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Career Role</span>
                      <span className="text-sm font-semibold text-slate-700">{profile?.targetRole || "Not Configured"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gained Skills</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile?.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill: string) => (
                            <span
                              key={skill}
                              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">No skills added yet</span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={startEdit}
                      className="w-full mt-4 border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"
                      variant="outline"
                      size="sm"
                    >
                      Update Profile
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveProfile.mutate(profileForm);
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <Label htmlFor="fullName" className="text-xs font-semibold text-slate-600">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        placeholder="e.g. Yash Barjatya"
                        className="h-8 text-xs border-slate-200 mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="degree" className="text-xs font-semibold text-slate-600">Degree</Label>
                      <Input
                        id="degree"
                        value={profileForm.degree}
                        onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                        placeholder="e.g. B.Tech CSE"
                        className="h-8 text-xs border-slate-200 mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="semester" className="text-xs font-semibold text-slate-600">Semester</Label>
                      <Input
                        id="semester"
                        value={profileForm.semester}
                        onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                        placeholder="e.g. Semester 6"
                        className="h-8 text-xs border-slate-200 mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="targetRole" className="text-xs font-semibold text-slate-600">Target Role</Label>
                      <Input
                        id="targetRole"
                        value={profileForm.targetRole}
                        onChange={(e) => setProfileForm({ ...profileForm, targetRole: e.target.value })}
                        placeholder="e.g. Frontend Engineer"
                        className="h-8 text-xs border-slate-200 mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="skills" className="text-xs font-semibold text-slate-600">Skills (Comma-separated)</Label>
                      <Input
                        id="skills"
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                        placeholder="e.g. React, Node.js, HTML"
                        className="h-8 text-xs border-slate-200 mt-1"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={saveProfile.isPending}
                        className="flex-1 h-8 text-xs bg-[#2563EB] hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        {saveProfile.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="h-8 text-xs border-slate-200 text-slate-500"
                        variant="outline"
                        size="sm"
                      >
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
