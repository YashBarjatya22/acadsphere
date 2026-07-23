import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAnalyticsData } from "@/lib/admin.functions";
import {
  TrendingUp, BarChart2, PieChart as PieChartIcon, Activity,
  Users, Clock, Zap, ArrowUpRight, Award, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
});

const ACTIVE_VS_INACTIVE = [
  { name: "Active (Weekly Login)", value: 890 },
  { name: "Semi-Active (1-2 Logins)", value: 180 },
  { name: "Inactive (7+ Days)", value: 70 },
];

const DEPT_ENGAGEMENT = [
  { dept: "CSE", studyHours: 340, aiQueries: 1450 },
  { dept: "ECE", studyHours: 280, aiQueries: 980 },
  { dept: "ISE", studyHours: 260, aiQueries: 1100 },
  { dept: "MECH", studyHours: 190, aiQueries: 620 },
  { dept: "CIVIL", studyHours: 150, aiQueries: 480 },
  { dept: "MCA", studyHours: 290, aiQueries: 1350 },
];

const SEMESTER_ENGAGEMENT = [
  { sem: "Sem 1", engagementScore: 78 },
  { sem: "Sem 2", engagementScore: 82 },
  { sem: "Sem 3", engagementScore: 85 },
  { sem: "Sem 4", engagementScore: 88 },
  { sem: "Sem 5", engagementScore: 92 },
  { sem: "Sem 6", engagementScore: 95 },
  { sem: "Sem 7", engagementScore: 90 },
  { sem: "Sem 8", engagementScore: 86 },
];

const DAILY_STUDY_TIME = [
  { day: "Mon", avgHours: 3.8 },
  { day: "Tue", avgHours: 4.2 },
  { day: "Wed", avgHours: 4.5 },
  { day: "Thu", avgHours: 4.1 },
  { day: "Fri", avgHours: 3.9 },
  { day: "Sat", avgHours: 2.4 },
  { day: "Sun", avgHours: 2.1 },
];

const AI_FEATURE_USAGE = [
  { name: "Smart Notes", value: 45 },
  { name: "AI Assistant", value: 35 },
  { name: "Lab Helper", value: 20 },
];

const PLATFORM_GROWTH = [
  { month: "Jan", users: 450, retentionPct: 82 },
  { month: "Feb", users: 620, retentionPct: 85 },
  { month: "Mar", users: 780, retentionPct: 88 },
  { month: "Apr", users: 950, retentionPct: 90 },
  { month: "May", users: 1100, retentionPct: 91 },
  { month: "Jun", users: 1250, retentionPct: 93 },
];

const CHART_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];

function AdminAnalyticsPage() {
  const analyticsFn = useServerFn(getAnalyticsData);
  const { data, refetch } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: () => analyticsFn(),
  });

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            Academic Analytics & Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data visualizations of active retention, department-wise engagement, study duration trends, and platform usage metrics.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Grid 1: Active vs Inactive Students & AI Feature Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active vs Inactive Donut Chart */}
        <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">Active vs Inactive Students</p>
            <p className="text-[11px] text-slate-400">Distribution by recent platform logins</p>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={ACTIVE_VS_INACTIVE} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {ACTIVE_VS_INACTIVE.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
            {ACTIVE_VS_INACTIVE.map((d, i) => (
              <div key={d.name} className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-[10px] text-slate-300 font-bold truncate">{d.name}</span>
                </div>
                <p className="font-mono text-sm font-black text-white mt-1">{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Feature Usage Breakdown */}
        <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">AI Feature Usage Share</p>
            <p className="text-[11px] text-slate-400">Proportion of AI tools utilized by students</p>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={AI_FEATURE_USAGE} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {AI_FEATURE_USAGE.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
            {AI_FEATURE_USAGE.slice(0, 3).map((d, i) => (
              <div key={d.name} className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-[10px] text-slate-300 font-bold truncate">{d.name}</span>
                </div>
                <p className="font-mono text-sm font-black text-white mt-1">{d.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 2: Department Engagement & Average Daily Study Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Engagement Bar Chart */}
        <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">Most Active Departments</p>
            <p className="text-[11px] text-slate-400">Total study hours & AI queries per department</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEPT_ENGAGEMENT}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="studyHours" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Study Hours" />
              <Bar dataKey="aiQueries" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="AI Queries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Average Study Duration */}
        <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">Average Daily Study Time</p>
            <p className="text-[11px] text-slate-400">Average hours spent per student per day</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={DAILY_STUDY_TIME}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="avgHours" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Avg Hours" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 3: Platform Growth & Retention Rate */}
      <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-300">Platform Growth & Student Retention</p>
          <p className="text-[11px] text-slate-400">6-month growth curve and 30-day student retention rate</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={PLATFORM_GROWTH}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 10, fontSize: 12 }} />
            <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#colorGrowth)" strokeWidth={2.5} name="Total Headcount" />
            <Line type="monotone" dataKey="retentionPct" stroke="#f59e0b" strokeWidth={2.5} name="Retention Rate (%)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
