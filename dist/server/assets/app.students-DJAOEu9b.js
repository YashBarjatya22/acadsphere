import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-C_NR-jAW.js";
import { C as ChatLayout } from "./ChatLayout-DhUO2gLY.js";
import { g as getProfileAndRole, l as listStudents, u as updateStudent, c as createStudent, d as deleteStudent } from "./studentos.functions-D-MWG8VA.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-Cwsrt9M1.js";
import { toast } from "sonner";
import { GraduationCap, Download, Plus, Search, RefreshCw, AlertCircle, Edit3, Trash2, X, School } from "lucide-react";
import "@tanstack/react-router";
import "./server-C5bjec8z.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-0D9COL9P.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "./client-h4N4kZKq.js";
import "./studentos-logo-CCLo3MN1.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
function StudentRegistryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    phone: "",
    department: "Computer Science",
    semester: "Semester 6",
    section: "A",
    cgpa: 8,
    attendancePercentage: 90
  });
  const listFn = useServerFn(listStudents);
  const createFn = useServerFn(createStudent);
  const updateFn = useServerFn(updateStudent);
  const deleteFn = useServerFn(deleteStudent);
  const getProfileFn = useServerFn(getProfileAndRole);
  const {
    data: profile
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn()
  });
  const {
    data: students = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["studentsList", search, deptFilter, semFilter],
    queryFn: () => listFn({
      data: {
        search,
        department: deptFilter,
        semester: semFilter
      }
    })
  });
  const activeRole = profile?.role || "student";
  const canManage = activeRole === "admin" || activeRole === "faculty";
  const saveMut = useMutation({
    mutationFn: (data) => {
      if (data.id) {
        return updateFn({
          data
        });
      }
      return createFn({
        data
      });
    },
    onSuccess: () => {
      toast.success(editingStudent ? "Student updated successfully!" : "Student registered successfully!");
      setModalOpen(false);
      qc.invalidateQueries({
        queryKey: ["studentsList"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboardStats"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Operation failed");
    }
  });
  const deleteMut = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Student registry record deleted");
      qc.invalidateQueries({
        queryKey: ["studentsList"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboardStats"]
      });
    }
  });
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setForm({
      studentId: `ST${Math.floor(1e4 + Math.random() * 9e4)}`,
      name: "",
      phone: "",
      department: "Computer Science",
      semester: "Semester 6",
      section: "A",
      cgpa: 8,
      attendancePercentage: 85
    });
    setModalOpen(true);
  };
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setForm({
      studentId: student.studentId,
      name: student.name,
      phone: student.phone || "",
      department: student.department,
      semester: student.semester,
      section: student.section,
      cgpa: student.cgpa,
      attendancePercentage: student.attendancePercentage
    });
    setModalOpen(true);
  };
  const exportCSV = () => {
    if (students.length === 0) return;
    const headers = ["Student ID", "Name", "Department", "Semester", "Section", "CGPA", "Attendance %", "Phone"];
    const rows = students.map((s) => [s.studentId, s.name, s.department, s.semester, s.section, s.cgpa, s.attendancePercentage, s.phone || ""]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StudentOS_Registry_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-[#0B0F19] text-slate-100 p-6 md:p-8 scrollbar-thin", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-extrabold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(GraduationCap, { className: "h-6 w-6 text-blue-500" }),
          " Student Registry Management"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-xs mt-1", children: "Search, filter, and review active university admissions and metrics." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: exportCSV, variant: "outline", className: "border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-xs h-8", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5 mr-1" }),
          " Export CSV"
        ] }),
        canManage && /* @__PURE__ */ jsxs(Button, { onClick: handleOpenAdd, className: "bg-blue-600 hover:bg-blue-700 text-white text-xs h-8", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          " Add Student"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-4 items-center mb-6 bg-slate-900/40 p-4 rounded-lg border border-slate-800/80", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search by name or ID...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8 bg-slate-950/40 border-slate-800 text-slate-200 text-xs h-9 placeholder-slate-500" })
      ] }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("select", { value: deptFilter, onChange: (e) => setDeptFilter(e.target.value), className: "w-full bg-slate-950/40 border border-slate-800 text-slate-300 text-xs h-9 px-2.5 rounded focus:outline-none", children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "All Departments" }),
        /* @__PURE__ */ jsx("option", { value: "Computer Science", children: "Computer Science" }),
        /* @__PURE__ */ jsx("option", { value: "Information Technology", children: "Information Technology" }),
        /* @__PURE__ */ jsx("option", { value: "Electronics", children: "Electronics" }),
        /* @__PURE__ */ jsx("option", { value: "Mechanical", children: "Mechanical" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("select", { value: semFilter, onChange: (e) => setSemFilter(e.target.value), className: "w-full bg-slate-950/40 border border-slate-800 text-slate-300 text-xs h-9 px-2.5 rounded focus:outline-none", children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "All Semesters" }),
        /* @__PURE__ */ jsx("option", { value: "Semester 1", children: "Semester 1" }),
        /* @__PURE__ */ jsx("option", { value: "Semester 2", children: "Semester 2" }),
        /* @__PURE__ */ jsx("option", { value: "Semester 4", children: "Semester 4" }),
        /* @__PURE__ */ jsx("option", { value: "Semester 6", children: "Semester 6" }),
        /* @__PURE__ */ jsx("option", { value: "Semester 8", children: "Semester 8" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx(Button, { onClick: () => {
        setSearch("");
        setDeptFilter("");
        setSemFilter("");
      }, variant: "ghost", className: "text-slate-400 hover:text-white text-xs h-9", children: "Clear filters" }) })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "bg-slate-900/30 border-slate-800", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "py-20 flex justify-center items-center text-slate-400 gap-2", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "animate-spin h-5 w-5 text-blue-500" }),
      " Loading student database..."
    ] }) : students.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "py-20 text-center text-slate-500 flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-slate-600" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm", children: "No student records found matching filters." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-slate-300", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-slate-950/40 border-b border-slate-850 text-slate-400 font-mono", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left py-3 px-4", children: "Student Details" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-3 px-4", children: "ID" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-3 px-4", children: "Department" }),
        /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4", children: "Class" }),
        /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4", children: "CGPA" }),
        /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4", children: "Attendance" }),
        canManage && /* @__PURE__ */ jsx("th", { className: "text-right py-3 px-4", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-850", children: students.map((student) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-900/30 transition-colors", children: [
        /* @__PURE__ */ jsxs("td", { className: "py-3.5 px-4 flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-[11px] grid place-items-center", children: student.name.charAt(0).toUpperCase() }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold text-slate-100", children: student.name }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 mt-0.5", children: student.phone || "No phone record" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "py-3.5 px-4 font-mono text-slate-300", children: student.studentId }),
        /* @__PURE__ */ jsx("td", { className: "py-3.5 px-4 text-slate-300", children: student.department }),
        /* @__PURE__ */ jsxs("td", { className: "py-3.5 px-4 text-center text-slate-400", children: [
          student.semester,
          " - Sec ",
          student.section
        ] }),
        /* @__PURE__ */ jsx("td", { className: "py-3.5 px-4 text-center font-bold text-blue-400", children: student.cgpa.toFixed(2) }),
        /* @__PURE__ */ jsx("td", { className: "py-3.5 px-4 text-center", children: /* @__PURE__ */ jsxs("span", { className: `px-2 py-0.5 rounded text-[10px] font-semibold border ${student.attendancePercentage >= 80 ? "bg-green-950/20 border-green-800 text-green-400" : "bg-red-950/20 border-red-800 text-red-400"}`, children: [
          student.attendancePercentage,
          "%"
        ] }) }),
        canManage && /* @__PURE__ */ jsx("td", { className: "py-3.5 px-4 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => handleOpenEdit(student), className: "p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white", title: "Edit Student", children: /* @__PURE__ */ jsx(Edit3, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            if (confirm("Are you sure?")) deleteMut.mutate(student.id);
          }, className: "p-1 hover:bg-red-950/30 rounded text-slate-500 hover:text-red-400", title: "Delete record", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) })
      ] }, student.id)) })
    ] }) }) }) }),
    modalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "bg-[#0F172A] border-slate-850 w-full max-w-md shadow-2xl relative", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setModalOpen(false), className: "absolute top-4 right-4 text-slate-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-4.5 w-4.5" }) }),
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm font-semibold text-slate-200 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(School, { className: "h-4.5 w-4.5 text-blue-400" }),
        editingStudent ? "Edit Student Details" : "Register New Student"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4 text-left", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        saveMut.mutate(editingStudent ? {
          ...form,
          id: editingStudent.id
        } : form);
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Student Name" }),
          /* @__PURE__ */ jsx(Input, { required: true, value: form.name, onChange: (e) => setForm({
            ...form,
            name: e.target.value
          }), placeholder: "e.g. Rahul Sharma", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Student ID / Roll No" }),
            /* @__PURE__ */ jsx(Input, { required: true, value: form.studentId, onChange: (e) => setForm({
              ...form,
              studentId: e.target.value
            }), placeholder: "e.g. ST22045", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8 font-mono" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Phone Number" }),
            /* @__PURE__ */ jsx(Input, { value: form.phone, onChange: (e) => setForm({
              ...form,
              phone: e.target.value
            }), placeholder: "e.g. +91 9876543210", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Department" }),
          /* @__PURE__ */ jsxs("select", { value: form.department, onChange: (e) => setForm({
            ...form,
            department: e.target.value
          }), className: "w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none", children: [
            /* @__PURE__ */ jsx("option", { value: "Computer Science", children: "Computer Science" }),
            /* @__PURE__ */ jsx("option", { value: "Information Technology", children: "Information Technology" }),
            /* @__PURE__ */ jsx("option", { value: "Electronics", children: "Electronics" }),
            /* @__PURE__ */ jsx("option", { value: "Mechanical", children: "Mechanical" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Semester" }),
            /* @__PURE__ */ jsxs("select", { value: form.semester, onChange: (e) => setForm({
              ...form,
              semester: e.target.value
            }), className: "w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none", children: [
              /* @__PURE__ */ jsx("option", { value: "Semester 1", children: "Semester 1" }),
              /* @__PURE__ */ jsx("option", { value: "Semester 2", children: "Semester 2" }),
              /* @__PURE__ */ jsx("option", { value: "Semester 4", children: "Semester 4" }),
              /* @__PURE__ */ jsx("option", { value: "Semester 6", children: "Semester 6" }),
              /* @__PURE__ */ jsx("option", { value: "Semester 8", children: "Semester 8" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Section" }),
            /* @__PURE__ */ jsx(Input, { required: true, value: form.section, onChange: (e) => setForm({
              ...form,
              section: e.target.value
            }), placeholder: "e.g. A", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Initial CGPA" }),
            /* @__PURE__ */ jsx(Input, { type: "number", step: "0.01", min: "0", max: "10", value: form.cgpa, onChange: (e) => setForm({
              ...form,
              cgpa: parseFloat(e.target.value) || 0
            }), className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Initial Attendance %" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: "0", max: "100", value: form.attendancePercentage, onChange: (e) => setForm({
              ...form,
              attendancePercentage: parseInt(e.target.value) || 0
            }), className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saveMut.isPending, className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8", children: saveMut.isPending ? "Processing..." : "Save Record" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setModalOpen(false), variant: "outline", className: "border-slate-800 text-slate-400 text-xs h-8", children: "Cancel" })
        ] })
      ] }) })
    ] }) })
  ] }) });
}
export {
  StudentRegistryPage as component
};
