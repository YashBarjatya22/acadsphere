import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generateLabCode } from "@/lib/viva-lab.functions";
import {
  Code, Sparkles, Copy, Terminal,
  FileCode, CheckCircle2, Loader2, AlertCircle, ChevronRight
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/lab-buddy")({
  component: LabBuddyPage,
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

const TEMPLATES = [
  { subject: "Database Management Systems", title: "Student Enrollment DB", desc: "Create tables, insert records, write JOIN queries", icon: "🗄️" },
  { subject: "Computer Networks", title: "TCP Socket in C", desc: "Client-server TCP connection with message passing", icon: "🌐" },
  { subject: "Operating Systems", title: "Producer-Consumer", desc: "Semaphore-based synchronization in C", icon: "⚙️" },
  { subject: "Data Structures", title: "Binary Search Tree", desc: "Insert, delete, traversal in Java/Python", icon: "🌳" },
];

interface GeneratedResult {
  language: string;
  code: string;
  explanation: string;
  testCases: string;
  notes: string;
}

function LabBuddyPage() {
  const [subject, setSubject] = useState("Database Management Systems");
  const [language, setLanguage] = useState("auto");
  const [exerciseText, setExerciseText] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const generateFn = useServerFn(generateLabCode);

  const generate = useMutation({
    mutationFn: () =>
      generateFn({
        data: { subject, exerciseDescription: exerciseText, language },
      }),
    onSuccess: (res) => {
      setResult(res);
      toast.success("Code generated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to generate code. Please try again.");
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
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setSubject(t.subject);
    setExerciseText(`${t.title}: ${t.desc}`);
  };

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col transition-colors duration-200">

        {/* Gradient Header */}
        <div className="relative overflow-hidden px-6 py-5 border-b border-border shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-background to-amber-500/5 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">Lab Buddy</h1>
                <p className="text-[10px] text-muted-foreground">AI-generated code for your lab exercises</p>
              </div>
            </div>
            <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded font-bold uppercase tracking-wider border border-orange-500/20">
              AI Code Engine
            </span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">

          {/* Left Panel: Config */}
          <aside className="w-72 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Lab Setup</h2>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Describe your exercise. The AI will generate complete, commented code with tests.
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Subject</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSubject(s.value)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                      subject === s.value
                        ? "bg-primary/10 border-primary/30 text-primary"
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
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Output Language</Label>
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

            {/* Templates */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Quick Templates</Label>
              {TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(t)}
                  className="w-full text-left p-2.5 rounded-lg border border-border/80 bg-muted/10 hover:bg-muted/30 hover:border-primary/30 transition-all"
                >
                  <p className="text-[10px] font-bold text-foreground flex items-center gap-1.5">
                    <span>{t.icon}</span> {t.title}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </aside>

          {/* Center: Input + Output */}
          <main className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-muted/10">

            {/* Exercise Input */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <FileCode className="h-3.5 w-3.5 text-orange-500" /> Lab Exercise Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleGenerate} className="space-y-3">
                  <Textarea
                    placeholder={`Describe your lab exercise in detail...\n\nExample: "Write a program to implement a TCP client-server chat application where the server can handle multiple clients using threading. Include error handling for connection failures."`}
                    value={exerciseText}
                    onChange={(e) => setExerciseText(e.target.value)}
                    className="h-36 text-xs bg-muted/40 border-border resize-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">{exerciseText.length} / 2000 chars</span>
                    <Button
                      type="submit"
                      disabled={generate.isPending}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs h-9 px-5 shadow-sm"
                    >
                      {generate.isPending ? (
                        <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate Code</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Generated Result */}
            {result && (
              <>
                {/* Explanation */}
                {result.explanation && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                      💡 Approach Explanation
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">{result.explanation}</p>
                  </div>
                )}

                {/* Code Block */}
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {result.language}
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
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto text-foreground whitespace-pre-wrap bg-muted/20 max-h-96 overflow-y-auto">
                    {result.code}
                  </pre>
                </div>

                {/* Test Cases */}
                {result.testCases && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5" /> Test Cases / Expected Output
                    </p>
                    <pre className="text-[11px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">{result.testCases}</pre>
                  </div>
                )}

                {/* Notes */}
                {result.notes && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5">
                      📝 Lab Notes
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">{result.notes}</p>
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {!result && !generate.isPending && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3 p-8 rounded-2xl border border-dashed border-border max-w-sm">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-md">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Ready to code</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Describe your lab exercise above or pick a quick template. The AI will generate clean, commented code with test cases.
                  </p>
                </div>
              </div>
            )}
          </main>

        </div>
      </div>
    </ChatLayout>
  );
}
