import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search, Download, FileText, CheckCircle, Clock, AlertTriangle, Eye, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/notes-monitoring")({
  component: NotesMonitoring,
});

const MOCK_NOTES = [
  { id: "n1", title: "DBMS Unit 3 - Relational Algebra & Normalization", student: "Aditya Verma", dept: "CSE", semester: "6", subject: "Database Management Systems", pages: 14, date: "2026-07-22", status: "Analyzed", score: 92, aiSummary: "Covers 1NF to 3NF, BCNF decomposition, relational calculus, and query optimization." },
  { id: "n2", title: "Operating Systems - Memory Management & Paging", student: "Neha Sharma", dept: "MCA", semester: "2", subject: "Operating Systems", pages: 22, date: "2026-07-21", status: "Analyzed", score: 88, aiSummary: "Detailed virtual memory concepts, page replacement algorithms (LRU, FIFO, Optimal)." },
  { id: "n3", title: "Computer Networks - TCP/IP Protocol Suite", student: "Rohan Gupta", dept: "IT", semester: "4", subject: "Computer Networks", pages: 18, date: "2026-07-21", status: "Analyzed", score: 95, aiSummary: "Layered architecture, TCP 3-way handshake, congestion control, and subnetting." },
  { id: "n4", title: "Compiler Design - Lexical Analysis & Parsing", student: "Priya Patel", dept: "CSE", semester: "6", subject: "Compiler Design", pages: 11, date: "2026-07-20", status: "Flagged", score: 64, aiSummary: "Incomplete notes on LL(1) parsing tables. Missing panic-mode error recovery." },
  { id: "n5", title: "Software Engineering - Agile & Scrum Framework", student: "Kiran Rao", dept: "ISE", semester: "4", subject: "Software Engineering", pages: 16, date: "2026-07-19", status: "Analyzed", score: 90, aiSummary: "User stories, sprint planning, velocity tracking, and burndown chart metrics." },
  { id: "n6", title: "Data Structures - Graph Algorithms (Dijkstra, Prim)", student: "evana.joseph", dept: "MCA", semester: "2", subject: "Data Structures", pages: 25, date: "2026-07-18", status: "Analyzed", score: 96, aiSummary: "Shortest path algorithms, MST calculations, topological sorting, and BFS/DFS traversal." },
];

function NotesMonitoring() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selectedNote, setSelectedNote] = useState<any>(null);

  const filtered = MOCK_NOTES.filter((n) =>
    (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.student.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase())) &&
    (!deptFilter || n.dept === deptFilter)
  );

  return (
    <div className="space-y-5 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Notes Monitoring & AI Audit</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Review, audit, and analyze student-uploaded notes and AI processing results across departments.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Notes Uploaded", value: "1,248", color: "bg-blue-600" },
          { label: "AI Analyzed Notes", value: "1,192", color: "bg-emerald-500" },
          { label: "Quality Flagged", value: "14", color: "bg-amber-500" },
          { label: "Avg Quality Score", value: "89.4%", color: "bg-violet-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <BookOpen className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{s.value}</p>
              <p className="text-[10px] text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            placeholder="Search notes, student, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 w-72 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {["CSE", "MCA", "IT", "ISE", "ECE"].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Notes Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              {["Note Title", "Student", "Subject", "Pages", "Uploaded", "Quality Score", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((note) => (
              <tr key={note.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 text-xs max-w-xs truncate">{note.title}</td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{note.student} <span className="text-[10px] text-slate-400 font-mono">({note.dept})</span></td>
                <td className="px-4 py-3 text-xs text-slate-500">{note.subject}</td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">{note.pages} pages</td>
                <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">{note.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold ${note.score >= 85 ? "text-emerald-600" : note.score >= 70 ? "text-amber-600" : "text-red-600"}`}>
                    {note.score}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${note.status === "Analyzed" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950" : "bg-amber-50 text-amber-600 dark:bg-amber-950"}`}>
                    {note.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedNote(note)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{selectedNote.title}</h3>
              <button onClick={() => setSelectedNote(null)} className="p-1 rounded-md text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Uploaded By:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedNote.student} ({selectedNote.dept})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Subject:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedNote.subject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">AI Quality Score:</span>
                <span className="font-bold text-emerald-600">{selectedNote.score}%</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">AI Generated Summary</p>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedNote.aiSummary}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
