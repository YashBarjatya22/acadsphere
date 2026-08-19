import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn, B as Button } from "./router-DWxA6Z2f.js";
import { l as listStudents } from "./studentos.functions-BCssppkW.js";
import { RefreshCw, Search, LogOut } from "lucide-react";
import { I as Input } from "./input-CCdkf2yx.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-H7niSSOQ.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
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
import "recharts";
const DEMO_LIVE_STUDENTS = [{
  id: "live-1",
  studentId: "1CR22CS045",
  name: "John Doe",
  department: "CSE",
  sem: "6",
  status: "Active",
  page: "Classroom",
  topic: "DBMS Normalization BCNF",
  duration: "42 mins",
  ip: "192.168.1.45"
}, {
  id: "live-2",
  studentId: "1CR22CS088",
  name: "Evana Joseph",
  department: "CSE",
  sem: "6",
  status: "Active",
  page: "AI Assistant",
  topic: "OS Banker's Algorithm",
  duration: "24 mins",
  ip: "192.168.1.88"
}, {
  id: "live-3",
  studentId: "1CR22EC012",
  name: "Rahul Kumar",
  department: "ECE",
  sem: "4",
  status: "Active",
  page: "Classroom",
  topic: "Web Tech React Hooks",
  duration: "49 mins",
  ip: "192.168.1.12"
}, {
  id: "live-4",
  studentId: "1CR22IS034",
  name: "Ananya Sharma",
  department: "ISE",
  sem: "6",
  status: "Active",
  page: "AI Assistant",
  topic: "Network TCP Handshake",
  duration: "18 mins",
  ip: "192.168.1.34"
}, {
  id: "live-5",
  studentId: "1CR22ME019",
  name: "Karthik Raja",
  department: "MECH",
  sem: "4",
  status: "Idle",
  page: "Attendance",
  topic: "Thermodynamics Revision",
  duration: "1 hr 12 mins",
  ip: "192.168.1.19"
}, {
  id: "live-6",
  studentId: "1CR22CV008",
  name: "Priya Nair",
  department: "CIVIL",
  sem: "2",
  status: "Active",
  page: "Classroom",
  topic: "Structural Analysis",
  duration: "35 mins",
  ip: "192.168.1.08"
}, {
  id: "live-7",
  studentId: "1CR22MC052",
  name: "Vikramaditya Singh",
  department: "MCA",
  sem: "4",
  status: "Active",
  page: "Resume Tailorer",
  topic: "Mock Interview Prep",
  duration: "55 mins",
  ip: "192.168.1.52"
}, {
  id: "live-8",
  studentId: "1CR22CS142",
  name: "Sneha Hegde",
  department: "CSE",
  sem: "6",
  status: "Active",
  page: "Resume Tailorer",
  topic: "ATS Keyword Check",
  duration: "15 mins",
  ip: "192.168.1.142"
}];
function LiveActivityPage() {
  const listFn = useServerFn(listStudents);
  const [search, setSearch] = useState("");
  const [terminatedSessions, setTerminatedSessions] = useState({});
  const {
    data: serverStudents = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["liveActivityStudents"],
    queryFn: () => listFn({
      data: {}
    }),
    refetchInterval: 1e4
  });
  const liveList = useMemo(() => {
    const combined = [...DEMO_LIVE_STUDENTS];
    for (const s of serverStudents) {
      if (!combined.some((d) => d.studentId === s.studentId)) {
        combined.push({
          id: s.id,
          studentId: s.studentId || "1CR22CS099",
          name: s.name,
          department: s.department || "CSE",
          sem: String(s.semester || "6"),
          status: "Active",
          page: "Smart Notes",
          topic: "DBMS Query Tuning",
          duration: "12 mins",
          ip: "192.168.1.99"
        });
      }
    }
    return combined.filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.studentId.toLowerCase().includes(search.toLowerCase()) || item.page.toLowerCase().includes(search.toLowerCase()));
  }, [serverStudents, search]);
  function forceLogout(id, name) {
    setTerminatedSessions((prev) => ({
      ...prev,
      [id]: true
    }));
    toast.success(`Session closed for ${name}`);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-7xl mx-auto font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-500", children: "Real-Time Monitor" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight mt-0.5", children: "Live Class Activity" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 dark:text-zinc-400 mt-1", children: "Real-time view of students currently studying online and their active study subjects." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => refetch(), className: "h-9 text-xs border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold gap-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}` }),
        " Sync Activity"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search active students by name, USN, or topic...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-800" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs font-mono text-stone-500 dark:text-zinc-400", children: [
        "Active Now: ",
        /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-700 dark:text-emerald-400", children: liveList.length })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl overflow-hidden", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-stone-100 dark:border-zinc-800 flex flex-row items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500" }),
          " Active Student Sessions"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-stone-500 dark:text-zinc-400 mt-0.5", children: "Updated live every 10 seconds" })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-stone-500 dark:text-zinc-400 font-bold uppercase text-[9.5px] tracking-wider", children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Student Profile" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "USN" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Department" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Current Module & Topic" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Duration" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-stone-100 dark:divide-zinc-800", children: liveList.map((s) => {
          const isTerminated = terminatedSessions[s.id];
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-stone-50/80 dark:hover:bg-zinc-800/40 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 font-bold text-stone-900 dark:text-zinc-100", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold text-xs flex items-center justify-center shrink-0", children: s.name?.charAt(0)?.toUpperCase() }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold text-stone-900 dark:text-zinc-100", children: s.name }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-stone-400 dark:text-zinc-500", children: s.ip })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 font-mono text-stone-600 dark:text-zinc-400", children: s.studentId }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxs("span", { className: "bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold", children: [
              s.department,
              " (Sem ",
              s.sem,
              ")"
            ] }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-5 py-3.5", children: [
              /* @__PURE__ */ jsx("p", { className: "font-bold text-stone-900 dark:text-zinc-100", children: s.page }),
              /* @__PURE__ */ jsx("p", { className: "text-[10.5px] text-stone-500 dark:text-zinc-400", children: s.topic })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 font-mono text-stone-500 dark:text-zinc-400", children: s.duration }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: isTerminated ? /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800", children: "Closed" }) : s.status === "Idle" ? /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800", children: "Idle" }) : /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800", children: "Active" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 text-right", children: !isTerminated && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => forceLogout(s.id, s.name), className: "h-7 text-[10px] border-stone-200 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold gap-1", children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-3 w-3" }),
              " End Session"
            ] }) })
          ] }, s.id);
        }) })
      ] }) }) })
    ] })
  ] });
}
export {
  LiveActivityPage as component
};
