import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-BYlyULqi.js";
import { l as listStudents } from "./studentos.functions-Ue8fd_EQ.js";
import { useState } from "react";
import { BookOpen, MessageSquare, Clock, TrendingUp, ChevronDown, ChevronRight, Eye, Code, FileText } from "lucide-react";
import "@tanstack/react-router";
import "./server-ClIdw9oM.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DcSfQrdP.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
function mockEngagement(student) {
  return {
    notesUploaded: Math.floor(Math.random() * 12),
    notesViewed: Math.floor(Math.random() * 40) + 5,
    aiQueries: Math.floor(Math.random() * 80) + 10,
    labAttempts: Math.floor(Math.random() * 15),
    assignmentsDone: Math.floor(Math.random() * 10),
    studyHours: Math.floor(Math.random() * 40) + 10,
    weeklyActive: Math.floor(Math.random() * 5) + 1,
    completionPct: Math.floor(Math.random() * 50) + 40
  };
}
function EngagementBar({
  value,
  max = 100,
  color = "bg-blue-500"
}) {
  const pct = Math.min(value / max * 100, 100);
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full ${color} rounded-full transition-all`, style: {
      width: `${pct}%`
    } }) }),
    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-slate-500 w-8 text-right", children: value })
  ] });
}
function AcademicMonitoring() {
  const listFn = useServerFn(listStudents);
  const {
    data: students = [],
    isLoading
  } = useQuery({
    queryKey: ["adminStudentList"],
    queryFn: () => listFn({
      data: {}
    })
  });
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState("studyHours");
  const enriched = students.map((s) => ({
    ...s,
    ...mockEngagement()
  }));
  const sorted = [...enriched].sort((a, b) => b[sortBy] - a[sortBy]);
  const totals = {
    totalNotes: enriched.reduce((acc, s) => acc + s.notesUploaded, 0),
    totalAI: enriched.reduce((acc, s) => acc + s.aiQueries, 0),
    totalHours: enriched.reduce((acc, s) => acc + s.studyHours, 0),
    avgCompletion: enriched.length > 0 ? Math.round(enriched.reduce((acc, s) => acc + s.completionPct, 0) / enriched.length) : 0
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-extrabold text-slate-800 dark:text-slate-100", children: "Academic Monitoring" }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 mt-0.5", children: "Read-only view of all student academic engagement and platform usage." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [{
      label: "Notes Uploaded",
      value: totals.totalNotes,
      icon: BookOpen,
      color: "bg-blue-600"
    }, {
      label: "AI Queries",
      value: totals.totalAI,
      icon: MessageSquare,
      color: "bg-violet-600"
    }, {
      label: "Study Hours",
      value: totals.totalHours,
      icon: Clock,
      color: "bg-emerald-500"
    }, {
      label: "Avg Completion",
      value: `${totals.avgCompletion}%`,
      icon: TrendingUp,
      color: "bg-amber-500"
    }].map((s) => /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: `h-9 w-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`, children: /* @__PURE__ */ jsx(s.icon, { className: "h-4.5 w-4.5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xl font-extrabold text-slate-800 dark:text-slate-100", children: s.value }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400", children: s.label })
      ] })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Sort by:" }),
      [["studyHours", "Study Hours"], ["aiQueries", "AI Queries"], ["notesUploaded", "Notes"], ["completionPct", "Completion"]].map(([k, label]) => /* @__PURE__ */ jsx("button", { onClick: () => setSortBy(k), className: `text-[10px] font-semibold px-3 py-1.5 rounded-full transition-colors ${sortBy === k ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`, children: label }, k))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50", children: ["Student", "Dept / Sem", "Study Hours", "AI Queries", "Notes Uploaded", "Assignments", "Completion", ""].map((h) => /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500", children: h }, h)) }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-800", children: sorted.map((student) => /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsx("div", { className: "h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-white text-[9px] font-bold", children: student.name?.charAt(0) }) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-slate-800 dark:text-slate-200", children: student.name })
            ] }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-xs text-slate-500", children: [
              student.department,
              " · Sem ",
              student.semester
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 w-32", children: /* @__PURE__ */ jsx(EngagementBar, { value: student.studyHours, max: 80, color: "bg-emerald-500" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 w-32", children: /* @__PURE__ */ jsx(EngagementBar, { value: student.aiQueries, max: 150, color: "bg-violet-500" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 w-32", children: /* @__PURE__ */ jsx(EngagementBar, { value: student.notesUploaded, max: 20, color: "bg-blue-500" }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 font-bold", children: [
              student.assignmentsDone,
              " done"
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 w-32", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-amber-500 rounded-full", style: {
                width: `${student.completionPct}%`
              } }) }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-slate-500", children: [
                student.completionPct,
                "%"
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("button", { onClick: () => setExpanded(expanded === student.id ? null : student.id), className: "p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors", children: expanded === student.id ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }) }) })
          ] }, student.id),
          expanded === student.id && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-4 pb-4 bg-slate-50 dark:bg-slate-800/30", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-3 pt-3", children: [{
            label: "Notes Viewed",
            value: student.notesViewed,
            icon: Eye
          }, {
            label: "Lab Attempts",
            value: student.labAttempts,
            icon: Code
          }, {
            label: "Assignments",
            value: student.assignmentsDone,
            icon: FileText
          }, {
            label: "Weekly Active Days",
            value: `${student.weeklyActive}/7`,
            icon: TrendingUp
          }].map((item) => /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center", children: [
            /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4 text-blue-500 mx-auto mb-1" }),
            /* @__PURE__ */ jsx("p", { className: "text-base font-extrabold text-slate-800 dark:text-slate-100", children: item.value }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-400", children: item.label })
          ] }, item.label)) }) }) }, `${student.id}-detail`)
        ] })) })
      ] }),
      !isLoading && sorted.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-32 text-slate-400", children: [
        /* @__PURE__ */ jsx(Eye, { className: "h-6 w-6 mb-2 opacity-40" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs", children: "No student data available" })
      ] })
    ] })
  ] });
}
export {
  AcademicMonitoring as component
};
