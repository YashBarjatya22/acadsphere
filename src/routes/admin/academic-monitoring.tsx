import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listStudents } from "@/lib/studentos.functions";
import { useState } from "react";
import { Eye, BookOpen, MessageSquare, Code, Volume2, FileText, Clock, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/academic-monitoring")({
  component: AcademicMonitoring,
});

// Generate realistic per-student engagement metrics
function mockEngagement(student: any) {
  return {
    notesUploaded: Math.floor(Math.random() * 12),
    notesViewed: Math.floor(Math.random() * 40) + 5,
    aiQueries: Math.floor(Math.random() * 80) + 10,
    labAttempts: Math.floor(Math.random() * 15),
    assignmentsDone: Math.floor(Math.random() * 10),
    studyHours: Math.floor(Math.random() * 40) + 10,
    weeklyActive: Math.floor(Math.random() * 5) + 1,
    completionPct: Math.floor(Math.random() * 50) + 40,
  };
}

function EngagementBar({ value, max = 100, color = "bg-blue-500" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{value}</span>
    </div>
  );
}

function AcademicMonitoring() {
  const listFn = useServerFn(listStudents);
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["adminStudentList"],
    queryFn: () => listFn({ data: {} }),
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"studyHours" | "aiQueries" | "notesUploaded" | "completionPct">("studyHours");

  const enriched = students.map((s: any) => ({ ...s, ...mockEngagement(s) }));
  const sorted = [...enriched].sort((a: any, b: any) => b[sortBy] - a[sortBy]);

  const totals = {
    totalNotes: enriched.reduce((acc: number, s: any) => acc + s.notesUploaded, 0),
    totalAI: enriched.reduce((acc: number, s: any) => acc + s.aiQueries, 0),
    totalHours: enriched.reduce((acc: number, s: any) => acc + s.studyHours, 0),
    avgCompletion: enriched.length > 0 ? Math.round(enriched.reduce((acc: number, s: any) => acc + s.completionPct, 0) / enriched.length) : 0,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Academic Monitoring</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Read-only view of all student academic engagement and platform usage.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Notes Uploaded", value: totals.totalNotes, icon: BookOpen, color: "bg-blue-600" },
          { label: "AI Queries", value: totals.totalAI, icon: MessageSquare, color: "bg-violet-600" },
          { label: "Study Hours", value: totals.totalHours, icon: Clock, color: "bg-emerald-500" },
          { label: "Avg Completion", value: `${totals.avgCompletion}%`, icon: TrendingUp, color: "bg-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{s.value}</p>
              <p className="text-[10px] text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sort by:</span>
        {([["studyHours", "Study Hours"], ["aiQueries", "AI Queries"], ["notesUploaded", "Notes"], ["completionPct", "Completion"]] as [typeof sortBy, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSortBy(k)}
            className={`text-[10px] font-semibold px-3 py-1.5 rounded-full transition-colors ${sortBy === k ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Student table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              {["Student", "Dept / Sem", "Study Hours", "AI Queries", "Notes Uploaded", "Assignments", "Completion", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.map((student: any) => (
              <>
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-[9px] font-bold">{student.name?.charAt(0)}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{student.department} · Sem {student.semester}</td>
                  <td className="px-4 py-3 w-32"><EngagementBar value={student.studyHours} max={80} color="bg-emerald-500" /></td>
                  <td className="px-4 py-3 w-32"><EngagementBar value={student.aiQueries} max={150} color="bg-violet-500" /></td>
                  <td className="px-4 py-3 w-32"><EngagementBar value={student.notesUploaded} max={20} color="bg-blue-500" /></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">
                    {student.assignmentsDone} done
                  </td>
                  <td className="px-4 py-3 w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${student.completionPct}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{student.completionPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setExpanded(expanded === student.id ? null : student.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {expanded === student.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
                {expanded === student.id && (
                  <tr key={`${student.id}-detail`}>
                    <td colSpan={8} className="px-4 pb-4 bg-slate-50 dark:bg-slate-800/30">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-3">
                        {[
                          { label: "Notes Viewed", value: student.notesViewed, icon: Eye },
                          { label: "Lab Attempts", value: student.labAttempts, icon: Code },
                          { label: "Assignments", value: student.assignmentsDone, icon: FileText },
                          { label: "Weekly Active Days", value: `${student.weeklyActive}/7`, icon: TrendingUp },
                        ].map((item) => (
                          <div key={item.label} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
                            <item.icon className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                            <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{item.value}</p>
                            <p className="text-[9px] text-slate-400">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <Eye className="h-6 w-6 mb-2 opacity-40" />
            <p className="text-xs">No student data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
