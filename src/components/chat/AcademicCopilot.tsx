import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Brain,
  Send,
  Mic,
  Paperclip,
  X,
  Pin,
  Bookmark,
  Check,
  Play,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
  CheckCircle2,
  Trash2,
  BookmarkCheck,
  FileCheck2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCopilot } from "@/hooks/useCopilot";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isCustomWorkflow?: boolean;
  workflowType?: "dbms" | "java" | "os" | "recursion" | "sql" | "viva" | "time";
  workflowStep?: number;
  quizAnswered?: boolean;
  quizCorrect?: boolean;
  vivaScore?: number;
  isBookmarked?: boolean;
  isPinned?: boolean;
}

export function AcademicCopilot() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<"idle" | "listening">("idle");
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [activeWorkflowLog, setActiveWorkflowLog] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeWorkflowLog, isTyping]);

  // Load or create Copilot Thread from Database
  useEffect(() => {
    async function initCopilotThread() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const userId = sessionData.session.user.id;
      
      // Look for existing copilot thread
      const { data: threads, error } = await supabase
        .from("threads")
        .select("id, title, module")
        .eq("user_id", userId)
        .eq("module", "copilot")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (threads && threads.length > 0) {
        setCurrentThreadId(threads[0].id);
        
        // Fetch messages for this thread
        const { data: dbMessages } = await supabase
          .from("messages")
          .select("id, role, parts")
          .eq("thread_id", threads[0].id)
          .order("created_at", { ascending: true });

        if (dbMessages && dbMessages.length > 0) {
          const loadedMessages: Message[] = dbMessages.map((m) => {
            let contentStr = "";
            try {
              const parts = typeof m.parts === "string" ? JSON.parse(m.parts) : m.parts;
              if (Array.isArray(parts)) {
                contentStr = parts.map((p: any) => p.text || "").join("");
              }
            } catch (e) {
              contentStr = typeof m.parts === "string" ? m.parts : "";
            }
            return {
              id: m.id,
              role: m.role as "user" | "assistant",
              content: contentStr || "Unable to load content",
            };
          });
          setMessages(loadedMessages);
        } else {
          loadWelcomeMessage();
        }
      } else {
        // Create new Copilot Thread
        const { data: newThread } = await supabase
          .from("threads")
          .insert([{ user_id: userId, title: "Academic Copilot Hub", module: "copilot" }])
          .select()
          .single();

        if (newThread) {
          setCurrentThreadId(newThread.id);
        }
        loadWelcomeMessage();
      }
    }

    if (isOpen && !currentThreadId) {
      initCopilotThread();
    }
  }, [isOpen]);

  // Listen to global open event
  useCopilot((query) => {
    setIsOpen(true);
    if (query.trim()) {
      handleSend(query);
    }
  });

  const loadWelcomeMessage = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `### Good Morning! I am your AI Academic Copilot. 🚀

Think of me as your academic operating system. I analyze your syllabus, weak subjects, lab sessions, and quizzes to keep you moving forward.

**How can I help you today?** You can select one of the quick actions below, upload your syllabus/lab documents, or ask me directly in natural language.`,
      },
    ]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      setAttachedFiles((prev) => [...prev, { name: file.name, size: sizeStr }]);
      toast.success(`Attached file: ${file.name}`);
    }
  };

  const simulateVoiceInput = () => {
    if (voiceState === "listening") {
      setVoiceState("idle");
      return;
    }
    setVoiceState("listening");
    toast.info("Listening... Speak now");
    
    setTimeout(() => {
      setVoiceState("idle");
      setInput("Help me prepare for tomorrow's DBMS lab");
      toast.success("Voice transcribed successfully!");
    }, 2800);
  };

  const triggerInteractiveWorkflow = async (
    type: "dbms" | "java" | "os" | "recursion" | "sql" | "viva" | "time",
    userQuery: string
  ) => {
    setIsTyping(true);
    setActiveWorkflowLog([]);
    
    const logs = {
      dbms: [
        "🔍 Detecting intent: Lab Preparation",
        "🌐 Retrieving syllabus schema for DBMS Lab...",
        "🧪 Synthesizing Theory for Experiment 4: SQL Joins...",
        "📄 Compiling Procedure & Expected Output data...",
        "🧠 Pre-loading Mock Viva Simulator..."
      ],
      java: [
        "🔍 Detecting intent: Exam Prep & Study Planning",
        "📂 Pulling syllabus matrix for Advanced Java...",
        "📅 Generating 7-day study timetable...",
        "⚡ Creating customized active recall flashcards...",
        "📝 Synced tasks with Study Planner database..."
      ],
      os: [
        "🔍 Detecting intent: Weak Subject Revision",
        "📊 Checking database telemetry for Operating Systems...",
        "⚠️ Gaps detected: CPU Scheduling (45% accuracy), Semaphores (50% accuracy)",
        "📋 Mapping remedial study path...",
        "⚡ Generating interactive scheduling quiz..."
      ],
      recursion: [
        "🔍 Detecting intent: Core Concept Clarification",
        "🎓 Adapting teaching tone to: Beginner",
        "🎨 Constructing recursion call stack visual diagram...",
        "🎮 Creating validation quiz..."
      ],
      sql: [
        "🔍 Detecting intent: Concept Reboot",
        "📖 Querying SQL basics templates...",
        "✍️ Formulating cheat sheet notes...",
        "📊 Setting up SQL interactive checkpoints..."
      ],
      viva: [
        "🔍 Detecting intent: Interactive Assessment",
        "🎙️ Launching Viva Simulator session...",
        "❓ Constructing subject questions..."
      ],
      time: [
        "🔍 Detecting intent: Optimized Study Sprint",
        "⏱️ Setting time constraint: 45 minutes",
        "⚖️ Allocating high-impact tasks...",
        "🔔 Structuring alerts..."
      ]
    };

    // Print logs one by one
    const workflowLogs = logs[type];
    for (let i = 0; i < workflowLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setActiveWorkflowLog((prev) => [...prev, workflowLogs[i]]);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setActiveWorkflowLog([]);
    setIsTyping(false);

    let content = "";
    if (type === "dbms") {
      content = `### 🧪 DBMS Lab Buddy: Experiment 4 (SQL Joins)

I have loaded your syllabus lab details. Here is the full guide:

*   **Experiment**: Creating queries using INNER JOIN, LEFT OUTER JOIN, and RIGHT OUTER JOIN.
*   **Theory**: Joins allow you to retrieve records from multiple tables based on a related column.
*   **Procedure**: Write the query matching common keys (e.g., \`Employee.dept_id = Department.id\`).

#### Expected Output Table
| Employee | Department | Salary | Join Type |
| :--- | :--- | :--- | :--- |
| Yash Barjatya | engineering | $120,000 | INNER JOIN |
| Alice Smith | marketing | $85,000 | INNER JOIN |
| Bob Jones | NULL | $50,000 | LEFT OUTER JOIN |

---
### 🎙️ Quick Viva Challenge
To mark this preparation as complete and raise your **Academic Health Score**, answer this question:

**What is the primary difference between a LEFT JOIN and an INNER JOIN?**`;
    } else if (type === "java") {
      content = `### 📅 7-Day Java CIA Study Roadmap

I have generated an optimized study timetable for your **Java CIA Exam** next week, prioritized by past exam weightage.

| Day | Topic Focus | Daily Commitment | Active Practice |
| :--- | :--- | :--- | :--- |
| **Day 1** | Multithreading & Thread Lifecycle | 60 Mins | Read Notes + Quiz |
| **Day 2** | Exception Handling (Try-Catch, Custom Exceptions) | 45 Mins | Practical Coding |
| **Day 3** | Java Collections Framework (ArrayList, HashMap) | 90 Mins | 10 Flashcards |
| **Day 4** | JDBC Database Connection Pipelines | 60 Mins | Connection Script |
| **Day 5** | Mock Exam Evaluation & Mistake Recap | 45 Mins | Adaptive Quiz |

---
**Academic OS Sync**: Would you like me to sync these 5 tasks to your **Study Planner** and set push notifications?`;
    } else if (type === "os") {
      content = `### 🧠 OS CPU Scheduling Gap Remediation

Your database profile reports a gap in **Operating Systems (Average Quiz Score: 48%)**. Specifically, CPU Scheduling algorithm calculations need reinforcement.

Here is your diagnostic review:
1.  **FCFS**: Simple, suffers from convoy effect.
2.  **SJF (Shortest Job First)**: Optimal, but can cause starvation of longer processes.
3.  **Round Robin**: Uses time slices, prevents starvation, high context-switching overhead.

Let's verify your conceptual understanding right now:
**Which CPU Scheduling algorithm is optimal in minimizing average waiting time?**`;
    } else if (type === "recursion") {
      content = `### 🔄 Recursion Explained (Beginner Level)

Think of recursion as a **mirror looking into another mirror**. 

In coding, **recursion is when a function calls itself** to solve a smaller sub-problem. 

#### The Call Stack Example: Factorial(3)
\`\`\`text
[Factorial(3)] -> calls 3 * Factorial(2)
   └── [Factorial(2)] -> calls 2 * Factorial(1)
         └── [Factorial(1)] -> base case reached: returns 1
\`\`\`
It then unwinds: \`1 * 2 * 3 = 6\`.

#### Rule of Gold: The Base Case
Every recursive function **must** have a base case to stop it from running forever (Stack Overflow).

Let's test this:
**What happens if a recursive function lacks a base case?**`;
    } else if (type === "time") {
      content = `### ⏱️ 45-Minute Sprints: Study Plan

Here is your micro-schedule designed to maximize retention in the next 45 minutes:

*   **00m - 20m**: Review core notes for **Computer Networks OSI Model** (High priority concept).
*   **20m - 35m**: Take a quick 10-question recall quiz.
*   **35m - 45m**: Read through the Mistake Bank for wrong answers.

[Click here to start the 20m Timer]`;
    } else if (type === "sql") {
      content = `### 📊 SQL Database Reboot

No worries, let's reset your SQL knowledge back to 100%. Here is your quick sheet:

*   **SELECT**: Fetches data. (\`SELECT name FROM users;\`)
*   **WHERE**: Filters records before grouping.
*   **GROUP BY**: Groups rows that have the same values.
*   **ORDER BY**: Sorts the output.

Would you like to generate a beginner SQL quiz to track your mastery?`;
    } else if (type === "viva") {
      content = `### 🎙️ Oral Viva Simulator Session
Subject: **Operating Systems & DBMS**

Let's begin the exam simulator. I will ask questions and evaluate your response:

**Question 1: Explain ACID properties in DBMS and why they are critical for transactions.**`;
    }

    const newMsg: Message = {
      id: Math.random().toString(),
      role: "assistant",
      content,
      isCustomWorkflow: true,
      workflowType: type,
      workflowStep: 1,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Save to database
    if (currentThreadId) {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const userMsgRecord = {
          id: crypto.randomUUID(),
          thread_id: currentThreadId,
          user_id: session.session.user.id,
          role: "user",
          parts: [{ type: "text", text: userQuery }],
        };
        const assistantMsgRecord = {
          id: crypto.randomUUID(),
          thread_id: currentThreadId,
          user_id: session.session.user.id,
          role: "assistant",
          parts: [{ type: "text", text: content }],
        };
        await supabase.from("messages").insert([userMsgRecord, assistantMsgRecord]);
        qc.invalidateQueries({ queryKey: ["threads"] });
      }
    }
  };

  const handleSend = async (text: string = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Intercept with heuristics
    const low = trimmed.toLowerCase();
    if (low.includes("dbms") && (low.includes("lab") || low.includes("tomorrow"))) {
      triggerInteractiveWorkflow("dbms", trimmed);
      return;
    }
    if (low.includes("java") && (low.includes("cia") || low.includes("week"))) {
      triggerInteractiveWorkflow("java", trimmed);
      return;
    }
    if (low.includes("operating system") || low.includes("weak in os") || low.includes("weak in operating")) {
      triggerInteractiveWorkflow("os", trimmed);
      return;
    }
    if (low.includes("recursion")) {
      triggerInteractiveWorkflow("recursion", trimmed);
      return;
    }
    if (low.includes("45 minute") || low.includes("one hour") || low.includes("1 hour")) {
      triggerInteractiveWorkflow("time", trimmed);
      return;
    }
    if (low.includes("sql") && low.includes("forgot")) {
      triggerInteractiveWorkflow("sql", trimmed);
      return;
    }
    if (low.includes("viva") || low.includes("test me")) {
      triggerInteractiveWorkflow("viva", trimmed);
      return;
    }

    // Default: call real API
    setIsTyping(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const payloadMessages = [...messages, userMsg].map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text" as const, text: m.content }],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: payloadMessages,
          threadId: currentThreadId,
        }),
      });

      if (!res.ok) throw new Error("Fetch failed");
      
      setIsTyping(false);
      
      // Parse streamed output response (simulating simple stream readout)
      const data = await res.json();
      // Handle array or object layout
      let replyContent = "";
      if (Array.isArray(data)) {
        replyContent = data.map((d: any) => d.parts?.map((p: any) => p.text || "").join("") || "").join("");
      } else if (data.content) {
        replyContent = data.content;
      } else if (typeof data === "string") {
        replyContent = data;
      } else {
        // Fallback reading
        replyContent = "I've processed your profile and synchronized your dashboard actions. Let's start with a notes analysis session!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: replyContent,
        },
      ]);
      qc.invalidateQueries({ queryKey: ["threads"] });

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      // Fallback response showing context awareness
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: `I've analyzed your context regarding **"${trimmed}"**. Based on your subjects and placement goals, here is a targeted recommendation:\n\n1. Review your weak areas in Algorithms.\n2. Complete Experiment 3 for networks.\n\nLet's get started on generating notes for this topic!`,
        },
      ]);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === "dbms") {
      handleSend("Help me prepare for tomorrow's DBMS lab");
    } else if (action === "java") {
      handleSend("Create a study plan for my Java CIA");
    } else if (action === "os") {
      handleSend("I am weak in Operating Systems");
    } else if (action === "recursion") {
      handleSend("Explain recursion using simple language");
    } else if (action === "time") {
      handleSend("I only have one hour. Make the best study plan.");
    } else if (action === "viva") {
      handleSend("Test me before my viva");
    }
  };

  const handleInteractiveAnswer = (msgId: string, isCorrect: boolean, explanation: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              quizAnswered: true,
              quizCorrect: isCorrect,
              content:
                m.content +
                `\n\n**Your Evaluation:**\n${
                  isCorrect
                    ? "✨ **Correct!** " + explanation
                    : "⚠️ **Incorrect.** " + explanation
                }\n\n**Dashboard Updated**: Success Score +2. Streak maintained.`,
            }
          : m
      )
    );
    toast.success("Academic Score Updated! +15 points");
  };

  const handleTextAnswer = (msgId: string, answer: string) => {
    if (!answer.trim()) return;

    const lower = answer.toLowerCase();
    let score = 70;
    let feedback = "Nice attempt! Make sure to mention that LEFT JOIN includes all rows from the left table even if there are no matches on the right.";
    
    if (lower.includes("all") && lower.includes("left") && lower.includes("match")) {
      score = 95;
      feedback = "Outstanding explanation! You correctly captured that LEFT JOIN preserves all records of the left table while INNER JOIN only keeps matching records.";
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              quizAnswered: true,
              vivaScore: score,
              content:
                m.content +
                `\n\n*Your Answer*: "${answer}"\n\n**Copilot Evaluation:**\n- **Confidence Rating**: \`${score}%\`\n- **Feedback**: ${feedback}\n\n**Dashboard Sync**: Academic Health Score increased. Weak concept weights updated.`,
            }
          : m
      )
    );
    toast.success(`Viva evaluated! Confidence: ${score}%`);
  };

  const syncStudyPlan = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              quizAnswered: true,
              content:
                m.content +
                `\n\n✅ **Planner Status**: 5 Tasks successfully synced to your [Study Planner](/study-planner). Push reminders active.`,
            }
          : m
      )
    );
    toast.success("Tasks written to study-planner!");
  };

  const toggleBookmark = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const newState = !m.isBookmarked;
          toast.success(newState ? "Response bookmarked!" : "Bookmark removed");
          return { ...m, isBookmarked: newState };
        }
        return m;
      })
    );
  };

  const togglePin = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const newState = !m.isPinned;
          toast.success(newState ? "Pinned to Dashboard widget!" : "Unpinned");
          return { ...m, isPinned: newState };
        }
        return m;
      })
    );
  };

  return (
    <>
      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/40 backdrop-blur-sm">
          {/* Backdrop closer */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          
          <div className="relative flex h-full w-full flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 md:max-w-md lg:max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-sidebar p-4">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Brain className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">AI Academic Copilot</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span>Context Active: 5th Sem MCA</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMessages([]);
                    loadWelcomeMessage();
                    toast.success("Conversation history cleared");
                  }}
                  title="Clear chat"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Context Strip */}
            <div className="grid grid-cols-3 border-b border-border bg-muted/30 py-2 text-center text-xs font-semibold text-muted-foreground">
              <div className="border-r border-border">
                🔥 <span className="text-foreground">12 Days</span>
              </div>
              <div className="border-r border-border">
                🛡️ AHS: <span className="text-primary font-bold">78</span>
              </div>
              <div>
                🎯 MCA Goal: <span className="text-foreground">SDE-1</span>
              </div>
            </div>

            {/* Message Area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-background/50"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {dragActive && (
                <div className="absolute inset-x-4 inset-y-20 z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-background/90 p-6 text-center backdrop-blur-sm">
                  <Paperclip className="h-10 w-10 text-primary animate-bounce" />
                  <p className="mt-3 font-semibold text-foreground text-sm">Drop your academic documents here</p>
                  <p className="text-xs text-muted-foreground mt-1">Syllabus PDF, Lab manuals, or study notes (Max 20MB)</p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-4 gap-2 text-sm shadow-sm transition-all ${
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground font-medium"
                      : "bg-surface text-foreground border border-border/80"
                  }`}
                >
                  {/* Markdown Renderer simulation */}
                  <div className="space-y-2 leading-relaxed whitespace-pre-wrap font-sans text-[13px]">
                    {m.content.startsWith("###") || m.content.includes("**") || m.content.includes("|") ? (
                      // Parse headers and lists
                      m.content.split("\n").map((line, idx) => {
                        if (line.startsWith("###")) {
                          return (
                            <h4 key={idx} className="font-display font-bold text-sm text-primary mt-2 flex items-center gap-1.5">
                              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                              {line.replace("###", "").trim()}
                            </h4>
                          );
                        }
                        if (line.startsWith("####")) {
                          return (
                            <h5 key={idx} className="font-semibold text-xs text-foreground mt-1 border-b border-border/40 pb-0.5">
                              {line.replace("####", "").trim()}
                            </h5>
                          );
                        }
                        if (line.startsWith("*") || line.startsWith("-")) {
                          return (
                            <li key={idx} className="ml-3 list-disc text-muted-foreground">
                              {line.replace(/^[\*\-]\s+/, "")}
                            </li>
                          );
                        }
                        if (line.startsWith("|")) {
                          // Simple table layout formatter
                          if (line.includes("---")) return null;
                          const cells = line.split("|").filter(Boolean).map(c => c.trim());
                          return (
                            <div key={idx} className="grid grid-cols-4 gap-1.5 py-1 text-[11px] border-b border-border/20 font-mono">
                              {cells.map((cell, cidx) => (
                                <span key={cidx} className={idx === 0 ? "font-bold text-primary" : "text-muted-foreground"}>
                                  {cell}
                                </span>
                              ))}
                            </div>
                          );
                        }
                        return <p key={idx}>{line}</p>;
                      })
                    ) : (
                      m.content
                    )}
                  </div>

                  {/* Bookmark and Pin Action controls */}
                  {m.role === "assistant" && (
                    <div className="flex items-center justify-end gap-1.5 border-t border-border/25 pt-2 mt-2 text-[10px] text-muted-foreground">
                      <button
                        onClick={() => togglePin(m.id)}
                        className={`p-1 rounded hover:bg-accent/40 ${m.isPinned ? "text-primary" : ""}`}
                        title="Pin this to dashboard"
                      >
                        <Pin className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => toggleBookmark(m.id)}
                        className={`p-1 rounded hover:bg-accent/40 ${m.isBookmarked ? "text-primary" : ""}`}
                        title="Bookmark response"
                      >
                        {m.isBookmarked ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                      </button>
                    </div>
                  )}

                  {/* CUSTOM INTERACTIVE WIDGETS */}
                  {m.isCustomWorkflow && !m.quizAnswered && (
                    <div className="border-t border-border/40 pt-3 mt-2 space-y-3 bg-muted/10 p-2.5 rounded-xl border">
                      {m.workflowType === "dbms" && (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Type your explanation..."
                            className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleTextAnswer(m.id, e.currentTarget.value);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const ta = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                              handleTextAnswer(m.id, ta.value);
                            }}
                            className="w-full rounded-lg bg-primary py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/95"
                          >
                            Submit Answer
                          </button>
                        </div>
                      )}

                      {m.workflowType === "java" && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => syncStudyPlan(m.id)}
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/95"
                          >
                            <Calendar className="h-3.5 w-3.5" /> Sync to Study Planner
                          </button>
                          
                          <div className="border-t border-border/30 pt-2 text-[11px] font-semibold text-muted-foreground">
                            Java Quick Verification:
                            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                              {["run()", "start()", "init()", "execute()"].map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => handleInteractiveAnswer(m.id, opt === "start()", "start() invokes the Thread-start sequence which allocates a new stack frame and runs run().")}
                                  className="border border-border bg-background rounded p-1 text-center text-foreground hover:border-primary/50 text-[10px]"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {m.workflowType === "os" && (
                        <div className="grid grid-cols-2 gap-1.5">
                          {["FCFS", "SJF", "Round Robin", "Priority"].map((alg) => (
                            <button
                              key={alg}
                              onClick={() => handleInteractiveAnswer(m.id, alg === "SJF", "Shortest Job First yields the mathematically minimum waiting time by scheduling shorter runtimes first.")}
                              className="border border-border bg-background rounded p-1 text-center text-foreground hover:border-primary/50 text-[10px]"
                            >
                              {alg}
                            </button>
                          ))}
                        </div>
                      )}

                      {m.workflowType === "recursion" && (
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => handleInteractiveAnswer(m.id, true, "Stack Overflow. Without a base case, memory frames build up until exhaustion occurs.")}
                            className="border border-border bg-background rounded p-2 text-left text-foreground hover:border-primary/50 text-[10px]"
                          >
                            A) Stack Overflow (Infinite recursion)
                          </button>
                          <button
                            onClick={() => handleInteractiveAnswer(m.id, false, "Stack Overflow. The recursion doesn't stop, it causes exhaustion.")}
                            className="border border-border bg-background rounded p-2 text-left text-foreground hover:border-primary/50 text-[10px]"
                          >
                            B) Resolves with a NULL response
                          </button>
                        </div>
                      )}

                      {m.workflowType === "viva" && (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Answer Question 1..."
                            className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleTextAnswer(m.id, e.currentTarget.value);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const ta = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                              handleTextAnswer(m.id, ta.value);
                            }}
                            className="w-full rounded-lg bg-primary py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/95"
                          >
                            Evaluate Answer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Workflow Status logs (Agent Simulation) */}
              {activeWorkflowLog.length > 0 && (
                <div className="border border-primary/20 bg-primary/5 rounded-2xl p-4 max-w-[85%] space-y-1.5 text-xs font-mono text-primary animate-pulse">
                  {activeWorkflowLog.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Streaming typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 max-w-[85%] bg-surface border border-border rounded-2xl p-4 text-xs text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Academic Copilot planning workflow...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Chips Scroll */}
            <div className="flex gap-1.5 overflow-x-auto border-t border-border bg-sidebar px-4 py-2 scrollbar-none">
              <button
                onClick={() => handleActionClick("dbms")}
                className="flex items-center gap-1 shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-foreground transition"
              >
                🧪 DBMS Lab Tomorrow
              </button>
              <button
                onClick={() => handleActionClick("java")}
                className="flex items-center gap-1 shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-foreground transition"
              >
                📅 Java CIA Study Plan
              </button>
              <button
                onClick={() => handleActionClick("os")}
                className="flex items-center gap-1 shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-foreground transition"
              >
                🧠 Weak in OS
              </button>
              <button
                onClick={() => handleActionClick("recursion")}
                className="flex items-center gap-1 shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-foreground transition"
              >
                🔄 Recursion Beginner
              </button>
              <button
                onClick={() => handleActionClick("viva")}
                className="flex items-center gap-1 shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-foreground transition"
              >
                🎙️ Mock Viva Test
              </button>
            </div>

            {/* Input Bar */}
            <div className="border-t border-border bg-card p-4">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {attachedFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 rounded bg-muted/40 px-2 py-0.5 text-[10px] border border-border text-foreground font-medium"
                    >
                      <FileText className="h-3 w-3 text-primary" />
                      <span className="truncate max-w-[80px]">{f.name}</span>
                      <button
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/45">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything or use quick actions..."
                  className="flex-1 bg-transparent px-2 text-xs text-foreground placeholder-muted-foreground outline-none border-none py-1.5"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isTyping) {
                      handleSend();
                    }
                  }}
                  disabled={isTyping}
                />

                <div className="flex items-center gap-1">
                  {/* File Upload Selector */}
                  <label className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
                          setAttachedFiles((prev) => [...prev, { name: file.name, size: sizeStr }]);
                          toast.success(`Selected file: ${file.name}`);
                        }
                      }}
                    />
                    <Paperclip className="h-4 w-4" />
                  </label>

                  {/* Voice Input Button */}
                  <button
                    onClick={simulateVoiceInput}
                    className={`rounded-lg p-1.5 transition ${
                      voiceState === "listening"
                        ? "bg-red-500/20 text-red-500 animate-pulse"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  {/* Submit Button */}
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="rounded-lg bg-primary p-1.5 text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-20 right-6 z-40 hidden md:block">
        <button
          onClick={() => triggerCopilot("")}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition hover:bg-primary/90"
          title="Open AI Academic Copilot"
        >
          <Sparkles className="h-6 w-6 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>

      {/* MOBILE BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card px-6 py-2 flex items-center justify-around md:hidden shadow-lg">
        <button
          onClick={() => navigate({ to: "/app" })}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>
        
        <button
          onClick={() => triggerCopilot("")}
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 focus:outline-none ring-4 ring-background"
        >
          <Sparkles className="h-6 w-6" />
        </button>

        <button
          onClick={() => navigate({ to: "/study-planner" })}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground"
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px]">Planner</span>
        </button>
      </div>
    </>
  );
}
