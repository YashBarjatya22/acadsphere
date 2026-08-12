import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { BookOpen, Search, Eye } from "lucide-react";
const MOCK_NOTES = [{
  id: "n1",
  title: "DBMS Unit 3 - Relational Algebra & Normalization",
  student: "Aditya Verma",
  dept: "CSE",
  semester: "6",
  subject: "Database Management Systems",
  pages: 14,
  date: "2026-07-22",
  status: "Analyzed",
  score: 92,
  aiSummary: "Covers 1NF to 3NF, BCNF decomposition, relational calculus, and query optimization."
}, {
  id: "n2",
  title: "Operating Systems - Memory Management & Paging",
  student: "Neha Sharma",
  dept: "MCA",
  semester: "2",
  subject: "Operating Systems",
  pages: 22,
  date: "2026-07-21",
  status: "Analyzed",
  score: 88,
  aiSummary: "Detailed virtual memory concepts, page replacement algorithms (LRU, FIFO, Optimal)."
}, {
  id: "n3",
  title: "Computer Networks - TCP/IP Protocol Suite",
  student: "Rohan Gupta",
  dept: "IT",
  semester: "4",
  subject: "Computer Networks",
  pages: 18,
  date: "2026-07-21",
  status: "Analyzed",
  score: 95,
  aiSummary: "Layered architecture, TCP 3-way handshake, congestion control, and subnetting."
}, {
  id: "n4",
  title: "Compiler Design - Lexical Analysis & Parsing",
  student: "Priya Patel",
  dept: "CSE",
  semester: "6",
  subject: "Compiler Design",
  pages: 11,
  date: "2026-07-20",
  status: "Flagged",
  score: 64,
  aiSummary: "Incomplete notes on LL(1) parsing tables. Missing panic-mode error recovery."
}, {
  id: "n5",
  title: "Software Engineering - Agile & Scrum Framework",
  student: "Kiran Rao",
  dept: "ISE",
  semester: "4",
  subject: "Software Engineering",
  pages: 16,
  date: "2026-07-19",
  status: "Analyzed",
  score: 90,
  aiSummary: "User stories, sprint planning, velocity tracking, and burndown chart metrics."
}, {
  id: "n6",
  title: "Data Structures - Graph Algorithms (Dijkstra, Prim)",
  student: "evana.joseph",
  dept: "MCA",
  semester: "2",
  subject: "Data Structures",
  pages: 25,
  date: "2026-07-18",
  status: "Analyzed",
  score: 96,
  aiSummary: "Shortest path algorithms, MST calculations, topological sorting, and BFS/DFS traversal."
}];
function NotesMonitoring() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const filtered = MOCK_NOTES.filter((n) => (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.student.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase())) && (!deptFilter || n.dept === deptFilter));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5 font-sans", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight", children: "Notes Monitoring & AI Audit" }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 mt-0.5", children: "Review, audit, and analyze student-uploaded notes and AI processing results across departments." })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-4", children: [{
      label: "Total Notes Uploaded",
      value: "1,248",
      color: "bg-blue-600"
    }, {
      label: "AI Analyzed Notes",
      value: "1,192",
      color: "bg-emerald-500"
    }, {
      label: "Quality Flagged",
      value: "14",
      color: "bg-amber-500"
    }, {
      label: "Avg Quality Score",
      value: "89.4%",
      color: "bg-violet-600"
    }].map((s) => /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: `h-9 w-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`, children: /* @__PURE__ */ jsx(BookOpen, { className: "h-4.5 w-4.5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xl font-extrabold text-slate-800 dark:text-slate-100", children: s.value }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400", children: s.label })
      ] })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 flex-wrap items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" }),
        /* @__PURE__ */ jsx("input", { placeholder: "Search notes, student, subject...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8 h-9 w-72 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" })
      ] }),
      /* @__PURE__ */ jsxs("select", { value: deptFilter, onChange: (e) => setDeptFilter(e.target.value), className: "h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "All Departments" }),
        ["CSE", "MCA", "IT", "ISE", "ECE"].map((d) => /* @__PURE__ */ jsx("option", { value: d, children: d }, d))
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50", children: ["Note Title", "Student", "Subject", "Pages", "Uploaded", "Quality Score", "Status", "Actions"].map((h) => /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500", children: h }, h)) }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-800", children: filtered.map((note) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 text-xs max-w-xs truncate", children: note.title }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-xs text-slate-600 dark:text-slate-400", children: [
          note.student,
          " ",
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-400 font-mono", children: [
            "(",
            note.dept,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-slate-500", children: note.subject }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-xs text-slate-500 font-mono", children: [
          note.pages,
          " pages"
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-[10px] text-slate-400 font-mono", children: note.date }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: `text-xs font-bold ${note.score >= 85 ? "text-emerald-600" : note.score >= 70 ? "text-amber-600" : "text-red-600"}`, children: [
          note.score,
          "%"
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${note.status === "Analyzed" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950" : "bg-amber-50 text-amber-600 dark:bg-amber-950"}`, children: note.status }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("button", { onClick: () => setSelectedNote(note), className: "p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors", children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }) })
      ] }, note.id)) })
    ] }) }),
    selectedNote && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-slate-800 dark:text-slate-100", children: selectedNote.title }),
        /* @__PURE__ */ jsx("button", { onClick: () => setSelectedNote(null), className: "p-1 rounded-md text-slate-400 hover:text-slate-600", children: "✕" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-1 border-b border-slate-100 dark:border-slate-800", children: [
          /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: "Uploaded By:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-slate-700 dark:text-slate-200", children: [
            selectedNote.student,
            " (",
            selectedNote.dept,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-1 border-b border-slate-100 dark:border-slate-800", children: [
          /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: "Subject:" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-700 dark:text-slate-200", children: selectedNote.subject })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-1 border-b border-slate-100 dark:border-slate-800", children: [
          /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: "AI Quality Score:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-emerald-600", children: [
            selectedNote.score,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1", children: "AI Generated Summary" }),
          /* @__PURE__ */ jsx("div", { className: "bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-slate-600 dark:text-slate-300 leading-relaxed", children: selectedNote.aiSummary })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  NotesMonitoring as component
};
