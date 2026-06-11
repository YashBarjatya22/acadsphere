import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  uploadAndAnalyzeNotes,
  listNotesAnalyses,
  deleteNotesAnalysis,
} from "@/lib/notes.functions";
import {
  Target,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Download,
  Award,
  BookOpen,
  Activity,
  History,
  Trash2,
  AlertTriangle,
  Heart,
  Key,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notes-gap-analyzer")({
  component: NotesGapAnalyzerPage,
});

function NotesGapAnalyzerPage() {
  const queryClient = useQueryClient();
  const analyzeNotesFn = useServerFn(uploadAndAnalyzeNotes);
  const listAnalysesFn = useServerFn(listNotesAnalyses);
  const deleteAnalysisFn = useServerFn(deleteNotesAnalysis);

  // Form states
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState(""); // base64 string
  const [subject, setSubject] = useState("DBMS");
  const [customSubject, setCustomSubject] = useState("");
  
  // Custom API key states
  const [provider, setProvider] = useState<"Gemini" | "OpenAI">("Gemini");
  const [customKey, setCustomKey] = useState("");
  const [showKeyExpander, setShowKeyExpander] = useState(false);

  // Selected Result state
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedMeta, setSelectedMeta] = useState<any>(null);

  // Fetch history
  const { data: historyList = [] } = useQuery({
    queryKey: ["notesAnalyses"],
    queryFn: () => listAnalysesFn(),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (fileExt !== "pdf" && fileExt !== "docx" && fileExt !== "txt") {
      toast.error("Only PDF, DOCX, and TXT files are supported.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File exceeds the 20MB size limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      setFileContent(base64String);
      setFileName(file.name);
      toast.success(`File selected: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!fileContent) throw new Error("Please upload your study notes.");
      const targetSubject = subject === "Custom" ? customSubject.trim() : subject;
      if (!targetSubject) throw new Error("Please specify a subject.");

      return analyzeNotesFn({
        data: {
          fileName,
          fileContent,
          subject: targetSubject,
          custom_key: customKey || undefined,
          provider: customKey ? provider : undefined
        }
      });
    },
    onSuccess: (data) => {
      setSelectedResult(data.result);
      setSelectedMeta({
        id: data.id,
        file_name: data.file_name,
        num_pages: data.num_pages,
        subject: data.subject,
        created_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ["notesAnalyses"] });
      toast.success("Syllabus gap analysis complete!");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.message || "Failed to analyze study notes.");
    }
  });

  const handleDeleteAnalysis = async (id: string) => {
    await deleteAnalysisFn({ data: { id } });
    queryClient.invalidateQueries({ queryKey: ["notesAnalyses"] });
    if (selectedMeta?.id === id) {
      setSelectedResult(null);
      setSelectedMeta(null);
    }
    toast.success("Analysis report deleted.");
  };

  const handleSelectHistory = (item: any) => {
    setSelectedResult(item.result);
    setSelectedMeta({
      id: item.id,
      file_name: item.file_name,
      num_pages: item.num_pages,
      subject: item.subject,
      created_at: item.created_at
    });
    setFileName(item.file_name);
    toast.info(`Loaded notes report: ${item.file_name}`);
  };

  const handleDownloadRevision = () => {
    if (!selectedResult || !fileName) return;

    const sheet = selectedResult.revisionSheet;
    const content = `STUDENTOS STUDY NOTES AUDIT - REVISION SHEET\n` +
      `File: ${fileName}\n` +
      `Subject: ${selectedMeta.subject}\n` +
      `Calculated Completeness: ${selectedResult.coverageScore}%\n` +
      `Exam Readiness: ${selectedResult.readinessScore}%\n\n` +
      `======================================================================\n` +
      `REVISION OUTLINE & GAPS:\n` +
      `======================================================================\n` +
      `${sheet.summary}\n\n` +
      `======================================================================\n` +
      `REQUIRED REVISION FORMULAS:\n` +
      `======================================================================\n` +
      sheet.formulas.map((f: string, i: number) => `* ${f}`).join("\n") +
      `\n\n======================================================================\n` +
      `EXAM PREPARATION TIPS:\n` +
      `======================================================================\n` +
      sheet.tips.map((t: string, i: number) => `* ${t}`).join("\n") +
      `\n\nGenerated via StudentOS Academic Auditor.`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RevisionSheet_${selectedMeta.subject.replace(/\s+/g, "")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Score color helper
  const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: "Excellent Coverage", color: "text-green-600 bg-green-50 border-green-200" };
    if (score >= 75) return { label: "Good Coverage", color: "text-blue-600 bg-blue-50 border-blue-200" };
    return { label: "Needs Improvement", color: "text-red-600 bg-red-50 border-red-200" };
  };

  // Readiness color
  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-50/50 [&>div]:bg-green-500";
    if (score >= 60) return "text-amber-500 bg-amber-50/50 [&>div]:bg-amber-500";
    return "text-red-500 bg-red-50/50 [&>div]:bg-red-500";
  };

  // Health helper
  const getHealthStyles = (status: string) => {
    if (status === "Green" || status === "Well Prepared") return { label: "Well Prepared", icon: CheckCircle, color: "text-green-700 bg-green-50 border-green-200" };
    if (status === "Red" || status === "High Exam Risk") return { label: "High Exam Risk", icon: ShieldAlert, color: "text-red-700 bg-red-50 border-red-200" };
    return { label: "Needs Revision", icon: AlertTriangle, color: "text-amber-700 bg-amber-50 border-amber-200" };
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <ChatLayout activeThreadId={null}>
      {/* Light Theme workspace */}
      <div className="h-full overflow-y-auto bg-slate-50 text-slate-800 light flex flex-col md:flex-row w-full">
        
        {/* Main Workspace */}
        <div className="flex-1 px-6 py-8 md:px-10">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-blue-900 flex items-center gap-2">
                <Target className="h-7 w-7 text-blue-600 shrink-0 animate-spin-slow" />
                Notes Gap Analyzer
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xl leading-relaxed">
                Upload your study notes and discover missing concepts, depth anomalies, and exam syllabus gaps before exam dates.
              </p>
            </div>
            
            {selectedMeta && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex gap-4 text-xs shadow-sm">
                <div>
                  <span className="text-slate-400 block font-medium">Pages</span>
                  <span className="font-bold text-slate-700">{selectedMeta.num_pages}</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400 block font-medium">Subject</span>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-2 py-0">
                    {selectedMeta.subject}
                  </Badge>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400 block font-medium">Audited</span>
                  <span className="font-bold text-slate-700">{formatShortDate(selectedMeta.created_at)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Left Col: Upload Forms */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Setup Card */}
              <Card className="bg-white border-slate-200/80 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-base font-bold text-blue-900 flex items-center gap-1.5">
                    <Upload className="h-4.5 w-4.5 text-blue-600" />
                    Upload Study Notes
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select a subject and upload your notes to evaluate coverage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  
                  {/* File Upload zone */}
                  <Label
                    htmlFor="notes-upload"
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/50 py-8 px-4 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                  >
                    <FileText className="h-9 w-9 text-slate-400 mb-3" />
                    <span className="text-xs font-semibold text-slate-700">
                      {fileName ? fileName : "Select a Notes document"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      PDF, DOCX, or TXT (Max 20MB)
                    </span>
                    <input
                      id="notes-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </Label>

                  {/* Subject Dropdown */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="subject">Subject Map</Label>
                    <select
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-8 px-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none"
                    >
                      <option value="DBMS">DBMS</option>
                      <option value="Operating Systems">Operating Systems</option>
                      <option value="Computer Networks">Computer Networks</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Data Structures">Data Structures</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Custom">Custom Subject...</option>
                    </select>
                  </div>

                  {subject === "Custom" && (
                    <div className="grid gap-1.5">
                      <Label htmlFor="customSub">Enter Custom Subject Name</Label>
                      <Input
                        id="customSub"
                        placeholder="e.g. Distributed Databases"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  )}

                  {/* Optional Key Expander */}
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

                  <Button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending || !fileContent}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm mt-2"
                  >
                    {mutation.isPending ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4 text-white" /> Auditing notes text...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Run Notes Audit
                      </>
                    )}
                  </Button>

                </CardContent>
              </Card>

              {/* Readiness Meter Card */}
              {selectedResult && (
                <Card className="bg-white border-slate-200/80 shadow-sm p-5 space-y-4">
                  
                  {/* Exam Readiness Score */}
                  <div className="border-b border-slate-100 pb-2">
                    <span className="font-display text-sm font-bold text-blue-900 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-blue-600" />
                      10. Exam Readiness Score
                    </span>
                  </div>
                  
                  <div className="text-center py-2 flex flex-col items-center">
                    <div className="relative inline-flex items-center justify-center">
                      {/* Simple visual progress circle mock using rounded borders */}
                      <div className="h-24 w-24 rounded-full border-8 border-slate-100 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-spin-slow opacity-25" />
                        <span className="font-display font-extrabold text-2xl text-blue-900">
                          {selectedResult.readinessScore}%
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block font-medium">Calculated Readiness Indicator</span>
                  </div>

                  {/* Learning Health Status */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <span className="font-display text-xs font-bold text-slate-500 block">
                      11. Learning Health Report
                    </span>
                    
                    {(() => {
                      const health = getHealthStyles(selectedResult.healthStatus);
                      const IconComponent = health.icon;
                      return (
                        <div className={`border rounded-lg p-3 flex gap-2.5 items-start text-xs ${health.color} font-medium`}>
                          <IconComponent className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Status: {health.label}</span>
                            <span className="text-[10px] opacity-80 block mt-0.5">Based on note topic coverage, completeness, and risk gaps.</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </Card>
              )}

            </div>

            {/* Right Col: Audit workspace */}
            <div className="lg:col-span-2 space-y-6">
              
              {!selectedResult ? (
                <Card className="flex flex-col items-center justify-center border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm min-h-[400px]">
                  <Target className="mb-4 h-16 w-16 text-slate-300 animate-pulse" />
                  <h3 className="font-display text-lg font-bold text-blue-900 mb-1">AI Syllabus Auditor</h3>
                  <p className="max-w-md text-xs leading-relaxed">
                    Upload your raw study notes PDF or DOCX file on the left. The system will audit your notes against textbook knowledge maps to find missing formulas, list exam risks, and construct revision cards.
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  
                  {/* Coverage Score progress header */}
                  <Card className="bg-white border-slate-200/80 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        {/* Circular progress ring */}
                        <div className="h-16 w-16 rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                          <span className="font-display font-extrabold text-lg text-blue-950">{selectedResult.coverageScore}%</span>
                        </div>
                        <div>
                          <span className="font-display font-bold text-slate-700 block">4. Note Coverage Completeness</span>
                          <span className="text-[10px] text-slate-400">Audited against textbook core modules</span>
                        </div>
                      </div>

                      <Badge className={`${getScoreCategory(selectedResult.coverageScore).color} text-[10px] font-bold px-3 py-1 border`}>
                        {getScoreCategory(selectedResult.coverageScore).label}
                      </Badge>

                    </div>
                  </Card>

                  {/* Gaps Checklist & warning boxes */}
                  <Card className="bg-white border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-base font-bold text-blue-900 flex items-center gap-1.5">
                        <AlertTriangle className="h-4.5 w-4.5 text-blue-600" />
                        5. Missing Syllabus Topics
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Warning indicators showing essential topics not found in your study notes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 pt-1 text-xs">
                      {selectedResult.missingTopics && selectedResult.missingTopics.length === 0 ? (
                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg p-3 flex gap-2 font-medium">
                          <CheckCircle className="h-4.5 w-4.5" /> Core topics are all covered in notes!
                        </div>
                      ) : (
                        selectedResult.missingTopics.map((topic: string, i: number) => (
                          <div key={i} className="bg-red-50/50 border border-red-200 text-red-800 rounded-lg p-3 flex gap-3 items-start leading-normal">
                            <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-semibold block text-red-900">Missing Concept: {topic}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Please update your notes database to include this chapter before reviews.</span>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Concept Depth bar chart */}
                  <Card className="bg-white border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-base font-bold text-blue-900 flex items-center gap-1.5">
                        <Activity className="h-4.5 w-4.5 text-blue-600" />
                        6. Concept Explanation Depth Analysis
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Review coverage depth rating for individual evaluated chapters.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1 text-xs">
                      {selectedResult.conceptDepth && selectedResult.conceptDepth.map((cd: any) => (
                        <div key={cd.topic} className="space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-600">{cd.topic}</span>
                            <span className="text-slate-800 font-bold">{cd.percent}% Depth</span>
                          </div>
                          <Progress value={cd.percent} className="h-1.5 bg-slate-100 [&>div]:bg-blue-600" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Exam Gaps Risks Indicators */}
                  <Card className="bg-white border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-base font-bold text-blue-900 flex items-center gap-1.5">
                        <ShieldAlert className="h-4.5 w-4.5 text-blue-600" />
                        7. Potential Exam Risks
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Topics categorized by exam vulnerability risk factors.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1 text-xs">
                      
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-red-200 bg-red-50/20 p-3.5 space-y-2">
                          <span className="font-bold text-red-700 text-xs block">High Exam Risk</span>
                          <div className="space-y-1">
                            {selectedResult.weakAreas?.highRisk && selectedResult.weakAreas.highRisk.map((r: string) => (
                              <Badge key={r} variant="outline" className="text-[9px] bg-white text-red-600 border-red-200 py-0.5">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50/20 p-3.5 space-y-2">
                          <span className="font-bold text-amber-700 text-xs block">Medium Exam Risk</span>
                          <div className="space-y-1">
                            {selectedResult.weakAreas?.mediumRisk && selectedResult.weakAreas.mediumRisk.map((r: string) => (
                              <Badge key={r} variant="outline" className="text-[9px] bg-white text-amber-600 border-amber-200 py-0.5">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/20 p-3.5 space-y-2">
                          <span className="font-bold text-emerald-700 text-xs block">Low Exam Risk</span>
                          <div className="space-y-1">
                            {selectedResult.weakAreas?.lowRisk && selectedResult.weakAreas.lowRisk.map((r: string) => (
                              <Badge key={r} variant="outline" className="text-[9px] bg-white text-emerald-600 border-emerald-200 py-0.5">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="bg-white border-slate-200/80 shadow-sm p-5 space-y-3">
                    <span className="font-display text-sm font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                      8. AI Auditor Recommendations
                    </span>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {selectedResult.recommendations && selectedResult.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex gap-2.5 items-start leading-normal">
                          <span className="font-bold text-blue-600">0{i+1}</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Smart Revision Sheet */}
                  <Card className="bg-white border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="font-display text-base font-bold text-blue-900">
                          9. Smart Revision Sheet
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Quick study card details explaining missing concepts and exam tips.
                        </CardDescription>
                      </div>
                      
                      <Button
                        onClick={handleDownloadRevision}
                        size="sm"
                        variant="outline"
                        className="h-8 border-blue-200 hover:bg-blue-50 text-blue-700 text-xs flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF (.txt)
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 text-xs">
                      
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg text-slate-600 leading-relaxed italic">
                        {selectedResult.revisionSheet?.summary}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <span className="font-bold text-blue-950 block text-xs">Key Formulas & Equations</span>
                          <ul className="space-y-1.5 list-inside list-disc text-slate-600 text-[11px] leading-relaxed">
                            {selectedResult.revisionSheet?.formulas && selectedResult.revisionSheet.formulas.map((f: string, i: number) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <span className="font-bold text-blue-950 block text-xs">Exam Tips & Viva advice</span>
                          <ul className="space-y-1.5 list-inside list-disc text-slate-600 text-[11px] leading-relaxed">
                            {selectedResult.revisionSheet?.tips && selectedResult.revisionSheet.tips.map((t: string, i: number) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </CardContent>
                  </Card>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* Previous Audits History Panel */}
        <aside className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-slate-200/80 p-5 shrink-0 flex flex-col">
          <div className="flex items-center gap-2 mb-4 font-display text-sm font-bold text-blue-900 border-b border-slate-100 pb-2">
            <History className="h-4.5 w-4.5 text-blue-600" />
            Previous Analyses
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[400px] md:max-h-none">
            {historyList.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center italic">
                No notes audited yet.
              </div>
            ) : (
              historyList.map((item: any) => {
                const active = selectedMeta?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`group border rounded-lg p-3 transition-colors text-xs space-y-2 flex flex-col justify-between ${
                      active ? "bg-blue-50/30 border-blue-400/50" : "bg-slate-50/40 border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="pr-6 cursor-pointer" onClick={() => handleSelectHistory(item)}>
                      <span className="font-bold text-slate-700 block truncate" title={item.file_name}>
                        {item.file_name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Subject: {item.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold text-blue-600">
                        Coverage: {item.result?.coverageScore || 0}%
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Audited: {formatShortDate(item.created_at)}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSelectHistory(item)}
                        className="h-6 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAnalysis(item.id)}
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
