import { type ReactNode, useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads, createThread, deleteThread } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Plus, MessageSquare, Trash2, LogOut, Menu,
  LayoutDashboard, BookOpen, Calendar, FileText,
  LineChart, CheckCircle2, Search, Bell, Sparkles,
  User, Settings, Code, Volume2, CalendarDays,
  Users, Sun, Moon, X
} from "lucide-react";
import logo from "@/assets/studentos-logo.png";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);

  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn(),
  });

  // Sync theme
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

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
    localStorage.removeItem("demo_session_token");
    localStorage.removeItem("demo_user_id");
    localStorage.removeItem("demo_user_email");
    // Fire and forget so we don't block on a paused Supabase project
    supabase.auth.signOut().catch(() => {});
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const navItems = [
    { label: "Dashboard",         to: "/app",                    icon: LayoutDashboard },
    { label: "AI Assistant",       to: "/app/ai-assistant",       icon: Sparkles },
    { label: "Smart Notes",        to: "/app/notes",              icon: BookOpen },
    { label: "Study Planner",      to: "/study-planner",          icon: Calendar },
    { label: "Lab Buddy",          to: "/app/lab-buddy",          icon: Code },
    { label: "Viva Simulator",     to: "/app/viva-simulator",     icon: Volume2 },
    { label: "Resume Builder",     to: "/app/resume-analyzer",    icon: FileText },
    { label: "Placement Hub",      to: "/analytics",              icon: LineChart },
    { label: "CIA Reminder",       to: "/app/cia-reminder",       icon: CalendarDays },
    { label: "Attendance",         to: "/app/attendance",         icon: CheckCircle2 },
    { label: "Community",          to: "/app/community",          icon: Users },
    { label: "Profile",            to: "/app/profile",            icon: User },
    { label: "Settings",           to: "/app/settings",           icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col",
          "border-r border-border bg-sidebar",
          "transition-transform duration-200 ease-out",
          "md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-border shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg border border-border bg-foreground overflow-hidden">
              <img
                src={logo}
                alt="AcadSphere"
                className="h-5 w-5 object-contain invert dark:invert-0"
              />
            </div>
            <span className="font-sans font-bold text-sm tracking-tight text-foreground">
              AcadSphere
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-[120ms] md:hidden"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {/* Section label */}
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground px-2 mb-3">
            Modules
          </p>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeProps={{
                    className: "bg-foreground text-background",
                  }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-sans rounded-lg transition-colors duration-[120ms] group"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* AI Mentoring threads */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                AI Mentoring
              </p>
              <button
                onClick={() => create.mutate()}
                disabled={create.isPending}
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-[120ms]"
                title="New AI Chat"
              >
                <Plus className="h-3 w-3" /> New
              </button>
            </div>

            {threads.length === 0 ? (
              <p className="px-2 py-2 text-[11px] font-mono text-muted-foreground">
                No active threads.
              </p>
            ) : (
              <ul className="space-y-0.5 max-h-40 overflow-y-auto">
                {threads.map((t: { id: string; title: string }) => {
                  const active = t.id === activeThreadId;
                  return (
                    <li key={t.id} className="group flex items-center gap-0.5 rounded-lg hover:bg-accent">
                      <Link
                        to="/app/$threadId"
                        params={{ threadId: t.id }}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex flex-1 items-center gap-2 truncate px-2.5 py-1.5 text-[12px] transition-colors duration-[120ms]",
                          active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        <span className="truncate">{t.title}</span>
                      </Link>
                      <button
                        onClick={() => del.mutate(t.id)}
                        aria-label="Delete chat"
                        className="invisible mr-1.5 grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground group-hover:visible transition-all duration-[120ms]"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors duration-[120ms]"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors duration-[120ms]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main content area ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-5 shrink-0 relative z-10">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-[120ms] md:hidden"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Workspace
              </span>
              <span className="text-border">/</span>
              <span className="font-sans text-[13px] font-medium text-foreground">
                AcadSphere Hub
              </span>
            </div>
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-sm mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search or ask anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-9 pr-4 py-2",
                  "text-[12px] font-sans",
                  "rounded-full border border-border bg-muted/60 text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground",
                  "transition-[border-color,box-shadow] duration-[120ms]",
                )}
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">

            {/* Ask AI */}
            <Button
              onClick={() => create.mutate()}
              size="sm"
              className="h-8 px-4 text-[10px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Ask AI</span>
            </Button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-[120ms]"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-[120ms]"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className={cn(
                    "absolute right-0 top-full mt-2 w-76 z-50",
                    "rounded-xl border border-border bg-popover p-5",
                    "shadow-none animate-slide-up",
                  )}>
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground">
                        Notifications
                      </p>
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        2 new
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                        <div>
                          <p className="text-[13px] font-sans font-medium text-foreground">CIA-1 Syllabus Update</p>
                          <p className="text-[11px] font-sans text-muted-foreground mt-0.5">Distributed Systems: Units 1 & 2 are finalized.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[13px] font-sans font-medium text-foreground">Viva prep suggested</p>
                          <p className="text-[11px] font-sans text-muted-foreground mt-0.5">Practice round open for Computer Networks.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center p-1 rounded-full hover:bg-accent transition-colors duration-[120ms]"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" />
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className={cn(
                    "absolute right-0 top-full mt-2 w-48 z-50",
                    "rounded-xl border border-border bg-popover py-2",
                    "shadow-none animate-slide-up",
                  )}>
                    <div className="px-4 py-2 border-b border-border mb-1">
                      <p className="font-sans text-[13px] font-semibold text-foreground">AcadSphere</p>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em] truncate mt-0.5">
                        student@acadsphere.edu
                      </p>
                    </div>

                    <Link
                      to="/app/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-sans text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-[120ms]"
                    >
                      <User className="h-3.5 w-3.5" />
                      My Profile
                    </Link>

                    <Link
                      to="/app/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-sans text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-[120ms]"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </Link>

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => { setShowProfileMenu(false); handleSignOut(); }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-[13px] font-sans text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-[120ms]"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
