import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { c as createSsrRpc, u as useServerFn } from "./createSsrRpc-CzYOcfyh.js";
import { C as ChatLayout } from "./ChatLayout-sTEV38C2.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-Cwsrt9M1.js";
import { P as Progress } from "./progress-KPDMJ8Ap.js";
import { B as Badge } from "./badge-BxXV9KYb.js";
import { S as Spinner } from "./spinner-D3GgUm1d.js";
import { a as createServerFn } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
import { Target, Upload, FileText, Key, ChevronUp, ChevronDown, Sparkles, Award, AlertTriangle, CheckCircle, AlertCircle, Activity, ShieldAlert, Download, History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
import "./studentos-logo-CCLo3MN1.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-progress";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./supabase.server-BXfiGlvE.js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
const NotesInputSchema = z.object({
  fileName: z.string(),
  fileContent: z.string(),
  // Base64 encoded file data
  subject: z.string(),
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional()
});
const uploadAndAnalyzeNotes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => NotesInputSchema.parse(input)).handler(createSsrRpc("7c98ed4cc526909e256b29e8fdb5dc5c9c984117e900cd9dcb250e27e27bd943"));
const listNotesAnalyses = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c5e175fa05465f5d215fbdc003bcc4610aaba60f6083f1073967ff7794aee63d"));
const deleteNotesAnalysis = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string()
}).parse(input)).handler(createSsrRpc("081f8da933e521b0d47cfcbef4ad0231b0789f257086b1918daaf729bafe4d18"));
function NotesGapAnalyzerPage() {
  const queryClient = useQueryClient();
  const analyzeNotesFn = useServerFn(uploadAndAnalyzeNotes);
  const listAnalysesFn = useServerFn(listNotesAnalyses);
  const deleteAnalysisFn = useServerFn(deleteNotesAnalysis);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [subject, setSubject] = useState("DBMS");
  const [customSubject, setCustomSubject] = useState("");
  const [provider, setProvider] = useState("Gemini");
  const [customKey, setCustomKey] = useState("");
  const [showKeyExpander, setShowKeyExpander] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedMeta, setSelectedMeta] = useState(null);
  const {
    data: historyList = []
  } = useQuery({
    queryKey: ["notesAnalyses"],
    queryFn: () => listAnalysesFn()
  });
  const handleFileChange = (e) => {
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
      const base64String = reader.result.split(",")[1];
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
          custom_key: customKey || void 0,
          provider: customKey ? provider : void 0
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
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      queryClient.invalidateQueries({
        queryKey: ["notesAnalyses"]
      });
      toast.success("Syllabus gap analysis complete!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to analyze study notes.");
    }
  });
  const handleDeleteAnalysis = async (id) => {
    await deleteAnalysisFn({
      data: {
        id
      }
    });
    queryClient.invalidateQueries({
      queryKey: ["notesAnalyses"]
    });
    if (selectedMeta?.id === id) {
      setSelectedResult(null);
      setSelectedMeta(null);
    }
    toast.success("Analysis report deleted.");
  };
  const handleSelectHistory = (item) => {
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
    const content = `STUDENTOS STUDY NOTES AUDIT - REVISION SHEET
File: ${fileName}
Subject: ${selectedMeta.subject}
Calculated Completeness: ${selectedResult.coverageScore}%
Exam Readiness: ${selectedResult.readinessScore}%

======================================================================
REVISION OUTLINE & GAPS:
======================================================================
${sheet.summary}

======================================================================
REQUIRED REVISION FORMULAS:
======================================================================
` + sheet.formulas.map((f, i) => `* ${f}`).join("\n") + `

======================================================================
EXAM PREPARATION TIPS:
======================================================================
` + sheet.tips.map((t, i) => `* ${t}`).join("\n") + `

Generated via StudentOS Academic Auditor.`;
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RevisionSheet_${selectedMeta.subject.replace(/\s+/g, "")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const getScoreCategory = (score) => {
    if (score >= 90) return {
      label: "Excellent Coverage",
      color: "text-green-600 bg-green-50 border-green-200"
    };
    if (score >= 75) return {
      label: "Good Coverage",
      color: "text-blue-600 bg-blue-50 border-blue-200"
    };
    return {
      label: "Needs Improvement",
      color: "text-red-600 bg-red-50 border-red-200"
    };
  };
  const getHealthStyles = (status) => {
    if (status === "Green" || status === "Well Prepared") return {
      label: "Well Prepared",
      icon: CheckCircle,
      color: "text-green-700 bg-green-50 border-green-200"
    };
    if (status === "Red" || status === "High Exam Risk") return {
      label: "High Exam Risk",
      icon: ShieldAlert,
      color: "text-red-700 bg-red-50 border-red-200"
    };
    return {
      label: "Needs Revision",
      icon: AlertTriangle,
      color: "text-amber-700 bg-amber-50 border-amber-200"
    };
  };
  const formatShortDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(void 0, {
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-slate-50 text-slate-800 light flex flex-col md:flex-row w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 px-6 py-8 md:px-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-200 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "font-display text-3xl font-extrabold tracking-tight text-blue-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Target, { className: "h-7 w-7 text-blue-600 shrink-0 animate-spin-slow" }),
            "Notes Gap Analyzer"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1.5 max-w-xl leading-relaxed", children: "Upload your study notes and discover missing concepts, depth anomalies, and exam syllabus gaps before exam dates." })
        ] }),
        selectedMeta && /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200/80 rounded-xl p-3 flex gap-4 text-xs shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400 block font-medium", children: "Pages" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700", children: selectedMeta.num_pages })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-l border-slate-200 pl-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400 block font-medium", children: "Subject" }),
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-2 py-0", children: selectedMeta.subject })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-l border-slate-200 pl-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400 block font-medium", children: "Audited" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700", children: formatShortDate(selectedMeta.created_at) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1 space-y-6", children: [
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4", children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "font-display text-base font-bold text-blue-900 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-4.5 w-4.5 text-blue-600" }),
                "Upload Study Notes"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Select a subject and upload your notes to evaluate coverage." })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-xs", children: [
              /* @__PURE__ */ jsxs(Label, { htmlFor: "notes-upload", className: "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/50 py-8 px-4 text-center cursor-pointer hover:border-blue-500/50 transition-colors", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-9 w-9 text-slate-400 mb-3" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-slate-700", children: fileName ? fileName : "Select a Notes document" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 mt-1", children: "PDF, DOCX, or TXT (Max 20MB)" }),
                /* @__PURE__ */ jsx("input", { id: "notes-upload", type: "file", accept: ".pdf,.docx,.txt", onChange: handleFileChange, className: "hidden" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "subject", children: "Subject Map" }),
                /* @__PURE__ */ jsxs("select", { id: "subject", value: subject, onChange: (e) => setSubject(e.target.value), className: "w-full h-8 px-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none", children: [
                  /* @__PURE__ */ jsx("option", { value: "DBMS", children: "DBMS" }),
                  /* @__PURE__ */ jsx("option", { value: "Operating Systems", children: "Operating Systems" }),
                  /* @__PURE__ */ jsx("option", { value: "Computer Networks", children: "Computer Networks" }),
                  /* @__PURE__ */ jsx("option", { value: "Software Engineering", children: "Software Engineering" }),
                  /* @__PURE__ */ jsx("option", { value: "Data Structures", children: "Data Structures" }),
                  /* @__PURE__ */ jsx("option", { value: "Machine Learning", children: "Machine Learning" }),
                  /* @__PURE__ */ jsx("option", { value: "Web Development", children: "Web Development" }),
                  /* @__PURE__ */ jsx("option", { value: "Custom", children: "Custom Subject..." })
                ] })
              ] }),
              subject === "Custom" && /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "customSub", children: "Enter Custom Subject Name" }),
                /* @__PURE__ */ jsx(Input, { id: "customSub", placeholder: "e.g. Distributed Databases", value: customSubject, onChange: (e) => setCustomSubject(e.target.value), className: "h-8 text-xs bg-white" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5", children: [
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowKeyExpander(!showKeyExpander), className: "flex w-full items-center justify-between py-1 text-xs font-semibold text-slate-500 hover:text-slate-700", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Key, { className: "h-3.5 w-3.5" }),
                    "🔑 Optional: Use Custom API Keys"
                  ] }),
                  showKeyExpander ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5" })
                ] }),
                showKeyExpander && /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-3 pb-2 pt-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
                    /* @__PURE__ */ jsx(Label, { htmlFor: "provider", className: "text-[10px]", children: "LLM Provider" }),
                    /* @__PURE__ */ jsxs("select", { id: "provider", value: provider, onChange: (e) => setProvider(e.target.value), className: "w-full h-8 px-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none", children: [
                      /* @__PURE__ */ jsx("option", { value: "Gemini", children: "Gemini" }),
                      /* @__PURE__ */ jsx("option", { value: "OpenAI", children: "OpenAI" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
                    /* @__PURE__ */ jsx(Label, { htmlFor: "apiKey", className: "text-[10px]", children: "API Key" }),
                    /* @__PURE__ */ jsx(Input, { id: "apiKey", type: "password", placeholder: "Enter your API Key", value: customKey, onChange: (e) => setCustomKey(e.target.value), className: "h-8 text-xs bg-white" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(Button, { onClick: () => mutation.mutate(), disabled: mutation.isPending || !fileContent, className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm mt-2", children: mutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Spinner, { className: "mr-2 h-4 w-4 text-white" }),
                " Auditing notes text..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "mr-2 h-4 w-4" }),
                " Run Notes Audit"
              ] }) })
            ] })
          ] }),
          selectedResult && /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm p-5 space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "border-b border-slate-100 pb-2", children: /* @__PURE__ */ jsxs("span", { className: "font-display text-sm font-bold text-blue-900 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Award, { className: "h-4 w-4 text-blue-600" }),
              "10. Exam Readiness Score"
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-center py-2 flex flex-col items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "relative inline-flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "h-24 w-24 rounded-full border-8 border-slate-100 flex items-center justify-center relative", children: [
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-spin-slow opacity-25" }),
                /* @__PURE__ */ jsxs("span", { className: "font-display font-extrabold text-2xl text-blue-900", children: [
                  selectedResult.readinessScore,
                  "%"
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 mt-2 block font-medium", children: "Calculated Readiness Indicator" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-slate-100 pt-4 space-y-2.5", children: [
              /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-bold text-slate-500 block", children: "11. Learning Health Report" }),
              (() => {
                const health = getHealthStyles(selectedResult.healthStatus);
                const IconComponent = health.icon;
                return /* @__PURE__ */ jsxs("div", { className: `border rounded-lg p-3 flex gap-2.5 items-start text-xs ${health.color} font-medium`, children: [
                  /* @__PURE__ */ jsx(IconComponent, { className: "h-4.5 w-4.5 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("span", { className: "font-bold block", children: [
                      "Status: ",
                      health.label
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] opacity-80 block mt-0.5", children: "Based on note topic coverage, completeness, and risk gaps." })
                  ] })
                ] });
              })()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-6", children: !selectedResult ? /* @__PURE__ */ jsxs(Card, { className: "flex flex-col items-center justify-center border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm min-h-[400px]", children: [
          /* @__PURE__ */ jsx(Target, { className: "mb-4 h-16 w-16 text-slate-300 animate-pulse" }),
          /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-bold text-blue-900 mb-1", children: "AI Syllabus Auditor" }),
          /* @__PURE__ */ jsx("p", { className: "max-w-md text-xs leading-relaxed", children: "Upload your raw study notes PDF or DOCX file on the left. The system will audit your notes against textbook knowledge maps to find missing formulas, list exam risks, and construct revision cards." })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx(Card, { className: "bg-white border-slate-200/80 shadow-sm p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxs("span", { className: "font-display font-extrabold text-lg text-blue-950", children: [
                selectedResult.coverageScore,
                "%"
              ] }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-slate-700 block", children: "4. Note Coverage Completeness" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400", children: "Audited against textbook core modules" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Badge, { className: `${getScoreCategory(selectedResult.coverageScore).color} text-[10px] font-bold px-3 py-1 border`, children: getScoreCategory(selectedResult.coverageScore).label })
          ] }) }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "font-display text-base font-bold text-blue-900 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4.5 w-4.5 text-blue-600" }),
                "5. Missing Syllabus Topics"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Warning indicators showing essential topics not found in your study notes." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "grid gap-3 pt-1 text-xs", children: selectedResult.missingTopics && selectedResult.missingTopics.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg p-3 flex gap-2 font-medium", children: [
              /* @__PURE__ */ jsx(CheckCircle, { className: "h-4.5 w-4.5" }),
              " Core topics are all covered in notes!"
            ] }) : selectedResult.missingTopics.map((topic, i) => /* @__PURE__ */ jsxs("div", { className: "bg-red-50/50 border border-red-200 text-red-800 rounded-lg p-3 flex gap-3 items-start leading-normal", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("strong", { className: "font-semibold block text-red-900", children: [
                  "Missing Concept: ",
                  topic
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 block mt-0.5", children: "Please update your notes database to include this chapter before reviews." })
              ] })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "font-display text-base font-bold text-blue-900 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Activity, { className: "h-4.5 w-4.5 text-blue-600" }),
                "6. Concept Explanation Depth Analysis"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Review coverage depth rating for individual evaluated chapters." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "space-y-4 pt-1 text-xs", children: selectedResult.conceptDepth && selectedResult.conceptDepth.map((cd) => /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-semibold", children: [
                /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: cd.topic }),
                /* @__PURE__ */ jsxs("span", { className: "text-slate-800 font-bold", children: [
                  cd.percent,
                  "% Depth"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: cd.percent, className: "h-1.5 bg-slate-100 [&>div]:bg-blue-600" })
            ] }, cd.topic)) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "font-display text-base font-bold text-blue-900 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(ShieldAlert, { className: "h-4.5 w-4.5 text-blue-600" }),
                "7. Potential Exam Risks"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Topics categorized by exam vulnerability risk factors." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "space-y-4 pt-1 text-xs", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-red-200 bg-red-50/20 p-3.5 space-y-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-red-700 text-xs block", children: "High Exam Risk" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1", children: selectedResult.weakAreas?.highRisk && selectedResult.weakAreas.highRisk.map((r) => /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[9px] bg-white text-red-600 border-red-200 py-0.5", children: r }, r)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50/20 p-3.5 space-y-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-700 text-xs block", children: "Medium Exam Risk" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1", children: selectedResult.weakAreas?.mediumRisk && selectedResult.weakAreas.mediumRisk.map((r) => /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[9px] bg-white text-amber-600 border-amber-200 py-0.5", children: r }, r)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-emerald-200 bg-emerald-50/20 p-3.5 space-y-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-700 text-xs block", children: "Low Exam Risk" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1", children: selectedResult.weakAreas?.lowRisk && selectedResult.weakAreas.lowRisk.map((r) => /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[9px] bg-white text-emerald-600 border-emerald-200 py-0.5", children: r }, r)) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm p-5 space-y-3", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-display text-sm font-bold text-blue-900 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-blue-600 animate-pulse" }),
              "8. AI Auditor Recommendations"
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-xs text-slate-600", children: selectedResult.recommendations && selectedResult.recommendations.map((rec, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2.5 items-start leading-normal", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-blue-600", children: [
                "0",
                i + 1
              ] }),
              /* @__PURE__ */ jsx("span", { children: rec })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-slate-100 flex flex-row items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "font-display text-base font-bold text-blue-900", children: "9. Smart Revision Sheet" }),
                /* @__PURE__ */ jsx(CardDescription, { className: "text-xs mt-0.5", children: "Quick study card details explaining missing concepts and exam tips." })
              ] }),
              /* @__PURE__ */ jsxs(Button, { onClick: handleDownloadRevision, size: "sm", variant: "outline", className: "h-8 border-blue-200 hover:bg-blue-50 text-blue-700 text-xs flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
                "Download PDF (.txt)"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 space-y-4 text-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-slate-50 border border-slate-200/60 p-4 rounded-lg text-slate-600 leading-relaxed italic", children: selectedResult.revisionSheet?.summary }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-950 block text-xs", children: "Key Formulas & Equations" }),
                  /* @__PURE__ */ jsx("ul", { className: "space-y-1.5 list-inside list-disc text-slate-600 text-[11px] leading-relaxed", children: selectedResult.revisionSheet?.formulas && selectedResult.revisionSheet.formulas.map((f, i) => /* @__PURE__ */ jsx("li", { children: f }, i)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-950 block text-xs", children: "Exam Tips & Viva advice" }),
                  /* @__PURE__ */ jsx("ul", { className: "space-y-1.5 list-inside list-disc text-slate-600 text-[11px] leading-relaxed", children: selectedResult.revisionSheet?.tips && selectedResult.revisionSheet.tips.map((t, i) => /* @__PURE__ */ jsx("li", { children: t }, i)) })
                ] })
              ] })
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-slate-200/80 p-5 shrink-0 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4 font-display text-sm font-bold text-blue-900 border-b border-slate-100 pb-2", children: [
        /* @__PURE__ */ jsx(History, { className: "h-4.5 w-4.5 text-blue-600" }),
        "Previous Analyses"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto space-y-2.5 max-h-[400px] md:max-h-none", children: historyList.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-400 py-6 text-center italic", children: "No notes audited yet." }) : historyList.map((item) => {
        const active = selectedMeta?.id === item.id;
        return /* @__PURE__ */ jsxs("div", { className: `group border rounded-lg p-3 transition-colors text-xs space-y-2 flex flex-col justify-between ${active ? "bg-blue-50/30 border-blue-400/50" : "bg-slate-50/40 border-slate-200/80 hover:bg-slate-50"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "pr-6 cursor-pointer", onClick: () => handleSelectHistory(item), children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700 block truncate", title: item.file_name, children: item.file_name }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-400 mt-1 block", children: [
              "Subject: ",
              item.subject
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-400 block font-semibold text-blue-600", children: [
              "Coverage: ",
              item.result?.coverageScore || 0,
              "%"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-slate-400 block", children: [
              "Audited: ",
              formatShortDate(item.created_at)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-1", children: [
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleSelectHistory(item), className: "h-6 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2", children: "View" }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDeleteAnalysis(item.id), className: "h-6 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 px-2", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
          ] })
        ] }, item.id);
      }) })
    ] })
  ] }) });
}
export {
  NotesGapAnalyzerPage as component
};
