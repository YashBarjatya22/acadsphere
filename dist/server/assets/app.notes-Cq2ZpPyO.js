import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-CzYOcfyh.js";
import { C as ChatLayout } from "./ChatLayout-sTEV38C2.js";
import { g as getProfileAndRole, b as listStudyMaterials, e as listSubjects, f as createStudyMaterial, t as toggleFavoriteMaterial } from "./studentos.functions-D5GpOzs6.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { I as Input } from "./input-poeoKceV.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-Cwsrt9M1.js";
import { toast } from "sonner";
import { Sparkles, Upload, Folder, Search, X, Loader2, Star, Download } from "lucide-react";
import "@tanstack/react-router";
import "./server-CeiC96WD.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-CZBfFAiY.js";
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
const DEMO_DUMMY_NOTES = [{
  id: "note-1",
  title: "Normalization in Relational Databases",
  description: "Covers 1NF, 2NF, 3NF, and BCNF with step-by-step decomposition examples.",
  category: "Lecture Slides",
  fileUrl: "#",
  isFavorite: true,
  subjectCode: "CS301",
  subjectName: "DBMS"
}, {
  id: "note-2",
  title: "CPU Scheduling & Banker's Algorithm",
  description: "Comprehensive breakdown of Gantt charts, turn-around times, and deadlock prevention.",
  category: "Cheat Sheet",
  fileUrl: "#",
  isFavorite: false,
  subjectCode: "CS302",
  subjectName: "Operating Systems"
}, {
  id: "note-3",
  title: "Computer Networks TCP/IP 4-Layer Guide",
  description: "Handshake protocols, packet headers, IP addressing, and subnetting formulas.",
  category: "Question Bank",
  fileUrl: "#",
  isFavorite: true,
  subjectCode: "CS303",
  subjectName: "Computer Networks"
}, {
  id: "note-4",
  title: "React Hooks & Virtual DOM Cheatsheet",
  description: "useState, useEffect, custom hooks, and state management walkthroughs.",
  category: "Lecture Slides",
  fileUrl: "#",
  isFavorite: false,
  subjectCode: "CS304",
  subjectName: "Web Technologies"
}, {
  id: "note-5",
  title: "Machine Learning Gradient Descent Math",
  description: "Mathematical derivations for linear regression, backpropagation, and loss functions.",
  category: "Cheat Sheet",
  fileUrl: "#",
  isFavorite: false,
  subjectCode: "CS305",
  subjectName: "Artificial Intelligence"
}, {
  id: "note-6",
  title: "B+ Trees & Hashing Algorithm Manual",
  description: "Disk I/O optimization, node splitting, collision resolution, and AVL rotations.",
  category: "Question Bank",
  fileUrl: "#",
  isFavorite: true,
  subjectCode: "CS306",
  subjectName: "Data Structures"
}];
function NotesLibraryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiSubject, setAiSubject] = useState("Database Management Systems");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    description: "",
    subjectId: "",
    fileUrl: "",
    category: "Lecture Slides"
  });
  const getProfileFn = useServerFn(getProfileAndRole);
  const listMaterialsFn = useServerFn(listStudyMaterials);
  const createMaterialFn = useServerFn(createStudyMaterial);
  const toggleFavFn = useServerFn(toggleFavoriteMaterial);
  const listSubjectsFn = useServerFn(listSubjects);
  const {
    data: profile
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn()
  });
  const {
    data: serverMaterials = [],
    isLoading: loadingNotes
  } = useQuery({
    queryKey: ["notesList", selectedSubId],
    queryFn: () => listMaterialsFn({
      data: {
        subjectId: selectedSubId || void 0
      }
    })
  });
  const {
    data: subjects = []
  } = useQuery({
    queryKey: ["subjectsList"],
    queryFn: () => listSubjectsFn()
  });
  const [customNotes, setCustomNotes] = useState([]);
  const materials = useMemo(() => {
    const combined = [...customNotes, ...serverMaterials];
    for (const d of DEMO_DUMMY_NOTES) {
      if (!combined.some((m) => m.id === d.id || m.title === d.title)) {
        combined.push(d);
      }
    }
    return combined;
  }, [serverMaterials, customNotes]);
  const activeRole = profile?.role || "student";
  const canUpload = activeRole === "faculty" || activeRole === "admin";
  const uploadMut = useMutation({
    mutationFn: (data) => createMaterialFn({
      data
    }),
    onSuccess: () => {
      toast.success("Study note uploaded and cataloged!");
      setUploadOpen(false);
      setNewNote({
        title: "",
        description: "",
        subjectId: "",
        fileUrl: "",
        category: "Lecture Slides"
      });
      qc.invalidateQueries({
        queryKey: ["notesList"]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to upload study note");
    }
  });
  const favMut = useMutation({
    mutationFn: (materialId) => toggleFavFn({
      data: {
        materialId
      }
    }),
    onSuccess: (res) => {
      toast.success(res.favorited ? "Added to bookmarks!" : "Removed from bookmarks");
      qc.invalidateQueries({
        queryKey: ["notesList"]
      });
    }
  });
  function handleGenerateAiNotes(e) {
    e.preventDefault();
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic for AI Smart Note generation.");
      return;
    }
    setAiGenerating(true);
    toast.info(`Generating Smart Notes for "${aiTopic}"...`);
    setTimeout(() => {
      const generatedNote = {
        id: `ai-note-${Date.now()}`,
        title: `AI Notes: ${aiTopic}`,
        description: `Comprehensive AI-generated study summary covering core principles, derivations, 2-mark definitions, and 10-mark exam prompts for ${aiTopic}.`,
        category: "AI Smart Note",
        fileUrl: "#",
        isFavorite: true,
        subjectCode: aiSubject.includes("Database") ? "CS301" : aiSubject.includes("Operating") ? "CS302" : "CS303",
        subjectName: aiSubject
      };
      setCustomNotes((prev) => [generatedNote, ...prev]);
      setAiGenerating(false);
      setAiModalOpen(false);
      setAiTopic("");
      toast.success("Smart Note generated & added to library!");
    }, 1200);
  }
  function handleDownloadNote(note) {
    const content = `================================================================
ACADSPHERE AI SMART NOTES
Subject Code: ${note.subjectCode || "CS301"} | Subject: ${note.subjectName || "Computer Science"}
Category: ${note.category || "Lecture Notes"}
Title: ${note.title}
================================================================

EXECUTIVE OVERVIEW & SYLLABUS SCOPE:
${note.description || "Comprehensive lecture notes and exam study guide."}

CORE CONCEPT BREAKDOWN:
1. Fundamental Definitions & Key Principles
   - Detailed conceptual explanation of ${note.title}.
   - Core functional dependencies, algorithms, or architectural flow.

2. Step-by-Step Worked Examples:
   - Example 1: Basic decomposition and property verification.
   - Example 2: Complex multi-variable problem solving.

3. Formula & Key Terminology Reference:
   - Primary Keys, Foreign Keys, Closure Algorithms, and Time Complexity bounds.

RECOMMENDED EXAM REVISION QUESTIONS:
- 2-Mark Question: Define ${note.title} and state its primary importance.
- 5-Mark Question: Explain the step-by-step procedure with a diagram.
- 10-Mark Question: Derive the full algorithm and analyze worst-case time complexity.

================================================================
Generated by AcadSphere AI Academic OS · CMR Institute of Technology
Date: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}
================================================================`;
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${note.title.replace(/[^a-zA-Z0-9]/g, "_")}_SmartNotes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${note.title}_SmartNotes.txt`);
  }
  const filteredNotes = materials.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()));
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto bg-background text-foreground p-6 md:p-8 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1", children: "Library" }),
        /* @__PURE__ */ jsx("h1", { className: "font-sans font-extrabold text-foreground tracking-tight text-2xl", children: "Study Notes & Slides" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Browse slides, lecture notes, textbook chapters, or generate AI Smart Notes." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: () => setAiModalOpen(true), size: "sm", className: "h-9 px-4 text-xs font-bold gap-1.5 bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 shadow-sm", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
          " Generate Smart Notes"
        ] }),
        canUpload && /* @__PURE__ */ jsxs(Button, { onClick: () => setUploadOpen(true), variant: "outline", size: "sm", className: "h-9 px-4 text-xs font-bold gap-1.5 border-border", children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
          " Upload Material"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none", children: [
      /* @__PURE__ */ jsx(Button, { variant: selectedSubId === "" ? "default" : "outline", size: "sm", onClick: () => setSelectedSubId(""), className: "h-8 text-xs font-semibold rounded-full px-4", children: "All Folders" }),
      subjects.map((sub) => /* @__PURE__ */ jsxs(Button, { variant: selectedSubId === sub.id ? "default" : "outline", size: "sm", onClick: () => setSelectedSubId(sub.id), className: "h-8 text-xs font-semibold rounded-full px-4 gap-1.5", children: [
        /* @__PURE__ */ jsx(Folder, { className: "h-3 w-3" }),
        sub.code || sub.name
      ] }, sub.id))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative mb-8", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { placeholder: "Search notes, slides or cheat sheets...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-10 h-11 text-xs rounded-full border-border bg-card shadow-sm" })
    ] }),
    aiModalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-popover border border-border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4 font-sans", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-border pb-3", children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-extrabold text-sm flex items-center gap-2 text-foreground", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-amber-500" }),
          " Generate AI Smart Note"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setAiModalOpen(false), className: "p-1 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleGenerateAiNotes, className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "font-bold uppercase text-[10px] text-muted-foreground", children: "Subject / Course" }),
          /* @__PURE__ */ jsxs("select", { value: aiSubject, onChange: (e) => setAiSubject(e.target.value), className: "w-full mt-1 h-9 rounded-lg border border-border bg-background px-3 text-xs", children: [
            /* @__PURE__ */ jsx("option", { value: "Database Management Systems", children: "Database Management Systems (CS301)" }),
            /* @__PURE__ */ jsx("option", { value: "Operating Systems", children: "Operating Systems (CS302)" }),
            /* @__PURE__ */ jsx("option", { value: "Computer Networks", children: "Computer Networks (CS303)" }),
            /* @__PURE__ */ jsx("option", { value: "Artificial Intelligence", children: "Artificial Intelligence (CS305)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "font-bold uppercase text-[10px] text-muted-foreground", children: "Syllabus Topic or Concept" }),
          /* @__PURE__ */ jsx(Input, { value: aiTopic, onChange: (e) => setAiTopic(e.target.value), placeholder: "e.g. B+ Trees Indexing & Hash Collisions", className: "mt-1 h-9 text-xs", required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end pt-3 border-t border-border", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => setAiModalOpen(false), className: "h-8 text-xs", children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: aiGenerating, className: "h-8 text-xs font-bold gap-1.5 bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900", children: aiGenerating ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
            " Generating..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
            " Generate Note"
          ] }) })
        ] })
      ] })
    ] }) }),
    uploadOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-popover border border-border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-border pb-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-sm", children: "Upload Study Material" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setUploadOpen(false), className: "p-1 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "font-bold uppercase text-[10px] text-muted-foreground", children: "Title" }),
          /* @__PURE__ */ jsx(Input, { value: newNote.title, onChange: (e) => setNewNote({
            ...newNote,
            title: e.target.value
          }), placeholder: "e.g. Unit 3 DBMS Normalization", className: "mt-1 h-9" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "font-bold uppercase text-[10px] text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsx(Input, { value: newNote.description, onChange: (e) => setNewNote({
            ...newNote,
            description: e.target.value
          }), placeholder: "Brief summary of topics covered", className: "mt-1 h-9" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "font-bold uppercase text-[10px] text-muted-foreground", children: "Category" }),
          /* @__PURE__ */ jsxs("select", { value: newNote.category, onChange: (e) => setNewNote({
            ...newNote,
            category: e.target.value
          }), className: "w-full mt-1 h-9 rounded-md border border-border bg-background px-3 text-xs", children: [
            /* @__PURE__ */ jsx("option", { value: "Lecture Slides", children: "Lecture Slides" }),
            /* @__PURE__ */ jsx("option", { value: "Cheat Sheet", children: "Cheat Sheet" }),
            /* @__PURE__ */ jsx("option", { value: "Question Bank", children: "Question Bank" }),
            /* @__PURE__ */ jsx("option", { value: "Lab Manual", children: "Lab Manual" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end pt-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setUploadOpen(false), className: "h-8 text-xs", children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { onClick: () => uploadMut.mutate(newNote), disabled: uploadMut.isPending, className: "h-8 text-xs font-bold", children: uploadMut.isPending ? "Uploading..." : "Save Note" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: filteredNotes.map((note) => /* @__PURE__ */ jsxs(Card, { className: "border-border bg-card shadow-sm hover:shadow-md transition-all rounded-2xl flex flex-col justify-between", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-foreground border border-border", children: note.category || "Lecture Notes" }),
          /* @__PURE__ */ jsx("button", { onClick: () => favMut.mutate(note.id), className: "text-muted-foreground hover:text-amber-500 transition-colors p-1", children: /* @__PURE__ */ jsx(Star, { className: `h-4 w-4 ${note.isFavorite ? "fill-amber-400 text-amber-400" : ""}` }) })
        ] }),
        /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-bold text-foreground mt-2 leading-snug", children: note.title }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: note.description })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "pt-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-border/60 pt-3 mt-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-muted-foreground", children: [
          note.subjectCode || "CS301",
          " · ",
          note.subjectName || "CS"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleDownloadNote(note), className: "h-7 px-2.5 text-[11px] font-semibold gap-1 text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
          " Download"
        ] })
      ] }) })
    ] }, note.id)) })
  ] }) });
}
export {
  NotesLibraryPage as component
};
