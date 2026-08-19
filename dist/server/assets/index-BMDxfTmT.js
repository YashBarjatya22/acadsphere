import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { u as useServerFn, l as logo, B as Button } from "./router-DWxA6Z2f.js";
import { I as Input } from "./input-CCdkf2yx.js";
import { L as Label } from "./label-Des3dynE.js";
import { forwardRef, useRef, useImperativeHandle, useEffect, useState } from "react";
import { l as localDemoLogin } from "./auth.functions-CnzgITBP.js";
import { toast } from "sonner";
import { Sun, Moon, ArrowRight, LayoutDashboard, Sparkles, GraduationCap, Wand2, CheckCircle2, FileOutput, Users, User, Settings, Loader2, Zap, LogIn } from "lucide-react";
import "@tanstack/react-query";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
import "ai";
import "./ai-gateway.server-DLub9oIv.js";
import "@ai-sdk/openai-compatible";
import "node:crypto";
import "./server-CYaDwdxI.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-BnYhSKH5.js";
import "./supabase.server-BXfiGlvE.js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "zod";
import "framer-motion";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "gsap";
import "recharts";
const AntigravityMeshBackground = forwardRef(
  ({
    particleCount = 85,
    connectionDistance = 140,
    repulsionRadius = 180,
    repulsionStrength = 14,
    springK = 0.04,
    damping = 0.88,
    ambientSpeed = 0.6,
    nodeColor = "#6366f1",
    // Sleek indigo / cyber blue
    lineColor = "#818cf8",
    lineOpacity = 0.22,
    successColor = "#10b981",
    // Luminous emerald / cyan
    isSuccess = false,
    className = ""
  }, ref) => {
    const canvasRef = useRef(null);
    const shockwavesRef = useRef([]);
    const mouseRef = useRef({
      x: -1e3,
      y: -1e3,
      targetX: -1e3,
      targetY: -1e3,
      active: false,
      radius: repulsionRadius
    });
    const triggerShockwave = (x, y) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const originX = x ?? canvas.width / (2 * (window.devicePixelRatio || 1));
      const originY = y ?? canvas.height / (2 * (window.devicePixelRatio || 1));
      const maxDim = Math.max(canvas.width, canvas.height);
      shockwavesRef.current.push({
        x: originX,
        y: originY,
        radius: 0,
        maxRadius: maxDim * 0.9,
        speed: 16,
        strength: 28,
        alpha: 1,
        color: successColor
      });
    };
    useImperativeHandle(ref, () => ({
      triggerSuccess: (originX, originY) => {
        triggerShockwave(originX, originY);
      }
    }));
    useEffect(() => {
      if (isSuccess) {
        triggerShockwave();
      }
    }, [isSuccess]);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      let animationFrameId;
      let width = 0;
      let height = 0;
      let dpr = 1;
      let nodes = [];
      const hexToRgb = (hex) => {
        const cleanHex = hex.replace("#", "");
        if (cleanHex.length === 3) {
          const r = parseInt(cleanHex[0] + cleanHex[0], 16);
          const g = parseInt(cleanHex[1] + cleanHex[1], 16);
          const b = parseInt(cleanHex[2] + cleanHex[2], 16);
          return { r, g, b };
        }
        const num = parseInt(cleanHex, 16);
        return {
          r: num >> 16 & 255,
          g: num >> 8 & 255,
          b: num & 255
        };
      };
      const baseNodeRgb = hexToRgb(nodeColor);
      const baseLineRgb = hexToRgb(lineColor);
      const successRgb = hexToRgb(successColor);
      const initNodes = () => {
        dpr = window.devicePixelRatio || 1;
        width = canvas.parentElement?.clientWidth || window.innerWidth;
        height = canvas.parentElement?.clientHeight || window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        const area = width * height;
        const targetCount = Math.max(30, Math.min(140, Math.floor(area / 18e3 * (particleCount / 80))));
        nodes = [];
        for (let i = 0; i < targetCount; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          nodes.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: 1.6 + Math.random() * 1.8,
            phase: Math.random() * Math.PI * 2,
            phaseSpeed: (8e-3 + Math.random() * 0.015) * ambientSpeed,
            orbitAmpX: 18 + Math.random() * 32,
            orbitAmpY: 18 + Math.random() * 32,
            glow: 0
          });
        }
      };
      initNodes();
      const handleResize = () => {
        initNodes();
      };
      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.targetX = e.clientX - rect.left;
        mouseRef.current.targetY = e.clientY - rect.top;
        mouseRef.current.active = true;
      };
      const handleMouseLeave = () => {
        mouseRef.current.active = false;
        mouseRef.current.targetX = -1e3;
        mouseRef.current.targetY = -1e3;
      };
      const handleTouchMove = (e) => {
        if (e.touches.length > 0) {
          const rect = canvas.getBoundingClientRect();
          mouseRef.current.targetX = e.touches[0].clientX - rect.left;
          mouseRef.current.targetY = e.touches[0].clientY - rect.top;
          mouseRef.current.active = true;
        }
      };
      window.addEventListener("resize", handleResize);
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleMouseLeave);
      const render = () => {
        ctx.clearRect(0, 0, width, height);
        const mouse = mouseRef.current;
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
        if (mouse.active && mouse.x > 0 && mouse.y > 0) {
          const cursorGrad = ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            0,
            mouse.x,
            mouse.y,
            repulsionRadius * 1.2
          );
          cursorGrad.addColorStop(
            0,
            `rgba(${baseNodeRgb.r}, ${baseNodeRgb.g}, ${baseNodeRgb.b}, 0.08)`
          );
          cursorGrad.addColorStop(
            0.6,
            `rgba(${baseLineRgb.r}, ${baseLineRgb.g}, ${baseLineRgb.b}, 0.02)`
          );
          cursorGrad.addColorStop(1, "transparent");
          ctx.fillStyle = cursorGrad;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, repulsionRadius * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        const shockwaves = shockwavesRef.current;
        for (let sIdx = shockwaves.length - 1; sIdx >= 0; sIdx--) {
          const sw = shockwaves[sIdx];
          sw.radius += sw.speed;
          sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${successRgb.r}, ${successRgb.g}, ${successRgb.b}, ${sw.alpha * 0.7})`;
          ctx.lineWidth = Math.max(1, (1 - sw.radius / sw.maxRadius) * 4);
          ctx.stroke();
          for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            const dx = n.x - sw.x;
            const dy = n.y - sw.y;
            const dist = Math.hypot(dx, dy);
            const waveDelta = Math.abs(dist - sw.radius);
            if (waveDelta < 60) {
              const impulse = (1 - waveDelta / 60) * sw.strength * sw.alpha;
              const angle = Math.atan2(dy, dx);
              n.vx += Math.cos(angle) * impulse * 0.6;
              n.vy += Math.sin(angle) * impulse * 0.6;
              n.glow = Math.min(1, n.glow + impulse * 0.1);
            }
          }
          if (sw.alpha <= 0.01 || sw.radius >= sw.maxRadius) {
            shockwaves.splice(sIdx, 1);
          }
        }
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.phase += n.phaseSpeed;
          const targetAmbientX = n.originX + Math.sin(n.phase) * n.orbitAmpX;
          const targetAmbientY = n.originY + Math.cos(n.phase * 0.8) * n.orbitAmpY;
          if (mouse.active) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < repulsionRadius && dist > 0.1) {
              const normalizedDist = dist / repulsionRadius;
              const force = (1 - normalizedDist) * repulsionStrength;
              const angle = Math.atan2(dy, dx);
              const tangentAngle = angle + Math.PI * 0.25;
              n.vx += Math.cos(angle) * force * 0.65 + Math.cos(tangentAngle) * force * 0.2;
              n.vy += Math.sin(angle) * force * 0.65 + Math.sin(tangentAngle) * force * 0.2;
              n.glow = Math.min(1, n.glow + 0.04);
            }
          }
          const springAx = (targetAmbientX - n.x) * springK;
          const springAy = (targetAmbientY - n.y) * springK;
          n.vx = (n.vx + springAx) * damping;
          n.vy = (n.vy + springAy) * damping;
          n.x += n.vx;
          n.y += n.vy;
          n.glow = Math.max(0, n.glow - 0.018);
        }
        ctx.lineWidth = 1;
        const connDistSq = connectionDistance * connectionDistance;
        for (let i = 0; i < nodes.length; i++) {
          const nA = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const nB = nodes[j];
            const dx = nA.x - nB.x;
            const dy = nA.y - nB.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < connDistSq) {
              const dist = Math.sqrt(distSq);
              const factor = 1 - dist / connectionDistance;
              const alpha = factor * lineOpacity;
              const glowFactor = Math.max(nA.glow, nB.glow);
              ctx.beginPath();
              ctx.moveTo(nA.x, nA.y);
              ctx.lineTo(nB.x, nB.y);
              if (glowFactor > 0.05) {
                const r = Math.round(baseLineRgb.r + (successRgb.r - baseLineRgb.r) * glowFactor);
                const g = Math.round(baseLineRgb.g + (successRgb.g - baseLineRgb.g) * glowFactor);
                const b = Math.round(baseLineRgb.b + (successRgb.b - baseLineRgb.b) * glowFactor);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha * (1 + glowFactor * 2))})`;
              } else {
                ctx.strokeStyle = `rgba(${baseLineRgb.r}, ${baseLineRgb.g}, ${baseLineRgb.b}, ${alpha})`;
              }
              ctx.stroke();
            }
          }
        }
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const glowFactor = n.glow;
          const r = Math.round(baseNodeRgb.r + (successRgb.r - baseNodeRgb.r) * glowFactor);
          const g = Math.round(baseNodeRgb.g + (successRgb.g - baseNodeRgb.g) * glowFactor);
          const b = Math.round(baseNodeRgb.b + (successRgb.b - baseNodeRgb.b) * glowFactor);
          const currentRadius = n.radius * (1 + glowFactor * 0.6);
          ctx.beginPath();
          ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.7 + glowFactor * 0.3})`;
          ctx.fill();
          if (glowFactor > 0.1) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, currentRadius * 2.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${glowFactor * 0.25})`;
            ctx.fill();
          }
        }
        animationFrameId = requestAnimationFrame(render);
      };
      animationFrameId = requestAnimationFrame(render);
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleMouseLeave);
      };
    }, [
      particleCount,
      connectionDistance,
      repulsionRadius,
      repulsionStrength,
      springK,
      damping,
      ambientSpeed,
      nodeColor,
      lineColor,
      lineOpacity,
      successColor
    ]);
    return /* @__PURE__ */ jsx(
      "canvas",
      {
        ref: canvasRef,
        className: `fixed inset-0 pointer-events-none -z-10 w-full h-full ${className}`,
        style: { display: "block" }
      }
    );
  }
);
AntigravityMeshBackground.displayName = "AntigravityMeshBackground";
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
  const [isAuthSuccess, setIsAuthSuccess] = useState(false);
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
      setIsAuthSuccess(true);
      toast.success(`Welcome back, ${result.name || result.email}!`);
      setTimeout(() => {
        navigate({
          to: result.role === "admin" ? "/admin" : "/app",
          replace: true
        });
      }, 350);
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
      setIsAuthSuccess(true);
      toast.success("Signed in as Demo Student");
      setTimeout(() => {
        navigate({
          to: result.role === "admin" ? "/admin" : "/app",
          replace: true
        });
      }, 350);
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
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen bg-background text-foreground overflow-hidden", children: [
    /* @__PURE__ */ jsx(AntigravityMeshBackground, { isSuccess: isAuthSuccess, particleCount: 90, connectionDistance: 145, repulsionRadius: 190, repulsionStrength: 15, nodeColor: isDark ? "#818cf8" : "#4f46e5", lineColor: isDark ? "#6366f1" : "#818cf8", lineOpacity: isDark ? 0.28 : 0.22, successColor: "#10b981" }),
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
