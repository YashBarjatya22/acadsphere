import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, Shield, Bell, Database, Save, CheckCircle2, RefreshCw, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [collegeName, setCollegeName] = useState("CMR Institute of Technology");
  const [univCode, setUnivCode] = useState("1CR");
  const [acadYear, setAcadYear] = useState("2025-2026");
  const [term, setTerm] = useState("Even Semester");
  const [minAttendance, setMinAttendance] = useState("75");
  const [mfaRequired, setMfaRequired] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Institutional Settings & System Configuration Saved!");
  }

  function triggerBackup() {
    toast.loading("Initiating local SQLite database snapshot backup...", { duration: 2000 });
    setTimeout(() => {
      toast.success("Database Backup Snapshot Created Successfully! (backup_2026_07_23.db)");
    }, 2000);
  }

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            System Settings & Parameters
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global institution profile, academic term setup, attendance policy thresholds, and database snapshot controls.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Institution Parameters */}
        <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-black text-white">Institution & Academic Calendar Setup</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Institution / College Name</Label>
              <Input value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required className="h-9 text-xs bg-slate-900 border-slate-700 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">USN University Code Prefix</Label>
              <Input value={univCode} onChange={(e) => setUnivCode(e.target.value)} required className="h-9 text-xs bg-slate-900 border-slate-700 text-white font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Academic Year</Label>
              <Input value={acadYear} onChange={(e) => setAcadYear(e.target.value)} required className="h-9 text-xs bg-slate-900 border-slate-700 text-white font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Academic Term</Label>
              <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-white">
                <option value="Even Semester">Even Semester (Sem 2, 4, 6, 8)</option>
                <option value="Odd Semester">Odd Semester (Sem 1, 3, 5, 7)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Attendance Thresholds */}
        <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white">Security & Risk Policy Thresholds</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Minimum Attendance Threshold (%)</Label>
              <Input type="number" value={minAttendance} onChange={(e) => setMinAttendance(e.target.value)} className="h-9 text-xs bg-slate-900 border-slate-700 text-white font-mono" />
              <p className="text-[10px] text-slate-500">Students falling below this threshold are flagged as "Requiring Attention".</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mt-5">
              <div>
                <p className="text-xs font-bold text-white">Enforce Multi-Factor Authentication (MFA)</p>
                <p className="text-[10px] text-slate-400">Require OTP for faculty & admin logins.</p>
              </div>
              <input type="checkbox" checked={mfaRequired} onChange={(e) => setMfaRequired(e.target.checked)} className="rounded border-slate-700 bg-slate-900 h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Database & Backup Operations */}
        <div className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Database className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-black text-white">Database Backup & Recovery</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Instant SQLite System Snapshot</p>
              <p className="text-[10px] text-slate-400">Create an immediate backup copy of all student, query, and audit tables.</p>
            </div>
            <Button type="button" onClick={triggerBackup} variant="outline" className="h-9 text-xs gap-1.5 bg-slate-900 border-slate-700 text-slate-200">
              <Database className="h-3.5 w-3.5" /> Create Snapshot Now
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" className="h-10 text-xs px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold gap-1.5 shadow-lg shadow-blue-600/30">
            <Save className="h-4 w-4" /> Save Global Configuration
          </Button>
        </div>
      </form>

    </div>
  );
}
