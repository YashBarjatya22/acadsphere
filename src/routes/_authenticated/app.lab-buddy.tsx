import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generateLabCode } from "@/lib/viva-lab.functions";
import {
  Code, Sparkles, Copy, Terminal,
  FileCode, CheckCircle2, Loader2, AlertCircle, ChevronRight,
  Clock, Bell, BellRing, Calendar, FlaskConical, CheckSquare,
  Layers, BookOpen, Download, ShieldCheck, ArrowRight, Play, Check, RefreshCw
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/lab-buddy")({
  component: LabHelperPage,
});

const SUBJECTS = [
  { value: "Database Management Systems", label: "DBMS", icon: "🗄️", color: "from-violet-500 to-purple-600" },
  { value: "Computer Networks", label: "Networks", icon: "🌐", color: "from-blue-500 to-cyan-600" },
  { value: "Operating Systems", label: "OS", icon: "⚙️", color: "from-orange-500 to-amber-600" },
  { value: "Data Structures", label: "DSA", icon: "🌳", color: "from-emerald-500 to-teal-600" },
  { value: "Python Programming", label: "Python", icon: "🐍", color: "from-yellow-500 to-green-600" },
  { value: "Web Development", label: "Web Dev", icon: "🌍", color: "from-pink-500 to-rose-600" },
];

const LANGUAGES = ["auto", "SQL", "Python", "C", "Java", "JavaScript", "Bash"];

const QUICK_TEMPLATES = [
  { subject: "Database Management Systems", title: "Student Enrollment DB", desc: "Create tables, foreign keys, write INNER JOIN queries & triggers", icon: "🗄️" },
  { subject: "Operating Systems", title: "Banker's Algorithm in C", desc: "Simulate deadlock avoidance with allocation & max matrices", icon: "⚙️" },
  { subject: "Computer Networks", title: "TCP Socket Server in C", desc: "Client-server TCP socket connection with multi-threaded echo", icon: "🌐" },
  { subject: "Data Structures", title: "Binary Search Tree Traversal", desc: "Insert, delete, in-order/pre-order traversals in Python/Java", icon: "🌳" },
  { subject: "Python Programming", title: "CSV Data Analysis & Plotting", desc: "Read student grades CSV, calculate mean/variance & plot histogram", icon: "🐍" },
];

// Demo Lab Sessions & Reminders
interface LabScheduleItem {
  id: string;
  subject: string;
  labName: string;
  dayTime: string;
  room: string;
  instructor: string;
  dueDate: string;
  reminderActive: boolean;
  status: "Upcoming" | "Pending Submission" | "Completed";
  experimentCount: string;
}

const INITIAL_SCHEDULE: LabScheduleItem[] = [
  {
    id: "lab-1",
    subject: "DBMS Lab",
    labName: "Database Systems Lab (CS305P)",
    dayTime: "Tomorrow, 10:00 AM – 1:00 PM",
    room: "Lab 3, CS Block",
    instructor: "Dr. Rajesh K.",
    dueDate: "Tomorrow at 1:00 PM",
    reminderActive: true,
    status: "Upcoming",
    experimentCount: "Exp 4: ER Diagram to Relational Schema",
  },
  {
    id: "lab-2",
    subject: "OS Lab",
    labName: "Operating Systems Lab (CS306P)",
    dayTime: "Friday, 2:00 PM – 5:00 PM",
    room: "Advanced OS Computing Center",
    instructor: "Prof. Ananya Sen",
    dueDate: "July 26, 2026",
    reminderActive: true,
    status: "Pending Submission",
    experimentCount: "Exp 5: Process Synchronization using Semaphores",
  },
  {
    id: "lab-3",
    subject: "Networks Lab",
    labName: "Computer Networks Lab (CS307P)",
    dayTime: "Monday, 11:30 AM – 2:30 PM",
    room: "Network Systems Lab 2",
    instructor: "Dr. Suresh V.",
    dueDate: "July 29, 2026",
    reminderActive: false,
    status: "Upcoming",
    experimentCount: "Exp 3: CRC Error Detection Algorithm",
  },
];

// Demo Semester Lab Experiments Tracker
interface LabExperiment {
  expNum: number;
  title: string;
  subject: string;
  completed: boolean;
  notesReady: boolean;
  codeReady: boolean;
}

const INITIAL_EXPERIMENTS: LabExperiment[] = [
  { expNum: 1, title: "DDL & DML Commands in SQL", subject: "DBMS", completed: true, notesReady: true, codeReady: true },
  { expNum: 2, title: "Complex SQL Joins & Subqueries", subject: "DBMS", completed: true, notesReady: true, codeReady: true },
  { expNum: 3, title: "Views, Indexes & Stored Procedures", subject: "DBMS", completed: true, notesReady: true, codeReady: true },
  { expNum: 4, title: "Student Enrollment Database & Triggers", subject: "DBMS", completed: false, notesReady: true, codeReady: true },
  { expNum: 5, title: "FCFS & SJF CPU Scheduling Algorithms", subject: "OS", completed: true, notesReady: true, codeReady: true },
  { expNum: 6, title: "Banker's Deadlock Avoidance Algorithm", subject: "OS", completed: false, notesReady: true, codeReady: false },
  { expNum: 7, title: "TCP Socket Client-Server Communication", subject: "Networks", completed: true, notesReady: true, codeReady: true },
  { expNum: 8, title: "Distance Vector Routing Simulation", subject: "Networks", completed: false, notesReady: false, codeReady: false },
];

interface GeneratedResult {
  language: string;
  code: string;
  explanation: string;
  testCases: string;
  notes: string;
}

function LabHelperPage() {
  const [activeTab, setActiveTab] = useState<"helper" | "reminders" | "tracker">("helper");
  const [subject, setSubject] = useState("Database Management Systems");
  const [language, setLanguage] = useState("SQL");
  const [exerciseText, setExerciseText] = useState(
    "Student Enrollment Database: Create tables (STUDENT, COURSE, ENROLLMENT), write INNER JOIN queries to calculate student GPA, and add a BEFORE INSERT trigger to validate credit limits."
  );
  
  const [result, setResult] = useState<GeneratedResult | null>({
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
  const [scheduleItems, setScheduleItems] = useState<LabScheduleItem[]>(INITIAL_SCHEDULE);
  const [experiments, setExperiments] = useState<LabExperiment[]>(INITIAL_EXPERIMENTS);

  const generateFn = useServerFn(generateLabCode);

  const generate = useMutation({
    mutationFn: () =>
      generateFn({
        data: { subject, exerciseDescription: exerciseText, language },
      }),
    onSuccess: (res) => {
      setResult(res);
      toast.success("Lab code and procedure generated!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to generate lab response. Please try again.");
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyTemplate = (t: typeof QUICK_TEMPLATES[0]) => {
    setSubject(t.subject);
    setExerciseText(`${t.title}: ${t.desc}`);
    setActiveTab("helper");
  };

  const toggleReminder = (id: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.reminderActive;
          if (nextState) {
            toast.success(`Reminder enabled for ${item.labName}`);
          } else {
            toast.info(`Reminder disabled for ${item.labName}`);
          }
          return { ...item, reminderActive: nextState };
        }
        return item;
      })
    );
  };

  const toggleExperimentComplete = (expNum: number) => {
    setExperiments((prev) =>
      prev.map((exp) => {
        if (exp.expNum === expNum) {
          const next = !exp.completed;
          toast.success(next ? `Experiment ${expNum} marked as Completed!` : `Experiment ${expNum} marked as Pending`);
          return { ...exp, completed: next };
        }
        return exp;
      })
    );
  };

  const completedCount = experiments.filter((e) => e.completed).length;
  const progressPct = Math.round((completedCount / experiments.length) * 100);

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col transition-colors duration-200">

        {/* Gradient Header */}
        <div className="relative overflow-hidden px-6 py-5 border-b border-border shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <FlaskConical className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-tight">Lab Helper & Reminders</h1>
                  <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-orange-500/20">
                    Smart Assistant
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Lab schedule reminders, step-by-step experiment walkthroughs, and code verifiers
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="relative z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("reminders")}
                className="flex items-center gap-2 bg-card border border-border hover:border-amber-500/50 px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer text-left group"
              >
                <Clock className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Next Lab</p>
                  <p className="text-[11px] font-bold text-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tracker")}
                className="flex items-center gap-2 bg-card border border-border hover:border-emerald-500/50 px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer text-left group"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Progress</p>
                  <p className="text-[11px] font-bold text-foreground">{completedCount}/{experiments.length} Experiments ({progressPct}%)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="relative z-20 flex items-center gap-2 mt-4 pt-3 border-t border-border/40 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("helper")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
                activeTab === "helper"
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Code className="h-4 w-4" /> Experiment Helper & Code Engine
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reminders")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0 relative ${
                activeTab === "reminders"
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Bell className="h-4 w-4" /> Lab Schedule & Reminders
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tracker")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
                activeTab === "tracker"
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "bg-card/80 border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <CheckSquare className="h-4 w-4" /> Lab Manual Completion Tracker
            </button>
          </div>
        </div>

        {/* Tab 1: Experiment Helper */}
        {activeTab === "helper" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Setup Sidebar */}
            <aside className="w-80 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">
              <div>
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Lab Experiment Setup</h2>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Select your lab subject, describe the exercise or choose a pre-configured template.
                </p>
              </div>

              {/* Subject Grid */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Subject</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSubject(s.value)}
                      className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                        subject === s.value
                          ? "bg-primary/10 border-primary/30 text-primary shadow-xs"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Language</Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-9 text-xs bg-muted/40 border border-border rounded-lg px-2 font-medium mt-1 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l === "auto" ? "Auto-detect (recommended)" : l}</option>
                  ))}
                </select>
              </div>

              {/* Quick Templates */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Quick Experiment Templates</Label>
                {QUICK_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => applyTemplate(t)}
                    className="w-full text-left p-2.5 rounded-xl border border-border bg-muted/10 hover:bg-muted/40 hover:border-primary/30 transition-all group"
                  >
                    <p className="text-[10px] font-bold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><span>{t.icon}</span> {t.title}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{t.desc}</p>
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-muted/10">

              {/* Exercise Description Box */}
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCode className="h-3.5 w-3.5 text-orange-500" /> Experiment Description & Task
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">Subject: {subject}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleGenerate} className="space-y-3">
                    <Textarea
                      placeholder={`Describe your lab exercise in detail...\n\nExample: "Write a C program for Producer-Consumer problem using Semaphores and Mutex locks with multi-threading."`}
                      value={exerciseText}
                      onChange={(e) => setExerciseText(e.target.value)}
                      className="h-32 text-xs bg-muted/30 border-border resize-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">{exerciseText.length} / 2000 characters</span>
                      <Button
                        type="submit"
                        disabled={generate.isPending}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs h-9 px-5 shadow-sm"
                      >
                        {generate.isPending ? (
                          <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Generating Solution...</>
                        ) : (
                          <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate Lab Solution</>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Generated Solution */}
              {result && (
                <div className="space-y-4">
                  {/* Step 1: Approach & Explanation */}
                  {result.explanation && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" /> Step 1: Theoretical Approach & Concept
                        </p>
                        <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-mono font-bold">Verified</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{result.explanation}</p>
                    </div>
                  )}

                  {/* Step 2: Code Block */}
                  <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          Step 2: {result.language} Solution Code
                        </span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border transition-all ${
                          copied
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied to Clipboard!" : "Copy Code"}
                      </button>
                    </div>
                    <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto text-foreground whitespace-pre-wrap bg-muted/20 max-h-96 overflow-y-auto">
                      {result.code}
                    </pre>
                  </div>

                  {/* Step 3: Test Cases */}
                  {result.testCases && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5" /> Step 3: Test Cases & Expected Execution Output
                      </p>
                      <pre className="text-[11px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed bg-background/50 p-2.5 rounded-lg border border-emerald-500/10">{result.testCases}</pre>
                    </div>
                  )}

                  {/* Step 4: Lab Notes */}
                  {result.notes && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Step 4: Lab Manual Submission Notes & Gotchas
                      </p>
                      <p className="text-xs text-foreground leading-relaxed">{result.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        )}

        {/* Tab 2: Lab Reminders & Schedule */}
        {activeTab === "reminders" && (
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Weekly Lab Schedule & Deadline Reminders</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set automatic reminders for your practical sessions, manual sign-offs, and lab exams.
                </p>
              </div>
              <Button
                onClick={() => toast.success("Lab Schedule synced with your Academic Calendar!")}
                variant="outline"
                className="text-xs font-bold h-8 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Sync Calendar
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {scheduleItems.map((item) => (
                <Card key={item.id} className="border-border bg-card hover:border-primary/40 transition-all shadow-xs relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    item.status === "Upcoming" ? "bg-amber-500" : item.status === "Pending Submission" ? "bg-red-500" : "bg-emerald-500"
                  }`} />
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {item.subject}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "Upcoming"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : item.status === "Pending Submission"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse"
                          : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground mt-2">{item.labName}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{item.experimentCount}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-2 text-xs">
                    <div className="space-y-1.5 bg-muted/20 p-2.5 rounded-xl border border-border/60">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-foreground">{item.dayTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FlaskConical className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{item.room} · {item.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span>Manual Due: <strong className="text-foreground">{item.dueDate}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-medium text-muted-foreground">Push Notifications</span>
                      <button
                        onClick={() => toggleReminder(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          item.reminderActive
                            ? "bg-orange-500 text-white shadow-xs"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.reminderActive ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                        {item.reminderActive ? "Reminder Active" : "Set Reminder"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Notification Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Lab Reminder Alert Active</p>
                  <p className="text-[11px] text-muted-foreground">You will receive push reminders 12 hours and 1 hour before every lab session & manual submission deadline.</p>
                </div>
              </div>
              <Button onClick={() => toast.success("Test push alert sent!")} size="sm" variant="outline" className="text-xs font-bold h-8">
                Send Test Alert
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Lab Manual Completion Tracker */}
        {activeTab === "tracker" && (
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Semester Lab Manual Completion Tracker</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track completed lab experiments, verify code readiness, and stay submission-ready.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-2xl">
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Submission Readiness</p>
                  <p className="text-xs font-extrabold text-foreground">{completedCount} of {experiments.length} Experiments Done</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-extrabold text-xs">
                  {progressPct}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border">
                <div className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Experiments List */}
            <div className="grid gap-3">
              {experiments.map((exp) => (
                <div
                  key={exp.expNum}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    exp.completed
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => toggleExperimentComplete(exp.expNum)}
                      className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                        exp.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-border bg-muted hover:border-primary"
                      }`}
                    >
                      {exp.completed && <Check className="h-4 w-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                          Exp #{exp.expNum} · {exp.subject}
                        </span>
                        {exp.completed ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Completed & Verified</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Pending Execution</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-foreground mt-1">{exp.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded ${exp.notesReady ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"}`}>
                        {exp.notesReady ? "Notes Ready" : "Notes Needed"}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${exp.codeReady ? "bg-purple-500/10 text-purple-500" : "bg-muted text-muted-foreground"}`}>
                        {exp.codeReady ? "Code Ready" : "Code Needed"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSubject(exp.subject === "DBMS" ? "Database Management Systems" : exp.subject === "OS" ? "Operating Systems" : "Computer Networks");
                        setExerciseText(`Experiment ${exp.expNum}: ${exp.title}`);
                        setActiveTab("helper");
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Open Helper <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </ChatLayout>
  );
}
