import { jsxs, jsx } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./router-DWxA6Z2f.js";
import { i as getAnalyticsData } from "./admin.functions-DatX6ofe.js";
import { RefreshCw } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar, LineChart, Line, AreaChart, Area } from "recharts";
import "@tanstack/react-router";
import "react";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
import "sonner";
import "ai";
import "./ai-gateway.server-DLub9oIv.js";
import "@ai-sdk/openai-compatible";
import "node:crypto";
import "./server-CYaDwdxI.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-BnYhSKH5.js";
import "./supabase.server-BXfiGlvE.js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "zod";
import "framer-motion";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "gsap";
import "./admin-middleware-BXR6OyWJ.js";
const ACTIVE_VS_INACTIVE = [{
  name: "Active (Weekly Login)",
  value: 890
}, {
  name: "Semi-Active (1-2 Logins)",
  value: 180
}, {
  name: "Inactive (7+ Days)",
  value: 70
}];
const DEPT_ENGAGEMENT = [{
  dept: "CSE",
  studyHours: 340,
  aiQueries: 1450
}, {
  dept: "ECE",
  studyHours: 280,
  aiQueries: 980
}, {
  dept: "ISE",
  studyHours: 260,
  aiQueries: 1100
}, {
  dept: "MECH",
  studyHours: 190,
  aiQueries: 620
}, {
  dept: "CIVIL",
  studyHours: 150,
  aiQueries: 480
}, {
  dept: "MCA",
  studyHours: 290,
  aiQueries: 1350
}];
const DAILY_STUDY_TIME = [{
  day: "Mon",
  avgHours: 3.8
}, {
  day: "Tue",
  avgHours: 4.2
}, {
  day: "Wed",
  avgHours: 4.5
}, {
  day: "Thu",
  avgHours: 4.1
}, {
  day: "Fri",
  avgHours: 3.9
}, {
  day: "Sat",
  avgHours: 2.4
}, {
  day: "Sun",
  avgHours: 2.1
}];
const AI_FEATURE_USAGE = [{
  name: "AI Assistant",
  value: 45
}, {
  name: "Resume Tailorer",
  value: 35
}, {
  name: "Classroom",
  value: 20
}];
const PLATFORM_GROWTH = [{
  month: "Jan",
  users: 450,
  retentionPct: 82
}, {
  month: "Feb",
  users: 620,
  retentionPct: 85
}, {
  month: "Mar",
  users: 780,
  retentionPct: 88
}, {
  month: "Apr",
  users: 950,
  retentionPct: 90
}, {
  month: "May",
  users: 1100,
  retentionPct: 91
}, {
  month: "Jun",
  users: 1250,
  retentionPct: 93
}];
const CHART_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];
function AdminAnalyticsPage() {
  const analyticsFn = useServerFn(getAnalyticsData);
  const {
    data,
    refetch
  } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: () => analyticsFn()
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-white tracking-tight", children: "Academic Analytics & Intelligence" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Data visualizations of active retention, department-wise engagement, study duration trends, and platform usage metrics." })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => refetch(), className: "flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 hover:bg-slate-800 transition-colors", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
        " Refresh Analytics"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "pb-3 border-b border-slate-800 mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-black uppercase tracking-wider text-slate-300", children: "Active vs Inactive Students" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: "Distribution by recent platform logins" })
        ] }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 210, children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: ACTIVE_VS_INACTIVE, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 75, paddingAngle: 4, dataKey: "value", children: ACTIVE_VS_INACTIVE.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            borderRadius: 10,
            fontSize: 12
          } })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 mt-2 text-xs", children: ACTIVE_VS_INACTIVE.map((d, i) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/60 p-2 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full shrink-0", style: {
              backgroundColor: CHART_COLORS[i]
            } }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-300 font-bold truncate", children: d.name })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-mono text-sm font-black text-white mt-1", children: d.value })
        ] }, d.name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "pb-3 border-b border-slate-800 mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-black uppercase tracking-wider text-slate-300", children: "AI Feature Usage Share" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: "Proportion of AI tools utilized by students" })
        ] }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 210, children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: AI_FEATURE_USAGE, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 75, paddingAngle: 4, dataKey: "value", children: AI_FEATURE_USAGE.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            borderRadius: 10,
            fontSize: 12
          } })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 mt-2 text-xs", children: AI_FEATURE_USAGE.slice(0, 3).map((d, i) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/60 p-2 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full shrink-0", style: {
              backgroundColor: CHART_COLORS[i]
            } }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-300 font-bold truncate", children: d.name })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "font-mono text-sm font-black text-white mt-1", children: [
            d.value,
            "%"
          ] })
        ] }, d.name)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "pb-3 border-b border-slate-800 mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-black uppercase tracking-wider text-slate-300", children: "Most Active Departments" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: "Total study hours & AI queries per department" })
        ] }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs(BarChart, { data: DEPT_ENGAGEMENT, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e293b" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "dept", tick: {
            fontSize: 11,
            fill: "#94a3b8"
          } }),
          /* @__PURE__ */ jsx(YAxis, { tick: {
            fontSize: 11,
            fill: "#94a3b8"
          } }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            borderRadius: 10,
            fontSize: 12
          } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "studyHours", fill: "#3b82f6", radius: [4, 4, 0, 0], name: "Study Hours" }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "aiQueries", fill: "#8b5cf6", radius: [4, 4, 0, 0], name: "AI Queries" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "pb-3 border-b border-slate-800 mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-black uppercase tracking-wider text-slate-300", children: "Average Daily Study Time" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: "Average hours spent per student per day" })
        ] }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs(LineChart, { data: DAILY_STUDY_TIME, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e293b" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "day", tick: {
            fontSize: 11,
            fill: "#94a3b8"
          } }),
          /* @__PURE__ */ jsx(YAxis, { tick: {
            fontSize: 11,
            fill: "#94a3b8"
          } }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            borderRadius: 10,
            fontSize: 12
          } }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "avgHours", stroke: "#10b981", strokeWidth: 3, dot: {
            r: 5
          }, name: "Avg Hours" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "pb-3 border-b border-slate-800 mb-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-black uppercase tracking-wider text-slate-300", children: "Platform Growth & Student Retention" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: "6-month growth curve and 30-day student retention rate" })
      ] }),
      /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs(AreaChart, { data: PLATFORM_GROWTH, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorGrowth", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#6366f1", stopOpacity: 0.4 }),
          /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#6366f1", stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e293b" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "month", tick: {
          fontSize: 11,
          fill: "#94a3b8"
        } }),
        /* @__PURE__ */ jsx(YAxis, { tick: {
          fontSize: 11,
          fill: "#94a3b8"
        } }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          backgroundColor: "#0f172a",
          borderColor: "#334155",
          borderRadius: 10,
          fontSize: 12
        } }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "users", stroke: "#6366f1", fill: "url(#colorGrowth)", strokeWidth: 2.5, name: "Total Headcount" }),
        /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "retentionPct", stroke: "#f59e0b", strokeWidth: 2.5, name: "Retention Rate (%)" })
      ] }) })
    ] })
  ] });
}
export {
  AdminAnalyticsPage as component
};
