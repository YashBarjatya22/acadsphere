import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-CzYOcfyh.js";
import { C as ChatLayout } from "./ChatLayout-sTEV38C2.js";
import { g as getProfileAndRole, v as listAnnouncements, w as createAnnouncement } from "./studentos.functions-D5GpOzs6.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-Cwsrt9M1.js";
import { toast } from "sonner";
import { Megaphone, Plus, RefreshCw, X, ShieldAlert } from "lucide-react";
import "@tanstack/react-router";
import "./server-CeiC96WD.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CZBfFAiY.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "./client-h4N4kZKq.js";
import "./studentos-logo-CCLo3MN1.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
function AnnouncementsPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    priority: "medium",
    category: "general"
  });
  const getProfileFn = useServerFn(getProfileAndRole);
  const listAnnounceFn = useServerFn(listAnnouncements);
  const createAnnounceFn = useServerFn(createAnnouncement);
  const {
    data: profile
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn()
  });
  const {
    data: notices = [],
    isLoading: loadingNotices
  } = useQuery({
    queryKey: ["announcementsList"],
    queryFn: () => listAnnounceFn()
  });
  const activeRole = profile?.role || "student";
  const isFaculty = activeRole === "faculty" || activeRole === "admin";
  const createMut = useMutation({
    mutationFn: (data) => createAnnounceFn({
      data
    }),
    onSuccess: () => {
      toast.success("Notice broadcasted and sent to all student notifications!");
      setCreateOpen(false);
      setNewNotice({
        title: "",
        content: "",
        priority: "medium",
        category: "general"
      });
      qc.invalidateQueries({
        queryKey: ["announcementsList"]
      });
      qc.invalidateQueries({
        queryKey: ["notifications"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to post notice");
    }
  });
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-[#0B0F19] text-slate-100 p-6 md:p-8 scrollbar-thin", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-extrabold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Megaphone, { className: "h-6 w-6 text-orange-400" }),
          " Department Notice & Announcements"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-xs mt-1", children: "Read urgent faculty broadcasts, academic dates, placement drives, and event updates." })
      ] }),
      isFaculty && /* @__PURE__ */ jsxs(Button, { onClick: () => setCreateOpen(true), className: "bg-orange-600 hover:bg-orange-700 text-white text-xs h-8", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        " Broadcast Notice"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto space-y-6 text-left", children: loadingNotices ? /* @__PURE__ */ jsxs("div", { className: "py-20 flex justify-center items-center text-slate-400", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "animate-spin h-5 w-5 mr-1 text-orange-500" }),
      " Fetching announcements timeline..."
    ] }) : notices.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-slate-500 text-xs", children: "No active notices broadcasted." }) : notices.map((notice) => {
      const isHigh = notice.priority === "high";
      const isMedium = notice.priority === "medium";
      return /* @__PURE__ */ jsxs(Card, { className: `bg-slate-900/40 border-slate-800/80 transition-all hover:border-slate-700 relative overflow-hidden ${isHigh ? "border-l-4 border-l-red-500" : isMedium ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-blue-500"}`, children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 flex-wrap items-center", children: [
              /* @__PURE__ */ jsxs("span", { className: `px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider font-mono border ${isHigh ? "bg-red-950/20 border-red-800/40 text-red-400 animate-pulse" : isMedium ? "bg-amber-950/20 border-amber-800/40 text-amber-400" : "bg-blue-950/20 border-blue-800/40 text-blue-400"}`, children: [
                notice.priority,
                " Priority"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono bg-slate-950/30 text-slate-400 border border-slate-850", children: notice.category })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-500", children: new Date(notice.created_at || Date.now()).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-bold text-slate-200 mt-2", children: notice.title })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-300 leading-relaxed", children: notice.content }) })
      ] }, notice.id);
    }) }),
    createOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "bg-[#0F172A] border-slate-850 w-full max-w-md shadow-2xl text-left relative", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setCreateOpen(false), className: "absolute top-4 right-4 text-slate-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-4.5 w-4.5" }) }),
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm font-semibold text-slate-200 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(ShieldAlert, { className: "h-4.5 w-4.5 text-orange-400 animate-bounce" }),
        " Broadcast Notice Alert"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        createMut.mutate(newNotice);
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Notice Title" }),
          /* @__PURE__ */ jsx(Input, { required: true, value: newNotice.title, onChange: (e) => setNewNotice({
            ...newNotice,
            title: e.target.value
          }), placeholder: "e.g. End Semester Practical Schedule Released", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Detailed Content" }),
          /* @__PURE__ */ jsx("textarea", { required: true, value: newNotice.content, onChange: (e) => setNewNotice({
            ...newNotice,
            content: e.target.value
          }), placeholder: "Provide all timings, links, and rules...", rows: 5, className: "w-full p-2.5 rounded bg-slate-950/40 border border-slate-850 text-slate-200 text-xs focus:outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Priority Level" }),
            /* @__PURE__ */ jsxs("select", { value: newNotice.priority, onChange: (e) => setNewNotice({
              ...newNotice,
              priority: e.target.value
            }), className: "w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none", children: [
              /* @__PURE__ */ jsx("option", { value: "high", children: "High (Red Alert)" }),
              /* @__PURE__ */ jsx("option", { value: "medium", children: "Medium" }),
              /* @__PURE__ */ jsx("option", { value: "low", children: "Low" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Broadcast Category" }),
            /* @__PURE__ */ jsxs("select", { value: newNotice.category, onChange: (e) => setNewNotice({
              ...newNotice,
              category: e.target.value
            }), className: "w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none", children: [
              /* @__PURE__ */ jsx("option", { value: "academic", children: "Academic" }),
              /* @__PURE__ */ jsx("option", { value: "event", children: "Event / Webinar" }),
              /* @__PURE__ */ jsx("option", { value: "placement", children: "Placement Cell" }),
              /* @__PURE__ */ jsx("option", { value: "general", children: "General" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: createMut.isPending, className: "flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs h-8", children: createMut.isPending ? "Broadcasting..." : "Broadcast Notice" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setCreateOpen(false), variant: "outline", className: "border-slate-800 text-slate-400 text-xs h-8", children: "Cancel" })
        ] })
      ] }) })
    ] }) })
  ] }) });
}
export {
  AnnouncementsPage as component
};
