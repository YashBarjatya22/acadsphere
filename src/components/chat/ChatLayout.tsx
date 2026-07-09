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
  Users, Sun, Moon, X, Inbox
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
  const [isDark, setIsDark] = useState(true);

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
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      toast.success("Theme changed to Dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      toast.success("Theme changed to Light");
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
    // Clear demo session
    localStorage.removeItem("demo_session_token");
    localStorage.removeItem("demo_user_id");
    localStorage.removeItem("demo_user_email");
    // Clear Supabase session
    try { await supabase.auth.signOut(); } catch (_) {}
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  }


  // Sidebar Links
  const navItems = [
    { label: "Dashboard", to: "/app", icon: LayoutDashboard },
    { label: "AI Study Assistant", to: "/app/ai-assistant", icon: Sparkles },
    { label: "Smart Notes", to: "/app/notes", icon: BookOpen },
    { label: "Study Planner", to: "/study-planner", icon: Calendar },
    { label: "Lab Buddy", to: "/app/lab-buddy", icon: Code },
    { label: "Viva Simulator", to: "/app/viva-simulator", icon: Volume2 },
    { label: "Resume Builder", to: "/app/resume-analyzer", icon: FileText },
    { label: "Placement Hub", to: "/analytics", icon: LineChart },
    { label: "CIA Reminder", to: "/app/cia-reminder", icon: CalendarDays },
    { label: "Attendance Tracker", to: "/app/attendance", icon: CheckCircle2 },
    { label: "Community", to: "/app/community", icon: Users },
    { label: "Profile", to: "/app/profile", icon: User },
    { label: "Settings", to: "/app/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-200">
      
      {/* Sidebar overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center p-0.5 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-400 to-indigo-600 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="AcadSphere" className="h-8.5 w-8.5 rounded-[10px] relative bg-background p-1" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-500 bg-clip-text text-transparent">
              AcadSphere
            </span>
          </Link>
          <button 
            onClick={() => setOpen(false)} 
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin">
          <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Platform Modules
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "bg-primary text-white font-medium shadow-sm shadow-blue-500/10" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted/80" }}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 group"
                >
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* AI Conversations List */}
          <div className="mt-8">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                AI Mentoring
              </span>
              <button 
                onClick={() => create.mutate()} 
                disabled={create.isPending}
                className="text-xs text-primary hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
                title="New AI Chat"
              >
                <Plus className="h-3.5 w-3.5" /> New
              </button>
            </div>

            {threads.length === 0 ? (
              <div className="px-2 py-3 text-xs text-muted-foreground italic bg-muted/40 rounded-lg text-center">
                No active mentoring chats.
              </div>
            ) : (
              <ul className="space-y-0.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                {threads.map((t: { id: string; title: string }) => {
                  const active = t.id === activeThreadId;
                  return (
                    <li key={t.id} className="group flex items-center gap-0.5 rounded-lg hover:bg-muted/50">
                      <Link
                        to="/app/$threadId"
                        params={{ threadId: t.id }}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex flex-1 items-center gap-2 truncate px-2.5 py-1.5 text-xs transition-colors",
                          active
                            ? "font-semibold text-primary"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{t.title}</span>
                      </Link>
                      <button
                        onClick={() => del.mutate(t.id)}
                        aria-label="Delete chat"
                        className="invisible mr-1 grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:visible transition-all"
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

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navigation Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shrink-0 relative z-10">
          
          {/* Left: Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setOpen(true)} 
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground tracking-tight uppercase">Workspace</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-sm font-medium text-foreground">AcadSphere Hub</span>
            </div>
          </div>

          {/* Center: Command Center Style Search Bar */}
          <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources, templates, or ask AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-150"
              />
            </div>
          </div>

          {/* Right: Actions, Notifications, Profile */}
          <div className="flex items-center gap-3">
            
            {/* Quick AI Button */}
            <Button
              onClick={() => {
                create.mutate();
              }}
              size="sm"
              className="h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/10 transition-all duration-150"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Ask AI</span>
            </Button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all relative"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full" />
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                      <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">Notifications</h4>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-medium">New Alerts</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 text-xs pb-2 border-b border-border/40">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">CIA-1 Syllabus Update</p>
                          <p className="text-[10px] text-muted-foreground">Distributed Systems: Units 1 & 2 are finalized.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Viva prep suggested</p>
                          <p className="text-[10px] text-muted-foreground">Practice round open for Computer Networks.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-muted transition-all"
              >
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">AS</AvatarFallback>
                </Avatar>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card py-1.5 shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-foreground">AcadSphere Student</p>
                      <p className="text-[10px] text-muted-foreground truncate">student@acadsphere.edu</p>
                    </div>
                    
                    <Link
                      to="/app/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/app/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-border mt-1.5 pt-1.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleSignOut();
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
