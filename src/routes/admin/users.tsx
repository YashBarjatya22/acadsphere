import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAllUsers, adminUpdateUserRole, adminSetUserStatus, adminDeleteUser } from "@/lib/admin.functions";
import {
  UserCog, Shield, Search, Plus, Trash2, Edit, CheckCircle2,
  AlertTriangle, Lock, Key, Ban, UserCheck, RefreshCw, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAllUsers);
  const updateRoleFn = useServerFn(adminUpdateUserRole);
  const setStatusFn = useServerFn(adminSetUserStatus);
  const deleteFn = useServerFn(adminDeleteUser);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => listFn(),
  });

  const updateRoleMut = useMutation({
    mutationFn: (data: { userId: string; role: any }) => updateRoleFn({ data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminUsers"] }); toast.success("Role updated successfully!"); },
    onError: (e: any) => toast.error(e.message || "Failed to update role"),
  });

  const setStatusMut = useMutation({
    mutationFn: (data: { userId: string; status: any }) => setStatusFn({ data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminUsers"] }); toast.success("Account status updated!"); },
    onError: (e: any) => toast.error(e.message || "Failed to update status"),
  });

  const deleteMut = useMutation({
    mutationFn: (userId: string) => deleteFn({ data: { userId } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminUsers"] }); toast.success("User account deleted"); },
    onError: (e: any) => toast.error(e.message || "Failed to delete user"),
  });

  const filtered = users.filter((u: any) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            User & Role Management Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage institutional user accounts across Students, Faculty, Class Representatives (CRs), and System Administrators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/roles"
            className="h-9 text-xs gap-1.5 bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 rounded-xl px-3.5 flex items-center font-semibold"
          >
            <Shield className="h-3.5 w-3.5" /> Permission Matrix
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-[#0e1629] border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-wrap gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search user by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty / Professors</option>
            <option value="admin">System Administrators</option>
          </select>
        </div>
        <p className="text-[11px] font-mono text-slate-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> users
        </p>
      </div>

      {/* User Management Table */}
      <div className="bg-[#0e1629] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading user directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-black uppercase text-[9.5px] tracking-wider">
                  <th className="px-4 py-3.5 text-left">User Profile</th>
                  <th className="px-4 py-3.5 text-left">Email Address</th>
                  <th className="px-4 py-3.5 text-left">Assigned Role</th>
                  <th className="px-4 py-3.5 text-left">Account Status</th>
                  <th className="px-4 py-3.5 text-left">Created At</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <p className="font-bold text-white text-xs">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => updateRoleMut.mutate({ userId: u.id, role: e.target.value })}
                        className="h-7 rounded border border-slate-700 bg-slate-900 px-2 text-[11px] text-white font-bold uppercase focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.status === "suspended" ? (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setStatusMut.mutate({ userId: u.id, status: u.status === "suspended" ? "active" : "suspended" })}
                          className={`p-1.5 rounded-lg border border-transparent transition-colors ${u.status === "suspended" ? "text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20" : "text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20"}`}
                          title={u.status === "suspended" ? "Activate User" : "Suspend User"}
                        >
                          {u.status === "suspended" ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => deleteMut.mutate(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
