import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Wand2,
  Download,
  CheckCircle2,
  Sparkles,
  User,
  Briefcase,
  Code2,
  FileDown,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/_authenticated/app/resume-builder")({
  component: ResumeTailorerPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}
interface TailoredResume {
  customFilename: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: string[];
  certifications?: string[];
}

// ─── CDN script loader (idempotent) ──────────────────────────────────────────
function loadScript(src: string, globalCheck: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any)[globalCheck]) return resolve();
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

// ─── PDF Text extraction via pdfjs CDN ───────────────────────────────────────
const PDFJS_VERSION = "4.4.168";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.mjs`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import(/* @vite-ignore */ PDFJS_CDN);
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const textChunks: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    textChunks.push(pageText);
  }
  return textChunks.join("\n\n").trim();
}

// ─── Gemini API call ──────────────────────────────────────────────────────────
async function tailorResumeWithGemini(
  resumeText: string,
  jobDescription: string,
): Promise<TailoredResume> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Please add it to your .env file and restart the dev server.",
    );
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) optimization specialist and professional resume writer.

Analyze the provided resume and job description, then return a perfectly tailored, ATS-optimized resume.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Extract the candidate's full contact information (name, email, phone, LinkedIn).
2. Rewrite the professional summary to incorporate key phrases and requirements from the JD.
3. Rewrite ALL experience bullet points using strong action verbs, quantifiable metrics, and JD keywords.
4. Curate a skills list mirroring exact technology and skill keywords from the JD.
5. Keep education accurate — do NOT fabricate anything.
6. Generate a custom filename: FirstnameLastname_JobTitle_Resume (e.g. JohnDoe_SoftwareEngineer_Resume).

RESPONSE FORMAT — Return ONLY valid JSON, no markdown fences, no explanation:
{
  "customFilename": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "linkedin": "string",
  "summary": "string",
  "skills": ["skill1", "skill2"],
  "experience": [
    { "company": "string", "role": "string", "duration": "string", "bullets": ["bullet1"] }
  ],
  "education": ["degree at institution, year"],
  "certifications": ["cert1"]
}`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error ${resp.status}`);
  }

  const data = await resp.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as TailoredResume;
}

// ─── PDF generation via jsPDF CDN ────────────────────────────────────────────
const JSPDF_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

async function generateTailoredPDF(resume: TailoredResume): Promise<void> {
  await loadScript(JSPDF_CDN, "jspdf");
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;
  const lh = 5.5;

  const checkPageBreak = (needed: number) => {
    if (y + needed > 275) { doc.addPage(); y = 18; }
  };

  const sectionHeader = (title: string) => {
    checkPageBreak(12);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), margin, y);
    y += 1.5;
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;
    doc.setTextColor(40, 40, 40);
  };

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(10, 10, 10);
  doc.text(resume.fullName || "Candidate Name", pageWidth / 2, y, { align: "center" });
  y += 7;

  // Contact
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const contactParts = [resume.email, resume.phone, resume.linkedin].filter(Boolean);
  doc.text(contactParts.join("  |  "), pageWidth / 2, y, { align: "center" });
  y += 9;

  // Summary
  if (resume.summary) {
    sectionHeader("Professional Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(resume.summary, contentWidth);
    checkPageBreak(lines.length * lh);
    doc.text(lines, margin, y);
    y += lines.length * lh + 2;
  }

  // Skills
  if (resume.skills?.length) {
    sectionHeader("Technical Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    for (let i = 0; i < resume.skills.length; i += 5) {
      const row = resume.skills.slice(i, i + 5);
      checkPageBreak(lh);
      doc.text("• " + row.join("   •  "), margin, y);
      y += lh;
    }
    y += 2;
  }

  // Experience
  if (resume.experience?.length) {
    sectionHeader("Professional Experience");
    resume.experience.forEach((exp) => {
      checkPageBreak(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text(exp.role || "Role", margin, y);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(exp.duration || "", margin + contentWidth, y, { align: "right" });
      y += lh;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(exp.company || "", margin, y);
      y += lh + 1;
      doc.setTextColor(40, 40, 40);
      (exp.bullets || []).forEach((bullet) => {
        const bl = doc.splitTextToSize(`\u2022  ${bullet}`, contentWidth - 4);
        checkPageBreak(bl.length * lh);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.8);
        doc.text(bl, margin + 2, y);
        y += bl.length * lh + 0.5;
      });
      y += 3;
    });
  }

  // Education
  if (resume.education?.length) {
    sectionHeader("Education");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    resume.education.forEach((edu) => {
      checkPageBreak(lh);
      doc.text(`\u2022  ${edu}`, margin, y);
      y += lh;
    });
    y += 2;
  }

  // Certifications
  if (resume.certifications?.length) {
    sectionHeader("Certifications");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    resume.certifications.forEach((cert) => {
      checkPageBreak(lh);
      doc.text(`\u2022  ${cert}`, margin, y);
      y += lh;
    });
  }

  const filename = (resume.customFilename || "Tailored_Resume").replace(/[^a-zA-Z0-9_\-]/g, "_");
  doc.save(`${filename}.pdf`);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function ResumeTailorerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") { toast.error("Only PDF files are supported."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10MB."); return; }
    setUploadedFile(file);
    setExtractedText("");
    setTailoredResume(null);
    setIsExtracting(true);
    try {
      const text = await extractTextFromPDF(file);
      if (!text || text.length < 50) throw new Error("Could not extract readable text. The PDF may be image-based.");
      setExtractedText(text);
      toast.success(`✓ Extracted ${text.split(" ").length.toLocaleString()} words from ${file.name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to parse PDF.");
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
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
    if (!extractedText) { toast.error("Please upload a PDF resume first."); return; }
    if (!jobDescription.trim()) { toast.error("Please paste a job description."); return; }
    setIsTailoring(true);
    setTailoredResume(null);
    try {
      const result = await tailorResumeWithGemini(extractedText, jobDescription);
      setTailoredResume(result);
      toast.success("🎉 Resume tailored! Ready to download.");
    } catch (err: any) {
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
      await generateTailoredPDF(tailoredResume);
      toast.success(`Downloaded: ${tailoredResume.customFilename}.pdf`);
    } catch (err: any) {
      toast.error("PDF generation failed: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const canTailor = !!extractedText && !!jobDescription.trim() && !isTailoring && !isExtracting;

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full overflow-y-auto bg-background text-foreground">

        {/* Hero Banner */}
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-surface/80 via-background to-surface/40 px-6 py-10 md:px-10">
          <div className="absolute -top-32 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/8 blur-[80px]" />
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Gemini 1.5 Flash · ATS Optimizer
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-gradient sm:text-5xl">
              AI Resume Tailorer
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Upload your PDF resume, paste the target job description, and let Gemini AI rewrite
              every bullet point for maximum ATS compatibility — then download a perfectly formatted PDF.
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              {[
                { n: 1, label: "Upload PDF" },
                { n: 2, label: "Paste JD" },
                { n: 3, label: "AI Tailors" },
                { n: 4, label: "Download" },
              ].map((step, idx, arr) => (
                <div key={step.n} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {step.n}
                    </span>
                    <span>{step.label}</span>
                  </div>
                  {idx < arr.length - 1 && <ChevronRight className="h-3 w-3 opacity-40" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* ── LEFT: Inputs ── */}
            <div className="space-y-5">

              {/* PDF Upload */}
              <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-sans text-sm font-semibold">Upload Your Resume</h2>
                    <p className="text-xs text-muted-foreground">PDF format only · Max 10MB</p>
                  </div>
                </div>
                <div className="p-5">
                  {!uploadedFile ? (
                    <label
                      htmlFor="pdf-upload"
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center cursor-pointer transition-all duration-200 ${
                        isDragOver
                          ? "border-primary bg-primary/5 scale-[1.01]"
                          : "border-border/60 bg-surface/10 hover:border-primary/50 hover:bg-surface/20"
                      }`}
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/40">
                        <FileText className="h-7 w-7 text-muted-foreground/60" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Drop your PDF here</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        or <span className="text-primary underline underline-offset-2">click to browse</span>
                      </p>
                      <input
                        id="pdf-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-border bg-surface/30 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                            <FileText className="h-5 w-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold truncate max-w-[180px]">{uploadedFile.name}</p>
                            <p className="text-[10px] text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button onClick={clearFile} className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {isExtracting && (
                        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-xs text-primary">
                          <Spinner className="h-3.5 w-3.5" />
                          Parsing PDF text content...
                        </div>
                      )}

                      {extractedText && !isExtracting && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/20 px-3 py-2.5 text-xs text-green-400">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>Extracted <strong>{extractedText.split(" ").length.toLocaleString()}</strong> words · Ready for AI tailoring</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                    <Briefcase className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="font-sans text-sm font-semibold">Target Job Description</h2>
                    <p className="text-xs text-muted-foreground">Paste the full job listing · More detail = better results</p>
                  </div>
                </div>
                <div className="p-5">
                  <Textarea
                    id="job-description"
                    placeholder="We are looking for a Software Engineer with 3+ years of experience in React, Node.js, PostgreSQL..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[220px] resize-none bg-surface/30 font-sans text-xs leading-relaxed"
                  />
                  <p className="mt-2 text-right text-[10px] text-muted-foreground">
                    {jobDescription.split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>
              </div>

              {/* API key warning */}
              {!import.meta.env.VITE_GEMINI_API_KEY && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>API key missing.</strong> Add{" "}
                    <code className="font-mono bg-amber-500/10 px-1 rounded">VITE_GEMINI_API_KEY</code>{" "}
                    to your <code className="font-mono bg-amber-500/10 px-1 rounded">.env</code> and restart the dev server.
                  </p>
                </div>
              )}

              {/* Tailor Button */}
              <Button
                id="tailor-resume-btn"
                onClick={handleTailor}
                disabled={!canTailor}
                size="lg"
                className="w-full glow-primary rounded-xl py-6 text-sm font-bold tracking-wide"
              >
                {isTailoring ? (
                  <><Spinner className="mr-2 h-4 w-4" />Tailoring Resume with Gemini AI...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" />Tailor Resume with AI</>
                )}
              </Button>
            </div>

            {/* ── RIGHT: Results ── */}
            <div className="space-y-5">

              {/* Empty state */}
              {!tailoredResume && !isTailoring && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 p-12 text-center text-muted-foreground min-h-[400px]">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 border border-primary/10">
                    <Sparkles className="h-8 w-8 text-primary/40" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground/60">Your Tailored Resume Appears Here</h3>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed">
                    Upload your PDF, paste a job description, and click tailor to see AI-optimized results.
                  </p>
                </div>
              )}

              {/* Loading state */}
              {isTailoring && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/3 p-12 text-center min-h-[400px] gap-5">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">Gemini AI is working...</p>
                    <p className="mt-1 text-xs text-muted-foreground">Analyzing keywords · Rewriting bullets · Optimizing for ATS</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Parsing JD", "Mapping skills", "Rewriting bullets", "Generating PDF"].map((s, i) => (
                      <Badge key={s} variant="outline" className="text-[10px] border-primary/20 text-primary/70 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Success preview */}
              {tailoredResume && (
                <div className="space-y-4">
                  {/* Success banner */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/15">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-400">Resume Tailored Successfully!</p>
                        <p className="text-[10px] text-muted-foreground">
                          File: <span className="font-mono text-foreground/70">{tailoredResume.customFilename}.pdf</span>
                        </p>
                      </div>
                    </div>
                    <Button id="download-resume-btn-top" onClick={handleDownload} disabled={isDownloading} size="sm" className="shrink-0 gap-2 rounded-xl font-bold">
                      {isDownloading ? <><Spinner className="h-3.5 w-3.5" />Generating...</> : <><FileDown className="h-3.5 w-3.5" />Download PDF</>}
                    </Button>
                  </div>

                  {/* Preview card */}
                  <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm divide-y divide-border/60 overflow-hidden">

                    {/* Contact */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Contact</span>
                      </div>
                      <h3 className="font-display text-xl font-bold">{tailoredResume.fullName}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {tailoredResume.email && <span>{tailoredResume.email}</span>}
                        {tailoredResume.phone && <span>{tailoredResume.phone}</span>}
                        {tailoredResume.linkedin && <span>{tailoredResume.linkedin}</span>}
                      </div>
                    </div>

                    {/* Summary */}
                    {tailoredResume.summary && (
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Wand2 className="h-4 w-4 text-indigo-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">AI-Rewritten Summary</span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{tailoredResume.summary}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {tailoredResume.skills?.length > 0 && (
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Code2 className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Curated Skills</span>
                          <Badge variant="outline" className="ml-auto text-[9px] border-cyan-500/20 text-cyan-400">{tailoredResume.skills.length} skills</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {tailoredResume.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[10px] bg-cyan-500/8 text-cyan-300 border border-cyan-500/15">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience preview */}
                    {tailoredResume.experience?.length > 0 && (
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="h-4 w-4 text-amber-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Experience (ATS-Optimized)</span>
                        </div>
                        <div className="space-y-4">
                          {tailoredResume.experience.slice(0, 2).map((exp, i) => (
                            <div key={i} className="rounded-xl border border-border/50 bg-surface/20 p-3 space-y-2">
                              <div>
                                <p className="text-xs font-bold">{exp.role}</p>
                                <p className="text-[10px] text-muted-foreground">{exp.company} · {exp.duration}</p>
                              </div>
                              <ul className="space-y-1">
                                {(exp.bullets || []).slice(0, 3).map((bullet, j) => (
                                  <li key={j} className="flex gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
                                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {tailoredResume.experience.length > 2 && (
                            <p className="text-center text-[10px] text-muted-foreground">
                              +{tailoredResume.experience.length - 2} more entries in the downloaded PDF
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Download again */}
                    <div className="p-5">
                      <Button onClick={handleDownload} disabled={isDownloading} className="w-full rounded-xl gap-2 font-bold" size="lg">
                        {isDownloading
                          ? <><Spinner className="h-4 w-4" />Generating PDF...</>
                          : <><Download className="h-4 w-4" />Download {tailoredResume.customFilename}.pdf</>}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
