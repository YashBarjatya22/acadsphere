import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText, Download, Filter, Calendar, CheckCircle2,
  FileSpreadsheet, FileCode, Printer, RefreshCw, BarChart2, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReportsPage,
});

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: "Activity" | "Performance" | "Logins" | "AI";
  lastGenerated: string;
  fileSize: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: "rep-1", title: "Comprehensive Student Activity Report", description: "Detailed log of active study sessions, page views, and engagement duration per USN.", category: "Activity", lastGenerated: "Today 8:00 AM", fileSize: "2.4 MB" },
  { id: "rep-2", title: "Institutional Login & Session Statistics", description: "Login frequencies, active IP range logs, peak usage hours, and session timeouts.", category: "Logins", lastGenerated: "Today 6:00 AM", fileSize: "1.8 MB" },
  { id: "rep-3", title: "Platform & Module Usage Breakdown", description: "Usage metrics distribution across Smart Notes, AI Assistant, Resume Builder, and Lab Helper.", category: "Activity", lastGenerated: "Yesterday", fileSize: "3.1 MB" },
  { id: "rep-4", title: "AI Assistant & Learning Tool Metrics", description: "Total AI query counts, prompt tokens, code compilations, and learning module engagement.", category: "AI", lastGenerated: "Yesterday", fileSize: "1.2 MB" },
  { id: "rep-5", title: "Department-wise Performance Audit", description: "Comparative analysis of CSE, ECE, ISE, MECH, CIVIL, and MCA headcount & engagement.", category: "Performance", lastGenerated: "2 days ago", fileSize: "4.5 MB" },
  { id: "rep-6", title: "Semester-wise CGPA & Attendance Summary", description: "Academic standing, average CGPA score, and attendance compliance breakdown for Semesters 1 to 8.", category: "Performance", lastGenerated: "3 days ago", fileSize: "2.9 MB" },
];

function AdminReportsPage() {
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedSem, setSelectedSem] = useState("All Semesters");

  function downloadReport(title: string, format: "PDF" | "CSV" | "EXCEL") {
    toast.loading(`Generating ${title} (${format})...`, { duration: 1500 });
    setTimeout(() => {
      // Simulate file download
      const content = `AcadSphere ERP Official Report: ${title}\nGenerated on: ${new Date().toLocaleString()}\nScope: ${selectedDept} | ${selectedSem}\nFormat: ${format}\nStatus: Certified Valid\n`;
      const blob = new Blob([content], { type: format === "PDF" ? "application/pdf" : "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/ /g, "_")}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${title} exported as ${format}!`);
    }, 1500);
  }

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            Institutional Report Generator Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export official administrative reports for student engagement, login security, AI usage, department metrics, and academic performance.
          </p>
        </div>
      </div>

      {/* Report Generation Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-[#0e1629] border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Department Scope</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All Departments">All Departments</option>
              <option value="CSE">CSE (Computer Science)</option>
              <option value="ECE">ECE (Electronics)</option>
              <option value="ISE">ISE (Information Science)</option>
              <option value="MECH">MECH (Mechanical)</option>
              <option value="CIVIL">CIVIL (Civil Engineering)</option>
              <option value="MCA">MCA (Master of Computer Apps)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Semester Scope</label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All Semesters">All Semesters</option>
              {["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => (
                <option key={s} value={`Semester ${s}`}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> PDF, CSV & Excel Ready
        </span>
      </div>

      {/* Report Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TEMPLATES.map((rep) => (
          <div key={rep.id} className="bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {rep.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Last Generated: {rep.lastGenerated}</span>
              </div>
              <h3 className="text-sm font-black text-white mt-2">{rep.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rep.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Est. Size: {rep.fileSize}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => downloadReport(rep.title, "PDF")}
                  className="px-2.5 py-1 text-[10.5px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg border border-rose-500/20 transition-all flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" /> PDF
                </button>
                <button
                  onClick={() => downloadReport(rep.title, "CSV")}
                  className="px-2.5 py-1 text-[10.5px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg border border-emerald-500/20 transition-all flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-3 w-3" /> CSV
                </button>
                <button
                  onClick={() => downloadReport(rep.title, "EXCEL")}
                  className="px-2.5 py-1 text-[10.5px] font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg border border-blue-500/20 transition-all flex items-center gap-1"
                >
                  <Download className="h-3 w-3" /> Excel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
