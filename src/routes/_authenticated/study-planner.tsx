import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateStudyPlan,
  listStudyPlans,
  deleteStudyPlan,
  listStudyTasks,
  createStudyTask,
  updateStudyTask,
  deleteStudyTask,
} from "@/lib/study.functions";
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  FileCode,
  Gauge,
  ListTodo,
  TrendingUp,
  Award,
  BookOpen,
  CalendarDays,
  Target,
  Edit2,
  Save,
  Check,
  History,
  Key,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/study-planner")({
  component: StudyPlannerPage,
});

interface LocalSubject {
  name: string;
  examDate: string;
  difficulty: "High" | "Medium" | "Low";
}

function calculateCountdown(examDateStr: string): number {
  try {
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : Math.max(0, diffDays);
  } catch {
    return 0;
  }
}

function StudyPlannerPage() {
  const queryClient = useQueryClient();
  
  const generatePlanFn = useServerFn(generateStudyPlan);
  const listPlansFn = useServerFn(listStudyPlans);
  const deletePlanFn = useServerFn(deleteStudyPlan);
  const listTasksFn = useServerFn(listStudyTasks);
  const createTaskFn = useServerFn(createStudyTask);
  const updateTaskFn = useServerFn(updateStudyTask);
  const deleteTaskFn = useServerFn(deleteStudyTask);

  // Form states
  const [degree, setDegree] = useState("MCA Student");
  const [semester, setSemester] = useState("2nd Semester");
  const [studyHours, setStudyHours] = useState(4);
  const [weakSubjects, setWeakSubjects] = useState("DBMS, Computer Networks");
  const [strongSubjects, setStrongSubjects] = useState("Python, Web Development");
  const [preferredTime, setPreferredTime] = useState("6:00 PM - 10:00 PM");
  const [targetGrade, setTargetGrade] = useState("A+");
  
  // Custom API key states
  const [provider, setProvider] = useState<"Gemini" | "OpenAI">("Gemini");
  const [customKey, setCustomKey] = useState("");
  const [showKeyExpander, setShowKeyExpander] = useState(false);

  // Dynamic subjects list in form
  const [subjectsList, setSubjectsList] = useState<LocalSubject[]>([
    { name: "DBMS", examDate: "2026-06-15", difficulty: "High" },
    { name: "Operating Systems", examDate: "2026-06-18", difficulty: "Medium" }
  ]);
  const [newSubName, setNewSubName] = useState("");
  const [newSubDate, setNewSubDate] = useState("");
  const [newSubDifficulty, setNewSubDifficulty] = useState<"High" | "Medium" | "Low">("Medium");

  // Selected Plan result states
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanResult, setSelectedPlanResult] = useState<any>(null);
  const [selectedMeta, setSelectedMeta] = useState<any>(null);

  // Daily Tasks state
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  // Fetch plans history
  const { data: plansHistory = [], refetch: refetchPlans } = useQuery({
    queryKey: ["studyPlans"],
    queryFn: () => listPlansFn(),
  });

  // Fetch tasks when plan is selected
  useEffect(() => {
    if (selectedPlanId) {
      listTasksFn({ data: { planId: selectedPlanId } }).then((tasks) => {
        setTasksList(tasks);
      });
    } else {
      setTasksList([]);
    }
  }, [selectedPlanId, listTasksFn]);

  const addSubjectToForm = () => {
    if (!newSubName.trim()) {
      toast.error("Subject name cannot be empty.");
      return;
    }
    if (!newSubDate) {
      toast.error("Please select an exam date.");
      return;
    }
    setSubjectsList(prev => [...prev, { name: newSubName.trim(), examDate: newSubDate, difficulty: newSubDifficulty }]);
    setNewSubName("");
    setNewSubDate("");
    toast.success(`Subject ${newSubName} added to form.`);
  };

  const removeSubjectFromForm = (idx: number) => {
    setSubjectsList(prev => prev.filter((_, i) => i !== idx));
  };

  // Generate Plan Mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (subjectsList.length === 0) throw new Error("Please add at least one subject.");
      return generatePlanFn({
        data: {
          degree,
          semester,
          subjects: subjectsList,
          studyHoursPerDay: studyHours,
          weakSubjects,
          strongSubjects,
          preferredStudyTime: preferredTime,
          targetGrade,
          custom_key: customKey || undefined,
          provider: customKey ? provider : undefined
        }
      });
    },
    onSuccess: (data) => {
      setSelectedPlanId(data.id);
      setSelectedPlanResult(data.result);
      setSelectedMeta({
        id: data.id,
        degree: data.degree,
        semester: data.semester,
        subjects: data.subjects,
        created_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ["studyPlans"] });
      toast.success("AI Spaced Repetition study schedule created successfully!");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.message || "Failed to generate study plan.");
    }
  });

  // Delete Plan Mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      return deletePlanFn({ data: { id } });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["studyPlans"] });
      if (selectedPlanId === id) {
        setSelectedPlanId(null);
        setSelectedPlanResult(null);
        setSelectedMeta(null);
      }
      toast.success("Study plan removed.");
    }
  });

  // Task Operations
  const handleToggleTask = async (id: string, currentVal: number) => {
    const newVal = currentVal === 1 ? 0 : 1;
    await updateTaskFn({ data: { id, completed: newVal } });
    setTasksList(prev => prev.map(t => t.id === id ? { ...t, completed: newVal } : t));
    toast.success("Task status updated.");
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !newTaskTitle.trim()) return;

    const task = await createTaskFn({ data: { planId: selectedPlanId, title: newTaskTitle.trim() } });
    setTasksList(prev => [...prev, task]);
    setNewTaskTitle("");
    toast.success("Task added.");
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTaskFn({ data: { id } });
    setTasksList(prev => prev.filter(t => t.id !== id));
    toast.success("Task deleted.");
  };

  const handleStartEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const handleSaveEditTask = async (id: string) => {
    if (!editingTaskTitle.trim()) return;
    await updateTaskFn({ data: { id, title: editingTaskTitle.trim() } });
    setTasksList(prev => prev.map(t => t.id === id ? { ...t, title: editingTaskTitle.trim() } : t));
    setEditingTaskId(null);
    toast.success("Task updated.");
  };

  // Export timetable
  const handleExportText = () => {
    if (!selectedPlanResult || !selectedMeta) return;

    const sList = selectedMeta.subjects.map((s: any) => `- ${s.name} (Exam: ${s.examDate}, Difficulty: ${s.difficulty})`).join("\n");
    
    let timetableStr = "";
    Object.entries(selectedPlanResult.timetable).forEach(([day, slots]: [string, any]) => {
      timetableStr += `\n${day.toUpperCase()}:\n`;
      slots.forEach((s: any) => {
        timetableStr += `  * ${s.time} | ${s.subject} -> ${s.activity}\n`;
      });
    });

    const fileContent = `STUDENTOS STUDY PLANNER EXPORT\n` +
      `Degree: ${selectedMeta.degree} · Semester: ${selectedMeta.semester}\n` +
      `Generated: ${new Date(selectedMeta.created_at).toLocaleDateString()}\n\n` +
      `SUBJECTS LIST:\n${sList}\n\n` +
      `WEEKLY TIMETABLE SCHEDULE:${timetableStr}\n\n` +
      `RECOMMENDATIONS:\n` +
      selectedPlanResult.recommendations.map((r: string) => `- ${r}`).join("\n") +
      `\n\nGenerated via StudentOS AI Coach.`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `StudyPlan_${selectedMeta.semester.replace(/\s+/g, "")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectHistoryPlan = (plan: any) => {
    setSelectedPlanId(plan.id);
    setSelectedPlanResult(plan.result);
    setSelectedMeta({
      id: plan.id,
      degree: plan.degree,
      semester: plan.semester,
      subjects: plan.subjects,
      created_at: plan.created_at
    });
    setSubjectsList(plan.subjects);
    toast.info(`Loaded plan for ${plan.semester}`);
  };

  // Date format utility
  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Countdown Helper
  const getDaysRemaining = (dateStr: string) => {
    const days = calculateCountdown(dateStr);
    if (days === 0) return "Exam Completed";
    if (days === 1) return "1 Day Remaining";
    return `${days} Days Remaining`;
  };

  // Subjects lists completion rate math
  const getSubjectListCompletionRate = () => {
    if (tasksList.length === 0) return 0;
    const completed = tasksList.filter(t => t.completed === 1).length;
    return Math.round((completed / tasksList.length) * 100);
  };

  return (
    <ChatLayout activeThreadId={null}>
      {/* Notion light theme workspace wrapper */}
      <div className="h-full overflow-y-auto bg-slate-50 text-slate-800 light flex flex-col md:flex-row">
        
        {/* Main Panel */}
        <div className="flex-1 px-6 py-8 md:px-10">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-blue-900 flex items-center gap-2">
                <CalendarDays className="h-7 w-7 text-blue-600 shrink-0" />
                Study Planner
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xl leading-relaxed">
                Generate personalized study schedules and manage revisions with AI. Build high-retention spaced repetition calendars tailored around exam dates.
              </p>
            </div>
            {selectedPlanResult && (
              <Button
                onClick={handleExportText}
                size="sm"
                variant="outline"
                className="h-8 border-blue-200 hover:bg-blue-50 text-blue-700 text-xs flex items-center gap-1.5 self-start md:self-center"
              >
                <Download className="h-3.5 w-3.5" />
                Export Timetable (.txt)
              </Button>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Left Col: Setup & Form */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Form Card */}
              <Card className="bg-white border-slate-200/80 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-base font-bold text-blue-900 flex items-center gap-1.5">
                    <Target className="h-4.5 w-4.5 text-blue-600" />
                    Study Information
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Input your subjects and academic constraints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  
                  {/* Optional Keys Expander */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => setShowKeyExpander(!showKeyExpander)}
                      className="flex w-full items-center justify-between py-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      <span className="flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5" />
                        🔑 Optional: Use Custom API Keys
                      </span>
                      {showKeyExpander ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {showKeyExpander && (
                      <div className="mt-3 space-y-3 pb-2 pt-1">
                        <div className="grid gap-1.5">
                          <Label htmlFor="provider" className="text-[10px]">LLM Provider</Label>
                          <select
                            id="provider"
                            value={provider}
                            onChange={(e: any) => setProvider(e.target.value)}
                            className="w-full h-8 px-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none"
                          >
                            <option value="Gemini">Gemini</option>
                            <option value="OpenAI">OpenAI</option>
                          </select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="apiKey" className="text-[10px]">API Key</Label>
                          <Input
                            id="apiKey"
                            type="password"
                            placeholder="Enter your API Key"
                            value={customKey}
                            onChange={(e) => setCustomKey(e.target.value)}
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Degree / Semester */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="degree">Degree</Label>
                      <Input id="degree" value={degree} onChange={(e) => setDegree(e.target.value)} className="h-8 bg-white" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="semester">Semester</Label>
                      <Input id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} className="h-8 bg-white" />
                    </div>
                  </div>

                  {/* Weak & Strong Subjects */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="weakSub">Weak Subjects</Label>
                      <Input id="weakSub" placeholder="DBMS, Math" value={weakSubjects} onChange={(e) => setWeakSubjects(e.target.value)} className="h-8 bg-white" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="strongSub">Strong Subjects</Label>
                      <Input id="strongSub" placeholder="Python, Web" value={strongSubjects} onChange={(e) => setStrongSubjects(e.target.value)} className="h-8 bg-white" />
                    </div>
                  </div>

                  {/* Study Time / Study hours */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="studyHours">Hours / Day</Label>
                      <select
                        id="studyHours"
                        value={studyHours}
                        onChange={(e) => setStudyHours(parseInt(e.target.value, 10))}
                        className="h-8 px-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                      >
                        <option value={2}>2 Hours</option>
                        <option value={3}>3 Hours</option>
                        <option value={4}>4 Hours</option>
                        <option value={5}>5 Hours</option>
                        <option value={6}>6+ Hours</option>
                      </select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="prefTime">Preferred Time</Label>
                      <Input id="prefTime" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="h-8 bg-white" />
                    </div>
                  </div>

                  {/* Target Grade */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="targetGrade">Target Grade Goal</Label>
                    <Input id="targetGrade" value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className="h-8 bg-white" />
                  </div>

                  {/* Subjects Form List */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <span className="font-bold text-slate-700 block text-xs">Subjects Exam Dates</span>
                    
                    {/* Add subject subform */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 space-y-2">
                      <div className="grid gap-1.5">
                        <Input
                          placeholder="Subject Name (e.g. DBMS)"
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          className="h-7 text-xs bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={newSubDate}
                          onChange={(e) => setNewSubDate(e.target.value)}
                          className="h-7 text-xs bg-white"
                        />
                        <select
                          value={newSubDifficulty}
                          onChange={(e: any) => setNewSubDifficulty(e.target.value)}
                          className="h-7 px-1.5 border border-slate-200 bg-white rounded-md text-xs focus:outline-none"
                        >
                          <option value="High">High Diff</option>
                          <option value="Medium">Medium Diff</option>
                          <option value="Low">Low Diff</option>
                        </select>
                      </div>
                      <Button
                        type="button"
                        onClick={addSubjectToForm}
                        size="sm"
                        className="w-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 h-6"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Subject
                      </Button>
                    </div>

                    {/* Added Subjects chips */}
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {subjectsList.map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-md">
                          <div>
                            <span className="font-bold text-slate-700 block">{sub.name}</span>
                            <span className="text-[10px] text-slate-400">
                              {formatShortDate(sub.examDate)} · Difficulty: {sub.difficulty}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSubjectFromForm(idx)}
                            className="text-red-500 hover:text-red-600 px-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>

                  <Button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending || subjectsList.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm mt-2"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4 text-white" /> Generating study schedule...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Generate AI Study Plan
                      </>
                    )}
                  </Button>

                </CardContent>
              </Card>

              {/* Countdown Widgets Card */}
              {selectedMeta && (
                <Card className="bg-white border-slate-200/80 shadow-sm p-4 space-y-4">
                  <span className="font-display text-sm font-bold text-blue-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    5. Upcoming Exam Countdown
                  </span>
                  
                  <div className="space-y-2.5">
                    {selectedMeta.subjects.map((sub: any) => {
                      const days = calculateCountdown(sub.examDate);
                      let color = "text-indigo-600 bg-indigo-50 border-indigo-100";
                      if (days <= 5) color = "text-red-600 bg-red-50 border-red-100";
                      else if (days <= 10) color = "text-amber-600 bg-amber-50 border-amber-100";

                      return (
                        <div key={sub.name} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{sub.name}</span>
                          <Badge className={`${color} border text-[9px] font-bold px-2 py-0.5`}>
                            {getDaysRemaining(sub.examDate)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

            </div>

            {/* Right Col: Timetables & Trackers */}
            <div className="lg:col-span-2 space-y-6">
              
              {!selectedPlanResult ? (
                <Card className="flex flex-col items-center justify-center border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm min-h-[400px]">
                  <CalendarDays className="mb-4 h-16 w-16 text-slate-300 animate-pulse" />
                  <h3 className="font-display text-lg font-bold text-blue-900 mb-1">AI Study Coach</h3>
                  <p className="max-w-md text-xs leading-relaxed">
                    Set up your subjects and target schedule constraints on the left. The coach will construct a daily timetable, a detailed spaced repetition revision matrix, progress trackers, and pre-populate daily tasks.
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  
                  {/* Recommendations */}
                  <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-blue-800">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="font-semibold block text-blue-900">7. Smart Recommendations:</strong>
                      <ul className="list-inside list-disc space-y-1 text-blue-800/85">
                        {selectedPlanResult.recommendations && selectedPlanResult.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Daily Tasks Interactive Dashboard */}
                  <Card className="bg-white border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 flex flex-row justify-between items-center">
                      <div>
                        <CardTitle className="font-display text-base font-bold text-blue-900 flex items-center gap-1.5">
                          <ListTodo className="h-4.5 w-4.5 text-blue-600" />
                          8. Daily Tasks Checklist
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Check off study tasks or add custom notes.
                        </CardDescription>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Task Progress</span>
                        <span className="font-mono font-bold text-blue-600 text-xs">{getSubjectListCompletionRate()}% Done</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      
                      {/* Add custom task form */}
                      <form onSubmit={handleCreateTask} className="flex gap-2">
                        <Input
                          placeholder="Add a custom study task (e.g. Complete ER Diagram)..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="h-8 text-xs bg-slate-50 border-slate-200 flex-1"
                        />
                        <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 h-8 text-xs">
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </form>

                      {/* Tasks lists */}
                      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                        {tasksList.length === 0 ? (
                          <div className="text-center text-xs text-slate-400 py-4 italic">No tasks created yet.</div>
                        ) : (
                          tasksList.map((task) => {
                            const isEditing = editingTaskId === task.id;
                            return (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between border rounded-lg p-2.5 transition-colors ${
                                  task.completed === 1 ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200/80 hover:bg-slate-50/50"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 flex-1 pr-4">
                                  <input
                                    type="checkbox"
                                    checked={task.completed === 1}
                                    onChange={() => handleToggleTask(task.id, task.completed)}
                                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer shrink-0"
                                  />
                                  
                                  {isEditing ? (
                                    <Input
                                      value={editingTaskTitle}
                                      onChange={(e) => setEditingTaskTitle(e.target.value)}
                                      className="h-7 text-xs bg-white border-slate-300 py-0"
                                    />
                                  ) : (
                                    <span className={`text-xs leading-normal ${task.completed === 1 ? "line-through text-slate-400" : "text-slate-700"}`}>
                                      {task.title}
                                    </span>
                                  )}
                                </div>

                                <div className="flex gap-1.5 shrink-0">
                                  {isEditing ? (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSaveEditTask(task.id)}
                                      className="h-6 w-6 p-0 text-emerald-600 hover:bg-emerald-50"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleStartEditTask(task)}
                                      className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </CardContent>
                  </Card>

                  {/* Spaced Repetition Engine */}
                  <Card className="bg-white border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-base font-bold text-blue-900 flex items-center gap-1.5">
                        <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
                        3. Spaced Repetition Intervals
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Visually schedule revision intervals to maximize memory consolidation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      {selectedPlanResult.spacedRepetition && selectedPlanResult.spacedRepetition.map((item: any, idx: number) => (
                        <div key={idx} className="border border-slate-100 bg-slate-50/50 p-3 rounded-lg space-y-2">
                          <div className="flex justify-between font-bold">
                            <span className="text-blue-900">{item.topic}</span>
                            <span className="text-[10px] text-slate-400">{item.subject}</span>
                          </div>
                          
                          {/* 4 Steps spaced repetition */}
                          <div className="grid grid-cols-4 gap-2 pt-1 text-[10px] font-medium text-center">
                            <div className="bg-white border border-blue-200 text-blue-800 rounded p-1.5">
                              <span className="block font-bold">Rev 1</span>
                              <span className="text-[9px] text-slate-400">{item.rev1}</span>
                            </div>
                            <div className="bg-white border border-indigo-200 text-indigo-800 rounded p-1.5">
                              <span className="block font-bold">Rev 2</span>
                              <span className="text-[9px] text-slate-400">{item.rev2}</span>
                            </div>
                            <div className="bg-white border border-purple-200 text-purple-800 rounded p-1.5">
                              <span className="block font-bold">Rev 3</span>
                              <span className="text-[9px] text-slate-400">{item.rev3}</span>
                            </div>
                            <div className="bg-white border border-amber-200 text-amber-800 rounded p-1.5">
                              <span className="block font-bold">Rev 4</span>
                              <span className="text-[9px] text-slate-400">{item.rev4}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* 10. Calendar View & Timetable Tabs */}
                  <Tabs defaultValue="timetable" className="w-full bg-white border border-slate-200/80 rounded-xl overflow-hidden p-5 shadow-sm">
                    <TabsList className="grid grid-cols-4 bg-slate-100 border border-slate-200/60 mb-5">
                      <TabsTrigger value="timetable" className="text-xs">Schedule</TabsTrigger>
                      <TabsTrigger value="daily" className="text-xs">Daily Plan</TabsTrigger>
                      <TabsTrigger value="weekly" className="text-xs">Weekly Goals</TabsTrigger>
                      <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
                    </TabsList>

                    {/* Section 2: AI Timetable */}
                    <TabsContent value="timetable" className="space-y-4">
                      <h4 className="font-display text-sm font-bold text-blue-900">Weekly Study Timetable</h4>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        {selectedPlanResult.timetable && Object.entries(selectedPlanResult.timetable).map(([day, slots]: [string, any]) => (
                          <div key={day} className="border border-slate-100 bg-slate-50/50 p-3.5 rounded-lg space-y-2.5">
                            <span className="font-mono font-bold text-xs text-blue-950 block border-b border-slate-200 pb-1">{day}</span>
                            
                            <div className="space-y-2">
                              {slots.map((s: any, i: number) => (
                                <div key={i} className="bg-white border border-slate-100 p-2 rounded text-[11px] flex justify-between gap-3 leading-normal">
                                  <div>
                                    <span className="font-bold text-slate-700 block">{s.subject}</span>
                                    <span className="text-[10px] text-slate-400">{s.activity}</span>
                                  </div>
                                  <span className="font-mono text-[10px] text-blue-600 shrink-0 font-semibold align-middle mt-0.5">
                                    {s.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Section 10: Daily Planner Calendar Grid Mock */}
                    <TabsContent value="daily" className="space-y-4">
                      <h4 className="font-display text-sm font-bold text-blue-900">10. Calendar View (Interactive Agenda)</h4>
                      
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2 mb-2 font-bold">
                          <span className="text-blue-950">Study Agenda Calendar Slots</span>
                          <span className="text-slate-400">June 2026</span>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="bg-white border border-l-4 border-l-blue-500 p-3 rounded flex gap-4 justify-between items-center shadow-xs">
                            <div>
                              <span className="font-bold text-slate-700 block">Exam Session: DBMS</span>
                              <span className="text-[10px] text-slate-400">Scheduled on June 15, 2026</span>
                            </div>
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-100">Exam</Badge>
                          </div>
                          
                          <div className="bg-white border border-l-4 border-l-indigo-500 p-3 rounded flex gap-4 justify-between items-center shadow-xs">
                            <div>
                              <span className="font-bold text-slate-700 block">Daily Study: CPU Scheduling (OS)</span>
                              <span className="text-[10px] text-slate-400">Preferred Hours: 6:00 PM - 7:00 PM</span>
                            </div>
                            <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100">Study Session</Badge>
                          </div>

                          <div className="bg-white border border-l-4 border-l-purple-500 p-3 rounded flex gap-4 justify-between items-center shadow-xs">
                            <div>
                              <span className="font-bold text-slate-700 block">Spaced Revision: Normalization (DBMS)</span>
                              <span className="text-[10px] text-slate-400">Review Interval: 1st Revision</span>
                            </div>
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-100">Revision</Badge>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Section 4: Weekly Goals */}
                    <TabsContent value="weekly" className="space-y-4">
                      <h4 className="font-display text-sm font-bold text-blue-900">4. This Week's Progression Goals</h4>
                      
                      <div className="space-y-4 pt-1">
                        {selectedPlanResult.weeklyGoals && selectedPlanResult.weeklyGoals.map((g: any, i: number) => {
                          const planProgress = getSubjectListCompletionRate();
                          return (
                            <div key={i} className="space-y-1 text-xs">
                              <div className="flex justify-between font-semibold">
                                <span className="text-slate-600">{g.title}</span>
                                <span className="text-slate-800 font-bold">{planProgress}%</span>
                              </div>
                              <Progress value={planProgress} className="h-1.5 bg-slate-100 [&>div]:bg-blue-600" />
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>

                    {/* Section 6: Subject Progress */}
                    <TabsContent value="progress" className="space-y-4">
                      <h4 className="font-display text-sm font-bold text-blue-900">6. Subject Progress Tracker</h4>
                      
                      <div className="space-y-4">
                        {selectedPlanResult.subjectProgress && selectedPlanResult.subjectProgress.map((item: any) => (
                          <div key={item.subject} className="border border-slate-100 bg-slate-50/50 p-3 rounded-lg space-y-2 text-xs">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-blue-950">{item.subject}</span>
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0 font-bold">
                                {item.revisionStatus}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                                <span>Completion rate</span>
                                <span>{item.percent}%</span>
                              </div>
                              <Progress value={item.percent} className="h-1.5 bg-slate-100 [&>div]:bg-emerald-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1 text-[10px] leading-normal text-slate-500">
                              <div>
                                <strong className="text-slate-600 block">Covered Topics:</strong>
                                {item.covered && item.covered.map((c: string) => (
                                  <span key={c} className="block text-slate-400 font-medium">✔ {c}</span>
                                ))}
                              </div>
                              <div>
                                <strong className="text-slate-600 block">Remaining:</strong>
                                {item.remaining && item.remaining.map((r: string) => (
                                  <span key={r} className="block font-medium">· {r}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Section 9: Study Analytics */}
                  <Card className="bg-white border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <CardTitle className="font-display text-base font-bold text-blue-900 flex items-center gap-1.5">
                        <Gauge className="h-4.5 w-4.5 text-blue-600" />
                        9. Study Performance Analytics
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Metrics matching study consistency and goal completion velocity.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5 grid gap-4 sm:grid-cols-4 text-center">
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Studied Hours</span>
                        <span className="font-display font-extrabold text-2xl text-blue-900 block mt-1">
                          {studyHours * 5} hrs
                        </span>
                        <span className="text-[9px] text-slate-400">This current week</span>
                      </div>
                      
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Goal Accuracy</span>
                        <span className="font-display font-extrabold text-2xl text-indigo-600 block mt-1">
                          {getSubjectListCompletionRate()}%
                        </span>
                        <span className="text-[9px] text-slate-400">Tasks checked</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Consistency</span>
                        <span className="font-display font-extrabold text-2xl text-purple-600 block mt-1">92%</span>
                        <span className="text-[9px] text-slate-400">Timetable compliance</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Readiness Score</span>
                        <span className="font-display font-extrabold text-2xl text-emerald-600 block mt-1">84%</span>
                        <span className="text-[9px] text-slate-400">Grade probability A</span>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* History Sidebar Panel */}
        <aside className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-slate-200/80 p-5 shrink-0 flex flex-col">
          <div className="flex items-center gap-2 mb-4 font-display text-sm font-bold text-blue-900 border-b border-slate-100 pb-2">
            <History className="h-4.5 w-4.5 text-blue-600" />
            Previous Study Plans
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[400px] md:max-h-none">
            {plansHistory.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center italic">
                No study schedules created yet.
              </div>
            ) : (
              plansHistory.map((item: any) => {
                const active = selectedPlanId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`group border rounded-lg p-3 transition-colors text-xs space-y-2 flex flex-col justify-between ${
                      active ? "bg-blue-50/30 border-blue-400/50" : "bg-slate-50/40 border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="pr-6 cursor-pointer" onClick={() => handleSelectHistoryPlan(item)}>
                      <span className="font-bold text-slate-700 block">
                        {item.semester} plan
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Degree: {item.degree}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Created: {formatShortDate(item.created_at)}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSelectHistoryPlan(item)}
                        className="h-6 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePlanMutation.mutate(item.id)}
                        className="h-6 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

      </div>
    </ChatLayout>
  );
}
