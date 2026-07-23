import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/roles")({
  component: RolesPermissions,
});

const ROLES = [
  { name: "Super Admin", key: "super_admin", color: "bg-red-600", description: "Full system access. Can manage admins, reset passwords, configure platform." },
  { name: "Admin", key: "admin", color: "bg-orange-500", description: "Manages students, announcements, reports, and monitoring." },
  { name: "Faculty", key: "faculty", color: "bg-violet-600", description: "Can view student progress, post announcements in their department." },
  { name: "Class Rep", key: "class_rep", color: "bg-blue-500", description: "Can post in class channels and view class-level analytics." },
  { name: "Student", key: "student", color: "bg-slate-500", description: "Access to all learning modules — notes, lab buddy, AI, etc." },
];

const MODULES = [
  "Dashboard", "AI Assistant", "Smart Notes",
  "Lab Helper", "Resume Builder",
  "CIA Reminder", "Attendance", "Community", "Profile",
  "Student Management", "User Management", "Announcements",
  "Reports", "Analytics", "Audit Logs", "System Settings",
];

// Default permission matrix
const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  super_admin: Object.fromEntries(MODULES.map((m) => [m, true])),
  admin: Object.fromEntries(MODULES.map((m) => [m, !["AI Assistant", "Smart Notes", "Lab Helper", "Resume Builder"].includes(m)])),
  faculty: Object.fromEntries(MODULES.map((m) => [m, ["Dashboard", "AI Assistant", "Smart Notes", "Attendance", "Community", "Profile", "Announcements"].includes(m)])),
  class_rep: Object.fromEntries(MODULES.map((m) => [m, ["Dashboard", "Community", "Announcements", "Profile"].includes(m)])),
  student: Object.fromEntries(MODULES.map((m) => [m, !["Student Management", "User Management", "Announcements", "Reports", "Analytics", "Audit Logs", "System Settings"].includes(m)])),
};

function RolesPermissions() {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [saved, setSaved] = useState(false);

  function toggle(role: string, module: string) {
    if (role === "super_admin") return; // immutable
    setPermissions((prev) => ({
      ...prev,
      [role]: { ...prev[role], [module]: !prev[role][module] },
    }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Roles & Permissions</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Control which roles can access which modules across the platform.</p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {ROLES.map((role) => (
          <div key={role.key} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-7 w-7 rounded-lg ${role.color} flex items-center justify-center`}>
                <Shield className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{role.name}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{role.description}</p>
            <div className="mt-3">
              <p className="text-[10px] font-bold text-slate-500">
                {Object.values(permissions[role.key] || {}).filter(Boolean).length} / {MODULES.length} permissions
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Permission matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Permission Matrix</p>
          <p className="text-[10px] text-slate-400">Super Admin permissions are immutable.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 w-40">Module</th>
                {ROLES.map((role) => (
                  <th key={role.key} className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`h-5 w-5 rounded-md ${role.color}`} />
                      <span>{role.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MODULES.map((module) => (
                <tr key={module} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200">{module}</td>
                  {ROLES.map((role) => {
                    const has = permissions[role.key]?.[module] ?? false;
                    const locked = role.key === "super_admin";
                    return (
                      <td key={role.key} className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => toggle(role.key, module)}
                          disabled={locked}
                          className={`h-6 w-6 rounded-md flex items-center justify-center mx-auto transition-all ${has ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"} ${locked ? "cursor-not-allowed opacity-80" : "hover:scale-110"}`}
                        >
                          {has ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-colors ${saved ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            {saved ? "✓ Saved!" : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}
