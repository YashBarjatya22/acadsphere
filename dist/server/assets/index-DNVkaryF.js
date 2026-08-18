import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { l as logo } from "./studentos-logo-CCLo3MN1.js";
import { useState, useEffect } from "react";
import { u as useServerFn } from "./createSsrRpc-CQTokSDO.js";
import { l as localDemoLogin } from "./auth.functions-BLZqvgRQ.js";
import { toast } from "sonner";
import { Sun, Moon, ArrowRight, LayoutDashboard, Sparkles, GraduationCap, Wand2, CheckCircle2, FileOutput, Users, User, Settings, Loader2, Zap, LogIn } from "lucide-react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./server-DkTRikc9.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
const STATS = [{
  value: "45,000+",
  label: "AI queries resolved"
}, {
  value: "98.2%",
  label: "Placement readiness"
}, {
  value: "12,000+",
  label: "Study hours logged"
}, {
  value: "15+",
  label: "Institutions integrated"
}];
const FEATURES = [{
  icon: LayoutDashboard,
  title: "Dashboard",
  desc: "A single command center showing attendance, deadlines, AI insights, and progress at a glance."
}, {
  icon: Sparkles,
  title: "AI Study Assistant",
  desc: "Interactive contextual explanations tailored directly to your syllabus subjects."
}, {
  icon: GraduationCap,
  title: "Classroom",
  desc: "Syllabus tracking, assignment submissions, course resources, and faculty announcements."
}, {
  icon: Wand2,
  title: "Resume Tailorer",
  desc: "Executive 1-page ATS PDF builder, job description matching, and AI bullet optimization."
}, {
  icon: CheckCircle2,
  title: "Attendance Tracker",
  desc: "Real-time attendance percentage, subject-wise risk flags, and CUE Portal auto-sync."
}, {
  icon: FileOutput,
  title: "File Converter",
  desc: "Fast in-browser PDF, DOCX, image, and text format conversions."
}, {
  icon: Users,
  title: "Community",
  desc: "Connect with batchmates, share resources, ask questions, and collaborate on projects."
}, {
  icon: User,
  title: "Profile",
  desc: "Maintain your academic profile, skill tags, certifications, and placement preferences."
}, {
  icon: Settings,
  title: "Settings",
  desc: "Personalise themes, notification channels, AI tuning, and linked integrations."
}];
const TESTIMONIALS = [{
  quote: "AcadSphere turned my exam prep from chaos into a structured game plan. The AI Assistant and Smart Notes are insanely helpful for quick revisions.",
  author: "Aditya Verma",
  role: "MCA Student, RV College of Engineering",
  initials: "AV"
}, {
  quote: "With the Resume Builder and Career Roadmap, I went from applying blindly to landing three interview rounds. It's like having a senior developer coaching you 24/7.",
  author: "Neha Sharma",
  role: "B.Tech CSE, SRM University",
  initials: "NS"
}];
function Landing() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const localLoginFn = useServerFn(localDemoLogin);
  async function handleLandingLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const result = await localLoginFn({
        data: {
          email: loginEmail,
          password: loginPassword
        }
      });
      localStorage.setItem("demo_session_token", result.token);
      localStorage.setItem("demo_user_id", result.userId);
      localStorage.setItem("demo_user_email", result.email);
      localStorage.setItem("demo_user_role", result.role || "student");
      toast.success(`Welcome back, ${result.name || result.email}!`);
      navigate({
        to: result.role === "admin" ? "/admin" : "/app",
        replace: true
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }
  async function handleDemoAccess() {
    setDemoLoading(true);
    try {
      const result = await localLoginFn({
        data: {
          email: "demo@acadsphere.local",
          password: "demo123456",
          name: "Demo Student"
        }
      });
      localStorage.setItem("demo_session_token", result.token);
      localStorage.setItem("demo_user_id", result.userId);
      localStorage.setItem("demo_user_email", result.email);
      localStorage.setItem("demo_user_role", result.role || "student");
      toast.success("Signed in as Demo Student");
      navigate({
        to: result.role === "admin" ? "/admin" : "/app",
        replace: true
      });
    } catch (err) {
      toast.error("Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  }
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-50 flex justify-center pt-4 px-6", children: /* @__PURE__ */ jsxs("header", { className: "w-full max-w-5xl flex items-center justify-between px-5 h-12 nav-pill transition-editorial", style: {
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)"
    }, children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-6 w-6 rounded-md border border-border bg-foreground overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "AcadSphere", className: "h-4 w-4 object-contain invert dark:invert-0" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-sans font-bold text-sm tracking-tight text-foreground", children: "AcadSphere" })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "hidden md:flex items-center gap-0", children: ["#features", "#stats", "#testimonials", "#login"].map((href, i) => {
        const labels = ["Modules", "Impact", "Testimonials", "Sign In"];
        return /* @__PURE__ */ jsx("a", { href, className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors duration-[120ms] px-3 py-1.5", children: labels[i] }, href);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: toggleTheme, className: "p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors duration-[120ms]", title: isDark ? "Light mode" : "Dark mode", children: isDark ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Link, { to: "/auth", children: "Sign In" }) }),
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", children: /* @__PURE__ */ jsx(Link, { to: "/auth", children: "Get Started" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 opacity-[0.03]", style: {
        backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
        backgroundSize: "48px 48px"
      } }),
      /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-5xl px-6 grid gap-16 lg:grid-cols-12 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7 flex flex-col items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 mb-8", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-foreground" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground", children: "Version 2.0 · Professional Academic Workspace" })
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "font-sans font-extrabold text-foreground", style: {
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.05
          }, children: [
            "The premium academic",
            /* @__PURE__ */ jsx("br", {}),
            "operating system for",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "high achievers." })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-8 max-w-lg text-base font-sans text-muted-foreground leading-relaxed", children: "Consolidate notes, career roadmaps, lab manuals, and mock examinations into a single unified workspace — engineered for serious engineering students." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", children: /* @__PURE__ */ jsxs(Link, { to: "/auth", children: [
              "Start Your Journey",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
            ] }) }),
            /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", size: "lg", children: /* @__PURE__ */ jsx("a", { href: "#features", children: "Explore Modules" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-5 hidden lg:block", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-8 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground", children: "Student Success Overview" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1.5 font-sans font-bold text-2xl tracking-tight text-foreground", children: "92% Placement Ready" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg border border-border bg-background flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "", className: "h-5 w-5 object-contain" }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [{
            label: "Resume ATS Score",
            pct: 92
          }, {
            label: "Roadmap Progress",
            pct: 67
          }, {
            label: "Attendance",
            pct: 93
          }].map((item) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: item.label }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-foreground", children: [
                item.pct,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-1 w-full rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-foreground transition-all duration-500", style: {
              width: `${item.pct}%`
            } }) })
          ] }, item.label)) }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-border pt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "AI queries today" }),
            /* @__PURE__ */ jsx("span", { className: "font-sans font-bold text-foreground", children: "47" })
          ] }) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { id: "stats", className: "border-t border-border py-14 bg-card", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-5xl px-6", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 divide-x divide-border", children: STATS.map((stat) => /* @__PURE__ */ jsxs("div", { className: "px-6 first:pl-0 last:pr-0 text-center md:text-left", children: [
      /* @__PURE__ */ jsx("p", { className: "font-sans font-extrabold text-foreground", style: {
        fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
        letterSpacing: "-0.04em",
        lineHeight: 1.1
      }, children: stat.value }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: stat.label })
    ] }, stat.label)) }) }) }),
    /* @__PURE__ */ jsx("section", { id: "features", className: "py-24 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-4", children: "Unified Platform" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-sans font-extrabold text-foreground", style: {
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          letterSpacing: "-0.04em",
          lineHeight: 1.1
        }, children: [
          "13 engineered modules",
          /* @__PURE__ */ jsx("br", {}),
          "for every academic stage."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-xl text-sm font-sans text-muted-foreground leading-relaxed", children: "A comprehensive toolset sharing academic context to optimise learning, verify gaps, and boost placement readiness — all inside one platform." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-px sm:grid-cols-2 lg:grid-cols-3 border border-border rounded-2xl overflow-hidden bg-border", children: FEATURES.map((feat) => {
        const Icon = feat.icon;
        return /* @__PURE__ */ jsx("div", { className: "group bg-card p-6 transition-colors duration-[120ms] hover:bg-accent", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-sans font-semibold text-[13px] text-foreground leading-tight", children: feat.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[12px] font-sans text-muted-foreground leading-relaxed", children: feat.desc })
          ] })
        ] }) }, feat.title);
      }) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { id: "testimonials", className: "py-24 border-t border-border bg-card", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-4", children: "Student Testimonials" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-sans font-extrabold text-foreground", style: {
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          letterSpacing: "-0.04em",
          lineHeight: 1.1
        }, children: [
          "Loved by serious",
          /* @__PURE__ */ jsx("br", {}),
          "engineering students."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2", children: TESTIMONIALS.map((t, idx) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-background p-8 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsx("p", { className: "font-sans text-foreground/10 font-black leading-none mb-4", style: {
          fontSize: "5rem",
          lineHeight: 1
        }, "aria-hidden": "true", children: '"' }),
        /* @__PURE__ */ jsx("p", { className: "font-sans text-[15px] text-foreground leading-relaxed -mt-6", children: t.quote }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center gap-3 pt-6 border-t border-border", children: [
          /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full border border-border bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground", children: t.initials }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-sans font-semibold text-[13px] text-foreground", children: t.author }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground mt-0.5", children: t.role })
          ] })
        ] })
      ] }, idx)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { id: "login", className: "py-24 border-t border-border bg-card", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6 grid lg:grid-cols-2 gap-16 items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-4", children: "Ready to start?" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-sans font-extrabold text-foreground", style: {
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          letterSpacing: "-0.04em",
          lineHeight: 1.05
        }, children: [
          "Sign in to your",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "AcadSphere workspace." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm font-sans text-muted-foreground leading-relaxed max-w-sm", children: "No email confirmation. Your session is stored locally — works fully offline. New user? Just enter any email + password to create an account instantly." }),
        /* @__PURE__ */ jsxs("button", { onClick: handleDemoAccess, disabled: demoLoading, className: "mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground border border-border rounded-full px-4 py-2 transition-colors duration-[120ms] hover:bg-accent disabled:opacity-60", children: [
          demoLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
          "Quick Demo — No sign-up needed"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-background p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg border border-border bg-foreground flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "AcadSphere", className: "h-5 w-5 object-contain invert dark:invert-0" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-sans font-bold text-sm text-foreground", children: "AcadSphere" }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]", children: "Sign in · Works offline" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleLandingLogin, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "landing-email", className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "Email" }),
            /* @__PURE__ */ jsx(Input, { id: "landing-email", type: "email", autoComplete: "email", placeholder: "you@example.com", value: loginEmail, onChange: (e) => setLoginEmail(e.target.value), required: true, className: "h-10" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "landing-password", className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "Password" }),
            /* @__PURE__ */ jsx(Input, { id: "landing-password", type: "password", autoComplete: "current-password", placeholder: "••••••••", value: loginPassword, onChange: (e) => setLoginPassword(e.target.value), minLength: 6, required: true, className: "h-10" })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loginLoading, className: "w-full h-10", children: loginLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            " Signing in..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }),
            " Sign In / Create Account"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 pt-5 border-t border-border", children: /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground text-center", children: "New user? Just enter any email + password above — account is created automatically." }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-32 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6 grid lg:grid-cols-2 gap-12 items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-4", children: "Get Started" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-sans font-extrabold text-foreground", style: {
          fontSize: "clamp(2rem, 4vw, 3rem)",
          letterSpacing: "-0.04em",
          lineHeight: 1.05
        }, children: [
          "Redefine your",
          /* @__PURE__ */ jsx("br", {}),
          "learning speed today."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 items-start lg:items-end", children: [
        /* @__PURE__ */ jsx("p", { className: "max-w-sm text-sm font-sans text-muted-foreground leading-relaxed lg:text-right", children: "Register your profile, configure your syllabus and target role, and let AcadSphere build your success framework." }),
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", children: /* @__PURE__ */ jsxs(Link, { to: "/auth", children: [
          "Create Account",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border py-12", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-start justify-between gap-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-6 w-6 rounded-md border border-border bg-foreground overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "AcadSphere", className: "h-4 w-4 object-contain invert dark:invert-0" }) }),
          /* @__PURE__ */ jsx("span", { className: "font-sans font-bold text-sm text-foreground", children: "AcadSphere" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground", children: "© 2026 AcadSphere Inc." })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-6", children: [{
        href: "#features",
        label: "Modules"
      }, {
        href: "#testimonials",
        label: "Testimonials"
      }, {
        href: "#stats",
        label: "Impact"
      }, {
        href: "/auth",
        label: "Sign In"
      }].map((link) => /* @__PURE__ */ jsx("a", { href: link.href, className: "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors duration-[120ms]", children: link.label }, link.href)) })
    ] }) })
  ] });
}
export {
  Landing as component
};
