import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback } from "react";
import { C as ChatLayout } from "./ChatLayout-DhDUl__k.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./card-Cwsrt9M1.js";
import { supabase } from "./client-h4N4kZKq.js";
import { toast } from "sonner";
import { FileText, FileSpreadsheet, Presentation, FileImage, FileOutput, Zap, Shield, Clock, Sparkles, CheckCircle2, Upload, X, Download, RefreshCw } from "lucide-react";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "./createSsrRpc-B5NaTOOc.js";
import "./server-CTRvd-y5.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DvqTfCBg.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "./studentos-logo-CCLo3MN1.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "class-variance-authority";
const CONVERSIONS = [{
  id: "pdf-to-word",
  label: "PDF → Word",
  description: "Convert PDF documents to editable DOCX files",
  inputExt: [".pdf"],
  outputExt: "docx",
  icon: FileText,
  gradient: "from-blue-500 to-indigo-600",
  accept: ".pdf,application/pdf"
}, {
  id: "word-to-pdf",
  label: "Word → PDF",
  description: "Turn Word documents into polished PDFs",
  inputExt: [".doc", ".docx"],
  outputExt: "pdf",
  icon: FileText,
  gradient: "from-indigo-500 to-purple-600",
  accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}, {
  id: "pdf-to-excel",
  label: "PDF → Excel",
  description: "Extract tables from PDFs into spreadsheets",
  inputExt: [".pdf"],
  outputExt: "xlsx",
  icon: FileSpreadsheet,
  gradient: "from-emerald-500 to-teal-600",
  accept: ".pdf,application/pdf"
}, {
  id: "excel-to-pdf",
  label: "Excel → PDF",
  description: "Convert spreadsheets to shareable PDFs",
  inputExt: [".xls", ".xlsx"],
  outputExt: "pdf",
  icon: FileSpreadsheet,
  gradient: "from-teal-500 to-cyan-600",
  accept: ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}, {
  id: "pdf-to-powerpoint",
  label: "PDF → PowerPoint",
  description: "Convert PDF slides into editable presentations",
  inputExt: [".pdf"],
  outputExt: "pptx",
  icon: Presentation,
  gradient: "from-orange-500 to-rose-600",
  accept: ".pdf,application/pdf"
}, {
  id: "powerpoint-to-pdf",
  label: "PowerPoint → PDF",
  description: "Turn presentations into portable PDFs",
  inputExt: [".ppt", ".pptx"],
  outputExt: "pdf",
  icon: Presentation,
  gradient: "from-rose-500 to-pink-600",
  accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
}, {
  id: "pdf-to-jpg",
  label: "PDF → JPG",
  description: "Export each PDF page as a high-quality image",
  inputExt: [".pdf"],
  outputExt: "jpg",
  icon: FileImage,
  gradient: "from-yellow-500 to-orange-500",
  accept: ".pdf,application/pdf"
}, {
  id: "image-to-pdf",
  label: "Image → PDF",
  description: "Merge JPG/PNG images into a single PDF",
  inputExt: [".jpg", ".jpeg", ".png", ".webp"],
  outputExt: "pdf",
  icon: FileImage,
  gradient: "from-violet-500 to-purple-600",
  accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
}];
function ConversionsPage() {
  const [selectedConversion, setSelectedConversion] = useState(CONVERSIONS[0]);
  const [droppedFile, setDroppedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState("idle");
  const [history, setHistory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [selectedConversion]);
  const handleFile = (file) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!selectedConversion.inputExt.includes(ext)) {
      toast.error(`Invalid file type. Expected: ${selectedConversion.inputExt.join(", ")}`);
      return;
    }
    setDroppedFile(file);
    setProgress("idle");
  };
  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };
  const handleConvert = async () => {
    if (!droppedFile) return;
    setConverting(true);
    setProgress("uploading");
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user || !session?.access_token) {
        toast.error("You must be logged in to convert files.");
        setConverting(false);
        return;
      }
      const userId = session.user.id;
      const timestamp = Date.now();
      const sourcePath = `${userId}/${timestamp}_${droppedFile.name}`;
      setProgress("uploading");
      const {
        createClient
      } = await import("@supabase/supabase-js");
      const authClient = createClient("https://jlyembaddiyakxuvaflq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0", {
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      });
      const {
        error: uploadError
      } = await authClient.storage.from("conversions").upload(sourcePath, droppedFile, {
        upsert: true
      });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      setProgress("processing");
      const {
        data,
        error: fnError
      } = await supabase.functions.invoke("file-converter", {
        body: {
          source_path: sourcePath,
          target_format: selectedConversion.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (fnError) {
        let actualMsg = fnError.message;
        try {
          const body = await fnError.context?.json?.();
          if (body?.error) actualMsg = body.error;
        } catch {
        }
        console.error("Edge function error:", actualMsg);
        throw new Error(actualMsg);
      }
      if (!data?.success) throw new Error(data?.error || "Conversion failed");
      setProgress("saving");
      const historyItem = {
        id: `${timestamp}`,
        fileName: droppedFile.name,
        conversion: selectedConversion.label,
        signedUrl: data.signed_url,
        outputFileName: data.file_name,
        timestamp: /* @__PURE__ */ new Date()
      };
      setHistory((prev) => [historyItem, ...prev]);
      setProgress("done");
      toast.success("✅ File converted successfully!", {
        description: `${droppedFile.name} → ${data.file_name}`
      });
    } catch (err) {
      console.error("Conversion error:", err);
      toast.error("Conversion failed", {
        description: err.message
      });
      setProgress("idle");
    } finally {
      setConverting(false);
    }
  };
  const resetState = () => {
    setDroppedFile(null);
    setProgress("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const progressLabel = {
    idle: "",
    uploading: "Uploading file…",
    processing: "Converting with iLoveAPI…",
    saving: "Saving converted file…",
    done: "Done!"
  }[progress];
  const progressPercent = {
    idle: 0,
    uploading: 25,
    processing: 65,
    saving: 90,
    done: 100
  }[progress];
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: null, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full overflow-y-auto bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 px-6 py-10 md:px-10 md:py-14 shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-10", style: {
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: "28px 28px"
      } }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-3xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30", children: /* @__PURE__ */ jsx(FileOutput, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-white/70 text-xs font-semibold uppercase tracking-widest", children: "Powered by iLoveAPI" })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold text-white mb-2 leading-tight", children: "File Converter" }),
        /* @__PURE__ */ jsx("p", { className: "text-white/75 text-sm md:text-base max-w-xl", children: "Convert PDFs, Word docs, spreadsheets, presentations and images — instantly and securely." }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mt-5", children: [{
          icon: Zap,
          label: "Fast conversion"
        }, {
          icon: Shield,
          label: "Encrypted & private"
        }, {
          icon: Clock,
          label: "1h download link"
        }, {
          icon: Sparkles,
          label: "8 format types"
        }].map(({
          icon: Icon,
          label
        }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-white/90 text-xs font-medium ring-1 ring-white/20", children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
          label
        ] }, label)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-5", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-border/40", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: `h-6 w-6 rounded-lg bg-gradient-to-br ${selectedConversion.gradient} flex items-center justify-center`, children: /* @__PURE__ */ jsx(selectedConversion.icon, { className: "h-3.5 w-3.5 text-white" }) }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold uppercase tracking-wider", children: "Step 1 — Select Conversion" })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: CONVERSIONS.map((conv) => /* @__PURE__ */ jsxs("button", { onClick: () => {
              setSelectedConversion(conv);
              setDroppedFile(null);
              setProgress("idle");
            }, className: `
                        group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center
                        transition-all duration-200 cursor-pointer
                        ${selectedConversion.id === conv.id ? "border-primary bg-primary/8 shadow-sm" : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/60"}
                      `, children: [
              /* @__PURE__ */ jsx("div", { className: `
                        h-8 w-8 rounded-lg flex items-center justify-center
                        bg-gradient-to-br ${conv.gradient} shadow-sm
                        transition-transform duration-200 group-hover:scale-105
                      `, children: /* @__PURE__ */ jsx(conv.icon, { className: "h-4 w-4 text-white" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-foreground leading-tight", children: conv.label }),
              selectedConversion.id === conv.id && /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 right-1.5", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-primary" }) })
            ] }, conv.id)) }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground mt-3", children: [
              selectedConversion.description,
              " · Accepts: ",
              selectedConversion.inputExt.join(", "),
              " · Output: .",
              selectedConversion.outputExt
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-border/40", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center", children: /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5 text-white" }) }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-bold uppercase tracking-wider", children: "Step 2 — Upload File" })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
            !droppedFile ? /* @__PURE__ */ jsxs("div", { onDragOver, onDragLeave, onDrop, onClick: () => fileInputRef.current?.click(), className: `
                      relative flex flex-col items-center justify-center gap-4
                      rounded-2xl border-2 border-dashed p-10 cursor-pointer
                      transition-all duration-300
                      ${isDragging ? "border-primary bg-primary/8 scale-[1.01]" : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"}
                    `, children: [
              /* @__PURE__ */ jsx("div", { className: `
                      h-16 w-16 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br ${selectedConversion.gradient} shadow-lg
                      transition-transform duration-300
                      ${isDragging ? "scale-110" : ""}
                    `, children: /* @__PURE__ */ jsx(selectedConversion.icon, { className: "h-8 w-8 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: isDragging ? "Drop it here!" : "Drag & drop your file" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                  "or click to browse · ",
                  selectedConversion.inputExt.join(", "),
                  " · max 50 MB"
                ] })
              ] }),
              isDragging && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20" })
            ] }) : (
              /* File selected state */
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/30", children: [
                /* @__PURE__ */ jsx("div", { className: `h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${selectedConversion.gradient} shadow-sm shrink-0`, children: /* @__PURE__ */ jsx(selectedConversion.icon, { className: "h-6 w-6 text-white" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: droppedFile.name }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    (droppedFile.size / 1024 / 1024).toFixed(2),
                    " MB · Ready to convert"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: resetState, className: "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
              ] })
            ),
            /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: selectedConversion.accept, onChange: onFileInputChange, className: "hidden" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5 pb-5 space-y-4", children: [
          converting && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-foreground", children: progressLabel }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                progressPercent,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full bg-gradient-to-r ${selectedConversion.gradient} rounded-full transition-all duration-700`, style: {
              width: `${progressPercent}%`
            } }) })
          ] }),
          progress === "done" && history.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-emerald-500 shrink-0" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-emerald-700 dark:text-emerald-400", children: "Conversion complete!" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-600/80 dark:text-emerald-500/80 truncate", children: history[0].outputFileName })
            ] }),
            /* @__PURE__ */ jsx("a", { href: history[0].signedUrl, download: history[0].outputFileName, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "h-8 text-xs px-3 bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5", children: [
              /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
              "Download"
            ] }) })
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: handleConvert, disabled: !droppedFile || converting, className: `
                    w-full h-11 text-sm font-semibold gap-2
                    bg-gradient-to-r ${selectedConversion.gradient} text-white
                    hover:opacity-90 disabled:opacity-40
                    transition-all duration-200
                    ${!droppedFile || converting ? "cursor-not-allowed" : "hover:scale-[1.01] active:scale-[0.99]"}
                  `, children: converting ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }),
            progressLabel
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(FileOutput, { className: "h-4 w-4" }),
            "Convert ",
            droppedFile ? `"${droppedFile.name}"` : "File"
          ] }) }),
          progress !== "done" && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-center text-muted-foreground", children: "Files are processed securely via iLoveAPI · Download links expire in 1 hour" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-border/40", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-violet-500" }),
            "Supported Formats"
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "pt-3 space-y-2", children: CONVERSIONS.map((conv) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("div", { className: `h-5 w-5 rounded-md flex items-center justify-center bg-gradient-to-br ${conv.gradient}`, children: /* @__PURE__ */ jsx(conv.icon, { className: "h-3 w-3 text-white" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] text-foreground font-medium", children: conv.label })
          ] }, conv.id)) })
        ] }),
        history.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-border/40", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-xs font-bold uppercase tracking-wider flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-blue-500" }),
              "Recent Conversions"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-[10px]", children: "Links valid for 1 hour" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "pt-3 space-y-2", children: history.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/40", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500 shrink-0" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-foreground truncate", children: item.outputFileName }),
              /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground", children: item.conversion })
            ] }),
            /* @__PURE__ */ jsx("a", { href: item.signedUrl, download: item.outputFileName, target: "_blank", rel: "noopener noreferrer", className: "shrink-0", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "h-6 w-6 p-0 border-border/50", children: /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }) }) })
          ] }, item.id)) })
        ] }),
        /* @__PURE__ */ jsx(Card, { className: "border-border/60 bg-gradient-to-br from-violet-500/5 to-blue-500/5", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-4 space-y-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-violet-500" }),
            "Privacy & Security"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: ["Files are stored in your private folder only", "iLoveAPI auto-deletes files after processing", "All storage is protected by Row Level Security", "Signed download URLs expire after 1 hour"].map((tip) => /* @__PURE__ */ jsxs("li", { className: "text-[10px] text-muted-foreground flex items-start gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" }),
            tip
          ] }, tip)) })
        ] }) })
      ] })
    ] })
  ] }) });
}
export {
  ConversionsPage as component
};
