import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { CheckCircle2, FileText, FileSpreadsheet, Download } from "lucide-react";
import { toast } from "sonner";
const REPORT_TEMPLATES = [{
  id: "rep-1",
  title: "Comprehensive Student Activity Report",
  description: "Detailed log of active study sessions, page views, and engagement duration per USN.",
  category: "Activity",
  lastGenerated: "Today 8:00 AM",
  fileSize: "2.4 MB"
}, {
  id: "rep-2",
  title: "Institutional Login & Session Statistics",
  description: "Login frequencies, active IP range logs, peak usage hours, and session timeouts.",
  category: "Logins",
  lastGenerated: "Today 6:00 AM",
  fileSize: "1.8 MB"
}, {
  id: "rep-3",
  title: "Platform & Module Usage Breakdown",
  description: "Usage metrics distribution across AI Assistant, Classroom, Resume Tailorer, and Attendance.",
  category: "Activity",
  lastGenerated: "Yesterday",
  fileSize: "3.1 MB"
}, {
  id: "rep-4",
  title: "AI Assistant & Learning Tool Metrics",
  description: "Total AI query counts, prompt tokens, code compilations, and learning module engagement.",
  category: "AI",
  lastGenerated: "Yesterday",
  fileSize: "1.2 MB"
}, {
  id: "rep-5",
  title: "Department-wise Performance Audit",
  description: "Comparative analysis of CSE, ECE, ISE, MECH, CIVIL, and MCA headcount & engagement.",
  category: "Performance",
  lastGenerated: "2 days ago",
  fileSize: "4.5 MB"
}, {
  id: "rep-6",
  title: "Semester-wise CGPA & Attendance Summary",
  description: "Academic standing, average CGPA score, and attendance compliance breakdown for Semesters 1 to 8.",
  category: "Performance",
  lastGenerated: "3 days ago",
  fileSize: "2.9 MB"
}];
function AdminReportsPage() {
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedSem, setSelectedSem] = useState("All Semesters");
  function downloadReport(title, format) {
    toast.loading(`Generating ${title} (${format})...`, {
      duration: 1500
    });
    setTimeout(() => {
      const content = `AcadSphere ERP Official Report: ${title}
Generated on: ${(/* @__PURE__ */ new Date()).toLocaleString()}
Scope: ${selectedDept} | ${selectedSem}
Format: ${format}
Status: Certified Valid
`;
      const blob = new Blob([content], {
        type: format === "PDF" ? "application/pdf" : "text/csv"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/ /g, "_")}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${title} exported as ${format}!`);
    }, 1500);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] via-[#101b38] to-[#0e172e] p-5 rounded-2xl border border-slate-800 shadow-xl", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-white tracking-tight", children: "Institutional Report Generator Studio" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Generate and export official administrative reports for student engagement, login security, AI usage, department metrics, and academic performance." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-[#0e1629] border border-slate-800 p-4 rounded-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Department Scope" }),
          /* @__PURE__ */ jsxs("select", { value: selectedDept, onChange: (e) => setSelectedDept(e.target.value), className: "h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500", children: [
            /* @__PURE__ */ jsx("option", { value: "All Departments", children: "All Departments" }),
            /* @__PURE__ */ jsx("option", { value: "CSE", children: "CSE (Computer Science)" }),
            /* @__PURE__ */ jsx("option", { value: "ECE", children: "ECE (Electronics)" }),
            /* @__PURE__ */ jsx("option", { value: "ISE", children: "ISE (Information Science)" }),
            /* @__PURE__ */ jsx("option", { value: "MECH", children: "MECH (Mechanical)" }),
            /* @__PURE__ */ jsx("option", { value: "CIVIL", children: "CIVIL (Civil Engineering)" }),
            /* @__PURE__ */ jsx("option", { value: "MCA", children: "MCA (Master of Computer Apps)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Semester Scope" }),
          /* @__PURE__ */ jsxs("select", { value: selectedSem, onChange: (e) => setSelectedSem(e.target.value), className: "h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500", children: [
            /* @__PURE__ */ jsx("option", { value: "All Semesters", children: "All Semesters" }),
            ["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => /* @__PURE__ */ jsxs("option", { value: `Semester ${s}`, children: [
              "Semester ",
              s
            ] }, s))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
        " PDF, CSV & Excel Ready"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: REPORT_TEMPLATES.map((rep) => /* @__PURE__ */ jsxs("div", { className: "bg-[#0e1629] border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30", children: rep.category }),
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-500 font-mono", children: [
            "Last Generated: ",
            rep.lastGenerated
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-white mt-2", children: rep.title }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1 leading-relaxed", children: rep.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-slate-800/80 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-500 font-mono", children: [
          "Est. Size: ",
          rep.fileSize
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => downloadReport(rep.title, "PDF"), className: "px-2.5 py-1 text-[10.5px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg border border-rose-500/20 transition-all flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3" }),
            " PDF"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => downloadReport(rep.title, "CSV"), className: "px-2.5 py-1 text-[10.5px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg border border-emerald-500/20 transition-all flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-3 w-3" }),
            " CSV"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => downloadReport(rep.title, "EXCEL"), className: "px-2.5 py-1 text-[10.5px] font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg border border-blue-500/20 transition-all flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
            " Excel"
          ] })
        ] })
      ] })
    ] }, rep.id)) })
  ] });
}
export {
  AdminReportsPage as component
};
