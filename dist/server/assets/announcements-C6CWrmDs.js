import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-B5NaTOOc.js";
import { e as listAdminAnnouncements, f as createAdminAnnouncement, h as deleteAdminAnnouncement } from "./admin.functions-Ci8otzb5.js";
import { Megaphone, Loader2, Send, Trash2, FileText, Download } from "lucide-react";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-Cwsrt9M1.js";
import { toast } from "sonner";
import "@tanstack/react-router";
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
import "./admin-middleware-x1X5UcOZ.js";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const DEPARTMENTS = ["Entire College", "CSE", "ECE", "ISE", "MECH", "CIVIL", "MCA", "MBA"];
function AdminAnnouncementsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAdminAnnouncements);
  const createFn = useServerFn(createAdminAnnouncement);
  const deleteFn = useServerFn(deleteAdminAnnouncement);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetDept, setTargetDept] = useState("Entire College");
  const {
    data: announcements = [],
    isLoading
  } = useQuery({
    queryKey: ["adminAnnouncements"],
    queryFn: () => listFn()
  });
  const createMut = useMutation({
    mutationFn: (data) => createFn({
      data
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["adminAnnouncements"]
      });
      setTitle("");
      setBody("");
      toast.success("Institutional Notice Published!");
    },
    onError: (e) => toast.error(e.message || "Failed to post notice")
  });
  const deleteMut = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["adminAnnouncements"]
      });
      toast.success("Notice deleted");
    }
  });
  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !body) return toast.error("Please fill in title and notice text");
    createMut.mutate({
      title,
      body,
      audience: "all",
      targetDept
    });
  }
  function downloadReport(type) {
    toast.success(`Generating official ${type} institutional report...`);
    setTimeout(() => {
      const blob = new Blob([`AcadSphere Official ${type} Report
Generated: ${(/* @__PURE__ */ new Date()).toLocaleString()}
`], {
        type: "text/plain"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Acadsphere_Report.${type.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} Report Downloaded!`);
    }, 1e3);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-7xl mx-auto font-sans", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-500", children: "Institutional Notices & Reports" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight mt-0.5", children: "Notice Board & Export Reports" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 dark:text-zinc-400 mt-1", children: "Broadcast official circulars to students and export downloadable department records." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2 border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-stone-100 dark:border-zinc-800", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Megaphone, { className: "h-4 w-4 text-stone-700 dark:text-zinc-300" }),
            " Post New Circular"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-stone-500 dark:text-zinc-400", children: "Post notices visible on student dashboards" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "col-span-2 space-y-1", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Notice Title" }),
                /* @__PURE__ */ jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), required: true, placeholder: "e.g. Internal Exam-2 Timetable Released", className: "h-9 text-xs border-stone-200 dark:border-zinc-800" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Target Department" }),
                /* @__PURE__ */ jsx("select", { value: targetDept, onChange: (e) => setTargetDept(e.target.value), className: "w-full h-9 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs focus:outline-none", children: DEPARTMENTS.map((d) => /* @__PURE__ */ jsx("option", { value: d, children: d }, d)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Notice Content" }),
              /* @__PURE__ */ jsx("textarea", { value: body, onChange: (e) => setBody(e.target.value), required: true, rows: 4, className: "w-full rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs focus:outline-none", placeholder: "Enter circular description, instructions, or exam rules..." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: createMut.isPending, className: "h-9 text-xs font-bold gap-1.5 bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900", children: createMut.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
              " Publish Circular"
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 pt-6 border-t border-stone-100 dark:border-zinc-800 space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Published Circulars" }),
            announcements.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-400 dark:text-zinc-500", children: "No active circulars posted yet." }) : announcements.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-800", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-stone-900 dark:text-zinc-100", children: a.title }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-200", children: a.targetDept || "Entire College" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 dark:text-zinc-400 mt-1", children: a.body })
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: () => deleteMut.mutate(a.id), className: "p-1 rounded-lg text-stone-400 hover:text-red-600", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, a.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl h-fit", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-stone-100 dark:border-zinc-800", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-stone-700 dark:text-zinc-300" }),
            " Export Reports"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-stone-500 dark:text-zinc-400", children: "Generate certified institutional documents" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-4 space-y-3", children: [{
          title: "Student Enrolment Summary",
          format: "PDF"
        }, {
          title: "Attendance & Risk Records",
          format: "CSV"
        }, {
          title: "Academic Performance Breakdown",
          format: "Excel"
        }].map((rep) => /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-800 space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-stone-900 dark:text-zinc-100", children: rep.title }),
          /* @__PURE__ */ jsxs(Button, { onClick: () => downloadReport(rep.format), variant: "outline", className: "w-full h-8 text-xs font-bold gap-1.5 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
            " Download ",
            rep.format,
            " Report"
          ] })
        ] }, rep.title)) })
      ] })
    ] })
  ] });
}
export {
  AdminAnnouncementsPage as component
};
