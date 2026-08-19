import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-BYlyULqi.js";
import { l as listStudents, c as createStudent, d as deleteStudent } from "./studentos.functions-Ue8fd_EQ.js";
import { toast } from "sonner";
import { Download, Plus, Search, X, Loader2, GraduationCap, Eye, Edit2, Key, Ban, Trash2 } from "lucide-react";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { L as Label } from "./label-Cx2aJ22H.js";
import { C as Card } from "./card-Cwsrt9M1.js";
import "@tanstack/react-router";
import "./server-ClIdw9oM.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DcSfQrdP.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const DEPARTMENTS = ["CSE", "ECE", "ISE", "MECH", "CIVIL", "EEE", "MCA", "MBA", "BCA"];
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const SECTIONS = ["A", "B", "C", "D"];
const DUMMY_STUDENTS = [{
  id: "dummy-1",
  studentId: "1CR22CS045",
  name: "John Doe",
  email: "john.doe@acadsphere.edu",
  phone: "+91 9876543210",
  department: "CSE",
  semester: "6",
  section: "A",
  cgpa: 9.12,
  attendancePercentage: 94
}, {
  id: "dummy-2",
  studentId: "1CR22CS088",
  name: "Evana Joseph",
  email: "evana.j@acadsphere.edu",
  phone: "+91 9876543211",
  department: "CSE",
  semester: "6",
  section: "A",
  cgpa: 8.85,
  attendancePercentage: 91
}, {
  id: "dummy-3",
  studentId: "1CR22EC012",
  name: "Rahul Kumar",
  email: "rahul.k@acadsphere.edu",
  phone: "+91 9876543212",
  department: "ECE",
  semester: "4",
  section: "B",
  cgpa: 7.9,
  attendancePercentage: 82
}, {
  id: "dummy-4",
  studentId: "1CR22IS034",
  name: "Ananya Sharma",
  email: "ananya.s@acadsphere.edu",
  phone: "+91 9876543213",
  department: "ISE",
  semester: "6",
  section: "C",
  cgpa: 9.4,
  attendancePercentage: 96
}, {
  id: "dummy-5",
  studentId: "1CR22ME019",
  name: "Karthik Raja",
  email: "karthik.r@acadsphere.edu",
  phone: "+91 9876543214",
  department: "MECH",
  semester: "4",
  section: "A",
  cgpa: 7.2,
  attendancePercentage: 71
}, {
  id: "dummy-6",
  studentId: "1CR22CV008",
  name: "Priya Nair",
  email: "priya.n@acadsphere.edu",
  phone: "+91 9876543215",
  department: "CIVIL",
  semester: "2",
  section: "B",
  cgpa: 8.6,
  attendancePercentage: 88
}, {
  id: "dummy-7",
  studentId: "1CR22MC052",
  name: "Vikramaditya Singh",
  email: "vikram.s@acadsphere.edu",
  phone: "+91 9876543216",
  department: "MCA",
  semester: "4",
  section: "A",
  cgpa: 9.05,
  attendancePercentage: 93
}, {
  id: "dummy-8",
  studentId: "1CR22CS142",
  name: "Sneha Hegde",
  email: "sneha.h@acadsphere.edu",
  phone: "+91 9876543217",
  department: "CSE",
  semester: "6",
  section: "B",
  cgpa: 8.75,
  attendancePercentage: 89
}, {
  id: "dummy-9",
  studentId: "1CR22EC076",
  name: "Rohan Varma",
  email: "rohan.v@acadsphere.edu",
  phone: "+91 9876543218",
  department: "ECE",
  semester: "6",
  section: "A",
  cgpa: 6.95,
  attendancePercentage: 68
}, {
  id: "dummy-10",
  studentId: "1CR22IS091",
  name: "Aishwarya Rai",
  email: "aishwarya.r@acadsphere.edu",
  phone: "+91 9876543219",
  department: "ISE",
  semester: "6",
  section: "A",
  cgpa: 9.6,
  attendancePercentage: 98
}];
function StudentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}) {
  const [form, setForm] = useState({
    studentId: initialData?.studentId || "",
    name: initialData?.name || "",
    email: initialData?.email || `${initialData?.studentId?.toLowerCase() || "student"}@acadsphere.edu`,
    phone: initialData?.phone || "",
    department: initialData?.department || "CSE",
    semester: initialData?.semester || "1",
    section: initialData?.section || "A",
    cgpa: String(initialData?.cgpa || ""),
    attendancePercentage: String(initialData?.attendancePercentage || "100")
  });
  const set = (k) => (e) => setForm((f) => ({
    ...f,
    [k]: e.target.value
  }));
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      studentId: form.studentId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      semester: form.semester,
      section: form.section,
      cgpa: parseFloat(form.cgpa) || 0,
      attendancePercentage: parseFloat(form.attendancePercentage) || 100
    });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "USN / Roll No" }),
        /* @__PURE__ */ jsx(Input, { value: form.studentId, onChange: set("studentId"), required: true, className: "h-9 text-xs border-stone-200 dark:border-zinc-800", placeholder: "1CR22CS001" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Full Name" }),
        /* @__PURE__ */ jsx(Input, { value: form.name, onChange: set("name"), required: true, className: "h-9 text-xs border-stone-200 dark:border-zinc-800", placeholder: "John Doe" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Email Address" }),
        /* @__PURE__ */ jsx(Input, { type: "email", value: form.email, onChange: set("email"), required: true, className: "h-9 text-xs border-stone-200 dark:border-zinc-800", placeholder: "john.doe@acadsphere.edu" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Phone" }),
        /* @__PURE__ */ jsx(Input, { value: form.phone, onChange: set("phone"), className: "h-9 text-xs border-stone-200 dark:border-zinc-800", placeholder: "+91 9876543210" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-4", children: ["department", "semester", "section"].map((k) => /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: k }),
      /* @__PURE__ */ jsx("select", { value: form[k], onChange: set(k), className: "w-full h-9 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs focus:outline-none", children: (k === "department" ? DEPARTMENTS : k === "semester" ? SEMESTERS : SECTIONS).map((v) => /* @__PURE__ */ jsx("option", { value: v, children: v }, v)) })
    ] }, k)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "CGPA" }),
        /* @__PURE__ */ jsx(Input, { type: "number", step: "0.01", value: form.cgpa, onChange: set("cgpa"), className: "h-9 text-xs border-stone-200 dark:border-zinc-800", placeholder: "8.50" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Attendance %" }),
        /* @__PURE__ */ jsx(Input, { type: "number", value: form.attendancePercentage, onChange: set("attendancePercentage"), className: "h-9 text-xs border-stone-200 dark:border-zinc-800", placeholder: "88" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end pt-3 border-t border-stone-100 dark:border-zinc-800", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onCancel, className: "h-9 text-xs border-stone-200 dark:border-zinc-800", children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: isLoading, className: "h-9 text-xs font-bold bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900", children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : initialData ? "Save Changes" : "Enrol Student" })
    ] })
  ] });
}
function StudentManagement() {
  const qc = useQueryClient();
  const listFn = useServerFn(listStudents);
  const createFn = useServerFn(createStudent);
  const deleteFn = useServerFn(deleteStudent);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [disabledStudents, setDisabledStudents] = useState({});
  const {
    data: serverStudents = [],
    isLoading
  } = useQuery({
    queryKey: ["adminStudents", search, deptFilter, semFilter],
    queryFn: () => listFn({
      data: {
        search,
        department: deptFilter,
        semester: semFilter
      }
    }),
    refetchInterval: 3e4
  });
  const allStudents = useMemo(() => {
    const combined = [...serverStudents];
    for (const d of DUMMY_STUDENTS) {
      if (!combined.some((s) => s.studentId === d.studentId || s.id === d.id)) {
        combined.push(d);
      }
    }
    return combined;
  }, [serverStudents]);
  const filtered = useMemo(() => {
    return allStudents.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase());
      const matchDept = !deptFilter || s.department === deptFilter;
      const matchSem = !semFilter || String(s.semester) === String(semFilter);
      return matchSearch && matchDept && matchSem;
    });
  }, [allStudents, search, deptFilter, semFilter]);
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortField] ?? "";
      let bv = b[sortField] ?? "";
      if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortField, sortDir]);
  const createMut = useMutation({
    mutationFn: (data) => createFn({
      data
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["adminStudents"]
      });
      setShowForm(false);
      toast.success("Student record updated!");
    },
    onError: (e) => toast.error(e.message || "Failed to add student")
  });
  const deleteMut = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["adminStudents"]
      });
      setDeleteId(null);
      toast.success("Record removed");
    },
    onError: (e) => toast.error(e.message || "Failed to delete student")
  });
  function toggleStatus(id, name) {
    setDisabledStudents((prev) => {
      const nextState = !prev[id];
      toast.success(nextState ? `Enrolment paused for ${name}` : `Enrolment active for ${name}`);
      return {
        ...prev,
        [id]: nextState
      };
    });
  }
  function resetPassword(name) {
    const tempPass = `Acad#${Math.floor(1e5 + Math.random() * 9e5)}`;
    toast.success(`Passcode for ${name}: ${tempPass}`, {
      duration: 6e3
    });
  }
  function exportCSV() {
    const header = ["Name", "USN", "Department", "Semester", "Section", "CGPA", "Attendance"];
    const rows = sorted.map((s) => [s.name, s.studentId || "—", s.department, s.semester, s.section, s.cgpa || 0, `${s.attendancePercentage || 100}%`]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_registry.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV Export Generated");
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-7xl mx-auto font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-500", children: "Student Directory" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight mt-0.5", children: "Student Records & Directory" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 dark:text-zinc-400 mt-1", children: "Enrolled student list, department breakdown, academic scores, and profile records." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: exportCSV, className: "h-9 text-xs gap-1.5 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold hover:bg-stone-100 dark:hover:bg-zinc-800", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
          " Export CSV"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => {
          setEditStudent(null);
          setShowForm(true);
        }, className: "h-9 text-xs font-bold gap-1.5 bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 shadow-sm hover:bg-stone-800", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Enrol Student"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2.5 flex-1 w-full md:w-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search by student name or USN...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-800" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: deptFilter, onChange: (e) => setDeptFilter(e.target.value), className: "h-8 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 px-3 text-xs focus:outline-none", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Departments" }),
          DEPARTMENTS.map((d) => /* @__PURE__ */ jsx("option", { value: d, children: d }, d))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: semFilter, onChange: (e) => setSemFilter(e.target.value), className: "h-8 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 px-3 text-xs focus:outline-none", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Semesters" }),
          SEMESTERS.map((s) => /* @__PURE__ */ jsxs("option", { value: s, children: [
            "Semester ",
            s
          ] }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs font-mono text-stone-500 dark:text-zinc-400", children: [
        "Total Listed: ",
        /* @__PURE__ */ jsx("span", { className: "font-bold text-stone-900 dark:text-zinc-100", children: sorted.length })
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6 w-full max-w-lg shadow-xl space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-stone-900 dark:text-zinc-100", children: editStudent ? "Edit Student Details" : "New Student Enrolment" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowForm(false), className: "p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsx(StudentForm, { initialData: editStudent, onSubmit: (data) => createMut.mutate(data), onCancel: () => setShowForm(false), isLoading: createMut.isPending })
    ] }) }),
    viewStudent && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6 w-full max-w-2xl shadow-xl my-6 max-h-[90vh] overflow-y-auto space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between border-b border-stone-100 dark:border-zinc-800 pb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 flex items-center justify-center font-extrabold text-base", children: viewStudent.name?.charAt(0)?.toUpperCase() }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-extrabold text-stone-900 dark:text-zinc-100", children: viewStudent.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-stone-500 dark:text-zinc-400 font-mono", children: [
              "USN: ",
              viewStudent.studentId || "1CR22CS045",
              " · ",
              viewStudent.department,
              " (Sem ",
              viewStudent.semester,
              ", Sec ",
              viewStudent.section,
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setViewStudent(null), className: "p-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-800", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold text-stone-500 dark:text-zinc-400 uppercase", children: "CGPA Score" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-black text-stone-900 dark:text-zinc-100 mt-0.5", children: viewStudent.cgpa?.toFixed(2) || "8.50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-800", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold text-stone-500 dark:text-zinc-400 uppercase", children: "Attendance" }),
          /* @__PURE__ */ jsxs("p", { className: `text-lg font-black mt-0.5 ${viewStudent.attendancePercentage >= 75 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`, children: [
            viewStudent.attendancePercentage?.toFixed(0) || "88",
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-800", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold text-stone-500 dark:text-zinc-400 uppercase", children: "Status" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5", children: "Enrolled" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-stone-50 dark:bg-zinc-800/60 rounded-xl p-4 border border-stone-200/80 dark:border-zinc-800 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400", children: "Class Activity Log" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs font-mono", children: [{
          time: "09:10 AM",
          action: "Signed in on Chrome"
        }, {
          time: "09:15 AM",
          action: "Opened Smart Notes — DBMS Normalization"
        }, {
          time: "09:22 AM",
          action: "Completed CPU Scheduling Practice"
        }, {
          time: "09:30 AM",
          action: "Viva Session Score: 92%"
        }].map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800", children: [
          /* @__PURE__ */ jsx("span", { className: "text-stone-800 dark:text-zinc-200 font-semibold", children: item.action }),
          /* @__PURE__ */ jsxs("span", { className: "text-stone-400 dark:text-zinc-500 text-[10px]", children: [
            item.time,
            " Today"
          ] })
        ] }, i)) })
      ] })
    ] }) }),
    deleteId && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6 w-full max-w-sm shadow-xl space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-stone-900 dark:text-zinc-100", children: "Remove Student Record?" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 dark:text-zinc-400 mt-1", children: "This record will be permanently deleted from the directory." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setDeleteId(null), className: "h-8 text-xs border-stone-200 dark:border-zinc-800", children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, className: "h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-bold", children: deleteMut.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : "Remove" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center h-48 text-stone-500 text-xs", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }),
      " Loading student directory..."
    ] }) : sorted.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-48 text-stone-400", children: [
      /* @__PURE__ */ jsx(GraduationCap, { className: "h-8 w-8 mb-2 opacity-40" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold", children: "No student records found" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-stone-500 dark:text-zinc-400 font-bold uppercase text-[9.5px] tracking-wider", children: [
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "USN" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Department" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Semester" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "CGPA" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Attendance" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-left", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3.5 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-stone-100 dark:divide-zinc-800", children: sorted.map((student) => {
        const isDisabled = disabledStudents[student.id];
        return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-stone-50/80 dark:hover:bg-zinc-800/40 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold text-xs flex items-center justify-center shrink-0", children: student.name?.charAt(0)?.toUpperCase() }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-bold text-stone-900 dark:text-zinc-100", children: student.name }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-stone-400 dark:text-zinc-500", children: student.email || `${student.studentId?.toLowerCase()}@acadsphere.edu` })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 font-mono text-stone-600 dark:text-zinc-400", children: student.studentId || "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsx("span", { className: "bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold", children: student.department }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-5 py-3.5 text-stone-600 dark:text-zinc-400", children: [
            "Sem ",
            student.semester,
            " (",
            student.section,
            ")"
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 font-bold text-stone-900 dark:text-zinc-100", children: student.cgpa?.toFixed(2) || "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxs("span", { className: `font-bold ${student.attendancePercentage >= 75 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`, children: [
            student.attendancePercentage?.toFixed(0),
            "%"
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: isDisabled ? /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800", children: "Paused" }) : /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800", children: "Enrolled" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setViewStudent(student), className: "p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800", title: "View Profile", children: /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => {
              setEditStudent(student);
              setShowForm(true);
            }, className: "p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800", title: "Edit", children: /* @__PURE__ */ jsx(Edit2, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => resetPassword(student.name), className: "p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800", title: "Reset Passcode", children: /* @__PURE__ */ jsx(Key, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => toggleStatus(student.id, student.name), className: "p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800", title: isDisabled ? "Resume" : "Pause", children: /* @__PURE__ */ jsx(Ban, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => setDeleteId(student.id), className: "p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40", title: "Remove", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] }) })
        ] }, student.id);
      }) })
    ] }) }) })
  ] });
}
export {
  StudentManagement as component
};
