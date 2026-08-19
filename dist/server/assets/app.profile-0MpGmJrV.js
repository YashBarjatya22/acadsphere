import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "./client-h4N4kZKq.js";
import { u as useServerFn, C as ChatLayout, A as Avatar, e as AvatarImage, a as AvatarFallback, B as Button, f as getAnalyticsSummary, d as updateProfile } from "./router-DWxA6Z2f.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./card-H7niSSOQ.js";
import { I as Input } from "./input-CCdkf2yx.js";
import { L as Label } from "./label-Des3dynE.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { g as getProfileAndRole, a as updateProfileRole } from "./studentos.functions-BCssppkW.js";
import { toast } from "sonner";
import { Loader2, TrendingUp, Star, Target, Check, Mail, Building2, Shield, Edit3, Users, Radio, Activity, GraduationCap, Award, User } from "lucide-react";
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
function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const getProfileFn = useServerFn(getProfileAndRole);
  const updateRoleFn = useServerFn(updateProfileRole);
  const updateProfileFn = useServerFn(updateProfile);
  const {
    data: profileRole
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn()
  });
  const {
    data: analytics,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getSummaryFn()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    degree: "",
    semester: "",
    targetRole: "",
    skills: ""
  });
  const userRole = typeof window !== "undefined" ? localStorage.getItem("demo_user_role") || profileRole?.role || "student" : profileRole?.role || "student";
  const isAdmin = userRole === "admin";
  const switchRole = useMutation({
    mutationFn: (role) => updateRoleFn({
      data: {
        role
      }
    }),
    onSuccess: (_, role) => {
      localStorage.setItem("demo_user_role", role);
      toast.success(`Role switched to ${role.charAt(0).toUpperCase() + role.slice(1)}`);
      qc.invalidateQueries({
        queryKey: ["userProfile"]
      });
      qc.invalidateQueries({
        queryKey: ["analyticsSummary"]
      });
      if (role === "admin") {
        navigate({
          to: "/admin"
        });
      }
    },
    onError: (err) => toast.error(err.message || "Failed to switch role")
  });
  const saveProfile = useMutation({
    mutationFn: (data) => updateProfileFn({
      data
    }),
    onSuccess: (_, variables) => {
      localStorage.setItem("demo_user_name", variables.fullName);
      toast.success("Academic profile updated!");
      setIsEditing(false);
      refetch();
      qc.invalidateQueries({
        queryKey: ["analyticsSummary"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    }
  });
  const [sessionUser, setSessionUser] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || meta.name || u.email?.split("@")[0] || "Christ Student";
        const email = u.email || "";
        const avatar = meta.avatar_url || meta.picture || "";
        setSessionUser({
          name,
          email,
          avatar
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("demo_user_name", name);
          localStorage.setItem("demo_user_email", email);
          if (avatar) localStorage.setItem("demo_user_avatar", avatar);
        }
      }
    });
  }, []);
  const storedName = typeof window !== "undefined" ? localStorage.getItem("demo_user_name") : null;
  const storedEmail = typeof window !== "undefined" ? localStorage.getItem("demo_user_email") : null;
  const storedAvatar = typeof window !== "undefined" ? localStorage.getItem("demo_user_avatar") : null;
  const profile = analytics?.profile;
  const displayName = isAdmin ? "Academic Controller" : sessionUser?.name || storedName || profile?.fullName || storedEmail?.split("@")[0] || "Christ Student";
  const displayEmail = sessionUser?.email || storedEmail || "student@christuniversity.in";
  sessionUser?.avatar || storedAvatar || "";
  const displayDegree = profile?.degree || "MSc Big Data Analytics";
  const displayRole = isAdmin ? "Institutional Oversight Officer" : profile?.targetRole || "Software Engineer / Data Scientist";
  const initials = displayName.split(" ").map((n) => n[0]).filter(Boolean).join("").substring(0, 2).toUpperCase() || "CS";
  const startEdit = () => {
    setProfileForm({
      fullName: displayName,
      degree: displayDegree,
      semester: profile?.semester || "Semester 4",
      targetRole: profile?.targetRole || "Software Engineer / Data Scientist",
      skills: Array.isArray(profile?.skills) ? profile.skills.join(", ") : "SQL, Python, React"
    });
    setIsEditing(true);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "flex h-full items-center justify-center bg-background text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Loading student profile..." })
    ] }) });
  }
  const STUDENT_STAT_CARDS = [{
    label: "Roadmap Progress",
    value: `${analytics?.metrics?.roadmapProgress ?? analytics?.studentMetrics?.roadmap_progress ?? 67}%`,
    icon: TrendingUp
  }, {
    label: "Resume Strength",
    value: `${analytics?.metrics?.resumeStrength ?? analytics?.studentMetrics?.resume_strength ?? 85}%`,
    icon: Star
  }, {
    label: "Placement Score",
    value: `${analytics?.metrics?.placementReadiness ?? analytics?.studentMetrics?.placement_readiness ?? 78}%`,
    icon: Target
  }];
  const ADMIN_STAT_CARDS = [{
    label: "Total Enrolled",
    value: "1,140",
    icon: Users
  }, {
    label: "Active Now",
    value: "342",
    icon: Radio
  }, {
    label: "Active Sessions",
    value: "218",
    icon: Activity
  }];
  const STAT_CARDS = isAdmin ? ADMIN_STAT_CARDS : STUDENT_STAT_CARDS;
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 overflow-y-auto scrollbar-thin transition-colors duration-200 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden px-6 md:px-8 py-8 border-b border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-start gap-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
          /* @__PURE__ */ jsxs(Avatar, { className: "h-16 w-16 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800", children: [
            /* @__PURE__ */ jsx(AvatarImage, { src: storedAvatar || "", alt: displayName }),
            /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-black text-xl", children: initials })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-600 border-2 border-white dark:border-zinc-900 flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-white" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-100", children: displayName }),
            isAdmin && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-stone-200 dark:border-zinc-700 font-mono", children: "Admin Controller" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400 mt-1", children: [
            /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-xs text-stone-700 dark:text-zinc-300 font-semibold", children: displayEmail })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-stone-500 dark:text-zinc-400 mt-1", children: [
            displayDegree,
            " · ",
            displayRole
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-3 flex-wrap", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-[11px] font-semibold bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-1 rounded-full text-stone-700 dark:text-zinc-300", children: [
              /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5 text-stone-500" }),
              " Christ University (Bangalore)"
            ] }),
            isAdmin ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full", children: [
              /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-emerald-600" }),
              " Full Access"
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-1 rounded-full text-stone-700 dark:text-zinc-300", children: profile?.semester || "Semester 4" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          !isAdmin && !isEditing && /* @__PURE__ */ jsxs(Button, { onClick: startEdit, variant: "outline", className: "h-9 text-xs font-bold gap-1.5 border-stone-200 dark:border-zinc-700", children: [
            /* @__PURE__ */ jsx(Edit3, { className: "h-3.5 w-3.5" }),
            " Edit Profile"
          ] }),
          isAdmin && /* @__PURE__ */ jsxs(Button, { onClick: () => navigate({
            to: "/admin"
          }), className: "h-9 text-xs bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold gap-1.5 shrink-0 shadow-sm", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5" }),
            " Admin Overview"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative flex gap-3 mt-6 flex-wrap", children: STAT_CARDS.map((s) => {
        const Icon = s.icon;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-800 shadow-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-stone-200 dark:bg-zinc-700 flex items-center justify-center text-stone-800 dark:text-zinc-200 shrink-0", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[9.5px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider", children: s.label }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-stone-900 dark:text-zinc-100", children: s.value })
          ] })
        ] }, s.label);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 md:px-8 py-6 grid gap-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-4 md:col-span-1", children: isEditing ? /* @__PURE__ */ jsxs(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Edit Profile Details" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          saveProfile.mutate(profileForm);
        }, className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "fullName", className: "text-[10px] font-bold uppercase text-stone-500", children: "Full Name" }),
            /* @__PURE__ */ jsx(Input, { id: "fullName", value: profileForm.fullName, onChange: (e) => setProfileForm({
              ...profileForm,
              fullName: e.target.value
            }), className: "h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "degree", className: "text-[10px] font-bold uppercase text-stone-500", children: "Degree & Specialization" }),
            /* @__PURE__ */ jsx(Input, { id: "degree", value: profileForm.degree, onChange: (e) => setProfileForm({
              ...profileForm,
              degree: e.target.value
            }), className: "h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "semester", className: "text-[10px] font-bold uppercase text-stone-500", children: "Semester" }),
              /* @__PURE__ */ jsx(Input, { id: "semester", value: profileForm.semester, onChange: (e) => setProfileForm({
                ...profileForm,
                semester: e.target.value
              }), className: "h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold", required: true })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "targetRole", className: "text-[10px] font-bold uppercase text-stone-500", children: "Target Role" }),
              /* @__PURE__ */ jsx(Input, { id: "targetRole", value: profileForm.targetRole, onChange: (e) => setProfileForm({
                ...profileForm,
                targetRole: e.target.value
              }), className: "h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold", required: true })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "skills", className: "text-[10px] font-bold uppercase text-stone-500", children: "Skills (Comma-separated)" }),
            /* @__PURE__ */ jsx(Input, { id: "skills", value: profileForm.skills, onChange: (e) => setProfileForm({
              ...profileForm,
              skills: e.target.value
            }), className: "h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saveProfile.isPending, className: "flex-1 h-8 text-xs bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold", children: saveProfile.isPending ? "Saving..." : "Save Changes" }),
            /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setIsEditing(false), variant: "outline", className: "flex-1 h-8 text-xs border-stone-200", children: "Cancel" })
          ] })
        ] }) })
      ] }) : /* @__PURE__ */ jsxs(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Account Details" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-3 text-xs", children: [{
          label: "Full Name",
          value: displayName
        }, {
          label: "Email Address",
          value: displayEmail
        }, {
          label: "Institution",
          value: "Christ University (Bangalore)"
        }, {
          label: "Account Role",
          value: isAdmin ? "Academic Controller" : "Student"
        }, {
          label: "Degree",
          value: displayDegree
        }, {
          label: "Access Level",
          value: isAdmin ? "Full Administrative Oversight" : "Student Command Center"
        }].map((item) => /* @__PURE__ */ jsxs("div", { className: "border-b border-stone-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9.5px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider", children: item.label }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-stone-900 dark:text-zinc-100 mt-0.5", children: item.value })
        ] }, item.label)) })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl md:col-span-1", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-stone-700 dark:text-zinc-300" }),
            " Switch Workspace Role"
          ] }),
          /* @__PURE__ */ jsxs(CardDescription, { className: "text-xs mt-0.5", children: [
            "Active Mode: ",
            /* @__PURE__ */ jsx("span", { className: "font-bold text-stone-900 dark:text-zinc-100 capitalize", children: userRole })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-2.5", children: ["student", "faculty", "admin"].map((role) => /* @__PURE__ */ jsxs(Button, { onClick: () => switchRole.mutate(role), disabled: switchRole.isPending || userRole === role, variant: userRole === role ? "default" : "outline", className: `w-full h-9 text-xs capitalize ${userRole === role ? "bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold" : "border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800"}`, children: [
          switchRole.isPending && userRole !== role ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 mr-1.5 animate-spin" }) : userRole === role ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 mr-1.5" }) : null,
          role === "admin" ? "Academic Controller Mode" : role === "faculty" ? "Faculty Mode" : "Student Mode"
        ] }, role)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "md:col-span-1", children: /* @__PURE__ */ jsxs(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl h-full", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-stone-100 dark:border-zinc-800", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: isAdmin ? "Admin Shortcuts" : "Quick Actions" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-4 space-y-2", children: [{
          label: "Classroom Submissions",
          to: "/app/classroom",
          icon: GraduationCap
        }, {
          label: "AI Academic Mentoring",
          to: "/app/ai-assistant",
          icon: Star
        }, {
          label: "Smart Notes & Audits",
          to: "/app/notes",
          icon: Award
        }, {
          label: "Settings",
          to: "/app/settings",
          icon: User
        }].map((item) => /* @__PURE__ */ jsxs(Button, { onClick: () => navigate({
          to: item.to
        }), variant: "outline", className: "w-full justify-start text-xs h-9 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 gap-2 font-semibold", children: [
          /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4 text-stone-500" }),
          item.label
        ] }, item.to)) })
      ] }) })
    ] })
  ] }) });
}
export {
  ProfilePage as component
};
