import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, useRouterState, Link, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X, LayoutDashboard, GraduationCap, Radio, Megaphone, Sun, Moon, LogOut, Menu, Search, Bell } from "lucide-react";
import { toast } from "sonner";
import { l as logo } from "./studentos-logo-CCLo3MN1.js";
import { c as cn } from "./utils-H80jjgLf.js";
import { A as Avatar, a as AvatarFallback } from "./avatar-B-EjQ9LK.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-avatar";
const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Student Management", to: "/admin/students", icon: GraduationCap },
  { label: "Live Activity", to: "/admin/live-activity", icon: Radio, badge: "Active" },
  { label: "Announcements & Reports", to: "/admin/announcements", icon: Megaphone }
];
const PAGE_TITLES = {
  "/admin": "Academic Overview",
  "/admin/students": "Student Records & Directory",
  "/admin/live-activity": "Live Class Activity",
  "/admin/announcements": "Notice Board & Export Reports"
};
function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] || "Academic Portal";
  const adminEmail = typeof window !== "undefined" ? localStorage.getItem("demo_user_email") || "admin@acadsphere.edu" : "admin@acadsphere.edu";
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
  async function handleSignOut() {
    localStorage.removeItem("demo_session_token");
    localStorage.removeItem("demo_user_id");
    localStorage.removeItem("demo_user_email");
    localStorage.removeItem("demo_user_role");
    toast.success("Signed out from Academic Portal");
    navigate({ to: "/auth" });
  }
  function isActive(to) {
    if (to === "/admin") return currentPath === "/admin";
    return currentPath === to || currentPath.startsWith(to);
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 transition-colors duration-200 font-sans antialiased", children: [
    open && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-30 bg-stone-900/30 backdrop-blur-[2px] md:hidden",
        onClick: () => setOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col",
          "border-r border-stone-200 dark:border-zinc-800 bg-stone-100/80 dark:bg-zinc-900/80 backdrop-blur-md",
          "transition-transform duration-200 ease-out",
          "md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between px-5 border-b border-stone-200/80 dark:border-zinc-800/80 shrink-0", children: [
            /* @__PURE__ */ jsxs(Link, { to: "/admin", className: "flex items-center gap-3 group", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-8 w-8 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-100 dark:text-zinc-900 overflow-hidden shadow-sm", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: logo,
                  alt: "AcadSphere",
                  className: "h-4.5 w-4.5 object-contain invert dark:invert-0"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-sans font-bold text-sm tracking-tight text-stone-900 dark:text-zinc-100", children: "AcadSphere" }),
                /* @__PURE__ */ jsx("span", { className: "block text-[10px] font-mono text-stone-500 dark:text-zinc-400", children: "Academic Administration" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setOpen(false),
                className: "rounded-lg p-1.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 transition-colors md:hidden",
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto py-5 px-3 space-y-1 scrollbar-thin", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-500 px-3 mb-2", children: "Main Sections" }),
            /* @__PURE__ */ jsx("nav", { className: "space-y-1", children: ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return /* @__PURE__ */ jsxs(
                Link,
                {
                  to: item.to,
                  onClick: () => setOpen(false),
                  className: cn(
                    "flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 group",
                    active ? "bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 shadow-sm" : "text-stone-600 dark:text-zinc-400 hover:bg-stone-200/70 dark:hover:bg-zinc-800/70 hover:text-stone-900 dark:hover:text-zinc-100"
                  ),
                  children: [
                    /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0 transition-transform group-hover:scale-105" }),
                    /* @__PURE__ */ jsx("span", { children: item.label }),
                    item.badge && /* @__PURE__ */ jsx("span", { className: "ml-auto text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800", children: item.badge })
                  ]
                },
                item.label
              );
            }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-stone-200/80 dark:border-zinc-800/80 p-3 shrink-0 bg-stone-100/50 dark:bg-zinc-900/50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: toggleTheme,
                className: "p-2 text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-lg transition-colors",
                title: isDark ? "Light mode" : "Dark mode",
                children: isDark ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleSignOut,
                className: "flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase font-bold text-stone-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors",
                children: [
                  /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }),
                  "Sign Out"
                ]
              }
            )
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("header", { className: "flex h-16 items-center justify-between border-b border-stone-200/80 dark:border-zinc-800/80 bg-stone-50/90 dark:bg-zinc-950/90 px-6 shrink-0 z-10 backdrop-blur-md", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setOpen(true),
              className: "rounded-lg p-2 text-stone-500 hover:bg-stone-200 dark:hover:bg-zinc-800 transition-colors md:hidden",
              children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Workspace" }),
            /* @__PURE__ */ jsx("span", { className: "text-stone-300 dark:text-zinc-700", children: "/" }),
            /* @__PURE__ */ jsx("span", { className: "font-sans text-xs font-semibold text-stone-900 dark:text-zinc-100", children: pageTitle })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 max-w-sm mx-4 hidden sm:block", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search students, USNs, or records...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: cn(
                "w-full pl-9 pr-4 py-2",
                "text-xs font-sans",
                "rounded-full border border-stone-200 dark:border-zinc-800 bg-stone-100/80 dark:bg-zinc-900/80 text-stone-900 dark:text-zinc-100",
                "placeholder:text-stone-400 dark:placeholder:text-zinc-500",
                "focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-zinc-600",
                "transition-all duration-150"
              )
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 px-3 py-1 rounded-full", children: [
            /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500" }),
            /* @__PURE__ */ jsx("span", { children: "Campus Network Healthy" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => toast.info("No unread alerts."),
              className: "p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200/70 dark:hover:bg-zinc-800/70 transition-colors",
              title: "System Alerts",
              children: /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowProfileMenu(!showProfileMenu),
                className: "flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-stone-300 dark:hover:ring-zinc-700 transition-all",
                children: /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold text-xs", children: "AD" }) })
              }
            ),
            showProfileMenu && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40", onClick: () => setShowProfileMenu(false) }),
              /* @__PURE__ */ jsxs("div", { className: cn(
                "absolute right-0 top-full mt-2 w-52 z-50",
                "rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2",
                "shadow-lg animate-slide-up space-y-0.5"
              ), children: [
                /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-b border-stone-100 dark:border-zinc-800 mb-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-sans text-xs font-bold text-stone-900 dark:text-zinc-100", children: "Academic Controller" }),
                  /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] text-stone-500 dark:text-zinc-400 truncate mt-0.5", children: adminEmail })
                ] }),
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: "/admin",
                    onClick: () => setShowProfileMenu(false),
                    className: "flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-3.5 w-3.5" }),
                      "Academic Overview"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "border-t border-stone-100 dark:border-zinc-800 mt-1 pt-1", children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setShowProfileMenu(false);
                      handleSignOut();
                    },
                    className: "flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }),
                      "Sign Out"
                    ]
                  }
                ) })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto p-6 md:p-8 bg-stone-50 dark:bg-zinc-950 scrollbar-thin", children })
    ] })
  ] });
}
function AdminLayoutWrapper() {
  return /* @__PURE__ */ jsx(AdminLayout, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  AdminLayoutWrapper as component
};
