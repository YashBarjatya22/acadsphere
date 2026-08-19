import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, useLocation, Outlet, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { u as useServerFn } from "./createSsrRpc-B5NaTOOc.js";
import { l as localDemoLogin } from "./auth.functions-O1dmT_y8.js";
import { supabase } from "./client-h4N4kZKq.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { toast } from "sonner";
import { l as logo } from "./studentos-logo-CCLo3MN1.js";
import { Sparkles, CheckCircle2, Loader2, User, Mail, Lock, GraduationCap, Shield } from "lucide-react";
import "./server-CTRvd-y5.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const localLoginFn = useServerFn(localDemoLogin);
  useEffect(() => {
    if (location.pathname.includes("/callback")) return;
    supabase.auth.getUser().then(({
      data
    }) => {
      if (data?.user) {
        const user = data.user;
        const meta = user.user_metadata || {};
        const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "Christ Student";
        supabase.from("profiles").upsert([{
          id: user.id,
          full_name: fullName,
          degree: "MSc Big Data Analytics",
          target_role: "Software Engineer / Data Scientist",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }]).then(() => {
          toast.success(`Welcome to AcadSphere, ${fullName}!`);
          navigate({
            to: "/app",
            replace: true
          });
        });
      }
    }).catch(() => {
    });
    const demoToken = localStorage.getItem("demo_session_token");
    const storedRole = localStorage.getItem("demo_user_role");
    if (demoToken) {
      navigate({
        to: storedRole === "admin" ? "/admin" : "/app",
        replace: true
      });
    }
  }, [navigate, location.pathname]);
  if (location.pathname.includes("/callback")) {
    return /* @__PURE__ */ jsx(Outlet, {});
  }
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me",
          queryParams: {
            prompt: "consent"
          }
        }
      });
      if (error) {
        toast.error(`Google OAuth error: ${error.message}`);
        setGoogleLoading(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err) {
      toast.error(err?.message || "Failed to launch Google sign-in");
      setGoogleLoading(false);
    }
  };
  async function handleDemoLogin() {
    setDemoLoading(true);
    try {
      const result = await localLoginFn({
        data: {
          email: "aadharsh.krishnaa.g@mca.christuniversity.in",
          password: "2547201",
          name: "AADHARSH KRISHNAA G"
        }
      });
      localStorage.setItem("demo_session_token", result.token);
      localStorage.setItem("demo_user_id", result.userId);
      localStorage.setItem("demo_user_email", result.email);
      localStorage.setItem("demo_user_role", "student");
      toast.success("Signed in as AADHARSH KRISHNAA G (Christ MCA)");
      navigate({
        to: "/app",
        replace: true
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  }
  function handleAdminDemoLogin() {
    localStorage.setItem("demo_session_token", "demo_admin_token");
    localStorage.setItem("demo_user_id", "admin_user");
    localStorage.setItem("demo_user_email", "admin@acadsphere.edu");
    localStorage.setItem("demo_user_role", "admin");
    toast.success("Signed in as Academic Controller");
    navigate({
      to: "/admin",
      replace: true
    });
  }
  async function handleEmailPasswordAuth(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      if (mode === "signin") {
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password
        });
        if (data?.user) {
          const user = data.user;
          const isRoleAdmin = trimmedEmail.toLowerCase().includes("admin") || user.user_metadata?.role === "admin";
          const assignedRole = isRoleAdmin ? "admin" : "student";
          localStorage.setItem("demo_session_token", `sb_session_${user.id}`);
          localStorage.setItem("demo_user_id", user.id);
          localStorage.setItem("demo_user_email", user.email || trimmedEmail);
          localStorage.setItem("demo_user_role", assignedRole);
          try {
            await supabase.from("profiles").upsert([{
              id: user.id,
              full_name: user.user_metadata?.full_name || trimmedEmail.split("@")[0],
              degree: "MSc Big Data Analytics",
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }]);
          } catch (_) {
          }
          try {
            await localLoginFn({
              data: {
                email: user.email || trimmedEmail,
                password,
                name: user.user_metadata?.full_name
              }
            });
          } catch (_) {
          }
          toast.success(`Welcome back, ${user.email}!`);
          navigate({
            to: assignedRole === "admin" ? "/admin" : "/app",
            replace: true
          });
          return;
        }
        try {
          const result = await localLoginFn({
            data: {
              email: trimmedEmail,
              password,
              name: name || void 0
            }
          });
          const isRoleAdmin = trimmedEmail.toLowerCase().includes("admin") || result.role === "admin";
          const assignedRole = isRoleAdmin ? "admin" : "student";
          localStorage.setItem("demo_session_token", result.token);
          localStorage.setItem("demo_user_id", result.userId);
          localStorage.setItem("demo_user_email", result.email);
          localStorage.setItem("demo_user_role", assignedRole);
          toast.success(`Welcome, ${result.name || result.email}!`);
          navigate({
            to: assignedRole === "admin" ? "/admin" : "/app",
            replace: true
          });
          return;
        } catch (_) {
          throw new Error(error?.message || "Invalid email or password");
        }
      } else {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: name || trimmedEmail.split("@")[0]
            }
          }
        });
        if (error) {
          throw new Error(error.message);
        }
        if (data?.user) {
          const user = data.user;
          const result = await localLoginFn({
            data: {
              email: trimmedEmail,
              password,
              name: name || trimmedEmail.split("@")[0]
            }
          });
          localStorage.setItem("demo_session_token", result.token || `sb_session_${user.id}`);
          localStorage.setItem("demo_user_id", user.id || result.userId);
          localStorage.setItem("demo_user_email", trimmedEmail);
          localStorage.setItem("demo_user_role", "student");
          toast.success("Account created successfully!");
          navigate({
            to: "/app",
            replace: true
          });
          return;
        }
      }
    } catch (err) {
      toast.error(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#FAFAF8] text-[#0A0A0A] flex font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#F4F2EC] border-r border-[#E0DDD4]", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-8 w-8 rounded-xl bg-[#0A0A0A] text-white overflow-hidden shadow-sm", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "AcadSphere", className: "h-4.5 w-4.5 object-contain invert" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-sans font-bold text-base tracking-tight text-[#0A0A0A]", children: "AcadSphere" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0A0A0A]/10 text-[#0A0A0A]", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
          "Christ University Student OS"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-sans font-black text-[#0A0A0A] leading-[1.05]", style: {
          fontSize: "clamp(2.25rem, 3.5vw, 3.25rem)",
          letterSpacing: "-0.04em"
        }, children: [
          "Your academic",
          /* @__PURE__ */ jsx("br", {}),
          "command centre."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-sans text-muted-foreground leading-relaxed max-w-md", children: "Integrated student information system & Google Classroom sync for Christ University students, faculty, and academic controllers." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3.5 pt-4", children: ["Live Google Classroom Sync & Submissions Tracker", "AI Academic Assistant & Intelligent Smart Notes", "Real-Time Attendance Telemetry & Course Metrics", "Career Roadmap & Placement Preparation Hub"].map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-5 w-5 rounded-full bg-[#0A0A0A]/10 text-[#0A0A0A] flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-sans font-semibold text-[#0A0A0A]", children: item })
        ] }, item)) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: "© 2026 AcadSphere Inc. · Version 3.0 · Editorial Edition" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center px-6 py-12", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5 mb-8 lg:hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-8 w-8 rounded-xl bg-[#0A0A0A] text-white overflow-hidden shadow-sm", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "AcadSphere", className: "h-4.5 w-4.5 object-contain invert" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-sans font-bold text-base tracking-tight text-[#0A0A0A]", children: "AcadSphere" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black font-sans tracking-tight text-[#0A0A0A]", children: "Sign in to AcadSphere" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Use your Google Mail account or your registered Supabase / university credentials." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 shadow-sm text-center", children: /* @__PURE__ */ jsxs("button", { onClick: handleGoogleLogin, disabled: googleLoading, className: "w-full h-11 rounded-xl border border-[#E0DDD4] bg-white hover:bg-[#FAF9F5] text-[#0A0A0A] text-xs font-bold flex items-center justify-center gap-3 transition-all duration-150 shadow-sm active:scale-[0.98] disabled:opacity-60", children: [
          googleLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-[#0A0A0A]" }) : /* @__PURE__ */ jsxs("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
            /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
            /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" }),
            /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" })
          ] }),
          /* @__PURE__ */ jsx("span", { children: googleLoading ? "Redirecting to Google..." : "Continue with Google Mail" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-center my-2", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("div", { className: "w-full border-t border-[#E0DDD4]" }) }),
          /* @__PURE__ */ jsx("span", { className: "relative bg-[#FAFAF8] px-3 font-mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground", children: "Or sign in with email & password" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-6 space-y-4 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex bg-[#EAE7DC] p-1 rounded-xl", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMode("signin"), className: `flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === "signin" ? "bg-white text-[#0A0A0A] shadow-sm" : "text-muted-foreground hover:text-[#0A0A0A]"}`, children: "Sign In" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMode("signup"), className: `flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === "signup" ? "bg-white text-[#0A0A0A] shadow-sm" : "text-muted-foreground hover:text-[#0A0A0A]"}`, children: "Register" })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleEmailPasswordAuth, className: "space-y-4", children: [
            mode === "signup" && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", className: "text-xs font-bold text-[#0A0A0A]", children: "Full Name" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsx(Input, { id: "name", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g., Aadharsh Krishnaa", className: "h-10 pl-9 text-xs border-[#E0DDD4] bg-white focus-visible:ring-black" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", className: "text-xs font-bold text-[#0A0A0A]", children: "Email Address / Mail ID" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsx(Input, { id: "email", type: "email", autoComplete: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "student@mca.christuniversity.in", className: "h-10 pl-9 text-xs border-[#E0DDD4] bg-white focus-visible:ring-black", required: true })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password", className: "text-xs font-bold text-[#0A0A0A]", children: "Password" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsx(Input, { id: "password", type: "password", autoComplete: mode === "signup" ? "new-password" : "current-password", value: password, onChange: (e) => setPassword(e.target.value), minLength: 6, placeholder: "••••••••", className: "h-10 pl-9 text-xs border-[#E0DDD4] bg-white focus-visible:ring-black", required: true })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, className: "w-full h-10 font-bold bg-[#0A0A0A] text-[#ffffff] hover:opacity-90 transition-all shadow-sm", children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
              mode === "signin" ? "Authenticating Supabase..." : "Creating Account..."
            ] }) : mode === "signin" ? "Sign In with Supabase" : "Create Supabase Account" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#E0DDD4] bg-[#F4F2EC] p-4 space-y-2.5", children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center", children: "Quick University Demo Access" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { onClick: handleDemoLogin, disabled: demoLoading, variant: "outline", type: "button", className: "h-9 text-xs font-bold gap-1.5 border-[#E0DDD4] bg-white text-[#0A0A0A] hover:bg-[#EAE7DC]", children: [
              /* @__PURE__ */ jsx(GraduationCap, { className: "h-3.5 w-3.5 text-[#0A0A0A]" }),
              "Demo Student"
            ] }),
            /* @__PURE__ */ jsxs(Button, { onClick: handleAdminDemoLogin, type: "button", className: "h-9 text-xs bg-[#0A0A0A] text-white font-bold gap-1.5 hover:opacity-90 shadow-sm", children: [
              /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5" }),
              " Admin ERP"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  AuthPage as component
};
