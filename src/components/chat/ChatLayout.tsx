import { type ReactNode, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads, createThread, deleteThread } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, LogOut, Menu, FileCheck2, Compass, BookOpen, Calendar, Target, LineChart, CheckCircle2, Search, Flame, Sparkles } from "lucide-react";
import logo from "@/assets/studentos-logo.png";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AcademicCopilot } from "@/components/chat/AcademicCopilot";
import { triggerCopilot } from "@/hooks/useCopilot";

export function ChatLayout({
  activeThreadId,
  children,
}: {
  activeThreadId: string | null;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);

  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn(),
  });

  const create = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/app/$threadId", params: { threadId: t.id } });
      setOpen(false);
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (id === activeThreadId) navigate({ to: "/app" });
    },
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const handleComingSoon = (moduleName: string) => {
    toast.info(`Coming soon: The ${moduleName} module is currently under development.`);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-sidebar transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-display text-base font-semibold">StudentOS</span>
          </Link>
        </div>

        <div className="px-3 space-y-1.5 overflow-y-auto max-h-[350px] scrollbar-thin">
          <Button
            onClick={() => create.mutate()}
            disabled={create.isPending}
            className="w-full justify-start mb-2"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" /> New AI Mentor
          </Button>

          <div className="mt-4 px-2 pb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Command Center
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-border text-foreground hover:bg-sidebar-accent"
            size="sm"
          >
            <Link to="/app">
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> Dashboard
            </Link>
          </Button>

          <div className="mt-5 px-2 pb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            My Journey
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-border text-foreground hover:bg-sidebar-accent"
            size="sm"
          >
            <Link to="/app/career-roadmap">
              <Compass className="mr-2 h-4 w-4 text-primary" /> Career Roadmap
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-border text-foreground hover:bg-sidebar-accent"
            size="sm"
          >
            <Link to="/study-planner">
              <Calendar className="mr-2 h-4 w-4 text-primary" /> Study Planner
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-border text-foreground hover:bg-sidebar-accent"
            size="sm"
          >
            <Link to="/app/resume-analyzer">
              <FileCheck2 className="mr-2 h-4 w-4 text-primary" /> Resume Profile
            </Link>
          </Button>

          <div className="mt-5 px-2 pb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Knowledge Center
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-border text-foreground hover:bg-sidebar-accent"
            size="sm"
          >
            <Link to="/notes-gap-analyzer">
              <Target className="mr-2 h-4 w-4 text-primary" /> Notes Analyzer
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-border text-foreground hover:bg-sidebar-accent"
            size="sm"
          >
            <Link to="/paper-simplifier">
              <BookOpen className="mr-2 h-4 w-4 text-primary" /> Paper Simplifier
            </Link>
          </Button>

          <div className="mt-5 px-2 pb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Placement Center
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-border text-foreground hover:bg-sidebar-accent"
            size="sm"
          >
            <Link to="/analytics">
              <LineChart className="mr-2 h-4 w-4 text-primary" /> Success Analytics
            </Link>
          </Button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-2 pb-2">
          <div className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Conversations
          </div>
          {threads.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No chats yet.</div>
          )}
          <ul className="space-y-0.5">
            {threads.map((t: { id: string; title: string }) => {
              const active = t.id === activeThreadId;
              return (
                <li key={t.id} className="group flex items-center gap-1">
                  <Link
                    to="/app/$threadId"
                    params={{ threadId: t.id }}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-1 items-center gap-2 truncate rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent text-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground",
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="truncate">{t.title}</span>
                  </Link>
                  <button
                    onClick={() => del.mutate(t.id)}
                    aria-label="Delete chat"
                    className="invisible mr-1 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/20 hover:text-destructive group-hover:visible"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-border p-3">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        {/* Desktop Header */}
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 md:flex">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ask Academic Copilot... (e.g., Explain recursion, DBMS lab, OS weakness)"
                className="w-full rounded-full border border-border bg-background py-1.5 pl-10 pr-4 text-xs text-foreground placeholder-muted-foreground outline-none ring-primary focus:border-primary focus:ring-1 focus:ring-primary/45"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    triggerCopilot(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-accent/40 px-3 py-1 text-xs md:flex border border-border/50">
              <span className="text-muted-foreground text-[10px]">Streak:</span>
              <span className="flex items-center gap-1 font-bold text-foreground text-[11px]">
                <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" /> 12 Days
              </span>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-accent/40 px-3 py-1 text-xs md:flex border border-border/50">
              <span className="text-muted-foreground text-[10px]">Academic Health:</span>
              <span className="font-bold text-primary text-[11px]">78/100</span>
            </div>
            <Button
              onClick={() => triggerCopilot("")}
              variant="outline"
              className="gap-1.5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold"
              size="sm"
            >
              <Sparkles className="h-3.5 w-3.5" /> Copilot
            </Button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen((v) => !v)} className="rounded-md p-2 hover:bg-accent text-foreground">
              <Menu className="h-4 w-4" />
            </button>
            <span className="font-display text-sm font-semibold text-foreground">AcadSphere</span>
          </div>
          <button
            onClick={() => triggerCopilot("")}
            className="rounded-md p-2 text-primary hover:bg-accent/40"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </header>
        
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
      
      {/* Global Academic Copilot */}
      <AcademicCopilot />
    </div>
  );
}
