import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { C as ChatLayout } from "./ChatLayout-DhUO2gLY.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-Cwsrt9M1.js";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { c as cn } from "./utils-H80jjgLf.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { I as Input } from "./input-poeoKceV.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { c as createSsrRpc, u as useServerFn } from "./createSsrRpc-C_NR-jAW.js";
import { toast } from "sonner";
import { a as createServerFn } from "./server-C5bjec8z.js";
import { r as requireSupabaseAuth } from "./auth-middleware-0D9COL9P.js";
import { z } from "zod";
import { u as updateProfile } from "./analytics.functions-ClBBUcnH.js";
import { Settings, Bot, Palette, Moon, Sun, Check, Bell, MessageCircle, Phone, Loader2, LogOut, User, Send } from "lucide-react";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
import "./studentos-logo-CCLo3MN1.js";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
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
import "node:crypto";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitive.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
      "border border-border",
      "transition-colors duration-[200ms] ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Unchecked: muted background
      "bg-muted",
      // Checked: black background
      "data-[state=checked]:bg-foreground data-[state=checked]:border-foreground",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitive.Thumb,
      {
        className: cn(
          "pointer-events-none block h-3.5 w-3.5 rounded-full",
          "shadow-none",
          "ring-0",
          "transition-transform duration-[200ms] ease-out",
          // Unchecked: cream thumb
          "bg-muted-foreground",
          "translate-x-[3px]",
          // Checked: cream/background thumb, shifted right
          "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-background"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitive.Root.displayName;
const interpretSettlerInstruction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  instruction: z.string().max(1e3),
  customKey: z.string().optional()
})).handler(createSsrRpc("5116e39c6e9454cb2122c8344cea40cc4a17378638672c8a1acaecba3f82d22e"));
function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("preferences");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [vivaAudits, setVivaAudits] = useState(false);
  const [analyticsSharing, setAnalyticsSharing] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [saved, setSaved] = useState(false);
  const [accentColor, setAccentColor] = useState("blue");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{
    sender: "settler",
    text: "Hello! I am Settler, your autonomous workspace setup agent. I can configure themes, change profile info, post updates, or schedule assessments directly. Tell me what needs fixing or changing!",
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  }]);
  const interpretFn = useServerFn(interpretSettlerInstruction);
  const updateProfileFn = useServerFn(updateProfile);
  const chatEndRef = useRef(null);
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDark(theme !== "light");
    const accent = localStorage.getItem("accent") || "blue";
    setAccentColor(accent);
    (async () => {
      try {
        const {
          supabase
        } = await import("./client-h4N4kZKq.js");
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (!user) return;
        const {
          data
        } = await supabase.from("profiles").select("phone_number, sms_notifications_enabled").eq("id", user.id).single();
        if (data) {
          setPhoneNumber(data.phone_number || "");
          setSmsEnabled(data.sms_notifications_enabled ?? true);
        }
      } catch (_) {
      }
    })();
  }, []);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const handleThemeChange = (checked) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast.success(`Switched to ${checked ? "Dark" : "Light"} mode`);
  };
  const handleSave = () => {
    localStorage.setItem("settings_email_alerts", String(emailAlerts));
    localStorage.setItem("settings_viva_audits", String(vivaAudits));
    localStorage.setItem("settings_analytics", String(analyticsSharing));
    setSaved(true);
    toast.success("Preferences saved!");
    setTimeout(() => setSaved(false), 2e3);
  };
  const handleSavePhone = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setPhoneSaving(true);
    try {
      const {
        supabase
      } = await import("./client-h4N4kZKq.js");
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const {
        error
      } = await supabase.from("profiles").update({
        phone_number: phoneNumber.trim(),
        sms_notifications_enabled: smsEnabled
      }).eq("id", user.id);
      if (error) throw error;
      setPhoneSaved(true);
      toast.success("Phone number saved! You'll receive SMS reminders for upcoming assignments.");
      setTimeout(() => setPhoneSaved(false), 3e3);
    } catch (e) {
      toast.error(`Failed to save phone number: ${e.message}`);
    } finally {
      setPhoneSaving(false);
    }
  };
  async function handleSignOut() {
    localStorage.removeItem("demo_session_token");
    localStorage.removeItem("demo_user_id");
    localStorage.removeItem("demo_user_email");
    const {
      supabase
    } = await import("./client-h4N4kZKq.js");
    supabase.auth.signOut().catch(() => {
    });
    toast.success("Signed out successfully");
    navigate({
      to: "/"
    });
  }
  const handleInstruction = useMutation({
    mutationFn: (text) => interpretFn({
      data: {
        instruction: text
      }
    }),
    onSuccess: async (res) => {
      const settlerMsg = {
        sender: "settler",
        text: res.response,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      setMessages((prev) => [...prev, settlerMsg]);
      if (res.action) {
        const {
          type,
          params
        } = res.action;
        if (type === "theme" && params.value) {
          const darkChecked = params.value === "dark";
          handleThemeChange(darkChecked);
        } else if (type === "accent" && params.value) {
          setAccentColor(params.value);
          localStorage.setItem("accent", params.value);
          toast.success(`Theme accent set to ${params.value}`);
        } else if (type === "profile") {
          try {
            await updateProfileFn({
              data: {
                fullName: params.fullName || "Student Name",
                degree: params.degree || "B.Tech CSE",
                semester: params.semester || "Semester 6",
                targetRole: params.targetRole || "Frontend Engineer",
                skills: params.skills || ""
              }
            });
            qc.invalidateQueries({
              queryKey: ["analyticsSummary"]
            });
            toast.success("Profile updated successfully!");
          } catch (e) {
            toast.error("Failed to update profile: " + e.message);
          }
        } else if (type === "community") {
          try {
            const savedPostsStr = localStorage.getItem("acadsphere_community_posts") || "[]";
            const posts = JSON.parse(savedPostsStr);
            const newPost = {
              id: Date.now().toString(),
              author: "You (via Settler)",
              avatar: "YO",
              channel: params.channel || "#general-chat",
              content: params.content,
              likes: 0,
              likedByMe: false,
              time: "Just now",
              timestamp: Date.now()
            };
            posts.unshift(newPost);
            localStorage.setItem("acadsphere_community_posts", JSON.stringify(posts));
            toast.success(`Published post to ${newPost.channel}!`);
          } catch (_) {
          }
        }
      }
    },
    onError: () => {
      setMessages((prev) => [...prev, {
        sender: "settler",
        text: "I encountered an error trying to interpret that instruction. Please check the AI config key or try again.",
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      }]);
    }
  });
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = {
      sender: "user",
      text: chatInput,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    setMessages((prev) => [...prev, userMsg]);
    const textToSend = chatInput;
    setChatInput("");
    handleInstruction.mutate(textToSend);
  };
  const ACCENT_COLORS = [{
    id: "blue",
    label: "Ocean Blue",
    class: "bg-blue-500"
  }, {
    id: "violet",
    label: "Electric Violet",
    class: "bg-violet-500"
  }, {
    id: "emerald",
    label: "Emerald",
    class: "bg-emerald-500"
  }, {
    id: "rose",
    label: "Rose",
    class: "bg-rose-500"
  }, {
    id: "amber",
    label: "Amber",
    class: "bg-amber-500"
  }, {
    id: "cyan",
    label: "Cyan",
    class: "bg-cyan-500"
  }];
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full bg-background text-foreground flex flex-col transition-colors duration-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden px-6 py-5 border-b border-border shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-slate-500/10 via-background to-zinc-500/5 pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center shadow-md", children: /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-sm font-extrabold tracking-tight", children: "Workspace Preferences" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Modify settings manually or instruct Settler AI agent" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex bg-muted/60 border border-border p-0.5 rounded-lg text-xs font-semibold", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("preferences"), className: `px-3 py-1 rounded-md transition-all ${activeTab === "preferences" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: "Preferences" }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("settler"), className: `px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${activeTab === "settler" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsx(Bot, { className: "h-3.5 w-3.5" }),
            " Settler AI"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto scrollbar-thin p-6 bg-muted/10", children: /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: activeTab === "preferences" ? /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxs(Card, { className: "card-gradient border-border shadow-sm", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-border/60", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(Palette, { className: "h-3.5 w-3.5 text-white" }) }),
            "Visual Appearance"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-[10px]", children: "Theme and color accent preferences." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: `h-8 w-8 rounded-lg flex items-center justify-center ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-amber-500/10 text-amber-500"}`, children: isDark ? /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground", children: isDark ? "Dark Mode" : "Light Mode" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Reduces eye strain in dim environments" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Switch, { checked: isDark, onCheckedChange: handleThemeChange })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5", children: "Accent Color" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: ACCENT_COLORS.map((c) => /* @__PURE__ */ jsx("button", { onClick: () => {
              setAccentColor(c.id);
              localStorage.setItem("accent", c.id);
              toast.success(`Accent set to ${c.label}`);
            }, title: c.label, className: `h-7 w-7 rounded-full ${c.class} flex items-center justify-center transition-all hover:scale-110 shadow-sm ${accentColor === c.id ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/30" : ""}`, children: accentColor === c.id && /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-white" }) }, c.id)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "card-gradient border-border shadow-sm", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-border/60", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(Bell, { className: "h-3.5 w-3.5 text-white" }) }),
            "Notifications & Alerts"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-[10px]", children: "Manage syllabus, exam, and placement notification triggers." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-4 space-y-4", children: [{
          key: "email",
          label: "Email Notifications",
          desc: "Weekly performance summaries and placement drive alerts",
          checked: emailAlerts,
          onChange: setEmailAlerts
        }, {
          key: "viva",
          label: "Viva Score Reports",
          desc: "Instant grading reports after simulator completions",
          checked: vivaAudits,
          onChange: setVivaAudits
        }].map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground", children: item.label }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: item.desc })
          ] }),
          /* @__PURE__ */ jsx(Switch, { checked: item.checked, onCheckedChange: item.onChange })
        ] }, item.key)) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "card-gradient border-border shadow-sm", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-border/60", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center", children: /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5 text-white" }) }),
            "SMS Assignment Reminders"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-[10px]", children: "Get SMS alerts at 24h, 6h, and 1h before deadlines — even when the app is closed. Powered by Twilio." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground", children: "Enable SMS Reminders" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Receive automated SMS for pre-due and overdue assignments" })
            ] }),
            /* @__PURE__ */ jsx(Switch, { checked: smsEnabled, onCheckedChange: setSmsEnabled })
          ] }),
          smsEnabled && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "phone-number", className: "text-xs font-semibold", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" }),
              " Mobile Number (with country code)"
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(Input, { id: "phone-number", type: "tel", placeholder: "e.g. +919876543210", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), className: "h-8 text-xs font-mono bg-background border-border flex-1" }),
              /* @__PURE__ */ jsx(Button, { onClick: handleSavePhone, disabled: phoneSaving, className: `h-8 text-xs px-4 font-semibold ${phoneSaved ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-primary hover:bg-blue-700 text-white"}`, children: phoneSaving ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : phoneSaved ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 mr-1" }),
                " Saved!"
              ] }) : "Save" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "You'll get SMS: 24h before, 6h before, 1h before, and daily overdue alerts (up to 14 days). Sync Classroom after saving to activate reminders." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsx(Button, { onClick: handleSave, className: `font-bold text-xs px-6 h-9 shadow-sm transition-all ${saved ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-primary hover:bg-blue-700 text-white"}`, children: saved ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 mr-1.5" }),
        " Saved!"
      ] }) : "Save Preferences" }) }),
      /* @__PURE__ */ jsxs(Card, { className: "border-red-500/20 bg-red-500/5 shadow-sm", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-red-500/10", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5 text-red-500" }) }),
            "Account"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-[10px]", children: "Sign out of your current session." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground", children: "Sign Out" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Clears your local session and returns to the home page." })
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: handleSignOut, variant: "outline", className: "h-8 px-4 text-xs font-bold border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50", children: [
            /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5 mr-1.5" }),
            "Log Out"
          ] })
        ] }) })
      ] })
    ] }) : (
      /* Settler AI Agent Interface */
      /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-lg flex flex-col h-[550px] overflow-hidden rounded-2xl", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-border/60 bg-muted/20 shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md", children: /* @__PURE__ */ jsx(Bot, { className: "h-4.5 w-4.5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-foreground", children: "Settler Autopilot" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-[10px] mt-0.5", children: "Tell Settler what config changes to make or problems to fix." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin", children: [
          messages.map((m, idx) => /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`, children: [
            /* @__PURE__ */ jsx("div", { className: `h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-white ${m.sender === "user" ? "bg-primary" : "bg-gradient-to-br from-emerald-400 to-teal-500"}`, children: m.sender === "user" ? /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Bot, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1 max-w-[80%]", children: [
              /* @__PURE__ */ jsx("div", { className: `rounded-xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${m.sender === "user" ? "bg-primary text-white" : "bg-muted border border-border"}`, children: m.text }),
              /* @__PURE__ */ jsx("span", { className: "text-[8px] text-muted-foreground block px-1", children: m.timestamp })
            ] })
          ] }, idx)),
          /* @__PURE__ */ jsx("div", { ref: chatEndRef })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSendChat, className: "p-3 border-t border-border bg-muted/10 flex gap-2 shrink-0", children: [
          /* @__PURE__ */ jsx(Input, { placeholder: "e.g. 'switch to dark mode', 'change major to CSE and target role to Backend Engineer'...", value: chatInput, onChange: (e) => setChatInput(e.target.value), className: "flex-1 h-9 text-xs bg-muted/40 border-border focus:ring-1 focus:ring-primary", disabled: handleInstruction.isPending }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: handleInstruction.isPending || !chatInput.trim(), className: "h-9 px-4 bg-primary hover:bg-blue-700 text-white font-bold", children: handleInstruction.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4.5 w-4.5 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-4.5 w-4.5" }) })
        ] })
      ] })
    ) }) })
  ] }) });
}
export {
  SettingsPage as component
};
