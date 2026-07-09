import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateVivaQuestion, gradeVivaAnswer } from "@/lib/viva-lab.functions";
import {
  Volume2, Mic, MicOff, Send, History, Award,
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Trophy, Star
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/viva-simulator")({
  component: VivaSimulatorPage,
});

interface SessionEntry {
  q: string;
  a: string;
  score: number;
  grade: string;
  feedback: string;
  keyMissing: string;
}

const SUBJECTS = [
  { value: "Computer Networks", label: "Computer Networks (BCE304)", color: "from-blue-500 to-cyan-500" },
  { value: "Database Management Systems", label: "Database Systems (BCE302)", color: "from-violet-500 to-purple-500" },
  { value: "Operating Systems", label: "Operating Systems (BCE303)", color: "from-orange-500 to-amber-500" },
  { value: "Data Structures", label: "Data Structures & Algorithms", color: "from-emerald-500 to-teal-500" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { value: "medium", label: "Medium", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { value: "hard", label: "Hard", color: "text-red-500 bg-red-500/10 border-red-500/20" },
];

function gradeColor(grade: string) {
  const map: Record<string, string> = {
    A: "text-emerald-500", B: "text-blue-500",
    C: "text-amber-500", D: "text-orange-500", F: "text-red-500"
  };
  return map[grade] || "text-muted-foreground";
}

function VivaSimulatorPage() {
  const [subject, setSubject] = useState("Computer Networks");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [inProgress, setInProgress] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions] = useState(5);
  const [simHistory, setSimHistory] = useState<SessionEntry[]>([]);
  const [sessionDone, setSessionDone] = useState(false);

  const genQuestionFn = useServerFn(generateVivaQuestion);
  const gradeAnswerFn = useServerFn(gradeVivaAnswer);

  const generateQuestion = useMutation({
    mutationFn: () =>
      genQuestionFn({
        data: {
          subject,
          previousQuestions: simHistory.map((h) => h.q),
          difficulty,
        },
      }),
    onSuccess: (res) => {
      setCurrentQuestion(res.question);
      setStudentAnswer("");
    },
    onError: () => toast.error("Failed to generate question. Check AI config."),
  });

  const gradeAnswer = useMutation({
    mutationFn: (answer: string) =>
      gradeAnswerFn({
        data: { subject, question: currentQuestion, answer },
      }),
    onSuccess: (res) => {
      const entry: SessionEntry = {
        q: currentQuestion,
        a: studentAnswer,
        score: res.score,
        grade: res.grade,
        feedback: res.feedback,
        keyMissing: res.keyMissing,
      };
      const newHistory = [...simHistory, entry];
      setSimHistory(newHistory);
      setStudentAnswer("");

      if (newHistory.length >= totalQuestions) {
        setSessionDone(true);
        setInProgress(false);
        setCurrentQuestion("");
        toast.success("🎓 Viva session complete! Review your scorecard below.");
      } else {
        setQuestionCount((p) => p + 1);
        generateQuestion.mutate();
      }
    },
    onError: () => toast.error("Failed to grade answer. Please try again."),
  });

  const handleStart = () => {
    setSimHistory([]);
    setSessionDone(false);
    setQuestionCount(1);
    setInProgress(true);
    generateQuestion.mutate();
    toast.success(`Viva session started — ${difficulty} mode`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) {
      toast.warning("Please type your answer first.");
      return;
    }
    gradeAnswer.mutate(studentAnswer);
  };

  const avgScore = simHistory.length
    ? (simHistory.reduce((s, h) => s + h.score, 0) / simHistory.length).toFixed(1)
    : "—";

  const isLoading = generateQuestion.isPending || gradeAnswer.isPending;

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground flex flex-col transition-colors duration-200">

        {/* Gradient Header */}
        <div className="relative overflow-hidden px-6 py-5 border-b border-border shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-background to-violet-500/5 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-md">
                <Volume2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">AI Viva Simulator</h1>
                <p className="text-[10px] text-muted-foreground">AI-powered oral exam practice with instant grading</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {simHistory.length > 0 && (
                <span className="text-xs font-bold text-foreground bg-card border border-border px-3 py-1 rounded-full shadow-sm">
                  Avg Score: <span className="text-primary">{avgScore}/10</span>
                </span>
              )}
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold uppercase tracking-wider">
                Oral Exam Engine
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">

          {/* Left: Config */}
          <aside className="w-72 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Exam Configuration</h2>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Configure your subject and difficulty. The AI will generate real exam-style questions.
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Subject</Label>
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => !inProgress && setSubject(s.value)}
                  disabled={inProgress}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    subject === s.value
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Difficulty</Label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => !inProgress && setDifficulty(d.value as any)}
                    disabled={inProgress}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                      difficulty === d.value ? d.color : "border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Session info */}
            {inProgress && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Session Active</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Question</span>
                  <span className="font-bold text-foreground">{simHistory.length + 1} / {totalQuestions}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${((simHistory.length) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-auto space-y-2">
              {!inProgress ? (
                <Button
                  onClick={handleStart}
                  className="w-full h-9 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs shadow-sm"
                >
                  {sessionDone ? "Start New Session" : "Start Viva Session"}
                </Button>
              ) : (
                <Button
                  onClick={() => { setInProgress(false); setCurrentQuestion(""); }}
                  variant="outline"
                  className="w-full h-9 text-xs border-border"
                >
                  End Session
                </Button>
              )}
            </div>
          </aside>

          {/* Center: Active Viva */}
          <main className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-muted/10">

            {/* Not started or session done */}
            {!inProgress && !sessionDone && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 p-10 rounded-2xl border border-border bg-card shadow-sm max-w-md">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mx-auto shadow-md">
                    <Volume2 className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Ready for your Viva?</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The AI examiner will ask you {totalQuestions} real exam-style questions on your chosen subject and grade each answer instantly.
                  </p>
                  <Button
                    onClick={handleStart}
                    className="bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs h-9 px-6 shadow-sm"
                  >
                    Start Viva Practice
                  </Button>
                </div>
              </div>
            )}

            {/* Session done summary */}
            {sessionDone && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Session Complete!</h3>
                      <p className="text-[10px] text-muted-foreground">Average Score: <span className="text-primary font-bold">{avgScore}/10</span></p>
                    </div>
                  </div>
                  <Button onClick={handleStart} size="sm" variant="outline" className="h-8 text-xs border-border">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Active question */}
            {inProgress && (
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-6 space-y-5">
                  {/* Progress */}
                  <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Question {simHistory.length + 1} of {totalQuestions}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                      difficulty === "easy" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                      difficulty === "medium" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                      "text-red-500 bg-red-500/10 border-red-500/20"
                    }`}>{difficulty.toUpperCase()}</span>
                  </div>

                  {/* AI Question Bubble */}
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Volume2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Examiner</span>
                    </div>
                    {generateQuestion.isPending ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating question...</span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-foreground leading-relaxed">{currentQuestion}</p>
                    )}
                  </div>

                  {/* Answer Input */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Label htmlFor="answer" className="text-[10px] font-bold text-muted-foreground uppercase">
                      Your Answer
                    </Label>
                    <Textarea
                      id="answer"
                      placeholder="Type your answer clearly. Structure: define → explain → give an example..."
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      className="h-28 text-xs bg-muted/40 border-border resize-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">{studentAnswer.length} chars</span>
                      <Button
                        type="submit"
                        disabled={isLoading || !currentQuestion}
                        className="bg-primary hover:bg-blue-700 text-white font-bold text-xs h-9 px-5"
                      >
                        {gradeAnswer.isPending ? (
                          <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Grading...</>
                        ) : (
                          <><Send className="h-3.5 w-3.5 mr-1.5" /> Submit Answer</>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Response History */}
            {simHistory.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Session Scorecard
                </h4>
                {[...simHistory].reverse().map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card p-4 space-y-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-xs font-semibold text-foreground leading-relaxed flex-1">
                        Q: {item.q}
                      </p>
                      <div className="text-right shrink-0">
                        <span className={`text-lg font-black tabular-nums ${gradeColor(item.grade)}`}>
                          {item.score}/10
                        </span>
                        <p className={`text-[9px] font-bold ${gradeColor(item.grade)}`}>Grade {item.grade}</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.score >= 8 ? "bg-emerald-500" : item.score >= 6 ? "bg-blue-500" : item.score >= 4 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${item.score * 10}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                      💬 {item.feedback}
                    </p>
                    {item.keyMissing && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        ⚠️ Key concept missing: {item.keyMissing}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right: Tips & History */}
          <aside className="w-64 border-l border-border bg-card p-4 flex flex-col gap-5 overflow-y-auto shrink-0 scrollbar-thin">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" /> Viva Tips
              </h3>
              <div className="rounded-xl bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/10 p-3.5 space-y-3">
                {[
                  "State the definition first, then explain the mechanism.",
                  "Use real-world examples — e.g. for TCP: 'like a phone call'.",
                  "If you don't know, say what you do know and relate it.",
                  "Draw diagrams in your mind and describe them verbally.",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[10px] font-bold text-primary mt-0.5">{i + 1}.</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Past sessions */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4 text-muted-foreground" /> Past Sessions
              </h3>
              {[
                { title: "Computer Networks", score: "8.4/10", date: "Jul 8" },
                { title: "DBMS SQL", score: "9.2/10", date: "Jul 4" },
                { title: "Operating Systems", score: "7.6/10", date: "Jun 28" },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-border/80 bg-muted/10 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-foreground text-[10px]">{item.title}</h4>
                    <span className="text-[8px] text-muted-foreground">{item.date}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">{item.score}</span>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </ChatLayout>
  );
}
