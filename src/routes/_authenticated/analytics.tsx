import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { getAnalyticsSummary, exportAnalyticsCSV } from "@/lib/analytics.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart as RechartLine, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  PieChart as RechartPie, 
  Pie, 
  Cell 
} from "recharts";
import { 
  LineChart, 
  Flame, 
  GraduationCap, 
  Clock, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Download, 
  Share2, 
  Database,
  BrainCircuit,
  PieChart
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsDashboardPage,
});

const PIE_COLORS = ["#1E3A8A", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];

function AnalyticsDashboardPage() {
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const exportCSVFn = useServerFn(exportAnalyticsCSV);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getSummaryFn(),
  });

  const [simulatedHours, setSimulatedHours] = useState(15);

  const handleExportCSV = async () => {
    try {
      const res = await exportCSVFn();
      if (!res.csv) throw new Error("No data returned");
      
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `StudentOS_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV report exported successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to export CSV report");
    }
  };

  const handleDownloadPDF = () => {
    window.print();
    toast.success("Preparing dashboard layout for PDF print download");
  };

  const handleShareProgress = () => {
    if (navigator.share) {
      navigator.share({
        title: "StudentOS Academic Analytics",
        text: `My Placement Readiness is at ${analytics?.stats.placementReadiness || 82}%! Check out my learning velocity.`,
        url: window.location.href,
      }).then(() => {
        toast.success("Progress shared successfully!");
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Dashboard link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Dashboard link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-slate-50 text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium">Aggregating academic performance intelligence...</span>
          </div>
        </div>
      </ChatLayout>
    );
  }

  const stats = analytics?.stats;
  const profile = analytics?.profile;
  const placement = analytics?.placementBreakdown;
  const exam = analytics?.examReadiness;
  const achievements = analytics?.achievements || [];
  const heatmapData = analytics?.heatmapData || {};

  // Mock historical chart data for Learning Velocity
  const learningVelocityData = [
    { name: "Wk 1", skills: 1 },
    { name: "Wk 2", skills: 2 },
    { name: "Wk 3", skills: 3 },
    { name: "Wk 4", skills: 5 }
  ];

  // Productivity Heatmap Setup: GitHub contribution calendar logic
  const getHeatmapGrid = () => {
    const today = new Date();
    const days: Date[] = [];
    
    // Get start date (364 days ago, aligned to start on a Sunday or Sunday of that week)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Go back to Sunday

    let tempDate = new Date(startDate);
    while (tempDate <= today) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return days;
  };

  const heatmapDays = getHeatmapGrid();

  // Helper for heatmap square colors
  const getContributionColor = (dateStr: string) => {
    const count = heatmapData[dateStr] || 0;
    if (count === 0) return "bg-slate-100 hover:scale-110";
    if (count === 1) return "bg-blue-200 hover:bg-blue-300 hover:scale-125";
    if (count === 2) return "bg-blue-400 hover:bg-blue-500 hover:scale-125";
    if (count === 3) return "bg-blue-600 hover:bg-blue-700 hover:scale-125";
    return "bg-blue-900 hover:bg-blue-950 hover:scale-125"; // 4+ contributions
  };

  const formatHeatmapDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full overflow-y-auto bg-[#F8FAFC] text-slate-800 p-6 md:p-8 scrollbar-thin print:bg-white print:p-0">
        
        {/* Header Section */}
        <div className="border-b border-slate-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-none print:pb-0">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#1E3A8A] flex items-center gap-2">
              <LineChart className="h-7 w-7 text-[#2563EB]" />
              Analytics Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Track your learning journey, placement readiness, and academic growth.
            </p>
          </div>

          {/* Controls & Export */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              variant="outline"
              className="h-8 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF Report
            </Button>
            
            <Button
              onClick={handleExportCSV}
              size="sm"
              variant="outline"
              className="h-8 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs flex items-center gap-1.5"
            >
              <Database className="h-3.5 w-3.5 text-[#2563EB]" />
              Export Analytics
            </Button>

            <Button
              onClick={handleShareProgress}
              size="sm"
              variant="outline"
              className="h-8 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs flex items-center gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Progress
            </Button>
          </div>
        </div>

        {/* Native React Dashboard Panel */}
        <div className="space-y-6">
          
          {/* Row 1: Student Overview & Quick Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Overview Details */}
            <Card className="bg-white border-slate-200/80 shadow-sm md:col-span-1">
              <CardHeader className="pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Overview</span>
                <CardTitle className="font-display text-lg font-bold text-[#1E3A8A] mt-1">{profile?.fullName}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-4">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Degree</span>
                    <span className="font-bold text-slate-700 text-sm mt-0.5 block">{profile?.degree}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Semester</span>
                    <span className="font-bold text-slate-700 text-sm mt-0.5 block">{profile?.semester}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Target Career Role</span>
                  <Badge className="bg-blue-50 text-[#1E3A8A] border border-blue-100 font-bold px-2 py-0.5 mt-1">
                    {profile?.targetRole}
                  </Badge>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Academic Focus Skills</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {profile?.skills.map((skill: string) => (
                      <span key={skill} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="md:col-span-2 grid gap-4 grid-cols-2">
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Streak</span>
                  <Flame className="h-5 w-5 text-amber-500 shrink-0" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-slate-800">{stats?.currentStreak} Days</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Consistency Tracker Indicator</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Study Hours</span>
                  <Clock className="h-5 w-5 text-[#2563EB] shrink-0" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-slate-800">{stats?.studyHoursThisWeek} hrs</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Total Active Study Logging</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Score</span>
                  <GraduationCap className="h-5 w-5 text-indigo-500 shrink-0" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-[#1E3A8A]">{stats?.placementReadiness}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Job Ready Index Value</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Learning Velocity</span>
                  <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-slate-800">{stats?.learningVelocity} / wk</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Skills Mastered Speed Metric</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Study Streak Tracker & Placement Readiness Gauge */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Streak Consistency Graph */}
            <Card className="bg-white border-slate-200/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <Flame className="h-5 w-5 text-amber-500 shrink-0" />
                  Study Streak Tracker
                </CardTitle>
                <CardDescription className="text-xs">
                  Current Streak: <strong className="text-slate-700">{stats?.currentStreak} Days</strong> · Longest Streak: <strong className="text-slate-700">{stats?.longestStreak} Days</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-4">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <span className="font-semibold text-slate-600">Streak Status</span>
                  <Badge className="bg-amber-50 border border-amber-200 text-amber-700 font-bold">
                    🔥 Active
                  </Badge>
                </div>
                {/* Streak Bar Graph Visualization */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Streak Consistency Graph</span>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-amber-500" style={{ width: `${(stats?.currentStreak || 12) / 30 * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>0 Days</span>
                    <span>Target: 30 Days (Longest)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placement Readiness Gauge */}
            <Card className="bg-white border-slate-200/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <GraduationCap className="h-5 w-5 text-indigo-500 shrink-0" />
                  Placement Readiness Score
                </CardTitle>
                <CardDescription className="text-xs">
                  Aggregated metric of your resume quality, skills coverage, projects, and interviews.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2 pt-2 text-xs">
                
                {/* SVG Gauge Chart */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative h-28 w-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#E2E8F0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#2563EB"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - (stats?.placementReadiness || 82) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="font-display font-extrabold text-2xl text-[#1E3A8A]">{stats?.placementReadiness}%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Readiness</span>
                    </div>
                  </div>
                </div>

                {/* Score breakdown bar charts */}
                <div className="space-y-3 justify-center flex flex-col">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-600 text-[10px]">
                      <span>Resume Review Quality</span>
                      <span>{placement?.resume}%</span>
                    </div>
                    <Progress value={placement?.resume} className="h-1 bg-slate-100 [&>div]:bg-blue-600" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-600 text-[10px]">
                      <span>Skills Map Coverage</span>
                      <span>{placement?.skills}%</span>
                    </div>
                    <Progress value={placement?.skills} className="h-1 bg-slate-100 [&>div]:bg-blue-600" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-600 text-[10px]">
                      <span>Project Portfolio</span>
                      <span>{placement?.projects}%</span>
                    </div>
                    <Progress value={placement?.projects} className="h-1 bg-slate-100 [&>div]:bg-blue-600" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-600 text-[10px]">
                      <span>Mock Interview Readiness</span>
                      <span>{placement?.interview}%</span>
                    </div>
                    <Progress value={placement?.interview} className="h-1 bg-slate-100 [&>div]:bg-blue-600" />
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Row 3: Learning Velocity & Roadmap Progress */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Learning Velocity (Section 4) */}
            <Card className="bg-white border-slate-200/80 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                      <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" />
                      Learning Velocity
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Skills Added This Month: <strong className="text-slate-700">{stats?.skillsAddedThisMonth}</strong> · Avg Speed: <strong className="text-slate-700">{stats?.learningVelocity} Skills / Week</strong>.
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    Trend: {stats?.velocityTrend}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartLine data={learningVelocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "11px" }}
                      labelStyle={{ fontWeight: "bold", color: "#1E3A8A" }}
                    />
                    <Line type="monotone" dataKey="skills" stroke="#2563EB" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                  </RechartLine>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Roadmap Progress (Section 5) */}
            <Card className="bg-white border-slate-200/80 shadow-sm lg:col-span-1 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <Compass className="h-5 w-5 text-[#2563EB]" />
                  Roadmap Progress
                </CardTitle>
                <CardDescription className="text-xs">
                  Milestones tracking status from Career Roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-5 flex-1 flex flex-col justify-center">
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-slate-800">{analytics?.roadmap.percentage}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1 uppercase tracking-wider font-semibold">Completion Ratio</span>
                </div>
                <div className="space-y-1">
                  <Progress value={analytics?.roadmap.percentage} className="h-2 bg-slate-100 [&>div]:bg-[#2563EB]" />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
                    <span>Completed: {analytics?.roadmap.completed}/{analytics?.roadmap.total}</span>
                    <span>Remaining: {(analytics?.roadmap.total || 12) - (analytics?.roadmap.completed || 8)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Row 4: Study Performance (Pie Chart) & Subject Performance (Progress bars) */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Study Performance (Section 6) */}
            <Card className="bg-white border-slate-200/80 shadow-sm lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <PieChart className="h-5 w-5 text-indigo-500" />
                  Study Performance Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Study hours split by subject (Total: {stats?.totalStudyHours} hrs).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-56 flex items-center justify-center pt-1">
                <div className="relative w-full h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPie>
                      <Pie
                        data={analytics?.subjectDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analytics?.subjectDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(value) => `${value} hrs`} />
                    </RechartPie>
                  </ResponsiveContainer>
                  <div className="absolute text-center flex flex-col pointer-events-none">
                    <span className="text-2xl font-extrabold text-slate-800">{stats?.studyHoursThisMonth}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Hrs This Month</span>
                  </div>
                </div>
              </CardContent>
              <div className="px-5 pb-5 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                {analytics?.subjectDistribution.map((item: any, index: number) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="truncate">{item.name} ({item.value}h)</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Subject Performance & Coverage (Section 7) */}
            <Card className="bg-white border-slate-200/80 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <BookOpen className="h-5 w-5 text-indigo-500 shrink-0" />
                  Subject Coverage Performance
                </CardTitle>
                <CardDescription className="text-xs">
                  Audited coverage vs readiness benchmarks for core curriculum maps.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-5 pt-2">
                {analytics?.subjectPerformance.map((sub: any) => (
                  <div key={sub.name} className="border-b border-slate-100 pb-3 last:border-none last:pb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-2">
                      <span className="font-bold text-slate-700 text-sm">{sub.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400">Coverage: {sub.coverage}%</span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5">Readiness: {sub.readiness}%</span>
                        <Badge className={`text-[9px] font-bold py-0 ${
                          sub.revision === "Ready" 
                            ? "bg-green-50 border border-green-200 text-green-700" 
                            : "bg-amber-50 border border-amber-200 text-amber-700"
                        }`}>
                          {sub.revision}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={sub.coverage} className="h-1.5 bg-slate-100 [&>div]:bg-[#2563EB]" />
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          {/* Row 5: Exam Readiness & Skill Growth Dashboard */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Exam Readiness Status Card (Section 8) */}
            <Card className="bg-white border-slate-200/80 shadow-sm lg:col-span-1 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Exam Readiness Alert
                </CardTitle>
                <CardDescription className="text-xs">
                  Current preparedness index score: {exam?.score}%.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-4 flex-1 flex flex-col justify-center">
                {exam?.status === "Ready" ? (
                  <div className="border border-green-200 bg-green-50/50 text-green-800 rounded-xl p-4 flex gap-3 items-start leading-normal">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-green-950 block">Status: Well Prepared</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Syllabus gaps are minimal. Keep reviewing formulas and tips.</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-amber-200 bg-amber-50/50 text-amber-800 rounded-xl p-4 flex gap-3 items-start leading-normal">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-950 block">Status: Needs Revision</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Gaps detected in Operating Systems. Schedule a study check session.</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skill Growth Dashboard timeline (Section 9) */}
            <Card className="bg-white border-slate-200/80 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-[#2563EB]" />
                  Skill Growth Dashboard
                </CardTitle>
                <CardDescription className="text-xs">
                  Monthly timeline detailing skill additions, projects, and certifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-4 pt-1">
                <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-5">
                  {analytics?.skillsTimeline.map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-[#2563EB] ring-4 ring-white" />
                      <div>
                        <span className="font-bold text-[#1E3A8A] text-xs block">{item.month}</span>
                        <span className="text-slate-600 mt-0.5 block font-medium">Acquired mastery in: <strong className="text-slate-800 font-semibold">{item.skill}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Row 6: Productivity Heatmap (Section 10) */}
          <Card className="bg-white border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                <Calendar className="h-5 w-5 text-blue-600" />
                Productivity Heatmap
              </CardTitle>
              <CardDescription className="text-xs">
                Daily study log consistency and contribution activity grid for the last 365 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 overflow-x-auto text-[10px]">
              <div className="flex flex-col gap-1 min-w-[700px] pb-2">
                {/* Contribution grid columns wrapper */}
                <div className="grid grid-flow-col gap-1 auto-cols-max">
                  {/* Rows representing days of the week, columns representing weeks */}
                  {Array.from({ length: 53 }).map((_, weekIdx) => (
                    <div key={weekIdx} className="grid grid-rows-7 gap-1">
                      {Array.from({ length: 7 }).map((_, dayIdx) => {
                        const dateIndex = weekIdx * 7 + dayIdx;
                        const dateObj = heatmapDays[dateIndex];
                        if (!dateObj || dateObj > new Date()) return <div key={dayIdx} className="w-2.5 h-2.5 rounded-sm bg-transparent" />;
                        
                        const dateString = formatHeatmapDate(dateObj);
                        return (
                          <div
                            key={dayIdx}
                            title={`${dateString}: ${heatmapData[dateString] || 0} study sessions`}
                            className={`w-2.5 h-2.5 rounded-sm cursor-pointer transition-all ${getContributionColor(dateString)}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Heatmap Legend */}
                <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 mt-4 font-medium px-2">
                  <span>Less</span>
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-100" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-200" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-900" />
                  <span>More</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 7: AI Insights Engine & Predictions */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* AI Insights Engine (Section 11) */}
            <Card className="bg-white border-slate-200/80 shadow-sm p-5 space-y-4">
              <span className="font-display text-base font-bold text-[#1E3A8A] flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <BrainCircuit className="h-5 w-5 text-[#2563EB]" />
                AI Insights Engine
              </span>
              <ul className="space-y-3 text-xs text-slate-600 leading-normal">
                {analytics?.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="font-bold text-[#2563EB] shrink-0">0{idx+1}</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Predictions Engine & Simulator (Section 12) */}
            <Card className="bg-white border-slate-200/80 shadow-sm p-5 space-y-4">
              <span className="font-display text-base font-bold text-[#1E3A8A] flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <BrainCircuit className="h-5 w-5 text-indigo-500 animate-pulse" />
                Career Readiness Simulator & Predictions
              </span>
              
              {/* Interactive Range Slider */}
              <div className="space-y-2 pb-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Simulate Weekly Study Hours (Next 30 Days)</span>
                  <span className="text-blue-600 font-bold">{simulatedHours} Hours / Week</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={simulatedHours}
                  onChange={(e) => setSimulatedHours(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                  <span>0h (Low Intensity)</span>
                  <span>15h (Normal)</span>
                  <span>40h (High Intensity)</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-3.5">
                  <span className="font-semibold text-slate-400 text-[10px] uppercase block">Predicted Placement Score</span>
                  <strong className="text-xl font-bold text-[#1E3A8A] mt-1 block">
                    {Math.min((stats?.placementReadiness || 82) + Math.round(simulatedHours * 0.4), 98)}%
                  </strong>
                  <span className="text-[10px] text-slate-500 mt-1 block">Forecast in 30 Days</span>
                </div>

                <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-3.5">
                  <span className="font-semibold text-slate-400 text-[10px] uppercase block">Roadmap Completion Probability</span>
                  <strong className="text-xl font-bold text-purple-950 mt-1 block">
                    {Math.min((analytics?.predictions.roadmapCompletionProbability || 88) + Math.round(simulatedHours * 0.25), 99)}%
                  </strong>
                  <span className="text-[10px] text-slate-500 mt-1 block">{analytics?.predictions.skillGrowthForecast}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100/80 rounded-lg p-3 text-[10px] text-slate-500 leading-normal">
                💡 <strong>Simulator Insight:</strong> Studying {simulatedHours} hours per week accelerates learning velocity to approximately {Math.round((1.2 * (simulatedHours / 15)) * 10) / 10 || 0.5} skills per week, driving higher resume keyword matching scores and project portfolio completeness.
              </div>
            </Card>

          </div>

          {/* Row 8: Achievement Badge System (Section 13) */}
          <Card className="bg-white border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-[#1E3A8A] flex items-center gap-1.5">
                <Award className="h-5 w-5 text-indigo-500" />
                Achievement Badge System
              </CardTitle>
              <CardDescription className="text-xs">
                Unlock premium badges by completing core study schedules and roadmaps.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                {achievements.map((item: any) => (
                  <div 
                    key={item.id} 
                    className={`rounded-xl border p-4 text-center flex flex-col items-center justify-between gap-2 transition-all ${
                      item.unlocked 
                        ? "bg-white border-blue-200/80 shadow-sm" 
                        : "bg-slate-50/50 border-slate-200 opacity-50 select-none"
                    }`}
                  >
                    <span className="text-3xl shrink-0" role="img" aria-label={item.title}>
                      {item.icon}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">{item.title}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block leading-normal">{item.desc}</span>
                    </div>
                    <Badge className={`text-[9px] font-bold py-0.5 mt-2 ${
                      item.unlocked 
                        ? "bg-green-50 border border-green-200 text-green-700" 
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                      {item.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </ChatLayout>
  );
}
