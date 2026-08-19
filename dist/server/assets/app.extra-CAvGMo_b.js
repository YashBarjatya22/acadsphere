import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn, C as ChatLayout, B as Button } from "./router-DWxA6Z2f.js";
import { b as listPlacements, e as getResumeProfile, f as logActivity, h as createPlacement, i as updatePlacement, s as saveResumeProfile } from "./studentos.functions-BCssppkW.js";
import { I as Input } from "./input-CCdkf2yx.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-H7niSSOQ.js";
import { toast } from "sonner";
import { Sparkles, Clock, Briefcase, FileText, Trophy, Pause, Play, RotateCcw, Plus, X, AlertCircle, Check, Flame } from "lucide-react";
import "@tanstack/react-router";
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
function ExtraModulesPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("pomodoro");
  const logActivityFn = useServerFn(logActivity);
  const listPlacementsFn = useServerFn(listPlacements);
  const createPlacementFn = useServerFn(createPlacement);
  const updatePlacementFn = useServerFn(updatePlacement);
  const getResumeFn = useServerFn(getResumeProfile);
  const saveResumeFn = useServerFn(saveResumeProfile);
  const {
    data: placements = [],
    refetch: refetchPlacements
  } = useQuery({
    queryKey: ["placementsList"],
    queryFn: () => listPlacementsFn()
  });
  const {
    data: resume,
    refetch: refetchResume
  } = useQuery({
    queryKey: ["resumeProfile"],
    queryFn: () => getResumeFn()
  });
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            setSessionCount((prev) => prev + 1);
            toast.success("Focus block completed! Logging session minutes.");
            logSessionMut.mutate(25);
            setMinutes(25);
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1e3);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);
  const logSessionMut = useMutation({
    mutationFn: (duration) => logActivityFn({
      data: {
        type: "pomodoro",
        duration,
        details: "Completed 25-minute Pomodoro slot"
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["dashboardStats"]
      });
    }
  });
  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };
  const [placementOpen, setPlacementOpen] = useState(false);
  const [newPlace, setNewPlace] = useState({
    company: "",
    role: "",
    status: "applied",
    notes: ""
  });
  const createPlaceMut = useMutation({
    mutationFn: (data) => createPlacementFn({
      data
    }),
    onSuccess: () => {
      toast.success("Application cataloged!");
      setPlacementOpen(false);
      setNewPlace({
        company: "",
        role: "",
        status: "applied",
        notes: ""
      });
      refetchPlacements();
      qc.invalidateQueries({
        queryKey: ["dashboardStats"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to log application");
    }
  });
  const updatePlaceMut = useMutation({
    mutationFn: (data) => updatePlacementFn({
      data
    }),
    onSuccess: () => {
      toast.success("Application progress saved!");
      refetchPlacements();
      qc.invalidateQueries({
        queryKey: ["dashboardStats"]
      });
    }
  });
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    if (resume) {
      setSummary(resume.summary || "");
      setSkills(resume.skills ? resume.skills.join(", ") : "");
      setEducation(resume.education || []);
      setExperience(resume.experience || []);
      setProjects(resume.projects || []);
    }
  }, [resume]);
  const saveResumeMut = useMutation({
    mutationFn: () => {
      const skillsList = skills.split(",").map((s) => s.trim()).filter(Boolean);
      return saveResumeFn({
        data: {
          summary,
          skills: skillsList,
          education,
          experience,
          projects
        }
      });
    },
    onSuccess: () => {
      toast.success("Resume updated! ATS score recalculated.");
      refetchResume();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save resume");
    }
  });
  const addExperience = () => {
    setExperience([...experience, {
      company: "",
      role: "",
      duration: "",
      points: ""
    }]);
  };
  const addProject = () => {
    setProjects([...projects, {
      title: "",
      tech: "",
      description: ""
    }]);
  };
  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-[#0B0F19] text-slate-100 p-6 md:p-8 scrollbar-thin", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4 justify-between items-center", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("h1", { className: "text-xl font-extrabold text-white flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-indigo-400" }),
        " Study Utilities Hub"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-900 border border-slate-800 rounded p-0.5", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("pomodoro"), className: `px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${activeTab === "pomodoro" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`, children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
          " Pomodoro Timer"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("placement"), className: `px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${activeTab === "placement" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`, children: [
          /* @__PURE__ */ jsx(Briefcase, { className: "h-3.5 w-3.5" }),
          " Placement Tracker"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("resume"), className: `px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${activeTab === "resume" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`, children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
          " ATS Resume Builder"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("leaderboard"), className: `px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${activeTab === "leaderboard" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`, children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-3.5 w-3.5" }),
          " Leaderboards"
        ] })
      ] })
    ] }),
    activeTab === "pomodoro" && /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto py-8", children: /* @__PURE__ */ jsxs(Card, { className: "bg-slate-900/40 border-slate-800 shadow-2xl p-6 text-center backdrop-blur", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-300 uppercase tracking-widest font-mono", children: "Focus Countdown" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-slate-500", children: "25 minutes study block / 5 minutes rest break" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-8 mt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "h-44 w-44 rounded-full border-4 border-slate-800/80 mx-auto grid place-items-center relative bg-slate-950/40 shadow-inner", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-4xl font-black text-white font-mono tracking-tighter", children: [
            String(minutes).padStart(2, "0"),
            ":",
            String(seconds).padStart(2, "0")
          ] }),
          isActive && /* @__PURE__ */ jsx("span", { className: "absolute bottom-10 text-[9px] uppercase tracking-widest text-emerald-400 font-bold font-mono animate-pulse", children: "Running" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-3", children: [
          /* @__PURE__ */ jsxs(Button, { onClick: toggleTimer, className: `text-xs h-9 px-6 font-semibold ${isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"} text-white`, children: [
            isActive ? /* @__PURE__ */ jsx(Pause, { className: "h-3.5 w-3.5 mr-1" }) : /* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5 mr-1" }),
            isActive ? "Pause Focus" : "Start Focus"
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: resetTimer, variant: "outline", className: "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 text-xs h-9", children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5 mr-1" }),
            " Reset"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-slate-850 pt-4 text-xs text-slate-400", children: [
          "Blocks completed today: ",
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
            sessionCount,
            " blocks"
          ] }),
          " (",
          sessionCount * 25,
          " mins focus logged)"
        ] })
      ] })
    ] }) }),
    activeTab === "placement" && /* @__PURE__ */ jsxs("div", { className: "space-y-6 text-left", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-slate-300 font-mono uppercase tracking-wider", children: "// Applied Placement Track" }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => setPlacementOpen(true), className: "bg-blue-600 hover:bg-blue-700 text-white text-xs h-7", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3 mr-1" }),
          " Add Application"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: placements.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-12 text-center text-slate-500 text-xs sm:col-span-2", children: "No active applications currently logged." }) : placements.map((p) => /* @__PURE__ */ jsxs(Card, { className: "bg-slate-900/40 border-slate-800 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-200 text-sm", children: p.company }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1", children: p.role })
          ] }),
          /* @__PURE__ */ jsxs("select", { value: p.status, onChange: (e) => updatePlaceMut.mutate({
            id: p.id,
            status: e.target.value,
            notes: p.notes || ""
          }), className: "bg-slate-950/80 border border-slate-800 text-[10px] h-6 px-1.5 rounded text-slate-300 font-semibold focus:outline-none", children: [
            /* @__PURE__ */ jsx("option", { value: "applied", children: "Applied" }),
            /* @__PURE__ */ jsx("option", { value: "interviewing", children: "Interviewing" }),
            /* @__PURE__ */ jsx("option", { value: "offered", children: "Offered" }),
            /* @__PURE__ */ jsx("option", { value: "rejected", children: "Rejected" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 border-t border-slate-850 pt-3 text-xs", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-500", children: "Log notes:" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-300 mt-1 italic leading-relaxed", children: p.notes || "No notes logged." })
        ] })
      ] }, p.id)) }),
      placementOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "bg-[#0F172A] border-slate-850 w-full max-w-sm shadow-2xl relative", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setPlacementOpen(false), className: "absolute top-4 right-4 text-slate-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-4.5 w-4.5" }) }),
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-200", children: "Catalog Placement application" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          createPlaceMut.mutate(newPlace);
        }, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Company Name" }),
            /* @__PURE__ */ jsx(Input, { required: true, value: newPlace.company, onChange: (e) => setNewPlace({
              ...newPlace,
              company: e.target.value
            }), placeholder: "e.g. Microsoft", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Job Role" }),
            /* @__PURE__ */ jsx(Input, { required: true, value: newPlace.role, onChange: (e) => setNewPlace({
              ...newPlace,
              role: e.target.value
            }), placeholder: "e.g. Systems Engineer Intern", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Status" }),
            /* @__PURE__ */ jsxs("select", { value: newPlace.status, onChange: (e) => setNewPlace({
              ...newPlace,
              status: e.target.value
            }), className: "w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none", children: [
              /* @__PURE__ */ jsx("option", { value: "applied", children: "Applied" }),
              /* @__PURE__ */ jsx("option", { value: "interviewing", children: "Interviewing" }),
              /* @__PURE__ */ jsx("option", { value: "offered", children: "Offered" }),
              /* @__PURE__ */ jsx("option", { value: "rejected", children: "Rejected" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Preparation Notes" }),
            /* @__PURE__ */ jsx("textarea", { value: newPlace.notes, onChange: (e) => setNewPlace({
              ...newPlace,
              notes: e.target.value
            }), placeholder: "Log stage instructions, interview timestamps...", rows: 3, className: "w-full p-2.5 rounded bg-slate-950/40 border border-slate-850 text-slate-200 text-xs focus:outline-none" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: createPlaceMut.isPending, className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8", children: createPlaceMut.isPending ? "Logging..." : "Log Application" }),
            /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setPlacementOpen(false), variant: "outline", className: "border-slate-800 text-slate-400 text-xs h-8", children: "Cancel" })
          ] })
        ] }) })
      ] }) })
    ] }),
    activeTab === "resume" && /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3 text-left", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "bg-slate-900/40 border-slate-800 p-6", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "p-0 pb-4 border-b border-slate-805 mb-4", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-200", children: "ATS Profile Editor" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-0 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Professional Summary" }),
            /* @__PURE__ */ jsx("textarea", { value: summary, onChange: (e) => setSummary(e.target.value), placeholder: "Briefly state your technical focus and goals...", rows: 3, className: "w-full p-2.5 rounded bg-slate-950/40 border border-slate-850 text-slate-200 text-xs focus:outline-none" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Skills (Comma-separated)" }),
            /* @__PURE__ */ jsx(Input, { value: skills, onChange: (e) => setSkills(e.target.value), placeholder: "e.g. React, TypeScript, Python, SQL", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block", children: "Work Experience History" }),
              /* @__PURE__ */ jsx("button", { onClick: addExperience, className: "text-[10px] text-blue-400 hover:text-blue-300 font-semibold", children: "+ Add block" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3", children: experience.map((exp, idx) => /* @__PURE__ */ jsxs("div", { className: "p-3 border border-slate-850 rounded bg-slate-950/20 relative", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => removeExperience(idx), className: "absolute top-2 right-2 text-slate-500 hover:text-red-400 text-xs", children: "Remove" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(Input, { placeholder: "Company", value: exp.company, onChange: (e) => {
                  const list = [...experience];
                  list[idx].company = e.target.value;
                  setExperience(list);
                }, className: "bg-slate-950/30 border-slate-800 text-xs h-8" }),
                /* @__PURE__ */ jsx(Input, { placeholder: "Role / Title", value: exp.role, onChange: (e) => {
                  const list = [...experience];
                  list[idx].role = e.target.value;
                  setExperience(list);
                }, className: "bg-slate-950/30 border-slate-800 text-xs h-8" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 mb-2", children: /* @__PURE__ */ jsx(Input, { placeholder: "Duration (e.g. Summer 2025)", value: exp.duration, onChange: (e) => {
                const list = [...experience];
                list[idx].duration = e.target.value;
                setExperience(list);
              }, className: "bg-slate-950/30 border-slate-800 text-xs h-8" }) }),
              /* @__PURE__ */ jsx("textarea", { placeholder: "Describe achievements with metrics...", value: exp.points, onChange: (e) => {
                const list = [...experience];
                list[idx].points = e.target.value;
                setExperience(list);
              }, rows: 2, className: "w-full p-2 rounded bg-slate-950/30 border border-slate-800 text-slate-200 text-xs focus:outline-none" })
            ] }, idx)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block", children: "Engineering Projects" }),
              /* @__PURE__ */ jsx("button", { onClick: addProject, className: "text-[10px] text-blue-400 hover:text-blue-300 font-semibold", children: "+ Add block" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3", children: projects.map((proj, idx) => /* @__PURE__ */ jsxs("div", { className: "p-3 border border-slate-850 rounded bg-slate-950/20 relative", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => removeProject(idx), className: "absolute top-2 right-2 text-slate-500 hover:text-red-400 text-xs", children: "Remove" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(Input, { placeholder: "Project Title", value: proj.title, onChange: (e) => {
                  const list = [...projects];
                  list[idx].title = e.target.value;
                  setProjects(list);
                }, className: "bg-slate-950/30 border-slate-800 text-xs h-8" }),
                /* @__PURE__ */ jsx(Input, { placeholder: "Tech Stack Used", value: proj.tech, onChange: (e) => {
                  const list = [...projects];
                  list[idx].tech = e.target.value;
                  setProjects(list);
                }, className: "bg-slate-950/30 border-slate-800 text-xs h-8" })
              ] }),
              /* @__PURE__ */ jsx("textarea", { placeholder: "Enter project specifications...", value: proj.description, onChange: (e) => {
                const list = [...projects];
                list[idx].description = e.target.value;
                setProjects(list);
              }, rows: 2, className: "w-full p-2 rounded bg-slate-950/30 border border-slate-800 text-slate-200 text-xs focus:outline-none" })
            ] }, idx)) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-2 border-t border-slate-855", children: /* @__PURE__ */ jsx(Button, { onClick: () => saveResumeMut.mutate(), disabled: saveResumeMut.isPending, className: "bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8", children: saveResumeMut.isPending ? "Calculating..." : "Save & Score Resume" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "bg-slate-900/40 border-slate-800 p-6 text-center", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "p-0 pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold text-slate-400 uppercase tracking-widest font-mono", children: "ATS Scoring Audit" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-0 space-y-6 mt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "h-28 w-28 rounded-full border-4 border-slate-800 mx-auto grid place-items-center relative bg-slate-950/20", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-2xl font-black text-white", children: [
              resume?.ats_score || 0,
              "%"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "absolute bottom-6 text-[8px] text-slate-500 uppercase tracking-wider font-semibold", children: "ATS score" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-left border-t border-slate-850 pt-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-3", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5 text-amber-500" }),
              " Optimization Checklist"
            ] }),
            resume?.suggestions && resume.suggestions.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "space-y-2.5", children: resume.suggestions.map((s, idx) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2 items-start text-[11px] text-slate-300 leading-normal", children: [
              /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: s })
            ] }, idx)) }) : /* @__PURE__ */ jsxs("div", { className: "text-xs text-emerald-400 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
              " Resume is ATS fully optimized!"
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: () => {
            toast.success("Downloading ATS resume document file...");
          }, variant: "outline", className: "w-full border-slate-800 bg-slate-950 text-slate-300 text-xs h-8", children: "Print Resume Draft" })
        ] })
      ] }) })
    ] }),
    activeTab === "leaderboard" && /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto space-y-6 text-left", children: /* @__PURE__ */ jsxs(Card, { className: "bg-slate-900/40 border-slate-800 p-6", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-slate-850", children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm font-semibold text-slate-200 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5 text-amber-500" }),
          " Academic CGPA Leaderboard"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-slate-500", children: "Highest GPA logs among student registry cohort" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "pt-4 p-0", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [{
        rank: 1,
        name: "Yash Barjatya",
        cgpa: 9.82,
        streak: 15
      }, {
        rank: 2,
        name: "Priyanjali Sen",
        cgpa: 9.54,
        streak: 12
      }, {
        rank: 3,
        name: "Ananya Mehta",
        cgpa: 9.21,
        streak: 10
      }, {
        rank: 4,
        name: "Rohit Deshmukh",
        cgpa: 8.94,
        streak: 8
      }].map((user, i) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 rounded border border-slate-850 bg-slate-950/20", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: `h-6 w-6 rounded-full font-mono text-xs font-bold grid place-items-center ${user.rank === 1 ? "bg-amber-500/20 border border-amber-500/40 text-amber-400" : "bg-slate-800 text-slate-400"}`, children: user.rank }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-slate-200", children: user.name }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-slate-500 flex items-center gap-1 mt-0.5", children: [
              /* @__PURE__ */ jsx(Flame, { className: "h-3 w-3 text-amber-500" }),
              " ",
              user.streak,
              " days login"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm font-black text-blue-400", children: [
          user.cgpa,
          " CGPA"
        ] })
      ] }, i)) }) })
    ] }) })
  ] }) });
}
export {
  ExtraModulesPage as component
};
