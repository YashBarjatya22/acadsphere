import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import {
  getClassroomSubmissions,
  type SubmissionItem,
  type ClassroomResponse,
} from "@/lib/classroom.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  GraduationCap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Check,
  ChevronDown,
  Info,
  Calendar,
  X,
  MessageSquare,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/classroom")({
  head: () => ({
    meta: [
      { title: "Classroom Submissions · AcadSphere" },
      { name: "description", content: "Track pending coursework, deadlines, and grades across all your subjects." },
    ],
  }),
  component: ClassroomPage,
});

function ClassroomPage() {
  const fetchSubmissionsFn = useServerFn(getClassroomSubmissions);

  /* — UI State — */
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "OVERDUE" | "COMPLETED" | "INACTIVE">("ALL");
  const [selectedCourse, setSelectedCourse] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingDemoSms, setIsSendingDemoSms] = useState(false);
  const [reviewedMap, setReviewedMap] = useState<Record<string, boolean>>({});
  const [showBanner, setShowBanner] = useState(true);
  // Track whether a google_provider_token is present so the query key can react to it
  const [hasToken, setHasToken] = useState<boolean>(
    () => typeof window !== "undefined" && !!localStorage.getItem("google_provider_token")
  );
  const tokenCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll localStorage briefly after mount to catch the token written by auth/callback.
  useEffect(() => {
    if (hasToken) return;
    let attempts = 0;
    tokenCheckRef.current = setInterval(() => {
      attempts++;
      const tok = typeof window !== "undefined" ? localStorage.getItem("google_provider_token") : null;
      if (tok) {
        setHasToken(true);
        clearInterval(tokenCheckRef.current!);
      } else if (attempts >= 20) {
        clearInterval(tokenCheckRef.current!);
      }
    }, 500);
    return () => {
      if (tokenCheckRef.current) clearInterval(tokenCheckRef.current);
    };
  }, [hasToken]);

  /* — Fetch Submissions via Server Function — */
  const { data, isLoading, refetch } = useQuery<ClassroomResponse>({
    queryKey: ["classroomSubmissions", hasToken],
    queryFn: async () => {
      let googleToken =
        typeof window !== "undefined"
          ? (localStorage.getItem("google_provider_token") || undefined)
          : undefined;

      if (!googleToken) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.provider_token) {
            googleToken = session.provider_token;
            if (typeof window !== "undefined") {
              localStorage.setItem("google_provider_token", session.provider_token);
              setHasToken(true);
            }
          }
        } catch (_) {}
      }

      return fetchSubmissionsFn({ data: { providerToken: googleToken } }) as Promise<ClassroomResponse>;
    },
    refetchInterval: 60000,
  });

  const isConnected = data?.connected ?? false;
  const assignments = data?.assignments ?? [];

  /* — Manual Sync Handler — */
  // ── Offline SMS cache: quietly upsert PENDING/OVERDUE assignments to DB ──
  const syncTasksToDb = async (items: SubmissionItem[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const pendingItems = items.filter(
        (a) => a.state === "PENDING" || a.state === "OVERDUE"
      );
      if (pendingItems.length === 0) return;

      const rows = pendingItems.map((a) => ({
        user_id:       user.id,
        coursework_id: a.id,
        title:         a.title,
        course_name:   a.courseName || "",
        due_date:      a.dueDate ? new Date(a.dueDate).toISOString() : null,
        status:        "PENDING" as const,
      }));

      // upsert on (user_id, coursework_id) — preserves notification flags
      await supabase
        .from("classroom_tasks")
        .upsert(rows, {
          onConflict: "user_id,coursework_id",
          ignoreDuplicates: false,  // update due_date/title if changed
        });
    } catch (_) {
      // Non-critical: don't surface DB errors to the user
    }
  };

  const handleSync = async () => {
    setIsRefreshing(true);
    const result = await refetch();
    // Quietly cache to DB for offline cron processing
    if (result.data?.assignments) {
      await syncTasksToDb(result.data.assignments);
    }
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Classroom assignments synchronized!");
    }, 600);
  };

  /* — Demo SMS Handler (for live presentations) — */
  const handleDemoSms = async () => {
    setIsSendingDemoSms(true);
    try {
      // Get the user's saved phone number from Supabase profiles
      const { data: { user } } = await supabase.auth.getUser();
      let phone: string | undefined;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone_number")
          .eq("id", user.id)
          .single();
        phone = profile?.phone_number || undefined;
      }

      // Get user's display name
      const userName = user?.user_metadata?.full_name?.split(" ")[0]
        || user?.email?.split("@")[0]
        || "Student";

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-demo-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          pending: counts.pending,
          overdue: counts.overdue,
          completed: counts.completed,
          total: counts.total,
          courses: counts.courses,
          phone,
          userName,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("📱 Demo SMS sent to your phone!", {
          description: "Check your messages — live classroom stats delivered.",
        });
      } else {
        toast.error("SMS failed: " + (result.error || "Unknown error"), {
          description: "Make sure your phone number is saved in Settings.",
        });
      }
    } catch (err: any) {
      toast.error("Failed to send Demo SMS", { description: err.message });
    } finally {
      setIsSendingDemoSms(false);
    }
  };

  /* — Google OAuth Connect Handler — */
  const handleConnectGoogle = async () => {
    try {
      toast.info("Redirecting to Google Classroom OAuth...");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes:
            "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me",
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "consent",
          },
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate Google OAuth");
    }
  };

  /* — Toggle Reviewed State — */
  const toggleReviewed = (id: string) => {
    setReviewedMap((prev) => {
      const nextState = !prev[id];
      if (nextState) toast.success("Assignment marked as reviewed");
      return { ...prev, [id]: nextState };
    });
  };

  /* — Unique Course List for Dropdown Filter — */
  const coursesList = useMemo(() => {
    const activeSet = new Set<string>();
    const inactiveSet = new Set<string>();

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

  /* — Counts for Quick Stat Cards (Computed for Active Current Semester) — */
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
      courses: activeSubjectsCount,
    };
  }, [assignments, data]);

  /* — Filtered Assignments — */
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      // 1. Current vs Past Semester filter
      if (activeTab === "INACTIVE") {
        if (item.isCurrentSemester !== false) return false;
      } else {
        if (item.isCurrentSemester === false) return false;
      }

      // 2. Tab status filter
      if (activeTab === "PENDING" && item.state !== "PENDING") return false;
      if (activeTab === "OVERDUE" && item.state !== "OVERDUE") return false;
      if (activeTab === "COMPLETED" && item.state !== "SUBMITTED" && item.state !== "GRADED") return false;

      // 3. Course filter
      if (selectedCourse !== "ALL" && item.courseName !== selectedCourse) return false;

      // 4. Search query
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

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full overflow-y-auto bg-[#FAFAF8] dark:bg-background text-[#0A0A0A] dark:text-foreground p-4 md:p-8 space-y-6 scrollbar-thin">

        {/* ─── Top Header & Live Sync Action ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E0DDD4] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-[#0A0A0A]">
                Classroom Submissions
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-sans max-w-xl leading-relaxed">
              Track pending coursework, upcoming deadlines, and submission history across all your subjects.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSync}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E0DDD4] bg-[#F4F2EC] hover:bg-[#EAE7DC] text-xs font-semibold text-[#0A0A0A] transition-all duration-150 shadow-sm active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync Live Data"}</span>
            </button>

            {/* ── Demo SMS Button ── */}
            <button
              id="demo-sms-btn"
              onClick={handleDemoSms}
              disabled={isSendingDemoSms}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-70 overflow-hidden"
              style={{
                background: isSendingDemoSms
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "linear-gradient(135deg, #059669, #0d9488)",
                color: "white",
              }}
            >
              {/* Animated ping ring when idle */}
              {!isSendingDemoSms && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white opacity-80" />
                </span>
              )}
              {isSendingDemoSms ? (
                <Send className="h-3.5 w-3.5 animate-bounce" />
              ) : (
                <MessageSquare className="h-3.5 w-3.5" />
              )}
              <span>{isSendingDemoSms ? "Sending SMS..." : "Demo SMS"}</span>
            </button>

            {!isConnected && (
              <button
                onClick={handleConnectGoogle}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0A0A] text-white text-xs font-semibold hover:opacity-90 transition-all duration-150 shadow-sm active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Connect Google Classroom</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Google OAuth Connection Banner ─────────────────────────────── */}
        {!isConnected && showBanner && (
          <div className="relative rounded-2xl border border-amber-300/60 bg-amber-500/10 p-4 md:p-5 shadow-sm transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Connect Google Classroom Account
                  </h3>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed mt-0.5 max-w-2xl">
                    Sync your live university assignments, deadlines, and grades. Demonstration MCA coursework is currently active below for reference.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={handleConnectGoogle}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-black transition-colors"
                    >
                      Authorize Google Account
                    </button>
                    <button
                      onClick={() => setShowBanner(false)}
                      className="text-xs font-medium text-amber-900/70 hover:underline"
                    >
                      Dismiss Banner
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBanner(false)}
                className="text-amber-700/60 hover:text-amber-900 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Quick Summary Metric Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Card 1: Overdue */}
          <div className="rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm transition-all duration-150 hover:border-red-400/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Action Needed
              </span>
              <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0A0A0A]">{counts.overdue}</span>
              <span className="text-xs text-muted-foreground font-medium">Overdue Submissions</span>
            </div>
          </div>

          {/* Card 2: Pending */}
          <div className="rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm transition-all duration-150 hover:border-amber-400/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Due Soon
              </span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0A0A0A]">{counts.pending}</span>
              <span className="text-xs text-muted-foreground font-medium">Pending Coursework</span>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm transition-all duration-150 hover:border-emerald-400/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Turned In
              </span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0A0A0A]">{counts.completed}</span>
              <span className="text-xs text-muted-foreground font-medium">Submitted / Graded</span>
            </div>
          </div>

          {/* Card 4: Enrolled Courses */}
          <div className="rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm transition-all duration-150 hover:border-blue-400/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Subjects
              </span>
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0A0A0A]">{counts.courses}</span>
              <span className="text-xs text-muted-foreground font-medium">Active Classroom Subjects</span>
            </div>
          </div>
        </div>

        {/* ─── Filter Tabs & Search Bar ───────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#F4F2EC] p-2 rounded-2xl border border-[#E0DDD4]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-0.5">
            {[
              { id: "ALL", label: `Active (${counts.total})` },
              { id: "PENDING", label: `Pending (${counts.pending})` },
              { id: "OVERDUE", label: `Overdue (${counts.overdue})` },
              { id: "COMPLETED", label: `Completed (${counts.completed})` },
              { id: "INACTIVE", label: `Past Semesters (${counts.inactive})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedCourse("ALL");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-[#0A0A0A] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-[#EAE7DC] hover:text-[#0A0A0A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Course Filter Dropdown */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            {/* Course Filter Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="appearance-none bg-background border border-[#E0DDD4] rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="ALL">All Subjects</option>
                {coursesList.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Keyword Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search coursework..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E0DDD4] bg-background text-[#0A0A0A] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* ─── Submissions List / Grid ────────────────────────────────────── */}
        {isLoading ? (
          /* Loading Skeleton State */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-[#F4F2EC] border border-[#E0DDD4] animate-pulse" />
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#F4F2EC] rounded-2xl border border-[#E0DDD4] text-center">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-[#0A0A0A]">You're all caught up!</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchQuery || selectedCourse !== "ALL" || activeTab !== "ALL"
                ? "No submissions match your selected filter criteria."
                : "No pending or overdue assignments found across your Classroom subjects."}
            </p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="space-y-4">
            {filteredAssignments.map((item) => {
              const isOverdue = item.state === "OVERDUE";
              const isSubmitted = item.state === "SUBMITTED";
              const isGraded = item.state === "GRADED";
              const isReviewed = reviewedMap[item.id] ?? false;

              // Format Due Date Display
              let dueDisplay = "No Due Date";
              if (item.dueDate) {
                const d = new Date(item.dueDate);
                dueDisplay = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl border p-5 bg-[#F4F2EC] transition-all duration-150 hover:shadow-md ${
                    isOverdue
                      ? "border-red-300 dark:border-red-900/50"
                      : isReviewed
                      ? "opacity-60 border-[#E0DDD4]"
                      : "border-[#E0DDD4] hover:border-[#0A0A0A]/30"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                    {/* Left Details */}
                    <div className="flex-1 space-y-2">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0A0A0A]/10 text-[#0A0A0A]">
                          {item.courseName}
                        </span>

                        {/* Status Badge */}
                        {isOverdue && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-700 dark:text-red-400">
                            <AlertTriangle className="h-3 w-3" />
                            Missing / Overdue
                          </span>
                        )}
                        {item.state === "PENDING" && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            Pending Submission
                          </span>
                        )}
                        {isSubmitted && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Turned In
                          </span>
                        )}
                        {isGraded && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400">
                            <Sparkles className="h-3 w-3" />
                            Graded
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-[#0A0A0A] leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Due: <strong className="text-[#0A0A0A]">{dueDisplay}</strong></span>
                        </div>

                        {item.maxPoints != null && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] font-semibold text-[#0A0A0A]">
                              {isGraded && item.grade != null
                                ? `Score: ${item.grade}/${item.maxPoints} pts`
                                : `${item.maxPoints} pts possible`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 border-t md:border-t-0 border-[#E0DDD4] pt-3 md:pt-0">
                      <a
                        href={item.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A0A0A] text-white text-xs font-semibold hover:opacity-90 transition-all active:scale-95 shadow-sm"
                      >
                        <span>Open in Classroom</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <button
                        onClick={() => toggleReviewed(item.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          isReviewed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-background border-[#E0DDD4] text-muted-foreground hover:text-[#0A0A0A]"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{isReviewed ? "Reviewed" : "Mark Reviewed"}</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </ChatLayout>
  );
}
