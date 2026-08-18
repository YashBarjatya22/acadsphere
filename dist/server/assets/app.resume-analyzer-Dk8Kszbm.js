import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { c as createSsrRpc, u as useServerFn } from "./createSsrRpc-CQTokSDO.js";
import { C as ChatLayout } from "./ChatLayout-HmtBFy90.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { T as Textarea } from "./textarea-bZdI8Am0.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DmEazsxn.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-Cwsrt9M1.js";
import { B as Badge } from "./badge-BxXV9KYb.js";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { c as cn } from "./utils-H80jjgLf.js";
import { S as Spinner } from "./spinner-D3GgUm1d.js";
import { a as createServerFn } from "./server-DkTRikc9.js";
import { r as requireSupabaseAuth } from "./auth-middleware-C_UiqRP9.js";
import { z } from "zod";
import { Upload, FileText, CheckCircle, FileCheck2, Key, ChevronUp, ChevronDown, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
import "./studentos-logo-CCLo3MN1.js";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-select";
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
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      // Editorial tab list — underline style, no pill background
      "inline-flex items-center gap-0",
      "border-b border-border",
      "text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      // Space Mono uppercase labels with underline active indicator
      "relative inline-flex items-center justify-center",
      "font-mono text-[11px] uppercase tracking-[0.08em]",
      "px-4 py-3",
      "cursor-pointer",
      "whitespace-nowrap",
      "text-muted-foreground",
      "transition-colors duration-[120ms] ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
      // Active state: black text + bottom border indicator
      "data-[state=active]:text-foreground",
      "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[1px] data-[state=active]:after:bg-foreground data-[state=active]:after:content-['']",
      // Hover state
      "hover:text-foreground",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-6 ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "animate-fade-in",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
const ResumeInputSchema = z.object({
  fileName: z.string(),
  fileContent: z.string(),
  // Base64 encoded file data
  jobDescription: z.string(),
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional()
});
const analyzeResume = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => ResumeInputSchema.parse(input)).handler(createSsrRpc("c8f61b0afaae08e817dcd91bcf0654257dcb701d1ab06bf9bf2b1159856e40ce"));
function ResumeAnalyzerPage() {
  const analyzeFn = useServerFn(analyzeResume);
  const [fileName, setFileName] = useState("John_Doe_SDE_Resume.pdf");
  const [fileContent, setFileContent] = useState("");
  const [jobDescription, setJobDescription] = useState("Seeking a Software Development Engineer with strong proficiency in Data Structures, Relational Databases (SQL), Operating Systems, and React/TypeScript web frameworks.");
  const [provider, setProvider] = useState("Gemini");
  const [customKey, setCustomKey] = useState("");
  const [showKeyExpander, setShowKeyExpander] = useState(false);
  const [result, setResult] = useState({
    matchPercentage: 88,
    atsCompatibilityScore: 92,
    strengthAreas: ["Proficient in Core Java, Python, and SQL database querying.", "Hands-on project experience with React, REST APIs, and SQLite.", "Clear bullet points formatted with action verbs and quantifiable metrics."],
    missingKeywords: ["Docker", "Kubernetes", "Redis Caching", "CI/CD Pipeline"],
    grammarStyleIssues: ["Avoid passive phrasing in project descriptions — use active action verbs like 'Engineered', 'Architected', 'Deployed'."],
    tailoredBulletSuggestions: ["Architected a full-stack academic monitoring system serving 1,140 students with sub-100ms API query latency.", "Implemented spaced-repetition study planner algorithms, boosting student test scores by 24%."]
  });
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (fileExt !== "pdf" && fileExt !== "docx") {
      toast.error("Only PDF and DOCX files are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      setFileContent(base64String);
      setFileName(file.name);
      toast.success(`Loaded resume: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };
  const mutation = useMutation({
    mutationFn: async () => {
      if (!fileContent) {
        throw new Error("Please upload a resume file.");
      }
      if (!jobDescription.trim()) {
        throw new Error("Please paste a target job description.");
      }
      return analyzeFn({
        data: {
          fileName,
          fileContent,
          jobDescription,
          custom_key: customKey || void 0,
          provider: customKey ? provider : void 0
        }
      });
    },
    onSuccess: (data) => {
      setResult(data.analysis);
      toast.success("Resume analyzed successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Resume analysis failed. Please try again.");
    }
  });
  const getScoreStyles = (score) => {
    if (score >= 80) return {
      text: "text-green-400",
      border: "border-green-500/20",
      bg: "bg-green-500/10"
    };
    if (score >= 60) return {
      text: "text-yellow-400",
      border: "border-yellow-500/20",
      bg: "bg-yellow-500/10"
    };
    return {
      text: "text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/10"
    };
  };
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-background px-6 py-6 text-foreground md:px-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative mb-8 overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 text-center shadow-lg md:p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" }),
      /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-bold tracking-tight text-gradient sm:text-5xl", children: "Resume Analyzer & ATS Optimizer" }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base", children: "Bridge the gap between your resume and your dream role. Upload your resume, paste the target job description, and get instant score optimization." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card/40 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 font-display text-lg", children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5 text-primary" }),
              "Upload Resume"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Upload your resume in PDF or Word (DOCX) format." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs(Label, { htmlFor: "file-upload", className: "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/20 py-8 px-4 text-center cursor-pointer hover:border-primary/50 transition-colors", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-10 w-10 text-muted-foreground/40 mb-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: fileName ? fileName : "Click to select a file" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground mt-1", children: "Supports PDF and DOCX documents" }),
              /* @__PURE__ */ jsx("input", { id: "file-upload", type: "file", accept: ".pdf,.docx", onChange: handleFileChange, className: "hidden" })
            ] }),
            fileName && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-green-400 font-medium", children: [
                /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
                " Ready: ",
                fileName
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: () => {
                setFileName("");
                setFileContent("");
              }, className: "text-muted-foreground hover:text-foreground hover:underline", children: "Clear" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card/40 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 font-display text-lg", children: [
              /* @__PURE__ */ jsx(FileCheck2, { className: "h-5 w-5 text-primary" }),
              "Paste Job Description"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Input the target job listing description to evaluate alignment." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Textarea, { placeholder: "We are looking for a Software Engineer with experience in React, Python, and SQL...", value: jobDescription, onChange: (e) => setJobDescription(e.target.value), className: "min-h-[220px] resize-none" }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-surface/40 px-4 py-2", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowKeyExpander(!showKeyExpander), className: "flex w-full items-center justify-between py-1 text-sm font-medium text-muted-foreground hover:text-foreground", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Key, { className: "h-4 w-4" }),
                  "🔑 Optional: Use Custom API Keys"
                ] }),
                showKeyExpander ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
              ] }),
              showKeyExpander && /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-3 pb-2 pt-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "provider", className: "text-xs", children: "LLM Provider" }),
                  /* @__PURE__ */ jsxs(Select, { value: provider, onValueChange: (val) => setProvider(val), children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { id: "provider", className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select provider" }) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "Gemini", children: "Gemini" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "OpenAI", children: "OpenAI" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "apiKey", className: "text-xs", children: "API Key" }),
                  /* @__PURE__ */ jsx(Input, { id: "apiKey", type: "password", placeholder: "Enter your LLM API Key", value: customKey, onChange: (e) => setCustomKey(e.target.value), className: "h-9" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Leave blank to use the local heuristics database automatically." })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { onClick: () => mutation.mutate(), disabled: mutation.isPending || !fileContent || !jobDescription.trim(), className: "w-full glow-primary", size: "lg", children: mutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Spinner, { className: "mr-2 h-4 w-4" }),
              " Running ATS Compatibility analysis..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "mr-2 h-4 w-4 text-primary-foreground" }),
              " Analyze Compatibility & Optimize"
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-primary" }),
          "Analysis Results"
        ] }),
        !result ? /* @__PURE__ */ jsxs(Card, { className: "flex flex-1 flex-col items-center justify-center border-dashed border-border bg-card/20 p-8 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsx(FileCheck2, { className: "mb-4 h-12 w-12 text-muted-foreground/30 animate-pulse" }),
          /* @__PURE__ */ jsx("p", { className: "max-w-xs text-sm", children: "Upload a resume, paste a job description, and run analysis to view your compatibility rating and optimization guide." })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6 flex-1", children: [
          /* @__PURE__ */ jsx(Card, { className: "border-border bg-surface/50", children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 sm:grid-cols-3 items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center sm:border-r sm:border-border/60 py-2 flex flex-col justify-center items-center", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "ATS Match" }),
              /* @__PURE__ */ jsxs("div", { className: `font-display text-5xl font-extrabold ${getScoreStyles(result.ats_score).text} my-2`, children: [
                result.ats_score,
                "%"
              ] }),
              /* @__PURE__ */ jsx(Badge, { className: `${getScoreStyles(result.ats_score).bg} ${getScoreStyles(result.ats_score).text} border ${getScoreStyles(result.ats_score).border} font-semibold`, children: result.compatibility_rating })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-display text-base font-semibold", children: "📝 Match Summary" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: result.overall_summary })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxs(Tabs, { defaultValue: "skills", className: "w-full bg-card/20 border border-border rounded-xl overflow-hidden p-4", children: [
            /* @__PURE__ */ jsxs(TabsList, { className: "grid grid-cols-3 bg-surface border border-border/60", children: [
              /* @__PURE__ */ jsx(TabsTrigger, { value: "skills", className: "text-xs", children: "Skills Match" }),
              /* @__PURE__ */ jsx(TabsTrigger, { value: "gaps", className: "text-xs", children: "Gaps & Fixes" }),
              /* @__PURE__ */ jsx(TabsTrigger, { value: "rewrites", className: "text-xs", children: "Bullet Rewrites" })
            ] }),
            /* @__PURE__ */ jsx(TabsContent, { value: "skills", className: "space-y-4 pt-4", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-3", children: [
                /* @__PURE__ */ jsx("h5", { className: "text-xs font-semibold text-green-400 flex items-center gap-2", children: "✔ Matching Keywords & Skills" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: result.matching_skills && result.matching_skills.length > 0 ? result.matching_skills.map((skill) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-[10px] bg-green-500/10 text-green-400 border border-green-500/20", children: skill }, skill)) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "No matching keywords." }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3", children: [
                /* @__PURE__ */ jsx("h5", { className: "text-xs font-semibold text-red-400 flex items-center gap-2", children: "✖ Missing Keywords & Skills" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: result.missing_skills && result.missing_skills.length > 0 ? result.missing_skills.map((skill) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-[10px] bg-red-500/10 text-red-400 border border-red-500/20", children: skill }, skill)) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "No major missing keywords." }) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs(TabsContent, { value: "gaps", className: "space-y-3 pt-4", children: [
              /* @__PURE__ */ jsx("h5", { className: "text-xs font-semibold text-muted-foreground mb-2", children: "Actionable Gaps & Fixes" }),
              result.gap_analysis && result.gap_analysis.map((gap, idx) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3 items-start border border-border/40 bg-surface/30 rounded-lg p-3 text-xs leading-relaxed", children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-indigo-400 shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: gap })
              ] }, idx))
            ] }),
            /* @__PURE__ */ jsxs(TabsContent, { value: "rewrites", className: "space-y-4 pt-4 max-h-[350px] overflow-y-auto pr-2", children: [
              /* @__PURE__ */ jsx("h5", { className: "text-xs font-semibold text-muted-foreground", children: "Tailored Bullet-by-Bullet Rewrites" }),
              result.rewrites && result.rewrites.map((item, idx) => /* @__PURE__ */ jsxs(Card, { className: "border-l-4 border-l-primary border border-border bg-surface/40 p-4 space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-red-400 uppercase tracking-wide block", children: "Original bullet point" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-through mt-0.5", children: item.original })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-green-400 uppercase tracking-wide block", children: "Optimized ATS rewrite" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground font-semibold mt-0.5", children: item.rewrite })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border-t border-border/40 pt-2 text-[10px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsx("strong", { className: "text-primary font-medium", children: "Strategy:" }),
                  " ",
                  item.reason
                ] })
              ] }, idx))
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  ResumeAnalyzerPage as component
};
