import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn, C as ChatLayout, B as Button } from "./router-DWxA6Z2f.js";
import { g as getProfileAndRole, j as listAssignments, k as listSubmissions, m as listSubjects, n as createAssignment, o as createSubmission, p as gradeSubmission } from "./studentos.functions-BCssppkW.js";
import { I as Input } from "./input-CCdkf2yx.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-H7niSSOQ.js";
import { toast } from "sonner";
import { ClipboardList, Plus, RefreshCw, Check, FileCheck, AlertCircle, Calendar, Upload, X } from "lucide-react";
import "@tanstack/react-router";
import "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
import "ai";
import "./ai-gateway.server-DLub9oIv.js";
import "@ai-sdk/openai-compatible";
import "node:crypto";
import "./server-CYaDwdxI.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-BnYhSKH5.js";
import "./supabase.server-BXfiGlvE.js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "zod";
import "framer-motion";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "gsap";
import "recharts";
function AssignmentsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("board");
  const [createOpen, setCreateOpen] = useState(false);
  const [newAssign, setNewAssign] = useState({
    title: "",
    description: "",
    subjectId: "",
    dueDate: ""
  });
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedAssignId, setSelectedAssignId] = useState(null);
  const [fileName, setFileName] = useState("");
  const [gradingOpen, setGradingOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [grade, setGrade] = useState("A");
  const [feedback, setFeedback] = useState("");
  const getProfileFn = useServerFn(getProfileAndRole);
  const listAssignsFn = useServerFn(listAssignments);
  const createAssignFn = useServerFn(createAssignment);
  const listSubsFn = useServerFn(listSubmissions);
  const submitFn = useServerFn(createSubmission);
  const gradeFn = useServerFn(gradeSubmission);
  const listSubjectsFn = useServerFn(listSubjects);
  const {
    data: profile
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn()
  });
  const {
    data: assignments = [],
    isLoading: loadingAssigns
  } = useQuery({
    queryKey: ["assignmentsList"],
    queryFn: () => listAssignsFn()
  });
  const {
    data: submissions = [],
    isLoading: loadingSubs
  } = useQuery({
    queryKey: ["submissionsList", selectedAssignId],
    queryFn: () => listSubsFn({
      data: {
        assignmentId: selectedAssignId || void 0,
        studentId: profile?.role === "student" ? profile.id : void 0
      }
    })
  });
  const {
    data: subjects = []
  } = useQuery({
    queryKey: ["subjectsList"],
    queryFn: () => listSubjectsFn()
  });
  const activeRole = profile?.role || "student";
  const isFaculty = activeRole === "faculty" || activeRole === "admin";
  const createAssignMut = useMutation({
    mutationFn: (data) => createAssignFn({
      data
    }),
    onSuccess: () => {
      toast.success("Assignment created and broadcasted successfully!");
      setCreateOpen(false);
      setNewAssign({
        title: "",
        description: "",
        subjectId: "",
        dueDate: ""
      });
      qc.invalidateQueries({
        queryKey: ["assignmentsList"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create assignment");
    }
  });
  const submitMut = useMutation({
    mutationFn: (data) => submitFn({
      data
    }),
    onSuccess: () => {
      toast.success("Assignment submitted successfully!");
      setSubmitOpen(false);
      setFileName("");
      qc.invalidateQueries({
        queryKey: ["submissionsList"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboardStats"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Submission failed");
    }
  });
  const gradeMut = useMutation({
    mutationFn: (data) => gradeFn({
      data
    }),
    onSuccess: () => {
      toast.success("Grade submitted successfully!");
      setGradingOpen(false);
      setGrade("A");
      setFeedback("");
      qc.invalidateQueries({
        queryKey: ["submissionsList"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboardStats"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Grading failed");
    }
  });
  const subMap = new Map((submissions || []).map((s) => [s.assignmentId, s]));
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-[#0B0F19] text-slate-100 p-6 md:p-8 scrollbar-thin font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-extrabold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(ClipboardList, { className: "h-6 w-6 text-rose-400" }),
          " Academic Assignment Board"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-xs mt-1", children: "Upload homework worksheets, grade terms, and monitor classroom schedules." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: isFaculty && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Button, { onClick: () => {
          setActiveTab("board");
          setCreateOpen(true);
        }, className: "bg-rose-600 hover:bg-rose-700 text-white text-xs h-8", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          " Post Assignment"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-900 border border-slate-800 rounded p-0.5", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("board"), className: `px-3 py-1 rounded text-xs transition-colors ${activeTab === "board" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`, children: "Assignments" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("submissions"), className: `px-3 py-1 rounded text-xs transition-colors ${activeTab === "submissions" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`, children: "Grading Desk" })
        ] })
      ] }) })
    ] }),
    activeTab === "board" && /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-4", children: loadingAssigns ? /* @__PURE__ */ jsxs("div", { className: "py-20 flex justify-center items-center text-slate-400", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "animate-spin h-5 w-5 mr-1" }),
        " Loading assignments..."
      ] }) : assignments.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-slate-500 text-xs", children: "No assignments currently active." }) : assignments.map((as) => {
        const submission = subMap.get(as.id);
        const isSubmitted = !!submission;
        const isGraded = submission?.status === "graded";
        const isLate = submission?.status === "late";
        return /* @__PURE__ */ jsxs(Card, { className: "bg-slate-900/40 border-slate-800 text-left transition-all hover:border-slate-700/80", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
              /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-rose-950/20 border border-rose-800/40 text-rose-400 text-[9px] font-bold rounded uppercase tracking-wider font-mono", children: as.subjectCode || "CORE" }),
              !isFaculty && /* @__PURE__ */ jsx("div", { className: "text-right", children: isGraded ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-green-950/25 border border-green-800/30 rounded", children: [
                /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }),
                " Graded: ",
                submission.grade
              ] }) : isSubmitted ? /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${isLate ? "text-amber-400 bg-amber-950/25 border-amber-800/30" : "text-blue-400 bg-blue-950/25 border-blue-800/30"}`, children: [
                /* @__PURE__ */ jsx(FileCheck, { className: "h-3 w-3" }),
                " Submitted ",
                isLate && "(Late)"
              ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 px-2 py-0.5 bg-rose-950/20 border border-rose-800/30 rounded animate-pulse", children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3" }),
                " Pending Submission"
              ] }) })
            ] }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-200 mt-2", children: as.title }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-slate-500", children: as.subjectName })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-300 leading-relaxed mb-4", children: as.description }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-t border-slate-850 pt-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-slate-400 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 text-slate-500" }),
                "Due: ",
                new Date(as.dueDate).toLocaleString()
              ] }),
              !isFaculty && !isGraded && /* @__PURE__ */ jsxs(Button, { onClick: () => {
                setSelectedAssignId(as.id);
                setSubmitOpen(true);
              }, size: "sm", className: "h-7 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200", children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-3 w-3 mr-1" }),
                " ",
                isSubmitted ? "Resubmit" : "Submit File"
              ] })
            ] })
          ] })
        ] }, as.id);
      }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "bg-slate-900/40 border-slate-800 text-left", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-200", children: "Deadlines Timeline" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: assignments.slice(0, 3).map((as, i) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3 text-left", children: [
          /* @__PURE__ */ jsx("div", { className: "w-1 bg-rose-500 rounded" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-slate-200", children: as.title }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 mt-0.5", children: new Date(as.dueDate).toLocaleDateString() })
          ] })
        ] }, i)) })
      ] }) })
    ] }),
    activeTab === "submissions" && isFaculty && /* @__PURE__ */ jsxs(Card, { className: "bg-slate-900/30 border-slate-800", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-slate-850", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-200", children: "Pending Submissions Registry" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-slate-500", children: "Grade submitted student worksheets." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: loadingSubs ? /* @__PURE__ */ jsxs("div", { className: "py-12 flex justify-center items-center text-slate-400", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "animate-spin h-5 w-5 mr-1" }),
        " Fetching submissions..."
      ] }) : submissions.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-12 text-center text-slate-500 text-xs", children: "No student submissions logged yet." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-slate-300", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-950/40 border-b border-slate-850 font-mono text-[9px] text-slate-400", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-left", children: "Student" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-left", children: "Assignment" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-left", children: "Submission Date" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-center", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-center", children: "File" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-center", children: "Grade" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-850", children: submissions.map((sub) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-900/20", children: [
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-semibold text-slate-200", children: sub.studentName }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-slate-300", children: sub.assignmentTitle }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-mono text-slate-400", children: new Date(sub.submittedAt).toLocaleDateString() }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-semibold border ${sub.status === "graded" ? "bg-green-950/20 border-green-800 text-green-400" : sub.status === "late" ? "bg-red-950/20 border-red-800 text-red-400 animate-pulse" : "bg-blue-950/20 border-blue-800 text-blue-400"}`, children: sub.status }) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center font-semibold text-blue-400 hover:underline", children: /* @__PURE__ */ jsx("a", { href: `#${sub.fileUrl}`, onClick: (e) => {
            e.preventDefault();
            toast.success(`Simulating download of: ${sub.fileUrl}`);
          }, children: sub.fileUrl }) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center font-bold text-white", children: sub.grade || "-" }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-right", children: /* @__PURE__ */ jsx(Button, { onClick: () => {
            setSelectedSubId(sub.id);
            setGradingOpen(true);
          }, size: "sm", className: "h-7 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200", children: "Grade" }) })
        ] }, sub.id)) })
      ] }) }) })
    ] }),
    createOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "bg-[#0F172A] border-slate-850 w-full max-w-md shadow-2xl text-left relative", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setCreateOpen(false), className: "absolute top-4 right-4 text-slate-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-4.5 w-4.5" }) }),
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-200", children: "Post New Homework Assignment" }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        createAssignMut.mutate(newAssign);
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Subject / Lecture Course" }),
          /* @__PURE__ */ jsxs("select", { value: newAssign.subjectId, onChange: (e) => setNewAssign({
            ...newAssign,
            subjectId: e.target.value
          }), className: "w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none", required: true, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select subject..." }),
            subjects.map((s) => /* @__PURE__ */ jsxs("option", { value: s.id, children: [
              s.code,
              " - ",
              s.name
            ] }, s.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Assignment Title" }),
          /* @__PURE__ */ jsx(Input, { required: true, value: newAssign.title, onChange: (e) => setNewAssign({
            ...newAssign,
            title: e.target.value
          }), placeholder: "e.g. Normalization Theory Quiz Sheets", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Problem Description" }),
          /* @__PURE__ */ jsx("textarea", { required: true, value: newAssign.description, onChange: (e) => setNewAssign({
            ...newAssign,
            description: e.target.value
          }), placeholder: "Enter detailed worksheet questions...", rows: 4, className: "w-full p-2.5 rounded bg-slate-950/40 border border-slate-850 text-slate-200 text-xs focus:outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Submission Deadline" }),
          /* @__PURE__ */ jsx("input", { type: "datetime-local", required: true, value: newAssign.dueDate, onChange: (e) => setNewAssign({
            ...newAssign,
            dueDate: e.target.value
          }), className: "w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-3 rounded focus:outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: createAssignMut.isPending, className: "flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs h-8", children: createAssignMut.isPending ? "Broadcasting..." : "Broadcast Assignment" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setCreateOpen(false), variant: "outline", className: "border-slate-800 text-slate-400 text-xs h-8", children: "Cancel" })
        ] })
      ] }) })
    ] }) }),
    submitOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "bg-[#0F172A] border-slate-850 w-full max-w-sm shadow-2xl text-left relative", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setSubmitOpen(false), className: "absolute top-4 right-4 text-slate-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-4.5 w-4.5" }) }),
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-200", children: "Submit Homework File" }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        if (selectedAssignId) {
          submitMut.mutate({
            assignmentId: selectedAssignId,
            fileUrl: fileName || "relational-normalization.pdf"
          });
        }
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "File Name" }),
          /* @__PURE__ */ jsx(Input, { required: true, value: fileName, onChange: (e) => setFileName(e.target.value), placeholder: "e.g. database_normal_form_solution.pdf", className: "bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 border border-dashed border-slate-800 rounded-lg text-center bg-slate-950/20", children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-8 w-8 text-slate-500 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-slate-300", children: "Choose file or drag here" }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-500 mt-1", children: "Acceptable formats: PDF, DOCX, ZIP (max 10MB)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitMut.isPending, className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8", children: submitMut.isPending ? "Submitting..." : "Upload & Submit" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setSubmitOpen(false), variant: "outline", className: "border-slate-800 text-slate-400 text-xs h-8", children: "Cancel" })
        ] })
      ] }) })
    ] }) }),
    gradingOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "bg-[#0F172A] border-slate-850 w-full max-w-sm shadow-2xl text-left relative", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setGradingOpen(false), className: "absolute top-4 right-4 text-slate-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-4.5 w-4.5" }) }),
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold text-slate-200", children: "Grading Desk Evaluation" }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        if (selectedSubId) {
          gradeMut.mutate({
            id: selectedSubId,
            grade,
            feedback
          });
        }
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Select Grade Letter" }),
          /* @__PURE__ */ jsxs("select", { value: grade, onChange: (e) => setGrade(e.target.value), className: "w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none", children: [
            /* @__PURE__ */ jsx("option", { value: "A+", children: "A+ (Outstanding)" }),
            /* @__PURE__ */ jsx("option", { value: "A", children: "A (Excellent)" }),
            /* @__PURE__ */ jsx("option", { value: "B", children: "B (Good)" }),
            /* @__PURE__ */ jsx("option", { value: "C", children: "C (Pass)" }),
            /* @__PURE__ */ jsx("option", { value: "D", children: "D (Marginal)" }),
            /* @__PURE__ */ jsx("option", { value: "F", children: "F (Fail)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-medium text-slate-400 block mb-1", children: "Feedback Comments" }),
          /* @__PURE__ */ jsx("textarea", { value: feedback, onChange: (e) => setFeedback(e.target.value), placeholder: "Provide helpful suggestions to the student...", rows: 3, className: "w-full p-2.5 rounded bg-slate-950/40 border border-slate-850 text-slate-200 text-xs focus:outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: gradeMut.isPending, className: "flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-8", children: gradeMut.isPending ? "Submitting Grade..." : "Release Grade" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => setGradingOpen(false), variant: "outline", className: "border-slate-800 text-slate-400 text-xs h-8", children: "Cancel" })
        ] })
      ] }) })
    ] }) })
  ] }) });
}
export {
  AssignmentsPage as component
};
