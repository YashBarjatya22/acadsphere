import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-CzYOcfyh.js";
import { C as ChatLayout } from "./ChatLayout-sTEV38C2.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./card-Cwsrt9M1.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { T as Textarea } from "./textarea-bZdI8Am0.js";
import { toast } from "sonner";
import { g as generateLabCode } from "./viva-lab.functions-D5SuWx4S.js";
import { FlaskConical, Clock, CheckCircle2, Code, Bell, CheckSquare, ChevronRight, FileCode, Loader2, Sparkles, BookOpen, Copy, Terminal, AlertCircle, RefreshCw, Calendar, BellRing, Check, ArrowRight } from "lucide-react";
import "@tanstack/react-router";
import "./server-CeiC96WD.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CZBfFAiY.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "./client-h4N4kZKq.js";
import "./studentos-logo-CCLo3MN1.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
const SUBJECTS = [{
  value: "Database Management Systems",
  label: "DBMS",
  icon: "🗄️",
  color: "from-violet-500 to-purple-600"
}, {
  value: "Computer Networks",
  label: "Networks",
  icon: "🌐",
  color: "from-blue-500 to-cyan-600"
}, {
  value: "Operating Systems",
  label: "OS",
  icon: "⚙️",
  color: "from-orange-500 to-amber-600"
}, {
  value: "Data Structures",
  label: "DSA",
  icon: "🌳",
  color: "from-emerald-500 to-teal-600"
}, {
  value: "Python Programming",
  label: "Python",
  icon: "🐍",
  color: "from-yellow-500 to-green-600"
}, {
  value: "Web Development",
  label: "Web Dev",
  icon: "🌍",
  color: "from-pink-500 to-rose-600"
}];
const LANGUAGES = ["auto", "SQL", "Python", "C", "Java", "JavaScript", "Bash"];
const QUICK_TEMPLATES = [{
  subject: "Database Management Systems",
  title: "Student Enrollment DB",
  desc: "Create tables, foreign keys, write INNER JOIN queries & triggers",
  icon: "🗄️"
}, {
  subject: "Operating Systems",
  title: "Banker's Algorithm in C",
  desc: "Simulate deadlock avoidance with allocation & max matrices",
  icon: "⚙️"
}, {
  subject: "Computer Networks",
  title: "TCP Socket Server in C",
  desc: "Client-server TCP socket connection with multi-threaded echo",
  icon: "🌐"
}, {
  subject: "Data Structures",
  title: "Binary Search Tree Traversal",
  desc: "Insert, delete, in-order/pre-order traversals in Python/Java",
  icon: "🌳"
}, {
  subject: "Python Programming",
  title: "CSV Data Analysis & Plotting",
  desc: "Read student grades CSV, calculate mean/variance & plot histogram",
  icon: "🐍"
}];
const INITIAL_SCHEDULE = [{
  id: "lab-1",
  subject: "DBMS Lab",
  labName: "Database Systems Lab (CS305P)",
  dayTime: "Tomorrow, 10:00 AM – 1:00 PM",
  room: "Lab 3, CS Block",
  instructor: "Dr. Rajesh K.",
  dueDate: "Tomorrow at 1:00 PM",
  reminderActive: true,
  status: "Upcoming",
  experimentCount: "Exp 4: ER Diagram to Relational Schema"
}, {
  id: "lab-2",
  subject: "OS Lab",
  labName: "Operating Systems Lab (CS306P)",
  dayTime: "Friday, 2:00 PM – 5:00 PM",
  room: "Advanced OS Computing Center",
  instructor: "Prof. Ananya Sen",
  dueDate: "July 26, 2026",
  reminderActive: true,
  status: "Pending Submission",
  experimentCount: "Exp 5: Process Synchronization using Semaphores"
}, {
  id: "lab-3",
  subject: "Networks Lab",
  labName: "Computer Networks Lab (CS307P)",
  dayTime: "Monday, 11:30 AM – 2:30 PM",
  room: "Network Systems Lab 2",
  instructor: "Dr. Suresh V.",
  dueDate: "July 29, 2026",
  reminderActive: false,
  status: "Upcoming",
  experimentCount: "Exp 3: CRC Error Detection Algorithm"
}];
const INITIAL_EXPERIMENTS = [{
  expNum: 1,
  title: "DDL & DML Commands in SQL",
  subject: "DBMS",
  completed: true,
  notesReady: true,
  codeReady: true
}, {
  expNum: 2,
  title: "Complex SQL Joins & Subqueries",
  subject: "DBMS",
  completed: true,
  notesReady: true,
  codeReady: true
}, {
  expNum: 3,
  title: "Views, Indexes & Stored Procedures",
  subject: "DBMS",
  completed: true,
  notesReady: true,
  codeReady: true
}, {
  expNum: 4,
  title: "Student Enrollment Database & Triggers",
  subject: "DBMS",
  completed: false,
  notesReady: true,
  codeReady: true
}, {
  expNum: 5,
  title: "FCFS & SJF CPU Scheduling Algorithms",
  subject: "OS",
  completed: true,
  notesReady: true,
  codeReady: true
}, {
  expNum: 6,
  title: "Banker's Deadlock Avoidance Algorithm",
  subject: "OS",
  completed: false,
  notesReady: true,
  codeReady: false
}, {
  expNum: 7,
  title: "TCP Socket Client-Server Communication",
  subject: "Networks",
  completed: true,
  notesReady: true,
  codeReady: true
}, {
  expNum: 8,
  title: "Distance Vector Routing Simulation",
  subject: "Networks",
  completed: false,
  notesReady: false,
  codeReady: false
}];
function LabHelperPage() {
  const [activeTab, setActiveTab] = useState("helper");
  const [subject, setSubject] = useState("Database Management Systems");
  const [language, setLanguage] = useState("SQL");
  const [exerciseText, setExerciseText] = useState("Student Enrollment Database: Create tables (STUDENT, COURSE, ENROLLMENT), write INNER JOIN queries to calculate student GPA, and add a BEFORE INSERT trigger to validate credit limits.");
  const [result, setResult] = useState({
    language: "SQL",
    code: `-- Student Enrollment Database Schema & Sample Solution
CREATE TABLE STUDENT (
    USN VARCHAR(10) PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Dept VARCHAR(10),
    Semester INT CHECK (Semester BETWEEN 1 AND 8)
);

CREATE TABLE COURSE (
    CourseID VARCHAR(10) PRIMARY KEY,
    Title VARCHAR(50) NOT NULL,
    Credits INT CHECK (Credits > 0)
);

CREATE TABLE ENROLLMENT (
    USN VARCHAR(10),
    CourseID VARCHAR(10),
    Grade CHAR(2),
    PRIMARY KEY (USN, CourseID),
    FOREIGN KEY (USN) REFERENCES STUDENT(USN) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES COURSE(CourseID)
);

-- Step 1: Calculate Total Credits per Student
SELECT S.USN, S.Name, SUM(C.Credits) AS TotalCredits
FROM STUDENT S
JOIN ENROLLMENT E ON S.USN = E.USN
JOIN COURSE C ON E.CourseID = C.CourseID
GROUP BY S.USN, S.Name;

-- Step 2: Trigger to Prevent Over-Enrollment (>25 Credits)
DELIMITER //
CREATE TRIGGER CheckCreditLimit
BEFORE INSERT ON ENROLLMENT
FOR EACH ROW
BEGIN
    DECLARE total_credits INT;
    SELECT IFNULL(SUM(C.Credits), 0) INTO total_credits
    FROM ENROLLMENT E JOIN COURSE C ON E.CourseID = C.CourseID
    WHERE E.USN = NEW.USN;

    IF total_credits > 25 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Credit limit exceeded: Student cannot enroll in more than 25 credits';
    END IF;
END; //
DELIMITER ;`,
    explanation: "This solution defines the student-course schema with integrity constraints, joins tables for credit summaries, and adds a MySQL trigger to enforce credit limit rules.",
    testCases: "Input: INSERT into ENROLLMENT USN='1CR22CS045', CourseID='CS301'\nExpected Output: Query OK, 1 row affected. Credit total updated cleanly.",
    notes: "Run DDL statements first before creating the trigger. In SQLite, use standard CHECK constraints."
  });
  const [copied, setCopied] = useState(false);
  const [scheduleItems, setScheduleItems] = useState(INITIAL_SCHEDULE);
  const [experiments, setExperiments] = useState(INITIAL_EXPERIMENTS);
  const generateFn = useServerFn(generateLabCode);
  const generate = useMutation({
    mutationFn: () => generateFn({
      data: {
        subject,
        exerciseDescription: exerciseText,
        language
      }
    }),
    onSuccess: (res) => {
      setResult(res);
      toast.success("Lab code and procedure generated!");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to generate lab response. Please try again.");
    }
  });
  const handleGenerate = (e) => {
    e.preventDefault();
    if (!exerciseText.trim()) {
      toast.warning("Please describe your lab exercise first.");
      return;
    }
    generate.mutate();
  };
  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      toast.success("Lab code copied to clipboard!");
      setTimeout(() => setCopied(false), 2e3);
    }
  };
  const applyTemplate = (t) => {
    setSubject(t.subject);
    setExerciseText(`${t.title}: ${t.desc}`);
    setActiveTab("helper");
  };
  const toggleReminder = (id) => {
    setScheduleItems((prev) => prev.map((item) => {
      if (item.id === id) {
        const nextState = !item.reminderActive;
        if (nextState) {
          toast.success(`Reminder enabled for ${item.labName}`);
        } else {
          toast.info(`Reminder disabled for ${item.labName}`);
        }
        return {
          ...item,
          reminderActive: nextState
        };
      }
      return item;
    }));
  };
  const toggleExperimentComplete = (expNum) => {
    setExperiments((prev) => prev.map((exp) => {
      if (exp.expNum === expNum) {
        const next = !exp.completed;
        toast.success(next ? `Experiment ${expNum} marked as Completed!` : `Experiment ${expNum} marked as Pending`);
        return {
          ...exp,
          completed: next
        };
      }
      return exp;
    }));
  };
  const completedCount = experiments.filter((e) => e.completed).length;
  const progressPct = Math.round(completedCount / experiments.length * 100);
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full bg-background text-foreground flex flex-col transition-colors duration-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden px-6 py-5 border-b border-border shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20", children: /* @__PURE__ */ jsx(FlaskConical, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("h1", { className: "text-base font-extrabold tracking-tight", children: "Lab Helper & Reminders" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-orange-500/20", children: "Smart Assistant" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: "Lab schedule reminders, step-by-step experiment walkthroughs, and code verifiers" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-20 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("reminders"), className: "flex items-center gap-2 bg-card border border-border hover:border-amber-500/50 px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer text-left group", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-wider text-muted-foreground font-bold", children: "Next Lab" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-foreground", children: "Tomorrow, 10:00 AM" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("tracker"), className: "flex items-center gap-2 bg-card border border-border hover:border-emerald-500/50 px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer text-left group", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-500 group-hover:scale-110 transition-transform" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-wider text-muted-foreground font-bold", children: "Progress" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-bold text-foreground", children: [
                completedCount,
                "/",
                experiments.length,
                " Experiments (",
                progressPct,
                "%)"
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-20 flex items-center gap-2 mt-4 pt-3 border-t border-border/40 overflow-x-auto scrollbar-none", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("helper"), className: `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${activeTab === "helper" ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30" : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsx(Code, { className: "h-4 w-4" }),
          " Experiment Helper & Code Engine"
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("reminders"), className: `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0 relative ${activeTab === "reminders" ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30" : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }),
          " Lab Schedule & Reminders",
          /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-amber-500 animate-pulse" })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setActiveTab("tracker"), className: `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${activeTab === "tracker" ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30" : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsx(CheckSquare, { className: "h-4 w-4" }),
          " Lab Manual Completion Tracker"
        ] })
      ] })
    ] }),
    activeTab === "helper" && /* @__PURE__ */ jsxs("div", { className: "flex-1 flex overflow-hidden", children: [
      /* @__PURE__ */ jsxs("aside", { className: "w-80 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xs font-bold text-foreground uppercase tracking-wider mb-1", children: "Lab Experiment Setup" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground leading-relaxed", children: "Select your lab subject, describe the exercise or choose a pre-configured template." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold text-muted-foreground uppercase", children: "Target Subject" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1.5", children: SUBJECTS.map((s) => /* @__PURE__ */ jsxs("button", { onClick: () => setSubject(s.value), className: `flex items-center gap-1.5 px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${subject === s.value ? "bg-primary/10 border-primary/30 text-primary shadow-xs" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsx("span", { children: s.icon }),
            " ",
            s.label
          ] }, s.value)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold text-muted-foreground uppercase", children: "Target Language" }),
          /* @__PURE__ */ jsx("select", { value: language, onChange: (e) => setLanguage(e.target.value), className: "w-full h-9 text-xs bg-muted/40 border border-border rounded-lg px-2 font-medium mt-1 focus:outline-none focus:ring-1 focus:ring-primary", children: LANGUAGES.map((l) => /* @__PURE__ */ jsx("option", { value: l, children: l === "auto" ? "Auto-detect (recommended)" : l }, l)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold text-muted-foreground uppercase", children: "Quick Experiment Templates" }),
          QUICK_TEMPLATES.map((t, i) => /* @__PURE__ */ jsxs("button", { onClick: () => applyTemplate(t), className: "w-full text-left p-2.5 rounded-xl border border-border bg-muted/10 hover:bg-muted/40 hover:border-primary/30 transition-all group", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-foreground flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { children: t.icon }),
                " ",
                t.title
              ] }),
              /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground mt-0.5 line-clamp-2", children: t.desc })
          ] }, i))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-muted/10", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-xs", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-border/60", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(FileCode, { className: "h-3.5 w-3.5 text-orange-500" }),
              " Experiment Description & Task"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-muted-foreground", children: [
              "Subject: ",
              subject
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleGenerate, className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Textarea, { placeholder: `Describe your lab exercise in detail...

Example: "Write a C program for Producer-Consumer problem using Semaphores and Mutex locks with multi-threading."`, value: exerciseText, onChange: (e) => setExerciseText(e.target.value), className: "h-32 text-xs bg-muted/30 border-border resize-none focus:ring-1 focus:ring-primary", required: true }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                exerciseText.length,
                " / 2000 characters"
              ] }),
              /* @__PURE__ */ jsx(Button, { type: "submit", disabled: generate.isPending, className: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs h-9 px-5 shadow-sm", children: generate.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }),
                " Generating Solution..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 mr-1.5" }),
                " Generate Lab Solution"
              ] }) })
            ] })
          ] }) })
        ] }),
        result && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          result.explanation && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-blue-500/20 bg-blue-500/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(BookOpen, { className: "h-3.5 w-3.5" }),
                " Step 1: Theoretical Approach & Concept"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-mono font-bold", children: "Verified" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground leading-relaxed", children: result.explanation })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card shadow-xs overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-red-400" }),
                  /* @__PURE__ */ jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-amber-400" }),
                  /* @__PURE__ */ jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-emerald-400" })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-muted-foreground uppercase", children: [
                  "Step 2: ",
                  result.language,
                  " Solution Code"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: handleCopy, className: `flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border transition-all ${copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground border-border hover:text-foreground"}`, children: [
                copied ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
                copied ? "Copied to Clipboard!" : "Copy Code"
              ] })
            ] }),
            /* @__PURE__ */ jsx("pre", { className: "p-4 text-[11px] font-mono leading-relaxed overflow-x-auto text-foreground whitespace-pre-wrap bg-muted/20 max-h-96 overflow-y-auto", children: result.code })
          ] }),
          result.testCases && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Terminal, { className: "h-3.5 w-3.5" }),
              " Step 3: Test Cases & Expected Execution Output"
            ] }),
            /* @__PURE__ */ jsx("pre", { className: "text-[11px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed bg-background/50 p-2.5 rounded-lg border border-emerald-500/10", children: result.testCases })
          ] }),
          result.notes && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-500/20 bg-amber-500/5 p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
              " Step 4: Lab Manual Submission Notes & Gotchas"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground leading-relaxed", children: result.notes })
          ] })
        ] })
      ] })
    ] }),
    activeTab === "reminders" && /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6 overflow-y-auto scrollbar-thin space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-foreground uppercase tracking-wider", children: "Weekly Lab Schedule & Deadline Reminders" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Set automatic reminders for your practical sessions, manual sign-offs, and lab exams." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => toast.success("Lab Schedule synced with your Academic Calendar!"), variant: "outline", className: "text-xs font-bold h-8 gap-1.5", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
          " Sync Calendar"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3", children: scheduleItems.map((item) => /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card hover:border-primary/40 transition-all shadow-xs relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 right-0 h-1 ${item.status === "Upcoming" ? "bg-amber-500" : item.status === "Pending Submission" ? "bg-red-500" : "bg-emerald-500"}` }),
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2 pt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground", children: item.subject }),
            /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === "Upcoming" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" : item.status === "Pending Submission" ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`, children: item.status })
          ] }),
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-bold text-foreground mt-2", children: item.labName }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-muted-foreground", children: item.experimentCount })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3 pt-2 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 bg-muted/20 p-2.5 rounded-xl border border-border/60", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-amber-500 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: item.dayTime })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(FlaskConical, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
              /* @__PURE__ */ jsxs("span", { children: [
                item.room,
                " · ",
                item.instructor
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 text-red-500 shrink-0" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Manual Due: ",
                /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: item.dueDate })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-muted-foreground", children: "Push Notifications" }),
            /* @__PURE__ */ jsxs("button", { onClick: () => toggleReminder(item.id), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.reminderActive ? "bg-orange-500 text-white shadow-xs" : "bg-muted text-muted-foreground hover:text-foreground"}`, children: [
              item.reminderActive ? /* @__PURE__ */ jsx(BellRing, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Bell, { className: "h-3.5 w-3.5" }),
              item.reminderActive ? "Reminder Active" : "Set Reminder"
            ] })
          ] })
        ] })
      ] }, item.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(BellRing, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: "Lab Reminder Alert Active" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "You will receive push reminders 12 hours and 1 hour before every lab session & manual submission deadline." })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => toast.success("Test push alert sent!"), size: "sm", variant: "outline", className: "text-xs font-bold h-8", children: "Send Test Alert" })
      ] })
    ] }),
    activeTab === "tracker" && /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6 overflow-y-auto scrollbar-thin space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-foreground uppercase tracking-wider", children: "Semester Lab Manual Completion Tracker" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Track completed lab experiments, verify code readiness, and stay submission-ready." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-card border border-border p-3 rounded-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase font-bold text-muted-foreground", children: "Submission Readiness" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs font-extrabold text-foreground", children: [
              completedCount,
              " of ",
              experiments.length,
              " Experiments Done"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-extrabold text-xs", children: [
            progressPct,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: /* @__PURE__ */ jsx("div", { className: "h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-500", style: {
        width: `${progressPct}%`
      } }) }) }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: experiments.map((exp) => /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between p-4 rounded-xl border transition-all ${exp.completed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border hover:border-primary/30"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3.5", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => toggleExperimentComplete(exp.expNum), className: `h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${exp.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-muted hover:border-primary"}`, children: exp.completed && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase", children: [
                "Exp #",
                exp.expNum,
                " · ",
                exp.subject
              ] }),
              exp.completed ? /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-emerald-600 dark:text-emerald-400", children: "Completed & Verified" }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-amber-600 dark:text-amber-400", children: "Pending Execution" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground mt-1", children: exp.title })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2 text-[10px] font-bold", children: [
            /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded ${exp.notesReady ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"}`, children: exp.notesReady ? "Notes Ready" : "Notes Needed" }),
            /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded ${exp.codeReady ? "bg-purple-500/10 text-purple-500" : "bg-muted text-muted-foreground"}`, children: exp.codeReady ? "Code Ready" : "Code Needed" })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => {
            setSubject(exp.subject === "DBMS" ? "Database Management Systems" : exp.subject === "OS" ? "Operating Systems" : "Computer Networks");
            setExerciseText(`Experiment ${exp.expNum}: ${exp.title}`);
            setActiveTab("helper");
          }, className: "flex items-center gap-1 text-xs font-bold text-primary hover:underline", children: [
            "Open Helper ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
          ] })
        ] })
      ] }, exp.expNum)) })
    ] })
  ] }) });
}
export {
  LabHelperPage as component
};
