import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRef, useState, useCallback } from "react";
import { C as ChatLayout } from "./ChatLayout-DhDUl__k.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { T as Textarea } from "./textarea-bZdI8Am0.js";
import { B as Badge } from "./badge-BxXV9KYb.js";
import { S as Spinner } from "./spinner-D3GgUm1d.js";
import { toast } from "sonner";
import { Sparkles, ChevronRight, Upload, FileText, X, CheckCircle2, Briefcase, Wand2, FileDown, User, Code2, FolderGit2, GraduationCap, Award, Download } from "lucide-react";
import { g as generateATSResume } from "./router-XYZO7mbM.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "./createSsrRpc-B5NaTOOc.js";
import "./server-CTRvd-y5.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DvqTfCBg.js";
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
import "ai";
import "./ai-gateway.server-DLub9oIv.js";
import "@ai-sdk/openai-compatible";
function loadScript(src, globalCheck) {
  return new Promise((resolve, reject) => {
    if (window[globalCheck]) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}
const PDFJS_VERSION = "4.4.168";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.mjs`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;
async function extractTextFromPDF(file) {
  const pdfjs = await import(
    /* @vite-ignore */
    PDFJS_CDN
  );
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({
    data: arrayBuffer
  }).promise;
  const textChunks = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => "str" in item ? item.str : "").join(" ");
    textChunks.push(pageText);
  }
  return textChunks.join("\n\n").trim();
}
const MAMMOTH_CDN = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js";
async function extractTextFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  try {
    await loadScript(MAMMOTH_CDN, "mammoth");
    const mammoth = window.mammoth;
    if (mammoth) {
      const result = await mammoth.extractRawText({
        arrayBuffer
      });
      if (result?.value && result.value.trim().length > 20) {
        return result.value.trim();
      }
    }
  } catch (e) {
    console.warn("Mammoth extraction warning, using binary text fallback", e);
  }
  const decoder = new TextDecoder("utf-8");
  const raw = decoder.decode(arrayBuffer);
  const clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
  return clean.trim();
}
async function tailorResumeWithGemini(resumeText, jobDescription) {
  const apiKey = "AQ.Ab8RN6IA3SwLoHHNsvQVZuip2DpdwXNYo6Uj5p735Rz8t-QlmA";
  const systemPrompt = `You are an elite Executive Resume Strategist and ATS Specialist.
Your task is to analyze the user's ORIGINAL RESUME and target JOB DESCRIPTION, then produce an upgraded, highly tailored, ATS-optimized JSON payload.

CRITICAL RULES:
1. DO NOT STRIP CONTENT: Retain all high-impact technical details, metrics, frameworks, projects, live URLs, GitHub, personal portfolio link, and certifications from the original resume.
2. ATS KEYWORD INTEGRATION: Seamlessly weave keywords and skills from the Job Description into the Professional Summary, Experience bullet points, and Projects without lying or degrading technical depth.
3. CONCISE IMPACT BULLETS: Keep bullet points punchy and action-oriented using strong verbs (e.g., "Architected", "Integrated", "Optimized").
4. FILE NAMING: Generate a custom, clean filename (e.g., "Roy_Mathew_Frontend_Developer_Resume").

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

RETURN ONLY A VALID JSON OBJECT WITH THIS EXACT SCHEMA:
{
  "customFilename": "First_Last_TargetRole_Resume",
  "header": {
    "fullName": "Roy Mathew",
    "subTitle": "Master of Computer Applications (MCA) Student | Full-Stack & Frontend Developer",
    "contact": "roy.mathew@mca.christuniversity.in | +91 75940 29419 | Bengaluru, Karnataka",
    "links": "roymathew.site | linkedin.com/in/roymathew | github.com/roymathew"
  },
  "summary": "Tailored 2-3 sentence executive summary rich in ATS keywords...",
  "skills": {
    "Frontend": "React, HTML5, CSS3, Tailwind CSS, Next.js, TypeScript",
    "Backend & DB": "REST APIs, Supabase, PostgreSQL, Node.js",
    "Cloud & DevOps": "AWS (ECS, EC2, S3, CloudFront, WAF), Git, GitHub, CI/CD, Vercel",
    "Concepts": "CRUD, OOP, System Design, Real-Time WebSockets, Agile"
  },
  "experience": [
    {
      "role": "Full Stack Developer Intern",
      "company": "Job Jockey",
      "location": "Remote",
      "period": "2026",
      "bullets": [
        "Built a real-time voice-AI calling SaaS platform (Next.js/React, FastAPI) with sub-600ms latency using Pipecat streaming and WebSockets.",
        "Integrated multi-provider STT/TTS fallback (Groq, Deepgram, Cartesia) and Groq Llama 3.3 LLM layer with Twilio telephony.",
        "Designed SQLite-backed multi-tenant schema for campaign analytics and lead management."
      ]
    }
  ],
  "projects": [
    {
      "name": "AcadSphere",
      "tech": "TanStack Start (React 19), Supabase, PostgreSQL, TypeScript, AI SDK",
      "period": "2026",
      "bullets": [
        "Full-stack academic portal for real-time attendance tracking, grade analytics, and multi-course sync via Supabase Edge Functions.",
        "Integrated Chrome Extension sync scripts and context-aware AI tutor assistant using Vercel AI SDK."
      ]
    }
  ],
  "education": [
    {
      "degree": "Master of Computer Applications (MCA)",
      "institution": "CHRIST (Deemed to be University), Bengaluru",
      "period": "2025 - Present",
      "details": ""
    },
    {
      "degree": "Bachelor of Computer Applications (BCA)",
      "institution": "Christ Nagar College",
      "period": "2021 - 2024",
      "details": "CGPA: 7.4"
    }
  ],
  "certifications": [
    "AWS Academy Graduate - Cloud Foundations Training Badge (AWS)",
    "AI-first Software Engineering (Infosys)",
    "Cloud Computing (Infosys Springboard)",
    "Generative AI Essentials: Using LLMs to Work with Data (IBM)"
  ]
}`;
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: systemPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      }
    })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error ${resp.status}`);
  }
  const data = await resp.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
function ResumeTailorerPage() {
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const processFile = useCallback(async (file) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isPdf = ext === "pdf" || file.type === "application/pdf";
    const isDoc = ext === "docx" || ext === "doc" || file.type.includes("word") || file.type.includes("document");
    if (!isPdf && !isDoc) {
      toast.error("Only PDF, DOCX, and DOC files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    setUploadedFile(file);
    setExtractedText("");
    setTailoredResume(null);
    setIsExtracting(true);
    try {
      let text = "";
      if (isPdf) {
        text = await extractTextFromPDF(file);
      } else {
        text = await extractTextFromDocx(file);
      }
      if (!text || text.length < 30) {
        throw new Error("Could not extract readable text. The document may be image-based or empty.");
      }
      setExtractedText(text);
      toast.success(`✓ Extracted ${text.split(" ").length.toLocaleString()} words from ${file.name}`);
    } catch (err) {
      toast.error(err.message || "Failed to parse document.");
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  const clearFile = () => {
    setUploadedFile(null);
    setExtractedText("");
    setTailoredResume(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleTailor = async () => {
    if (!extractedText) {
      toast.error("Please upload a PDF or Word resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description.");
      return;
    }
    setIsTailoring(true);
    setTailoredResume(null);
    try {
      const result = await tailorResumeWithGemini(extractedText, jobDescription);
      setTailoredResume(result);
      toast.success("🎉 Resume tailored! Ready to download 1-page ATS PDF.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "AI tailoring failed. Please try again.");
    } finally {
      setIsTailoring(false);
    }
  };
  const handleDownload = async () => {
    if (!tailoredResume) return;
    setIsDownloading(true);
    try {
      await generateATSResume(tailoredResume);
      toast.success(`Downloaded: ${tailoredResume.customFilename || "Resume"}.pdf`);
    } catch (err) {
      toast.error("PDF generation failed: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };
  const canTailor = !!extractedText && !!jobDescription.trim() && !isTailoring && !isExtracting;
  const getFileExt = (filename) => filename.split(".").pop()?.toLowerCase() || "";
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden border-b border-border bg-gradient-to-br from-surface/80 via-background to-surface/40 px-6 py-10 md:px-10", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-32 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/8 blur-[80px]" }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
          "Powered by Gemini 3.6 Flash · PDFLayoutEngine (Zero Overlap ATS)"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-extrabold tracking-tight text-gradient sm:text-5xl", children: "AI Resume Tailorer" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base", children: "Upload your PDF, DOCX, or DOC resume, paste the target job description, and let Gemini 3.6 Flash optimize your summary, skills, experience, and projects for ATS compatibility — then download a pristine, high-density 1-page PDF." }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground", children: [{
          n: 1,
          label: "Upload PDF / Word"
        }, {
          n: 2,
          label: "Paste JD"
        }, {
          n: 3,
          label: "AI Tailors"
        }, {
          n: 4,
          label: "1-Page PDF"
        }].map((step, idx, arr) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary", children: step.n }),
            /* @__PURE__ */ jsx("span", { children: step.label })
          ] }),
          idx < arr.length - 1 && /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 opacity-40" })
        ] }, step.n)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 py-8 md:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-border/60 px-5 py-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-sans text-sm font-semibold", children: "Upload Your Resume" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "PDF, DOCX, or DOC format · Max 10MB" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-5", children: !uploadedFile ? /* @__PURE__ */ jsxs("label", { htmlFor: "pdf-upload", onDrop: handleDrop, onDragOver: (e) => {
            e.preventDefault();
            setIsDragOver(true);
          }, onDragLeave: () => setIsDragOver(false), className: `flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center cursor-pointer transition-all duration-200 ${isDragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border/60 bg-surface/10 hover:border-primary/50 hover:bg-surface/20"}`, children: [
            /* @__PURE__ */ jsx("div", { className: "mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/40", children: /* @__PURE__ */ jsx(FileText, { className: "h-7 w-7 text-muted-foreground/60" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: "Drop your PDF or Word document here" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Supports ",
              /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: ".pdf, .docx, .doc" }),
              " ·",
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-primary underline underline-offset-2", children: "click to browse" })
            ] }),
            /* @__PURE__ */ jsx("input", { id: "pdf-upload", ref: fileInputRef, type: "file", accept: "application/pdf,.pdf,.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword", onChange: handleFileInput, className: "hidden" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border bg-surface/30 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: `flex h-9 w-9 items-center justify-center rounded-lg ${getFileExt(uploadedFile.name) === "pdf" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`, children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold truncate max-w-[180px]", children: uploadedFile.name }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground uppercase font-mono", children: [
                    getFileExt(uploadedFile.name),
                    " · ",
                    (uploadedFile.size / 1024).toFixed(1),
                    " KB"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: clearFile, className: "rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
            ] }),
            isExtracting && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-xs text-primary", children: [
              /* @__PURE__ */ jsx(Spinner, { className: "h-3.5 w-3.5" }),
              "Parsing document text content..."
            ] }),
            extractedText && !isExtracting && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/20 px-3 py-2.5 text-xs text-green-400", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 shrink-0" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Extracted",
                " ",
                /* @__PURE__ */ jsx("strong", { children: extractedText.split(" ").length.toLocaleString() }),
                " ",
                "words · Ready for AI tailoring"
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-border/60 px-5 py-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10", children: /* @__PURE__ */ jsx(Briefcase, { className: "h-4 w-4 text-indigo-400" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-sans text-sm font-semibold", children: "Target Job Description" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Paste the full job listing · More detail = better results" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
            /* @__PURE__ */ jsx(Textarea, { id: "job-description", placeholder: "We are looking for a Software Engineer with experience in React, Node.js, PostgreSQL...", value: jobDescription, onChange: (e) => setJobDescription(e.target.value), className: "min-h-[220px] resize-none bg-surface/30 font-sans text-xs leading-relaxed" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2 text-right text-[10px] text-muted-foreground", children: [
              jobDescription.split(/\s+/).filter(Boolean).length,
              " words"
            ] })
          ] })
        ] }),
        false,
        /* @__PURE__ */ jsx(Button, { id: "tailor-resume-btn", onClick: handleTailor, disabled: !canTailor, size: "lg", className: "w-full glow-primary rounded-xl py-6 text-sm font-bold tracking-wide", children: isTailoring ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Spinner, { className: "mr-2 h-4 w-4" }),
          "Tailoring Resume with Gemini 3.6 Flash..."
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Wand2, { className: "mr-2 h-4 w-4" }),
          "Tailor Resume with Gemini AI"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        !tailoredResume && !isTailoring && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 p-12 text-center text-muted-foreground min-h-[400px]", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 border border-primary/10", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-8 w-8 text-primary/40" }) }),
          /* @__PURE__ */ jsx("h3", { className: "font-display text-base font-semibold text-foreground/60", children: "Your Executive 1-Page Resume Appears Here" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-xs text-xs leading-relaxed", children: "Upload your PDF, paste a job description, and click tailor to generate an ATS-optimized, zero-overlap 1-page PDF." })
        ] }),
        isTailoring && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/3 p-12 text-center min-h-[400px] gap-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" }),
            /* @__PURE__ */ jsx(Sparkles, { className: "absolute inset-0 m-auto h-6 w-6 text-primary" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-display font-semibold text-foreground", children: "Gemini 3.6 Flash is optimizing..." }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Retaining projects & links · Weaving ATS keywords · Formatting zero-overlap 1-page layout" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2", children: ["Preserving Projects", "Categorizing Skills", "Optimizing Bullets", "Calculating Coordinates"].map((s, i) => /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] border-primary/20 text-primary/70 animate-pulse", style: {
            animationDelay: `${i * 0.3}s`
          }, children: s }, s)) })
        ] }),
        tailoredResume && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-green-500/20 bg-green-500/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-green-500/15", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-400" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-green-400", children: "Resume Optimized for Zero-Overlap ATS!" }),
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                  "File:",
                  " ",
                  /* @__PURE__ */ jsxs("span", { className: "font-mono text-foreground/70", children: [
                    tailoredResume.customFilename || "Roy_Mathew_Resume",
                    ".pdf"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { id: "download-resume-btn-top", onClick: handleDownload, disabled: isDownloading, size: "sm", className: "shrink-0 gap-2 rounded-xl font-bold", children: isDownloading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Spinner, { className: "h-3.5 w-3.5" }),
              "Generating..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(FileDown, { className: "h-3.5 w-3.5" }),
              "Download Zero-Overlap PDF"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card/50 backdrop-blur-sm divide-y divide-border/60 overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-primary", children: "Header & Contact" })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "font-display text-xl font-bold", children: tailoredResume.header?.fullName }),
              tailoredResume.header?.subTitle && /* @__PURE__ */ jsx("p", { className: "text-xs text-primary/80 font-medium mt-0.5", children: tailoredResume.header.subTitle }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
                tailoredResume.header?.contact && /* @__PURE__ */ jsx("span", { children: tailoredResume.header.contact }),
                tailoredResume.header?.links && /* @__PURE__ */ jsx("span", { className: "text-indigo-400 font-mono text-[11px]", children: tailoredResume.header.links })
              ] })
            ] }),
            tailoredResume.summary && /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(Wand2, { className: "h-4 w-4 text-indigo-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-indigo-400", children: "Executive Summary" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed text-muted-foreground", children: tailoredResume.summary })
            ] }),
            tailoredResume.skills && Object.keys(tailoredResume.skills).length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx(Code2, { className: "h-4 w-4 text-cyan-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-cyan-400", children: "Technical Skills" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Object.entries(tailoredResume.skills).map(([category, skillsList]) => /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-foreground mr-1.5", children: [
                  category,
                  ":"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: skillsList })
              ] }, category)) })
            ] }),
            tailoredResume.experience?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx(Briefcase, { className: "h-4 w-4 text-amber-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-amber-400", children: "Work Experience" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: tailoredResume.experience.map((exp, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/50 bg-surface/20 p-3 space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold", children: [
                    exp.company,
                    " ",
                    exp.role ? `— ${exp.role}` : ""
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: exp.period })
                ] }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: (exp.bullets || []).map((bullet, j) => /* @__PURE__ */ jsxs("li", { className: "flex gap-1.5 text-[10px] text-muted-foreground leading-relaxed", children: [
                  /* @__PURE__ */ jsx("span", { className: "mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" }),
                  bullet
                ] }, j)) })
              ] }, i)) })
            ] }),
            tailoredResume.projects?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx(FolderGit2, { className: "h-4 w-4 text-purple-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-purple-400", children: "Key Projects" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: tailoredResume.projects.map((proj, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/50 bg-surface/20 p-3 space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold", children: [
                    proj.name,
                    " ",
                    proj.tech ? /* @__PURE__ */ jsxs("span", { className: "font-normal text-muted-foreground", children: [
                      "| ",
                      proj.tech
                    ] }) : ""
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: proj.period })
                ] }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: (proj.bullets || []).map((bullet, j) => /* @__PURE__ */ jsxs("li", { className: "flex gap-1.5 text-[10px] text-muted-foreground leading-relaxed", children: [
                  /* @__PURE__ */ jsx("span", { className: "mt-1 h-1 w-1 shrink-0 rounded-full bg-purple-400/60" }),
                  bullet
                ] }, j)) })
              ] }, i)) })
            ] }),
            (tailoredResume.education && tailoredResume.education.length > 0 || tailoredResume.certifications && tailoredResume.certifications.length > 0) && /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
              tailoredResume.education?.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4 text-emerald-400" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-emerald-400", children: "Education" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: tailoredResume.education.map((edu, i) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                    edu.degree,
                    " — ",
                    edu.institution
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground text-[10px]", children: [
                    edu.period,
                    " ",
                    edu.details ? `(${edu.details})` : ""
                  ] })
                ] }, i)) })
              ] }),
              tailoredResume.certifications?.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsx(Award, { className: "h-4 w-4 text-amber-400" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-amber-400", children: "Certifications" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: tailoredResume.certifications.join(" • ") })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsx(Button, { onClick: handleDownload, disabled: isDownloading, className: "w-full rounded-xl gap-2 font-bold", size: "lg", children: isDownloading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Spinner, { className: "h-4 w-4" }),
              "Generating PDF..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
              "Download ",
              tailoredResume.customFilename || "Resume",
              ".pdf"
            ] }) }) })
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  ResumeTailorerPage as component
};
