import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAuditLogs } from "@/lib/admin.functions";
import { ScrollText, RefreshCw, CheckCircle2, AlertTriangle, Shield, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AdminAuditLogsPage,
});

function AdminAuditLogsPage() {
  const auditFn = useServerFn(listAuditLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["adminAuditLogs"],
    queryFn: () => auditFn(),
  });

  const filtered = logs.filter((log: any) => {
    const matchSearch =
      (log.actor_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.target || "").toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  function exportAuditCSV() {
    const header = ["Timestamp", "Admin Actor", "Action", "Target", "Status", "Details"];
    const rows = filtered.map((l: any) => [
      new Date(l.created_at || Date.now()).toLocaleString(),
      l.actor_email || "system_admin",
      l.action,
      l.target || "—",
      l.status || "success",
      l.details || "—"
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit_logs.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log history exported to CSV!");
  }

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            Administrative Security Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of system modifications, student record updates, role changes, password resets, and announcements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportAuditCSV} variant="outline" className="h-9 text-xs gap-1.5 bg-slate-900 border-slate-700 text-slate-200">
            <Download className="h-3.5 w-3.5" /> Export Audit CSV
          </Button>
          <Button onClick={() => refetch()} className="h-9 text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-[#0e1629] border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-wrap gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search audit trail by admin, action, or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Action Types</option>
            <option value="ROLE_CHANGED">ROLE_CHANGED</option>
            <option value="USER_SUSPENDED">USER_SUSPENDED</option>
            <option value="USER_ACTIVATED">USER_ACTIVATED</option>
            <option value="USER_DELETED">USER_DELETED</option>
            <option value="ANNOUNCEMENT_CREATED">ANNOUNCEMENT_CREATED</option>
            <option value="ANNOUNCEMENT_DELETED">ANNOUNCEMENT_DELETED</option>
          </select>
        </div>
        <p className="text-[11px] font-mono text-slate-400">
          Entries: <span className="text-white font-bold">{filtered.length}</span>
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0e1629] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-black uppercase text-[9.5px] tracking-wider">
                <th className="px-4 py-3.5 text-left font-sans">Timestamp</th>
                <th className="px-4 py-3.5 text-left font-sans">Admin Actor</th>
                <th className="px-4 py-3.5 text-left font-sans">Action Event</th>
                <th className="px-4 py-3.5 text-left font-sans">Target Entity</th>
                <th className="px-4 py-3.5 text-left font-sans">Audit Details</th>
                <th className="px-4 py-3.5 text-right font-sans">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-sans">No audit log entries matching criteria.</td>
                </tr>
              ) : (
                filtered.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {new Date(log.created_at || Date.now()).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-200">{log.actor_email || "system_admin"}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-800 text-blue-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{log.target || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">{log.details || "—"}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-2.5 w-2.5" /> {log.status || "success"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
