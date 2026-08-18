import { jsxs, jsx } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-CQTokSDO.js";
import { d as listAuditLogs } from "./admin.functions-CDEPKrTd.js";
import { Download, RefreshCw, Search, CheckCircle2 } from "lucide-react";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { useState } from "react";
import { toast } from "sonner";
import "@tanstack/react-router";
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
import "./admin-middleware-CM2QETWH.js";
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
function AdminAuditLogsPage() {
  const auditFn = useServerFn(listAuditLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const {
    data: logs = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["adminAuditLogs"],
    queryFn: () => auditFn()
  });
  const filtered = logs.filter((log) => {
    const matchSearch = (log.actor_email || "").toLowerCase().includes(search.toLowerCase()) || (log.action || "").toLowerCase().includes(search.toLowerCase()) || (log.target || "").toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || log.action === actionFilter;
    return matchSearch && matchAction;
  });
  function exportAuditCSV() {
    const header = ["Timestamp", "Admin Actor", "Action", "Target", "Status", "Details"];
    const rows = filtered.map((l) => [new Date(l.created_at || Date.now()).toLocaleString(), l.actor_email || "system_admin", l.action, l.target || "—", l.status || "success", l.details || "—"]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log history exported to CSV!");
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-white tracking-tight", children: "Administrative Security Audit Trail" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Immutable log of system modifications, student record updates, role changes, password resets, and announcements." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: exportAuditCSV, variant: "outline", className: "h-9 text-xs gap-1.5 bg-slate-900 border-slate-700 text-slate-200", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
          " Export Audit CSV"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => refetch(), className: "h-9 text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}` }),
          " Refresh"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-[#0e1629] border border-slate-800 p-4 rounded-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2.5 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search audit trail by admin, action, or target...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-9 text-xs bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: actionFilter, onChange: (e) => setActionFilter(e.target.value), className: "h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Action Types" }),
          /* @__PURE__ */ jsx("option", { value: "ROLE_CHANGED", children: "ROLE_CHANGED" }),
          /* @__PURE__ */ jsx("option", { value: "USER_SUSPENDED", children: "USER_SUSPENDED" }),
          /* @__PURE__ */ jsx("option", { value: "USER_ACTIVATED", children: "USER_ACTIVATED" }),
          /* @__PURE__ */ jsx("option", { value: "USER_DELETED", children: "USER_DELETED" }),
          /* @__PURE__ */ jsx("option", { value: "ANNOUNCEMENT_CREATED", children: "ANNOUNCEMENT_CREATED" }),
          /* @__PURE__ */ jsx("option", { value: "ANNOUNCEMENT_DELETED", children: "ANNOUNCEMENT_DELETED" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-mono text-slate-400", children: [
        "Entries: ",
        /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: filtered.length })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl shadow-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs font-mono", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-800 bg-slate-900/80 text-slate-400 font-black uppercase text-[9.5px] tracking-wider", children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left font-sans", children: "Timestamp" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left font-sans", children: "Admin Actor" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left font-sans", children: "Action Event" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left font-sans", children: "Target Entity" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left font-sans", children: "Audit Details" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-right font-sans", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-800/80", children: filtered.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "text-center py-8 text-slate-500 font-sans", children: "No audit log entries matching criteria." }) }) : filtered.map((log) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-900/60 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 text-slate-400 text-[11px]", children: new Date(log.created_at || Date.now()).toLocaleString("en-IN") }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 font-bold text-slate-200", children: log.actor_email || "system_admin" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5", children: /* @__PURE__ */ jsx("span", { className: "bg-slate-800 text-blue-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold", children: log.action }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 text-slate-300", children: log.target || "—" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 text-slate-400 max-w-xs truncate", children: log.details || "—" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 text-right", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5" }),
          " ",
          log.status || "success"
        ] }) })
      ] }, log.id)) })
    ] }) }) })
  ] });
}
export {
  AdminAuditLogsPage as component
};
