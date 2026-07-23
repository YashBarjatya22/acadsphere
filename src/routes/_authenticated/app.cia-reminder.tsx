import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Bell, BellOff, Plus, Trash2, Clock, CheckCircle2, AlertCircle, Flame, Timer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/cia-reminder")({
  component: CiaReminderPage,
});

interface Exam {
  id: string;
  subject: string;
  date: string;
  syllabus: string;
  reminderSet: boolean;
  type: "CIA-1" | "CIA-2" | "Model" | "Semester";
}

const STORAGE_KEY = "acadsphere_cia_exams";

const defaultExams: Exam[] = [
  { id: "1", subject: "Database Management Systems (DBMS)", date: "2026-07-28", syllabus: "Units 1 & 2 — ER Models, Relational Algebra, BCNF", reminderSet: true, type: "CIA-2" },
  { id: "2", subject: "Operating Systems (OS)", date: "2026-07-30", syllabus: "Units 1–3 — Deadlocks, Banker's Algorithm, Semaphores", reminderSet: true, type: "CIA-2" },
  { id: "3", subject: "Computer Networks (CN)", date: "2026-08-02", syllabus: "Units 1 & 2 — TCP 3-Way Handshake, Subnetting, IPv6", reminderSet: true, type: "CIA-2" },
  { id: "4", subject: "Artificial Intelligence (AI)", date: "2026-08-06", syllabus: "Units 1–3 — Minimax Algorithm, A* Search, Loss Functions", reminderSet: true, type: "Model" },
];

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyConfig(days: number) {
  if (days < 0) return { label: "Past", color: "text-muted-foreground", bg: "bg-muted/60 border-border", badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" };
  if (days === 0) return { label: "TODAY!", color: "text-red-500", bg: "bg-red-500/8 border-red-400/30", badge: "bg-red-500 text-white", dot: "bg-red-500" };
  if (days <= 2) return { label: `${days}d left`, color: "text-red-500", bg: "bg-red-500/8 border-red-400/30", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", dot: "bg-red-500" };
  if (days <= 7) return { label: `${days}d left`, color: "text-amber-500", bg: "bg-amber-500/8 border-amber-400/30", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" };
  return { label: `${days}d left`, color: "text-emerald-500", bg: "bg-emerald-500/8 border-emerald-400/30", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500" };
}

function CiaReminderPage() {
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultExams;
    } catch { return defaultExams; }
  });

  const [newSubject, setNewSubject] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSyllabus, setNewSyllabus] = useState("");
  const [newType, setNewType] = useState<Exam["type"]>("CIA-1");

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  }, [exams]);

  const examsSorted = useMemo(() =>
    [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [exams]
  );

  const stats = useMemo(() => ({
    total: exams.length,
    upcoming: exams.filter(e => getDaysUntil(e.date) >= 0).length,
    urgent: exams.filter(e => { const d = getDaysUntil(e.date); return d >= 0 && d <= 3; }).length,
    reminders: exams.filter(e => e.reminderSet).length,
  }), [exams]);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newDate || !newSyllabus) {
      toast.warning("Please fill in all the details.");
      return;
    }
    const newExam: Exam = {
      id: Date.now().toString(),
      subject: newSubject,
      date: newDate,
      syllabus: newSyllabus,
      reminderSet: true,
      type: newType,
    };
    setExams(prev => [...prev, newExam]);
    setNewSubject(""); setNewDate(""); setNewSyllabus(""); setNewType("CIA-1");
    toast.success("CIA exam scheduled with reminders enabled!");
  };

  const handleToggleReminder = (id: string) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, reminderSet: !e.reminderSet } : e));
    const target = exams.find(e => e.id === id);
    toast.success(target?.reminderSet ? "Reminders muted." : "Reminders activated!");
  };

  const handleDeleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    toast.success("Exam removed.");
  };

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground overflow-y-auto scrollbar-thin transition-colors duration-200">

        {/* Gradient Header */}
        <div className="relative overflow-hidden px-6 md:px-8 py-8 border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5 pointer-events-none" />
          <div className="absolute right-8 top-4 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-foreground tracking-tight">CIA Reminder</h1>
                <p className="text-xs text-muted-foreground">Live countdowns for your Internal Assessments</p>
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-sm text-xs">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-semibold text-foreground">{stats.total} Scheduled</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-sm text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground">{stats.upcoming} Upcoming</span>
              </div>
              {stats.urgent > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-400/30 shadow-sm text-xs">
                  <Flame className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-bold text-red-600 dark:text-red-400">{stats.urgent} Urgent (≤3 days)</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-sm text-xs">
                <Bell className="h-3 w-3 text-primary" />
                <span className="font-semibold text-foreground">{stats.reminders} Reminders On</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-8 py-6 grid gap-6 lg:grid-cols-12 items-start">

          {/* Left Panel: Exam Cards */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scheduled Assessments</h3>

            {examsSorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-semibold text-muted-foreground">No CIA exams scheduled</p>
                <p className="text-xs text-muted-foreground/70">Use the form on the right to add your upcoming assessments.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {examsSorted.map((exam) => {
                  const days = getDaysUntil(exam.date);
                  const urg = urgencyConfig(days);
                  return (
                    <div
                      key={exam.id}
                      className={`rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${urg.bg}`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${urg.dot} ${days === 0 ? "animate-ping" : ""}`} />
                            <h4 className="text-sm font-bold text-foreground truncate">{exam.subject}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urg.badge}`}>
                              {exam.type}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 border border-border px-2 py-0.5 rounded">
                              <CalendarDays className="h-3 w-3" /> {exam.date}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border px-2 py-0.5 rounded truncate max-w-xs">
                              {exam.syllabus}
                            </span>
                          </div>
                        </div>

                        {/* Countdown + Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-center min-w-[56px]">
                            <p className={`text-lg font-black tabular-nums ${urg.color}`}>
                              {days < 0 ? "Done" : days === 0 ? "Now" : `${days}d`}
                            </p>
                            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {days < 0 ? "Completed" : days === 0 ? "Exam day" : "remaining"}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleReminder(exam.id)}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all ${
                              exam.reminderSet
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border hover:bg-muted/60"
                            }`}
                            title={exam.reminderSet ? "Mute reminders" : "Enable reminders"}
                          >
                            {exam.reminderSet ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-muted/40 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Add Form */}
          <div className="lg:col-span-4">
            <Card className="card-gradient shadow-sm border-border sticky top-6">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5 text-primary" /> Schedule Exam
                </CardTitle>
                <CardDescription className="text-[10px]">Add your upcoming assessment to get live countdown reminders.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <form onSubmit={handleAddExam} className="space-y-3.5">
                  <div>
                    <Label htmlFor="subject" className="text-[10px] font-bold text-muted-foreground uppercase">Subject Name</Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Distributed Systems (DS)"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="h-9 text-xs bg-muted/40 border-border mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-[10px] font-bold text-muted-foreground uppercase">Exam Type</Label>
                    <select
                      id="type"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as Exam["type"])}
                      className="w-full h-9 text-xs bg-muted/40 border border-border rounded-lg px-2 font-medium mt-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="CIA-1">CIA-1</option>
                      <option value="CIA-2">CIA-2</option>
                      <option value="Model">Model Exam</option>
                      <option value="Semester">Semester Exam</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="date" className="text-[10px] font-bold text-muted-foreground uppercase">Exam Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="h-9 text-xs bg-muted/40 border-border mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="syllabus" className="text-[10px] font-bold text-muted-foreground uppercase">Syllabus Scope</Label>
                    <Input
                      id="syllabus"
                      placeholder="e.g. Units 1, 2 and 3"
                      value={newSyllabus}
                      onChange={(e) => setNewSyllabus(e.target.value)}
                      className="h-9 text-xs bg-muted/40 border-border mt-1"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-9 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold flex items-center justify-center gap-1.5 mt-2 shadow-sm">
                    <Plus className="h-3.5 w-3.5" /> Add to Schedule
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
