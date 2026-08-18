import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-CQTokSDO.js";
import { l as listAllUsers, a as adminUpdateUserRole, b as adminSetUserStatus, c as adminDeleteUser } from "./admin.functions-CDEPKrTd.js";
import { Shield, Search, Loader2, UserCheck, Ban, Trash2 } from "lucide-react";
import { I as Input } from "./input-poeoKceV.js";
import { toast } from "sonner";
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
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function AdminUsersPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAllUsers);
  const updateRoleFn = useServerFn(adminUpdateUserRole);
  const setStatusFn = useServerFn(adminSetUserStatus);
  const deleteFn = useServerFn(adminDeleteUser);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const {
    data: users = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => listFn()
  });
  const updateRoleMut = useMutation({
    mutationFn: (data) => updateRoleFn({
      data
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["adminUsers"]
      });
      toast.success("Role updated successfully!");
    },
    onError: (e) => toast.error(e.message || "Failed to update role")
  });
  const setStatusMut = useMutation({
    mutationFn: (data) => setStatusFn({
      data
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["adminUsers"]
      });
      toast.success("Account status updated!");
    },
    onError: (e) => toast.error(e.message || "Failed to update status")
  });
  const deleteMut = useMutation({
    mutationFn: (userId) => deleteFn({
      data: {
        userId
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["adminUsers"]
      });
      toast.success("User account deleted");
    },
    onError: (e) => toast.error(e.message || "Failed to delete user")
  });
  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-white tracking-tight", children: "User & Role Management Directory" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Manage institutional user accounts across Students, Faculty, Class Representatives (CRs), and System Administrators." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/roles", className: "h-9 text-xs gap-1.5 bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 rounded-xl px-3.5 flex items-center font-semibold", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5" }),
        " Permission Matrix"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-[#0e1629] border border-slate-800 p-4 rounded-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2.5 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search user by name or email address...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-9 text-xs bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), className: "h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Roles" }),
          /* @__PURE__ */ jsx("option", { value: "student", children: "Students" }),
          /* @__PURE__ */ jsx("option", { value: "faculty", children: "Faculty / Professors" }),
          /* @__PURE__ */ jsx("option", { value: "admin", children: "System Administrators" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-mono text-slate-400", children: [
        "Showing ",
        /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: filtered.length }),
        " users"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl shadow-xl overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center h-48 text-slate-400 text-xs", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin mr-2" }),
      " Loading user directory..."
    ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-800 bg-slate-900/80 text-slate-400 font-black uppercase text-[9.5px] tracking-wider", children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left", children: "User Profile" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left", children: "Email Address" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left", children: "Assigned Role" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left", children: "Account Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-left", children: "Created At" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3.5 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-800/80", children: filtered.map((u) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-900/60 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0", children: u.name?.charAt(0)?.toUpperCase() }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-white text-xs", children: u.name })
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 font-mono text-slate-300", children: u.email }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5", children: /* @__PURE__ */ jsxs("select", { value: u.role, onChange: (e) => updateRoleMut.mutate({
          userId: u.id,
          role: e.target.value
        }), className: "h-7 rounded border border-slate-700 bg-slate-900 px-2 text-[11px] text-white font-bold uppercase focus:outline-none", children: [
          /* @__PURE__ */ jsx("option", { value: "student", children: "Student" }),
          /* @__PURE__ */ jsx("option", { value: "faculty", children: "Faculty" }),
          /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" })
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5", children: u.status === "suspended" ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30", children: "Suspended" }) : /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", children: "Active" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 font-mono text-slate-400 text-[11px]", children: new Date(u.createdAt || Date.now()).toLocaleDateString("en-IN") }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setStatusMut.mutate({
            userId: u.id,
            status: u.status === "suspended" ? "active" : "suspended"
          }), className: `p-1.5 rounded-lg border border-transparent transition-colors ${u.status === "suspended" ? "text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20" : "text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20"}`, title: u.status === "suspended" ? "Activate User" : "Suspend User", children: u.status === "suspended" ? /* @__PURE__ */ jsx(UserCheck, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Ban, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => deleteMut.mutate(u.id), className: "p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors", title: "Delete User Account", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) })
      ] }, u.id)) })
    ] }) }) })
  ] });
}
export {
  AdminUsersPage as component
};
