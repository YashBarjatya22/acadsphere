import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Shield, Check, X } from "lucide-react";
const ROLES = [{
  name: "Super Admin",
  key: "super_admin",
  color: "bg-red-600",
  description: "Full system access. Can manage admins, reset passwords, configure platform."
}, {
  name: "Admin",
  key: "admin",
  color: "bg-orange-500",
  description: "Manages students, announcements, reports, and monitoring."
}, {
  name: "Faculty",
  key: "faculty",
  color: "bg-violet-600",
  description: "Can view student progress, post announcements in their department."
}, {
  name: "Class Rep",
  key: "class_rep",
  color: "bg-blue-500",
  description: "Can post in class channels and view class-level analytics."
}, {
  name: "Student",
  key: "student",
  color: "bg-slate-500",
  description: "Access to all learning modules — notes, lab buddy, AI, etc."
}];
const MODULES = ["Dashboard", "AI Assistant", "Classroom", "Resume Tailorer", "Attendance", "Community", "Profile", "Student Management", "User Management", "Announcements", "Reports", "Analytics", "Audit Logs", "System Settings"];
const DEFAULT_PERMISSIONS = {
  super_admin: Object.fromEntries(MODULES.map((m) => [m, true])),
  admin: Object.fromEntries(MODULES.map((m) => [m, !["AI Assistant", "Resume Tailorer"].includes(m)])),
  faculty: Object.fromEntries(MODULES.map((m) => [m, ["Dashboard", "AI Assistant", "Classroom", "Attendance", "Community", "Profile", "Announcements"].includes(m)])),
  class_rep: Object.fromEntries(MODULES.map((m) => [m, ["Dashboard", "Community", "Announcements", "Profile"].includes(m)])),
  student: Object.fromEntries(MODULES.map((m) => [m, !["Student Management", "User Management", "Announcements", "Reports", "Analytics", "Audit Logs", "System Settings"].includes(m)]))
};
function RolesPermissions() {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [saved, setSaved] = useState(false);
  function toggle(role, module) {
    if (role === "super_admin") return;
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module]
      }
    }));
  }
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2e3);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-extrabold text-slate-800 dark:text-slate-100", children: "Roles & Permissions" }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 mt-0.5", children: "Control which roles can access which modules across the platform." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-3", children: ROLES.map((role) => /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: `h-7 w-7 rounded-lg ${role.color} flex items-center justify-center`, children: /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-800 dark:text-slate-100", children: role.name })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 leading-relaxed", children: role.description }),
      /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-slate-500", children: [
        Object.values(permissions[role.key] || {}).filter(Boolean).length,
        " / ",
        MODULES.length,
        " permissions"
      ] }) })
    ] }, role.key)) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-700 dark:text-slate-200", children: "Permission Matrix" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400", children: "Super Admin permissions are immutable." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 w-40", children: "Module" }),
          ROLES.map((role) => /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsx("div", { className: `h-5 w-5 rounded-md ${role.color}` }),
            /* @__PURE__ */ jsx("span", { children: role.name })
          ] }) }, role.key))
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-800", children: MODULES.map((module) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200", children: module }),
          ROLES.map((role) => {
            const has = permissions[role.key]?.[module] ?? false;
            const locked = role.key === "super_admin";
            return /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-center", children: /* @__PURE__ */ jsx("button", { onClick: () => toggle(role.key, module), disabled: locked, className: `h-6 w-6 rounded-md flex items-center justify-center mx-auto transition-all ${has ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"} ${locked ? "cursor-not-allowed opacity-80" : "hover:scale-110"}`, children: has ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) }) }, role.key);
          })
        ] }, module)) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end", children: /* @__PURE__ */ jsx("button", { onClick: handleSave, className: `px-6 py-2 rounded-lg text-xs font-bold transition-colors ${saved ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`, children: saved ? "✓ Saved!" : "Save Permissions" }) })
    ] })
  ] });
}
export {
  RolesPermissions as component
};
