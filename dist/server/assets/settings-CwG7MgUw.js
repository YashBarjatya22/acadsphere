import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Building, Shield, Database, Save } from "lucide-react";
import { B as Button } from "./router-DWxA6Z2f.js";
import { I as Input } from "./input-CCdkf2yx.js";
import { L as Label } from "./label-Des3dynE.js";
import { toast } from "sonner";
import "@tanstack/react-query";
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
function AdminSettingsPage() {
  const [collegeName, setCollegeName] = useState("Christ University (Deemed to be University)");
  const [univCode, setUnivCode] = useState("CU");
  const [acadYear, setAcadYear] = useState("2025-2026");
  const [term, setTerm] = useState("Even Semester");
  const [minAttendance, setMinAttendance] = useState("75");
  const [mfaRequired, setMfaRequired] = useState(false);
  function handleSave(e) {
    e.preventDefault();
    toast.success("Institutional Settings & System Configuration Saved!");
  }
  function triggerBackup() {
    toast.loading("Initiating local SQLite database snapshot backup...", {
      duration: 2e3
    });
    setTimeout(() => {
      toast.success("Database Backup Snapshot Created Successfully! (backup_2026_07_23.db)");
    }, 2e3);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-white tracking-tight", children: "System Settings & Parameters" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Global institution profile, academic term setup, attendance policy thresholds, and database snapshot controls." })
    ] }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-3 border-b border-slate-800", children: [
          /* @__PURE__ */ jsx(Building, { className: "h-4 w-4 text-blue-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-white", children: "Institution & Academic Calendar Setup" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase text-slate-400", children: "Institution / College Name" }),
            /* @__PURE__ */ jsx(Input, { value: collegeName, onChange: (e) => setCollegeName(e.target.value), required: true, className: "h-9 text-xs bg-slate-900 border-slate-700 text-white" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase text-slate-400", children: "USN University Code Prefix" }),
            /* @__PURE__ */ jsx(Input, { value: univCode, onChange: (e) => setUnivCode(e.target.value), required: true, className: "h-9 text-xs bg-slate-900 border-slate-700 text-white font-mono" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase text-slate-400", children: "Academic Year" }),
            /* @__PURE__ */ jsx(Input, { value: acadYear, onChange: (e) => setAcadYear(e.target.value), required: true, className: "h-9 text-xs bg-slate-900 border-slate-700 text-white font-mono" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase text-slate-400", children: "Academic Term" }),
            /* @__PURE__ */ jsxs("select", { value: term, onChange: (e) => setTerm(e.target.value), className: "w-full h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-white", children: [
              /* @__PURE__ */ jsx("option", { value: "Even Semester", children: "Even Semester (Sem 2, 4, 6, 8)" }),
              /* @__PURE__ */ jsx("option", { value: "Odd Semester", children: "Odd Semester (Sem 1, 3, 5, 7)" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-3 border-b border-slate-800", children: [
          /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4 text-emerald-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-white", children: "Security & Risk Policy Thresholds" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase text-slate-400", children: "Minimum Attendance Threshold (%)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", value: minAttendance, onChange: (e) => setMinAttendance(e.target.value), className: "h-9 text-xs bg-slate-900 border-slate-700 text-white font-mono" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500", children: 'Students falling below this threshold are flagged as "Requiring Attention".' })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mt-5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-white", children: "Enforce Multi-Factor Authentication (MFA)" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400", children: "Require OTP for faculty & admin logins." })
            ] }),
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: mfaRequired, onChange: (e) => setMfaRequired(e.target.checked), className: "rounded border-slate-700 bg-slate-900 h-4 w-4" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-3 border-b border-slate-800", children: [
          /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-violet-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-white", children: "Database Backup & Recovery" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-white", children: "Instant SQLite System Snapshot" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400", children: "Create an immediate backup copy of all student, query, and audit tables." })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: triggerBackup, variant: "outline", className: "h-9 text-xs gap-1.5 bg-slate-900 border-slate-700 text-slate-200", children: [
            /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5" }),
            " Create Snapshot Now"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxs(Button, { type: "submit", className: "h-10 text-xs px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold gap-1.5 shadow-lg shadow-blue-600/30", children: [
        /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
        " Save Global Configuration"
      ] }) })
    ] })
  ] });
}
export {
  AdminSettingsPage as component
};
