import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { createThread, listThreads } from "@/lib/chat.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Sparkles, ArrowRight, BookOpen, Brain, Zap, HelpCircle, 
  MessageSquare, Volume2, Mic, History, Award, CheckCircle2 
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/ai-assistant")({
  component: AIAssistantLauncher,
});

const PROMPT_TEMPLATES = [
  {
    icon: BookOpen,
    title: "Summarize Syllabus Topics",
    desc: "Generate plain-English explanations of textbook or lecture slides.",
    prompt: "I want you to act as an Academic Coach. Summarize the core concepts of 'Database Normalization and BCNF' into brief bullet points, and explain the key differences between 3NF and BCNF with a simple table.",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    icon: Brain,
    title: "Explain Complex Concepts",
    desc: "Break down complicated computer science formulas and algorithms.",
    prompt: "Please explain the concept of 'CPU Scheduling Deadlock and Banker's Algorithm' with a real-life analogy. Explain it so a freshman engineering student can understand it immediately.",
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  },
  {
    icon: HelpCircle,
    title: "Generate Quiz Questions",
    desc: "Generate a mock exam sheet to test your topic comprehension.",
    prompt: "I have an exam on 'Computer Networks TCP/UDP Handshake and IP Addressing' tomorrow. Generate 5 challenging multiple-choice questions with answers and detailed explanations for me to practice.",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  },
  {
    icon: Zap,
    title: "Create Revision Flashcards",
    desc: "Create active-recall flashcard summaries for study sessions.",
    prompt: "Generate 6 active-recall study flashcards for 'Operating System Semaphores and Mutexes'. Format them as Front vs Back questions.",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
  }
];

function AIAssistantLauncher() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [customPrompt, setCustomPrompt] = useState("");
  const [subject, setSubject] = useState("dbms");

  const createFn = useServerFn(createThread);
  const listFn = useServerFn(listThreads);

  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn(),
  });

  const startThread = useMutation({
    mutationFn: async (promptText: string) => {
      const t = await createFn({ data: {} });
      return { thread: t, promptText };
    },
    onSuccess: ({ thread, promptText }) => {
      toast.success("AI Mentoring thread active!");
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ 
        to: "/app/$threadId", 
        params: { threadId: thread.id },
        search: { prompt: promptText }
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to initialize mentoring session");
    }
  });

  const handleLaunchCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) {
      toast.warning("Please type a topic or question to ask the AI assistant.");
      return;
    }
    startThread.mutate(customPrompt);
  };

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col transition-colors duration-200">
        
        {/* Header bar */}
        <div className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <h1 className="text-sm font-bold tracking-tight">AI Study Assistant</h1>
          </div>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">AI Copilot Hub</span>
        </div>

        {/* 3-Column layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Column 1: Left Inputs */}
          <aside className="w-80 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Study Copilot</h2>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Ask customized technical queries, generate explainers, or get active-recall guides.</p>
            </div>

            <form onSubmit={handleLaunchCustom} className="space-y-4">
              <div>
                <Label htmlFor="subject" className="text-[10px] font-bold text-muted-foreground uppercase">Target Subject Context</Label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs bg-muted border border-border rounded-lg h-9 px-2 font-medium focus:outline-none mt-1"
                >
                  <option value="dbms">Database Systems Lab</option>
                  <option value="networks">Computer Networks Lab</option>
                  <option value="dsa">Data Structures & Algorithms</option>
                </select>
              </div>

              <div>
                <Label htmlFor="prompt" className="text-[10px] font-bold text-muted-foreground uppercase">Custom Question / Topic</Label>
                <Textarea 
                  id="prompt"
                  placeholder="e.g. 'Explain B-Trees vs B+ Trees database index schemes...'"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="h-32 text-xs bg-muted/40 border-border mt-1 resize-none"
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={startThread.isPending}
                className="w-full h-9 bg-primary hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                {startThread.isPending ? "Configuring..." : "Launch AI Session"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </aside>

          {/* Column 2: Center Placeholder Workspace */}
          <main className="flex-1 bg-muted/10 p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin items-center justify-center">
            <div className="max-w-md w-full text-center space-y-4 p-8 border border-border bg-card rounded-2xl shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Active AI Tutoring Workspace</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter your syllabus questions on the left side, or load one of the quick templates from the history list to initialize a thread.
                </p>
              </div>

              {/* Skeletons to represent loading state visual aesthetic */}
              <div className="space-y-2 pt-4 text-left">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          </main>

          {/* Column 3: Right Side Templates and History list */}
          <aside className="w-72 border-l border-border bg-card p-4 flex flex-col gap-5 overflow-y-auto shrink-0 scrollbar-thin">
            
            {/* Quick Templates */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Quick Templates</h3>
              <div className="space-y-2">
                {PROMPT_TEMPLATES.map((tmpl, idx) => {
                  const Icon = tmpl.icon;
                  return (
                    <div 
                      key={idx}
                      onClick={() => startThread.mutate(tmpl.prompt)}
                      className="p-2.5 rounded-lg border border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40 cursor-pointer transition-all"
                    >
                      <h4 className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-primary shrink-0" /> {tmpl.title}
                      </h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{tmpl.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Mentoring History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4 text-muted-foreground" /> Chat Threads
              </h3>
              
              {threads.length === 0 ? (
                <div className="text-[10px] text-muted-foreground italic bg-muted/40 p-2.5 rounded-lg text-center">
                  No active threads.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
                  {threads.map((t: { id: string; title: string }) => (
                    <div 
                      key={t.id} 
                      onClick={() => navigate({ to: "/app/$threadId", params: { threadId: t.id } })}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 cursor-pointer text-xs transition-all truncate"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate text-[10px] font-semibold text-foreground">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </aside>

        </div>

      </div>
    </ChatLayout>
  );
}
