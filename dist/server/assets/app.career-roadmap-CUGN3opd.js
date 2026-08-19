import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { c as cn, b as createSsrRpc, u as useServerFn, C as ChatLayout, B as Button } from "./router-DWxA6Z2f.js";
import { I as Input } from "./input-CCdkf2yx.js";
import { L as Label } from "./label-Des3dynE.js";
import { T as Textarea } from "./textarea-BQ4HChmG.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DIUkkxXh.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-H7niSSOQ.js";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { P as Progress } from "./progress-DIAGBDSx.js";
import { B as Badge } from "./badge-BQ_C0VL2.js";
import { S as Spinner } from "./spinner-I8NdNz5N.js";
import { c as createServerFn } from "./server-CYaDwdxI.js";
import { r as requireSupabaseAuth } from "./auth-middleware-BnYhSKH5.js";
import { z } from "zod";
import { Compass, Key, ChevronUp, ChevronDown, Sparkles, TrendingUp, Award, Clock, Calendar, BookOpen } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
import "ai";
import "./ai-gateway.server-DLub9oIv.js";
import "@ai-sdk/openai-compatible";
import "node:crypto";
import "framer-motion";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "gsap";
import "recharts";
import "@radix-ui/react-select";
import "@radix-ui/react-progress";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./supabase.server-BXfiGlvE.js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
const Slider = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(
  SliderPrimitive.Root,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(SliderPrimitive.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsx(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = SliderPrimitive.Root.displayName;
const RoadmapInputSchema = z.object({
  name: z.string(),
  degree: z.string(),
  semester: z.string(),
  current_skills: z.string(),
  certifications: z.string().optional(),
  projects: z.string().optional(),
  target_role: z.string(),
  timeline_months: z.number(),
  study_hours: z.number(),
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional()
});
const generateCareerRoadmap = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => RoadmapInputSchema.parse(input)).handler(createSsrRpc("f3ea2a919d97095b7d3b84d5dae9e3ef43e85de3a5ea98d6d6f7975ae92cee17"));
function CareerRoadmapPage() {
  const roadmapFn = useServerFn(generateCareerRoadmap);
  const [name, setName] = useState("Yash Barjatya");
  const [degree, setDegree] = useState("MCA Student");
  const [semester, setSemester] = useState("2nd Year");
  const [currentSkills, setCurrentSkills] = useState("HTML, CSS, JavaScript, Basic Git");
  const [certifications, setCertifications] = useState("");
  const [projects, setProjects] = useState("");
  const [targetRole, setTargetRole] = useState("Frontend Engineer");
  const [timeline, setTimeline] = useState("6 Months");
  const [studyHours, setStudyHours] = useState(15);
  const [provider, setProvider] = useState("Gemini");
  const [customKey, setCustomKey] = useState("");
  const [showKeyExpander, setShowKeyExpander] = useState(false);
  const [result, setResult] = useState(null);
  const mutation = useMutation({
    mutationFn: async () => {
      let timelineMonths = 6;
      if (timeline.includes("3")) timelineMonths = 3;
      if (timeline.includes("12")) timelineMonths = 12;
      if (timeline.includes("24")) timelineMonths = 24;
      return roadmapFn({
        data: {
          name,
          degree,
          semester,
          current_skills: currentSkills,
          certifications,
          projects,
          target_role: targetRole,
          timeline_months: timelineMonths,
          study_hours: studyHours,
          custom_key: customKey || void 0,
          provider: customKey ? provider : void 0
        }
      });
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Personalized roadmap generated successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Roadmap generation failed. Please try again.");
    }
  });
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-background px-6 py-6 text-foreground md:px-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative mb-8 overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 text-center shadow-lg md:p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" }),
      /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-bold tracking-tight text-gradient sm:text-5xl", children: "CareerPilot AI" }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base", children: "Personalized month-by-month roadmaps, skills gaps analytics, learning resources, and mentor schedules — tailored to target roles." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card/40 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 font-display text-xl", children: [
            /* @__PURE__ */ jsx(Compass, { className: "h-5 w-5 text-primary animate-pulse" }),
            "Career Assessment Form"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Provide details about your academic progress and career goals." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-surface/40 px-4 py-2", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowKeyExpander(!showKeyExpander), className: "flex w-full items-center justify-between py-1 text-sm font-medium text-muted-foreground hover:text-foreground", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Key, { className: "h-4 w-4" }),
                "🔑 Optional: Use Custom API Keys"
              ] }),
              showKeyExpander ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
            ] }),
            showKeyExpander && /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-3 pb-2 pt-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "provider", className: "text-xs", children: "LLM Provider" }),
                /* @__PURE__ */ jsxs(Select, { value: provider, onValueChange: (val) => setProvider(val), children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { id: "provider", className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select provider" }) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "Gemini", children: "Gemini" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "OpenAI", children: "OpenAI" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "apiKey", className: "text-xs", children: "API Key" }),
                /* @__PURE__ */ jsx(Input, { id: "apiKey", type: "password", placeholder: "Enter your LLM API Key", value: customKey, onChange: (e) => setCustomKey(e.target.value), className: "h-9" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Leave blank to use the local heuristics database automatically." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full Name" }),
            /* @__PURE__ */ jsx(Input, { id: "name", placeholder: "Enter your full name", value: name, onChange: (e) => setName(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "degree", children: "Current Degree" }),
              /* @__PURE__ */ jsxs(Select, { value: degree, onValueChange: setDegree, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "degree", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Degree" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "MCA Student", children: "MCA Student" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "BCA Student", children: "BCA Student" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Engineering (B.Tech)", children: "Engineering (B.Tech)" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Fresher / Graduate", children: "Fresher / Graduate" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Career Switcher", children: "Career Switcher" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "semester", children: "Semester / Year" }),
              /* @__PURE__ */ jsxs(Select, { value: semester, onValueChange: setSemester, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "semester", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Semester/Year" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "1st Year", children: "1st Year" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "2nd Year", children: "2nd Year" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "3rd Year", children: "3rd Year" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "4th Year", children: "4th Year" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Completed", children: "Completed" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "currentSkills", children: "Current Skills" }),
            /* @__PURE__ */ jsx(Textarea, { id: "currentSkills", placeholder: "e.g. HTML, CSS, JavaScript, Basic Git", value: currentSkills, onChange: (e) => setCurrentSkills(e.target.value), className: "min-h-[70px] resize-none" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "certifications", children: "Certifications Completed" }),
              /* @__PURE__ */ jsx(Input, { id: "certifications", placeholder: "e.g. FreeCodeCamp, Azure Fund.", value: certifications, onChange: (e) => setCertifications(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "projects", children: "Completed Projects" }),
              /* @__PURE__ */ jsx(Input, { id: "projects", placeholder: "e.g. Personal Portfolio website", value: projects, onChange: (e) => setProjects(e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "targetRole", children: "Target Role" }),
              /* @__PURE__ */ jsxs(Select, { value: targetRole, onValueChange: setTargetRole, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "targetRole", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Target Role" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "Frontend Engineer", children: "Frontend Engineer" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Backend Engineer", children: "Backend Engineer" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Full Stack Engineer", children: "Full Stack Engineer" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Data Scientist / ML Engineer", children: "Data Scientist / ML Engineer" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "timeline", children: "Expected Timeline" }),
              /* @__PURE__ */ jsxs(Select, { value: timeline, onValueChange: setTimeline, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "timeline", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Timeline" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "3 Months", children: "3 Months" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "6 Months", children: "6 Months" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "12 Months", children: "12 Months" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "24 Months", children: "24 Months" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 pt-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "studyHours", children: "Available Study Hours / Week" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-semibold text-primary", children: [
                studyHours,
                " hours"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Slider, { id: "studyHours", min: 5, max: 50, step: 5, value: [studyHours], onValueChange: (val) => setStudyHours(val[0]), className: "py-1.5" })
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: () => mutation.mutate(), disabled: mutation.isPending, className: "w-full glow-primary", size: "lg", children: mutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Spinner, { className: "mr-2 h-4 w-4" }),
            " Analyzing profile & compiling roadmap..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "mr-2 h-4 w-4 text-primary-foreground" }),
            " Generate Personalized Roadmap"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-display text-xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-primary" }),
          "Career Analytics Dashboard"
        ] }),
        !result ? /* @__PURE__ */ jsxs(Card, { className: "flex flex-1 flex-col items-center justify-center border-dashed border-border bg-card/20 p-8 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Compass, { className: "mb-4 h-12 w-12 text-muted-foreground/30 animate-pulse" }),
          /* @__PURE__ */ jsx("p", { className: "max-w-xs text-sm", children: "Fill out the Career Assessment Form and click generate to view your personalized roadmap and placement diagnostics." })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "grid gap-6 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs(Card, { className: "bg-surface/50 border-border text-center", children: [
              /* @__PURE__ */ jsx(CardHeader, { className: "p-4 pb-1", children: /* @__PURE__ */ jsx(CardDescription, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Job Readiness" }) }),
              /* @__PURE__ */ jsxs(CardContent, { className: "p-4 pt-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "font-display text-4xl font-extrabold text-primary", children: [
                  result.readiness_score,
                  "%"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Industry target is 80%+" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "bg-surface/50 border-border text-center", children: [
              /* @__PURE__ */ jsx(CardHeader, { className: "p-4 pb-1", children: /* @__PURE__ */ jsx(CardDescription, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Skill Gap" }) }),
              /* @__PURE__ */ jsxs(CardContent, { className: "p-4 pt-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "font-display text-4xl font-extrabold text-indigo-400", children: [
                  result.skill_gap_score,
                  "%"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Missing key target skills" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "bg-surface/50 border-border text-center", children: [
              /* @__PURE__ */ jsx(CardHeader, { className: "p-4 pb-1", children: /* @__PURE__ */ jsx(CardDescription, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Difficulty" }) }),
              /* @__PURE__ */ jsxs(CardContent, { className: "p-4 pt-1", children: [
                /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-extrabold text-sky-400 mt-2", children: result.difficulty }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Based on timeline & gaps" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-green-500/20 bg-green-500/5 p-4", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-green-400 flex items-center gap-2 mb-3", children: "✔ Matching Strengths" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: result.matching_skills && result.matching_skills.length > 0 ? result.matching_skills.map((skill) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "bg-green-500/10 text-green-400 border border-green-500/20", children: skill }, skill)) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "No matching core skills identified." }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-500/20 bg-red-500/5 p-4", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-red-400 flex items-center gap-2 mb-3", children: "✖ Skill Gaps / Weaknesses" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: result.missing_skills && result.missing_skills.length > 0 ? result.missing_skills.map((skill) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "bg-red-500/10 text-red-400 border border-red-500/20", children: skill }, skill)) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "All target skills are matched!" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-surface/30 border-border p-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-muted-foreground mb-4", children: "Analytics Indicators" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-medium", children: [
                  /* @__PURE__ */ jsx("span", { children: "Skill Completion Rate" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    result.readiness_score,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Progress, { value: result.readiness_score, className: "h-1.5 bg-border [&>div]:bg-primary" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-medium", children: [
                  /* @__PURE__ */ jsx("span", { children: "Project & Portfolio Completion" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    projects.trim() ? 60 : 15,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Progress, { value: projects.trim() ? 60 : 15, className: "h-1.5 bg-border [&>div]:bg-indigo-400" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-medium", children: [
                  /* @__PURE__ */ jsx("span", { children: "Interview Readiness" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    Math.min(100, Math.max(10, result.readiness_score - 15)),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Progress, { value: Math.min(100, Math.max(10, result.readiness_score - 15)), className: "h-1.5 bg-border [&>div]:bg-sky-400" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    result && /* @__PURE__ */ jsxs("div", { className: "mt-12 space-y-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "border-b border-border pb-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl font-bold tracking-tight text-gradient flex items-center gap-2", children: "🗺️ Month-by-Month Career Roadmap" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Follow this interactive, progressive month-by-month plan designed to build technical competence and prepare you for hiring loops." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: result.roadmap && result.roadmap.map((item, idx) => /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card/60 relative overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 h-1 w-full bg-primary" }),
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-xs uppercase tracking-widest text-primary", children: item.month }),
            /* @__PURE__ */ jsx(CardTitle, { className: "font-display text-lg font-semibold mt-1", children: item.title })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground block", children: "📚 Topics to Master" }),
              /* @__PURE__ */ jsx("ul", { className: "list-inside list-disc space-y-0.5 text-xs text-foreground/80", children: Array.isArray(item.topics) ? item.topics.map((topic, i) => /* @__PURE__ */ jsx("li", { children: topic }, i)) : /* @__PURE__ */ jsx("li", { children: item.topics }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground block", children: "💻 Practice Goals" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/80 leading-relaxed whitespace-pre-line", children: item.practice })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground block", children: "🚀 Recommended Project" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/80 leading-relaxed", children: item.project })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground block", children: "🤝 Placement & Interview Prep" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/80 leading-relaxed", children: item.interview })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground block", children: "📂 Portfolio Improvements" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/80 leading-relaxed", children: item.portfolio })
            ] })
          ] })
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-border pb-2", children: /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl font-bold tracking-tight text-gradient flex items-center gap-2", children: "🧑‍🏫 AI Mentor Checkpoints" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs(Card, { className: "bg-surface/30 border-border p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-primary flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }),
                " Weekly Goal"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: result.mentor?.weekly_goal })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-indigo-400 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
                " Daily Learning Target"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: result.mentor?.daily_target })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-sky-400 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }),
                " Study Schedule"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: result.mentor?.schedule })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-surface/30 border-border p-6", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-primary flex items-center gap-2 mb-3", children: "💡 Motivation Checkpoints" }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: result.mentor?.checkpoints && result.mentor.checkpoints.map((point, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2.5 items-start text-xs text-muted-foreground leading-relaxed", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-primary", children: [
                "0",
                i + 1
              ] }),
              /* @__PURE__ */ jsx("span", { children: point })
            ] }, i)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 pb-12", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-border pb-2", children: /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl font-bold tracking-tight text-gradient flex items-center gap-2", children: "💡 Industry Insights & Learning Resources" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs(Card, { className: "bg-surface/30 border-border p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-primary flex items-center gap-2 border-b border-border/40 pb-2", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }),
              " Industry Trends"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground block font-medium", children: "Average Salary Package" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground mt-0.5 block", children: result.role_details?.salary })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground block font-medium", children: "Market Demand Level" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground mt-0.5 block", children: result.role_details?.demand })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground block font-medium", children: "Future Growth Potential" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground mt-0.5 block", children: result.role_details?.growth })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground block font-medium", children: "Top Hiring Companies" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: result.role_details?.companies && result.role_details.companies.map((c) => /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-background border-border py-0.5", children: c }, c)) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "bg-surface/30 border-border p-6", children: [
            /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-primary flex items-center gap-2 border-b border-border/40 pb-2 mb-4", children: [
              /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }),
              " Premium Learning Resources"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-4 max-h-[300px] overflow-y-auto pr-2", children: result.role_details?.resources && Object.entries(result.role_details.resources).map(([topic, links]) => /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 border-b border-border/20 pb-3 last:border-0 last:pb-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: topic }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 text-[10px]", children: [
                /* @__PURE__ */ jsx("a", { href: links.youtube, target: "_blank", rel: "noopener noreferrer", className: "text-sky-400 hover:underline", children: "📺 Video Playlist" }),
                /* @__PURE__ */ jsx("a", { href: links.doc, target: "_blank", rel: "noopener noreferrer", className: "text-emerald-400 hover:underline", children: "📖 Official Docs" }),
                /* @__PURE__ */ jsx("a", { href: links.platform, target: "_blank", rel: "noopener noreferrer", className: "text-indigo-400 hover:underline", children: "🛠️ Practice Platform" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground italic mt-1", children: [
                /* @__PURE__ */ jsx("strong", { children: "Recommended Project:" }),
                " ",
                links.project
              ] })
            ] }, topic)) })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  CareerRoadmapPage as component
};
