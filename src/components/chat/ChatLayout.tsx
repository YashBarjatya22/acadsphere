import { type ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads, createThread, deleteThread } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MessageSquare, Trash2, LogOut, Menu,
  LayoutDashboard, BookOpen, Calendar, FileText,
  LineChart, CheckCircle2, Search, Bell, Sparkles,
  User, Settings, Code, Volume2, CalendarDays,
  Users, Sun, Moon, X, Activity, GraduationCap,
  UserCog, Shield, Radio, Megaphone, TrendingUp, ScrollText, Lock, FileOutput,
  Wand2, ChevronLeft, ChevronRight
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
  const location = useLocation();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const [sessionUser, setSessionUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || meta.name || u.email?.split("@")[0] || (isAdmin ? "Administrator" : "Student");
        const email = u.email || "";
        const avatar = meta.avatar_url || meta.picture || "";

        setSessionUser({ name, email, avatar });

        if (typeof window !== "undefined") {
          localStorage.setItem("demo_user_name", name);
          localStorage.setItem("demo_user_email", email);
          if (avatar) localStorage.setItem("demo_user_avatar", avatar);
          if (session.provider_token) localStorage.setItem("google_provider_token", session.provider_token);
        }
      }
    });
  }, [isAdmin]);

  const userName = sessionUser?.name || (typeof window !== "undefined"
    ? (localStorage.getItem("demo_user_name") || (isAdmin ? "Administrator" : "Christ Student"))
    : (isAdmin ? "Administrator" : "Christ Student"));
  const userEmail = sessionUser?.email || (typeof window !== "undefined"
    ? (localStorage.getItem("demo_user_email") || "")
    : "");
  const userAvatar = sessionUser?.avatar || (typeof window !== "undefined"
    ? (localStorage.getItem("demo_user_avatar") || "")
    : "");
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .substring(0, 2)
    .toUpperCase() || "CS";

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
      setMobileOpen(false);
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
    { label: "Dashboard",       to: "/app",                icon: LayoutDashboard },
    { label: "AI Assistant",    to: "/app/ai-assistant",   icon: Sparkles },
    { label: "Classroom",       to: "/app/classroom",      icon: GraduationCap },
    { label: "Resume Tailorer", to: "/app/resume-builder", icon: Wand2 },
    { label: "Attendance",      to: "/app/attendance",     icon: CheckCircle2 },
    { label: "File Converter",  to: "/app/conversions",    icon: FileOutput },
    { label: "Community",       to: "/app/community",      icon: Users },
    { label: "Profile",         to: "/app/profile",        icon: User },
    { label: "Settings",        to: "/app/settings",       icon: Settings },
  ];

  // Administrator navigation items
  const adminNavItems = [
    { label: "Command Center",   to: "/admin",             icon: LayoutDashboard },
    { label: "Student SIS",      to: "/admin/students",    icon: GraduationCap },
    { label: "Live Activity",    to: "/admin/live-activity", icon: Radio },
    { label: "Analytics",        to: "/admin/analytics",   icon: TrendingUp },
    { label: "Announcements",    to: "/admin/announcements", icon: Megaphone },
    { label: "Reports",          to: "/admin/reports",     icon: FileText },
    { label: "User Roles",       to: "/admin/users",       icon: UserCog },
    { label: "Audit Logs",       to: "/admin/audit-logs",  icon: ScrollText },
    { label: "Security",         to: "/admin/security",    icon: Lock },
    { label: "Settings",         to: "/admin/settings",    icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans overflow-hidden selection:bg-zinc-200 dark:selection:bg-zinc-800">

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Sleek Minimalist Sidebar ───────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 240 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col shrink-0",
          "border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl",
          "md:static",
          mobileOpen ? "translate-x-0 !w-64" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
          <Link to={isAdmin ? "/admin" : "/app"} className="flex items-center gap-3 group min-w-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-xs shrink-0 transition-transform group-hover:scale-105">
              <img
                src={logo}
                alt="AcadSphere"
                className="h-4.5 w-4.5 object-contain invert dark:invert-0"
              />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col min-w-0"
              >
                <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  AcadSphere
                </span>
                <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                  {isAdmin ? "Enterprise Admin" : "Student OS"}
                </span>
              </motion.div>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1 scrollbar-none">
          {!collapsed && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 mb-2 font-medium">
              {isAdmin ? "Navigation" : "Modules"}
            </p>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="block relative group"
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-150 relative",
                      isActive
                        ? "text-zinc-900 dark:text-zinc-50 bg-zinc-100/90 dark:bg-zinc-800/80 font-semibold shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40"
                    )}
                  >
                    {/* Active Accent Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-zinc-900 dark:bg-zinc-100"
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      />
                    )}

                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100")} />
                    
                    {!collapsed && (
                      <span className="truncate tracking-tight">{item.label}</span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 p-2.5 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className={cn("flex items-center", collapsed ? "justify-center flex-col gap-2" : "justify-between px-1")}>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 rounded-xl transition-colors"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>

            {!collapsed && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 rounded-xl transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </motion.button>
            )}

            {/* Desktop Collapse Toggle */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 rounded-lg transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Viewport Area ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950">

        {/* Tactile Glass Topnav */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl px-5 shrink-0 z-30">

          {/* Left: Mobile menu & breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-[10px]">
                Platform
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">
                {isAdmin ? "Enterprise Command Center" : "AcadSphere Academic Space"}
              </span>
            </div>
          </div>

          {/* Center Search */}
          <div className="flex-1 max-w-sm mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder={isAdmin ? "Search students or records..." : "Search modules, courses, subjects..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs font-sans rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
              />
            </div>
          </div>

          {/* Right Actions & Profile */}
          <div className="flex items-center gap-2.5">
            {!isAdmin ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => create.mutate()}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ask AI</span>
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate({ to: "/admin/students" })}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Manage SIS</span>
              </motion.button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center p-0.5 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-[10px]">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-56 z-50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl py-1.5 shadow-lg"
                    >
                      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {userName}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-500 truncate mt-0.5">
                          {userEmail}
                        </p>
                      </div>

                      <Link
                        to={isAdmin ? "/admin" : "/app/profile"}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <User className="h-3.5 w-3.5" />
                        {isAdmin ? "Admin Center" : "Profile & Credentials"}
                      </Link>

                      <Link
                        to={isAdmin ? "/admin/settings" : "/app/settings"}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Preferences & Integrations
                      </Link>

                      <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
                        <button
                          onClick={() => { setShowProfileMenu(false); handleSignOut(); }}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content with Framer Motion Page Transition */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
export default ChatLayout;
