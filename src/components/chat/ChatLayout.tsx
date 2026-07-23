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
  Users, Sun, Moon, X, Activity, GraduationCap,
  UserCog, Shield, Radio, Megaphone, TrendingUp, ScrollText, Lock
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

  const userRole = typeof window !== "undefined"
    ? (localStorage.getItem("demo_user_role") || "student")
    : "student";
  const isAdmin = userRole === "admin";

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
    localStorage.removeItem("demo_user_role");
    supabase.auth.signOut().catch(() => {});
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  // Student navigation items
  const studentNavItems = [
    { label: "Dashboard",         to: "/app",                    icon: LayoutDashboard },
    { label: "AI Assistant",       to: "/app/ai-assistant",       icon: Sparkles },
    { label: "Smart Notes",        to: "/app/notes",              icon: BookOpen },
    { label: "Lab Helper",         to: "/app/lab-buddy",          icon: Code },
    { label: "Resume Builder",     to: "/app/resume-analyzer",    icon: FileText },
    { label: "CIA Reminder",       to: "/app/cia-reminder",       icon: CalendarDays },
    { label: "Attendance",         to: "/app/attendance",         icon: CheckCircle2 },
    { label: "Community",          to: "/app/community",          icon: Users },
    { label: "Profile",            to: "/app/profile",            icon: User },
    { label: "Settings",           to: "/app/settings",           icon: Settings },
  ];

  // Administrator navigation items: NO student modules, NO student dashboard
  const adminNavItems = [
    { label: "Admin Command Center", to: "/admin font-bold",       icon: LayoutDashboard },
    { label: "Student Monitoring",   to: "/admin/live-activity",   icon: Activity },
    { label: "Student Management",   to: "/admin/students",        icon: GraduationCap },
    { label: "Live Activity",       to: "/admin/live-activity",   icon: Radio },
    { label: "Analytics",            to: "/admin/analytics",       icon: TrendingUp },
    { label: "Announcements",        to: "/admin/announcements",   icon: Megaphone },
    { label: "Reports",              to: "/admin/reports",         icon: FileText },
    { label: "User & Role Management", to: "/admin/users",         icon: UserCog },
    { label: "Audit Logs",          to: "/admin/audit-logs",      icon: ScrollText },
    { label: "Security",             to: "/admin/security",        icon: Lock },
    { label: "Settings",             to: "/admin/settings",        icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

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
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg border border-border bg-foreground overflow-hidden">
              <img
                src={logo}
                alt="AcadSphere"
                className="h-5 w-5 object-contain invert dark:invert-0"
              />
            </div>
            <span className="font-sans font-bold text-sm tracking-tight text-foreground">
              AcadSphere {isAdmin && <span className="text-[10px] text-blue-500 font-mono">(Admin)</span>}
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
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground px-2 mb-3">
            {isAdmin ? "Admin SIS Monitoring" : "Modules"}
          </p>

          <nav className="space-y-0.5">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label + idx}
                  to={item.to.split(" ")[0]}
                  onClick={() => setOpen(false)}
                  activeProps={{
                    className: "bg-foreground text-background font-bold",
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
                {isAdmin ? "Admin SIS Monitoring Center" : "AcadSphere Hub"}
              </span>
            </div>
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-sm mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder={isAdmin ? "Search students, USNs, or audit logs..." : "Search or ask anything..."}
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

            {!isAdmin ? (
              <Button
                onClick={() => create.mutate()}
                size="sm"
                className="h-8 px-4 text-[10px]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Ask AI</span>
              </Button>
            ) : (
              <Button
                onClick={() => navigate({ to: "/admin/students" })}
                size="sm"
                className="h-8 px-4 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Manage Students</span>
              </Button>
            )}

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

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center p-1 rounded-full hover:bg-accent transition-colors duration-[120ms]"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" />
                  <AvatarFallback>{isAdmin ? "AD" : "AS"}</AvatarFallback>
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
                      <p className="font-sans text-[13px] font-semibold text-foreground">
                        {isAdmin ? "Administrator" : "AcadSphere"}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em] truncate mt-0.5">
                        {localStorage.getItem("demo_user_email") || "admin@acadsphere.edu"}
                      </p>
                    </div>

                    <Link
                      to={isAdmin ? "/admin" : "/app/profile"}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-sans text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-[120ms]"
                    >
                      <User className="h-3.5 w-3.5" />
                      {isAdmin ? "Admin Center" : "My Profile"}
                    </Link>

                    <Link
                      to={isAdmin ? "/admin/settings" : "/app/settings"}
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
