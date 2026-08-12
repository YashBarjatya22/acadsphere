import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
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
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, BookOpen, Upload, FileText, Key, ChevronUp, BrainCircuit, Gauge, Activity, Award, Download, History, Trash2 } from "lucide-react";
import { c as cn } from "./utils-H80jjgLf.js";
import { a as createServerFn } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
import "./studentos-logo-CCLo3MN1.js";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-progress";
import "clsx";
import "tailwind-merge";
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
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
  AccordionPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
const PaperInputSchema = z.object({
  fileName: z.string(),
  fileContent: z.string(),
  // Base64 encoded file data
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional()
});
const uploadAndAnalyzePaper = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => PaperInputSchema.parse(input)).handler(createSsrRpc("b864881ebda058fd7fe211b2ff03ce320363964dadcd542a5c194f45876a3203"));
const listPaperAnalyses = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9d31a0c5e0323d8f1e4a599365927fa8d2ae3db65c02cced968934ffc2139847"));
const deletePaperAnalysis = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string()
}).parse(input)).handler(createSsrRpc("bcfa5e3cb5b13000d2dde6f4a096e7b946de892afd899c05366b0101343ad179"));
function PaperSimplifierPage() {
  const queryClient = useQueryClient();
  const analyzePaperFn = useServerFn(uploadAndAnalyzePaper);
  const listAnalysesFn = useServerFn(listPaperAnalyses);
  const deleteAnalysisFn = useServerFn(deletePaperAnalysis);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [provider, setProvider] = useState("Gemini");
  const [customKey, setCustomKey] = useState("");
  const [showKeyExpander, setShowKeyExpander] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedMeta, setSelectedMeta] = useState(null);
  const {
    data: history = [],
    refetch: refetchHistory
  } = useQuery({
    queryKey: ["paperAnalyses"],
    queryFn: () => listAnalysesFn()
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!fileContent) throw new Error("Please upload a research paper.");
      return analyzePaperFn({
        data: {
          fileName,
          fileContent,
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
        upload_date: (/* @__PURE__ */ new Date()).toISOString(),
        status: data.status
      });
      queryClient.invalidateQueries({
        queryKey: ["paperAnalyses"]
      });
      toast.success("Research paper parsed and analyzed successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to analyze paper. Check configuration.");
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return deleteAnalysisFn({
        data: {
          id
        }
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["paperAnalyses"]
      });
      if (selectedMeta?.id === id) {
        setSelectedResult(null);
        setSelectedMeta(null);
      }
      toast.success("Analysis deleted.");
    }
  });
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF research paper.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size exceeds 20MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      setFileContent(base64String);
      setFileName(file.name);
      toast.success(`PDF selected: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };
  const handleSelectHistory = (item) => {
    setSelectedResult(item.result);
    setSelectedMeta({
      id: item.id,
      file_name: item.file_name,
      num_pages: item.num_pages,
      upload_date: item.upload_date,
      status: item.status
    });
    setFileName(item.file_name);
    toast.info(`Loaded analysis: ${item.file_name}`);
  };
  const downloadRevisionAsTxt = () => {
    if (!selectedResult || !fileName) return;
    const content = `STUDENTOS PAPER SIMPLIFIER - QUICK REVISION SHEET
Paper Title: ${fileName}
Analyzed Date: ${new Date(selectedMeta?.upload_date).toLocaleDateString()}
Estimated Pages: ${selectedMeta?.num_pages}

======================================================================
EXAMINATION SUMMARY:
======================================================================
${selectedResult.quickRevision.summary}

======================================================================
KEY REVISION BULLET POINTS:
======================================================================
` + selectedResult.quickRevision.bulletPoints.map((pt, idx) => `[${idx + 1}] ${pt}`).join("\n\n") + `

Generated via StudentOS AI Research Assistant.`;
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName.replace(/\.[^/.]+$/, "")}_RevisionSheet.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const getDifficultyColor = (level) => {
    if (level === "Easy") return "bg-green-500/10 text-green-700 border-green-500/20";
    if (level === "Hard") return "bg-red-500/10 text-red-700 border-red-500/20";
    return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  };
  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(void 0, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateString;
    }
  };
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-slate-50 text-slate-800 light flex flex-col md:flex-row", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 px-6 py-8 md:px-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-200 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "font-display text-3xl font-extrabold tracking-tight text-blue-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(BookOpen, { className: "h-7 w-7 text-blue-600 shrink-0" }),
            "Paper Simplifier"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1.5 max-w-xl leading-relaxed", children: "Upload a research paper and receive AI-powered summaries, explanations, and viva preparation tools. Ideal for MCA, BCA, and Engineering students." })
        ] }),
        selectedMeta && /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200/80 rounded-xl p-3 flex gap-4 text-xs shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400 block font-medium", children: "Pages" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700", children: selectedMeta.num_pages })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-l border-slate-200 pl-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400 block font-medium", children: "Status" }),
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold px-2 py-0", children: selectedMeta.status })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-l border-slate-200 pl-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400 block font-medium", children: "Uploaded" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700", children: formatDate(selectedMeta.upload_date) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1 space-y-6", children: [
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4", children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "font-display text-base font-bold text-blue-900 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-4.5 w-4.5 text-blue-600" }),
                "Upload Research Paper"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Drag and drop your paper PDF file to start the extraction." })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs(Label, { htmlFor: "paper-upload", className: "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/50 py-8 px-4 text-center cursor-pointer hover:border-blue-500/50 transition-colors", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-9 w-9 text-slate-400 mb-3" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-slate-700", children: fileName ? fileName : "Click to select a research PDF" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 mt-1", children: "PDF documents up to 20MB" }),
                /* @__PURE__ */ jsx("input", { id: "paper-upload", type: "file", accept: ".pdf", onChange: handleFileChange, className: "hidden" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5", children: [
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowKeyExpander(!showKeyExpander), className: "flex w-full items-center justify-between py-1 text-xs font-semibold text-slate-500 hover:text-slate-700", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Key, { className: "h-3.5 w-3.5" }),
                    "🔑 Optional: Use Custom API Keys"
                  ] }),
                  showKeyExpander ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5" })
                ] }),
                showKeyExpander && /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-3 pb-2 pt-1 text-xs", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
                    /* @__PURE__ */ jsx(Label, { htmlFor: "provider", className: "text-[10px]", children: "LLM Provider" }),
                    /* @__PURE__ */ jsxs("select", { id: "provider", value: provider, onChange: (e) => setProvider(e.target.value), className: "w-full h-8 px-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none focus:border-blue-500", children: [
                      /* @__PURE__ */ jsx("option", { value: "Gemini", children: "Gemini" }),
                      /* @__PURE__ */ jsx("option", { value: "OpenAI", children: "OpenAI" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
                    /* @__PURE__ */ jsx(Label, { htmlFor: "apiKey", className: "text-[10px]", children: "API Key" }),
                    /* @__PURE__ */ jsx(Input, { id: "apiKey", type: "password", placeholder: "Enter your LLM API Key", value: customKey, onChange: (e) => setCustomKey(e.target.value), className: "h-8 text-xs bg-white border-slate-200" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(Button, { onClick: () => uploadMutation.mutate(), disabled: uploadMutation.isPending || !fileContent, className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm", children: uploadMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Spinner, { className: "mr-2 h-4 w-4 text-white" }),
                " Analyzing paper contents..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(BrainCircuit, { className: "mr-2 h-4 w-4" }),
                " Simplify Paper Now"
              ] }) })
            ] })
          ] }),
          selectedResult && /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm space-y-5 p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-100 pb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-display text-sm font-bold text-blue-900 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Gauge, { className: "h-4 w-4 text-blue-600" }),
                "Extraction Confidence"
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[9px] py-0 border-blue-200 bg-blue-50/50 text-blue-700", children: "AI Diagnostics" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-semibold", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Summary Confidence" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-slate-700 font-bold", children: [
                    selectedResult.confidenceMeter?.summaryScore,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Progress, { value: selectedResult.confidenceMeter?.summaryScore || 85, className: "h-1.5 bg-slate-100 [&>div]:bg-blue-600" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-semibold", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Extraction Quality" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-slate-700 font-bold", children: [
                    selectedResult.confidenceMeter?.extractionScore,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Progress, { value: selectedResult.confidenceMeter?.extractionScore || 90, className: "h-1.5 bg-slate-100 [&>div]:bg-blue-600" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-slate-100 pt-4 space-y-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-display text-sm font-bold text-blue-900 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-blue-600" }),
                "Analytics Metrics"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-semibold", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Vocabulary & Reading Difficulty" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-slate-700 font-bold", children: [
                      selectedResult.analytics?.readingDifficulty,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: selectedResult.analytics?.readingDifficulty || 65, className: "h-1.5 bg-slate-100 [&>div]:bg-amber-500" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-semibold", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Research & Math Complexity" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-slate-700 font-bold", children: [
                      selectedResult.analytics?.researchComplexity,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: selectedResult.analytics?.researchComplexity || 75, className: "h-1.5 bg-slate-100 [&>div]:bg-purple-500" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-semibold", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "MCA Student Comprehension Rate" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-slate-700 font-bold", children: [
                      selectedResult.analytics?.studentUnderstanding,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: selectedResult.analytics?.studentUnderstanding || 80, className: "h-1.5 bg-slate-100 [&>div]:bg-emerald-500" })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-6", children: !selectedResult ? /* @__PURE__ */ jsxs(Card, { className: "flex flex-col items-center justify-center border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm min-h-[400px]", children: [
          /* @__PURE__ */ jsx(BrainCircuit, { className: "mb-4 h-16 w-16 text-slate-300 animate-pulse" }),
          /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-bold text-blue-900 mb-1", children: "AI Research Companion" }),
          /* @__PURE__ */ jsx("p", { className: "max-w-md text-xs leading-relaxed", children: "Upload a research paper PDF on the left. The assistant will parse the content, extract structured methodology indices, draft a quick revision sheet, and formulate a 10-question viva preparation dashboard." })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-6", children: /* @__PURE__ */ jsxs(Accordion, { type: "single", collapsible: true, defaultValue: "summary", className: "space-y-4", children: [
            /* @__PURE__ */ jsxs(AccordionItem, { value: "summary", className: "border border-slate-100 bg-slate-50/50 rounded-lg overflow-hidden px-4", children: [
              /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm font-bold text-blue-900 hover:no-underline py-3", children: "1. Plain English Summary" }),
              /* @__PURE__ */ jsx(AccordionContent, { className: "text-xs text-slate-600 leading-relaxed space-y-3 pt-1 pb-4", children: selectedResult.plainEnglishSummary.split("\n\n").map((p, i) => /* @__PURE__ */ jsx("p", { children: p }, i)) })
            ] }),
            /* @__PURE__ */ jsxs(AccordionItem, { value: "problem", className: "border border-slate-100 bg-slate-50/50 rounded-lg overflow-hidden px-4", children: [
              /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm font-bold text-blue-900 hover:no-underline py-3", children: "2. Problem Statement" }),
              /* @__PURE__ */ jsxs(AccordionContent, { className: "space-y-4 pt-1 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1", children: "What the researchers are solving" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.problemStatement?.solving })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1", children: "Why it matters" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.problemStatement?.whyItMatters })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(AccordionItem, { value: "findings", className: "border border-slate-100 bg-slate-50/50 rounded-lg overflow-hidden px-4", children: [
              /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm font-bold text-blue-900 hover:no-underline py-3", children: "3. Key Findings" }),
              /* @__PURE__ */ jsx(AccordionContent, { className: "pt-1 pb-4", children: /* @__PURE__ */ jsx("ul", { className: "space-y-2.5", children: selectedResult.keyFindings && selectedResult.keyFindings.map((finding, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2 text-xs text-slate-600 leading-relaxed", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-blue-600 shrink-0", children: [
                  "0",
                  i + 1,
                  "."
                ] }),
                /* @__PURE__ */ jsx("span", { children: finding })
              ] }, i)) }) })
            ] }),
            /* @__PURE__ */ jsxs(AccordionItem, { value: "methodology", className: "border border-slate-100 bg-slate-50/50 rounded-lg overflow-hidden px-4", children: [
              /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm font-bold text-blue-900 hover:no-underline py-3", children: "4. Research Methodology" }),
              /* @__PURE__ */ jsxs(AccordionContent, { className: "grid gap-4 sm:grid-cols-2 pt-1 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 p-3 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1", children: "Approach & Architecture" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.methodology?.approach })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 p-3 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1", children: "Algorithms & Equations" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.methodology?.algorithms || "None discussed." })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 p-3 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1", children: "Datasets Utilized" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.methodology?.dataset || "Simulation/theoretical dataset." })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 p-3 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1", children: "Tech Stack & Frameworks" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.methodology?.tools })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(AccordionItem, { value: "keywords", className: "border border-slate-100 bg-slate-50/50 rounded-lg overflow-hidden px-4", children: [
              /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm font-bold text-blue-900 hover:no-underline py-3", children: "5. Important Keywords & Definitions" }),
              /* @__PURE__ */ jsx(AccordionContent, { className: "pt-1 pb-4", children: /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: selectedResult.keywords && selectedResult.keywords.map((kw, i) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 p-3 rounded-lg", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-700 text-xs block mb-1", children: kw.word }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 leading-normal", children: kw.definition })
              ] }, i)) }) })
            ] }),
            /* @__PURE__ */ jsxs(AccordionItem, { value: "gap", className: "border border-slate-100 bg-slate-50/50 rounded-lg overflow-hidden px-4", children: [
              /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm font-bold text-blue-900 hover:no-underline py-3", children: "6. Research Gap & Limitations" }),
              /* @__PURE__ */ jsxs(AccordionContent, { className: "space-y-4 pt-1 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1", children: "Missing Elements / Scope Skips" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.researchGap?.missing })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1", children: "Study Limitations" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.researchGap?.limitations })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1", children: "Open Vulnerabilities & Challenges" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.researchGap?.challenges })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(AccordionItem, { value: "scope", className: "border border-slate-100 bg-slate-50/50 rounded-lg overflow-hidden px-4", children: [
              /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm font-bold text-blue-900 hover:no-underline py-3", children: "7. Future Scope & Extensions" }),
              /* @__PURE__ */ jsxs(AccordionContent, { className: "space-y-3 pt-1 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1", children: "Recommended future improvements" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.futureScope?.improvements })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1", children: "Student Extension/Project Opportunities" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedResult.futureScope?.extensions })
                ] })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "font-display text-base font-bold text-blue-900 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Award, { className: "h-4.5 w-4.5 text-blue-600" }),
                "8. Viva Preparation Module"
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "10 expected project viva questions compiled by the AI Mentor based on the research core metrics." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Accordion, { type: "multiple", className: "space-y-2.5", children: selectedResult.vivaPrep && selectedResult.vivaPrep.map((item, i) => /* @__PURE__ */ jsxs(AccordionItem, { value: `viva-${i}`, className: "border border-slate-200 bg-slate-50/30 rounded-lg overflow-hidden px-3", children: [
              /* @__PURE__ */ jsxs(AccordionTrigger, { className: "text-xs font-semibold text-slate-700 hover:no-underline py-2.5 text-left flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-start gap-2 pr-6", children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-mono text-blue-600", children: [
                    "Q",
                    i + 1,
                    "."
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: item.question })
                ] }),
                /* @__PURE__ */ jsx(Badge, { className: `${getDifficultyColor(item.difficulty)} border text-[9px] px-1.5 py-0 shrink-0 font-bold`, children: item.difficulty })
              ] }),
              /* @__PURE__ */ jsxs(AccordionContent, { className: "text-xs text-slate-500 leading-normal border-t border-slate-100 pt-3 pb-3 mt-1 pl-7", children: [
                /* @__PURE__ */ jsx("strong", { className: "text-blue-900 block mb-1", children: "Expected Viva Answer:" }),
                item.expectedAnswer
              ] })
            ] }, i)) }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-white border-slate-200/80 shadow-sm", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 flex flex-row items-center justify-between border-b border-slate-100", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "font-display text-base font-bold text-blue-900", children: "9. Quick Revision Sheet" }),
                /* @__PURE__ */ jsx(CardDescription, { className: "text-xs mt-0.5", children: "One-page bullet-point review summary for last-minute revisions." })
              ] }),
              /* @__PURE__ */ jsxs(Button, { onClick: downloadRevisionAsTxt, size: "sm", variant: "outline", className: "h-8 border-blue-200 hover:bg-blue-50 text-blue-700 text-xs flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
                "Download (.txt)"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 pt-4 text-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-slate-50 p-4 rounded-lg border border-slate-100 italic text-slate-600 leading-relaxed", children: selectedResult.quickRevision?.summary }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 pl-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-900 block text-xs", children: "Key Study Bullet Points" }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-2 list-inside list-disc text-slate-600", children: selectedResult.quickRevision?.bulletPoints && selectedResult.quickRevision.bulletPoints.map((pt, idx) => /* @__PURE__ */ jsx("li", { className: "leading-relaxed pl-1 text-[11px]", children: pt }, idx)) })
              ] })
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-slate-200/80 p-5 shrink-0 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4 font-display text-sm font-bold text-blue-900 border-b border-slate-100 pb-2", children: [
        /* @__PURE__ */ jsx(History, { className: "h-4.5 w-4.5 text-blue-600" }),
        "Analysis History"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto space-y-2.5 max-h-[400px] md:max-h-none", children: history.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-400 py-6 text-center italic", children: "No research papers simplified yet." }) : history.map((item) => {
        const active = selectedMeta?.id === item.id;
        return /* @__PURE__ */ jsxs("div", { className: `group border rounded-lg p-3 transition-colors text-xs space-y-2 relative flex flex-col justify-between ${active ? "bg-blue-50/30 border-blue-400/50" : "bg-slate-50/40 border-slate-200/80 hover:bg-slate-50"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "pr-6 cursor-pointer", onClick: () => handleSelectHistory(item), children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700 block truncate", title: item.file_name, children: item.file_name }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-400 mt-1 block", children: [
              formatDate(item.upload_date),
              " · ",
              item.num_pages,
              " pages"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-1", children: [
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleSelectHistory(item), className: "h-6 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2", children: "View" }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => deleteMutation.mutate(item.id), className: "h-6 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 px-2", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
          ] })
        ] }, item.id);
      }) })
    ] })
  ] }) });
}
export {
  PaperSimplifierPage as component
};
