import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-B5NaTOOc.js";
import { g as getAdminDashboardStats } from "./admin.functions-Ci8otzb5.js";
import { RefreshCw, Radio, GraduationCap, UserCheck, AlertCircle, ArrowUpRight, Megaphone, ChevronRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar } from "recharts";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-Cwsrt9M1.js";
import { B as Button } from "./button-CUmEMVhO.js";
import "react";
import "./server-CTRvd-y5.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
import "./admin-middleware-x1X5UcOZ.js";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
const DAILY_ACTIVE_DATA = [{
  day: "Mon",
  active: 240,
  logins: 310
}, {
  day: "Tue",
  active: 280,
  logins: 340
}, {
  day: "Wed",
  active: 310,
  logins: 390
}, {
  day: "Thu",
  active: 295,
  logins: 375
}, {
  day: "Fri",
  active: 340,
  logins: 420
}, {
  day: "Sat",
  active: 180,
  logins: 210
}, {
  day: "Sun",
  active: 150,
  logins: 190
}];
const DEPT_ACTIVITY_DATA = [{
  dept: "CSE",
  count: 320
}, {
  dept: "ECE",
  count: 210
}, {
  dept: "ISE",
  count: 180
}, {
  dept: "MECH",
  count: 140
}, {
  dept: "CIVIL",
  count: 95
}, {
  dept: "MCA",
  count: 110
}];
function AdminDashboard() {
  const statsFn = useServerFn(getAdminDashboardStats);
  const {
    data: stats,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => statsFn(),
    refetchInterval: 3e4
  });
  const totalStudents = stats?.totalStudents ?? 1140;
  const onlineStudents = stats?.onlineStudents ?? 342;
  const todayLogins = stats?.todayLogins ?? 485;
  const requiringAttention = stats?.studentsAtRisk ?? Math.floor(totalStudents * 0.12);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-7xl mx-auto font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-500", children: "Institutional Registry" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight mt-0.5", children: "Academic Overview" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 dark:text-zinc-400 mt-1", children: "Current summary of enrolled students, active class sessions, and attendance metrics." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: () => refetch(), variant: "outline", size: "sm", className: "h-9 text-xs border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold gap-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}` }),
          " Sync Feed"
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/admin/live-activity", children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "h-9 text-xs font-bold gap-1.5 bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 shadow-sm hover:bg-stone-800", children: [
          /* @__PURE__ */ jsx(Radio, { className: "h-3.5 w-3.5 text-emerald-400" }),
          " Live Monitor"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Total Enrolled" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-black text-stone-900 dark:text-zinc-100 mt-1", children: totalStudents.toLocaleString() }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-1", children: "↑ +18 this term" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-700 dark:text-zinc-300 shrink-0", children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5" }) })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Active Students" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1", children: onlineStudents }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-stone-500 dark:text-zinc-400 mt-1", children: "Studying on platform" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0", children: /* @__PURE__ */ jsx(Radio, { className: "h-5 w-5" }) })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Today's Logins" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-black text-stone-900 dark:text-zinc-100 mt-1", children: todayLogins }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-stone-500 dark:text-zinc-400 mt-1", children: "42% daily attendance" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-700 dark:text-zinc-300 shrink-0", children: /* @__PURE__ */ jsx(UserCheck, { className: "h-5 w-5" }) })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Needs Support" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-black text-amber-700 dark:text-amber-400 mt-1", children: requiringAttention }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-stone-500 dark:text-zinc-400 mt-1", children: "Low attendance risk" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2 border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Weekly Study Engagement" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-stone-500 dark:text-zinc-400", children: "7-day active user logins and study sessions" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs(AreaChart, { data: DAILY_ACTIVE_DATA, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorNaturalWarm", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#44403c", stopOpacity: 0.12 }),
            /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#44403c", stopOpacity: 0 })
          ] }) }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e7e5e4", vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "day", tick: {
            fontSize: 11,
            fill: "#78716c"
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { tick: {
            fontSize: 11,
            fill: "#78716c"
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            backgroundColor: "#ffffff",
            borderColor: "#e7e5e4",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          } }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "active", stroke: "#292524", fill: "url(#colorNaturalWarm)", strokeWidth: 2, name: "Active Students" })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Department Enrolment" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-stone-500 dark:text-zinc-400", children: "Student headcount by branch" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs(BarChart, { data: DEPT_ACTIVITY_DATA, layout: "vertical", children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e7e5e4", horizontal: false }),
          /* @__PURE__ */ jsx(XAxis, { type: "number", tick: {
            fontSize: 11,
            fill: "#78716c"
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { dataKey: "dept", type: "category", tick: {
            fontSize: 11,
            fill: "#78716c"
          }, axisLine: false, tickLine: false, width: 45 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            backgroundColor: "#ffffff",
            borderColor: "#e7e5e4",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "count", fill: "#44403c", radius: [0, 6, 6, 0], name: "Students" })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2 border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 flex flex-row items-center justify-between border-b border-stone-100 dark:border-zinc-800", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500" }),
              " Active Student Stream"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-stone-500 dark:text-zinc-400 mt-0.5", children: "Students currently studying online" })
          ] }),
          /* @__PURE__ */ jsxs(Link, { to: "/admin/live-activity", className: "text-xs font-bold text-stone-900 dark:text-zinc-100 hover:underline flex items-center gap-1", children: [
            "View All ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-4 space-y-3", children: [{
          name: "John Doe",
          usn: "1CR22CS045",
          dept: "CSE",
          sem: "6",
          status: "Online",
          page: "Classroom",
          login: "9:12 AM",
          session: "42 mins"
        }, {
          name: "Evana Joseph",
          usn: "1CR22CS088",
          dept: "CSE",
          sem: "6",
          status: "Online",
          page: "AI Assistant",
          login: "9:30 AM",
          session: "24 mins"
        }, {
          name: "Rahul Kumar",
          usn: "1CR22EC012",
          dept: "ECE",
          sem: "4",
          status: "Online",
          page: "Resume Tailorer",
          login: "9:05 AM",
          session: "49 mins"
        }].map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold text-xs flex items-center justify-center shrink-0", children: s.name.charAt(0) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-stone-900 dark:text-zinc-100", children: s.name }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-stone-500 dark:text-zinc-400", children: [
                  "(",
                  s.usn,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5", children: [
                s.dept,
                " · Sem ",
                s.sem,
                " — ",
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-stone-800 dark:text-zinc-200", children: s.page })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800", children: s.status }),
            /* @__PURE__ */ jsx("p", { className: "text-stone-500 dark:text-zinc-400 text-[10px] font-mono mt-1", children: s.session })
          ] })
        ] }, s.usn)) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-stone-100 dark:border-zinc-800", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Core Sections" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-4 space-y-2.5", children: [{
          label: "Student Records & Directory",
          icon: GraduationCap,
          to: "/admin/students"
        }, {
          label: "Live Class Monitor",
          icon: Radio,
          to: "/admin/live-activity"
        }, {
          label: "Notice Board & Export Reports",
          icon: Megaphone,
          to: "/admin/announcements"
        }].map((action) => /* @__PURE__ */ jsx(Link, { to: action.to, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "w-full justify-between text-xs h-10 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold hover:bg-stone-100 dark:hover:bg-zinc-800 mb-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(action.icon, { className: "h-4 w-4 shrink-0 text-stone-500" }),
            /* @__PURE__ */ jsx("span", { children: action.label })
          ] }),
          /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5 text-stone-400" })
        ] }) }, action.to)) })
      ] })
    ] })
  ] });
}
export {
  AdminDashboard as component
};
