import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FileOutput, Upload, Download, RefreshCw, FileText, FileImage,
  FileSpreadsheet, Presentation, ChevronDown, CheckCircle2, X,
  Sparkles, Zap, Clock, Shield
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/conversions")({
  component: ConversionsPage,
});

// ── Conversion type definitions ───────────────────────────────────────────────
interface ConversionType {
  id: string;
  label: string;
  description: string;
  inputExt: string[];
  outputExt: string;
  icon: React.ElementType;
  gradient: string;
  accept: string;
}

const CONVERSIONS: ConversionType[] = [
  {
    id: "pdf-to-word",
    label: "PDF → Word",
    description: "Convert PDF documents to editable DOCX files",
    inputExt: [".pdf"],
    outputExt: "docx",
    icon: FileText,
    gradient: "from-blue-500 to-indigo-600",
    accept: ".pdf,application/pdf",
  },
  {
    id: "word-to-pdf",
    label: "Word → PDF",
    description: "Turn Word documents into polished PDFs",
    inputExt: [".doc", ".docx"],
    outputExt: "pdf",
    icon: FileText,
    gradient: "from-indigo-500 to-purple-600",
    accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    id: "pdf-to-excel",
    label: "PDF → Excel",
    description: "Extract tables from PDFs into spreadsheets",
    inputExt: [".pdf"],
    outputExt: "xlsx",
    icon: FileSpreadsheet,
    gradient: "from-emerald-500 to-teal-600",
    accept: ".pdf,application/pdf",
  },
  {
    id: "excel-to-pdf",
    label: "Excel → PDF",
    description: "Convert spreadsheets to shareable PDFs",
    inputExt: [".xls", ".xlsx"],
    outputExt: "pdf",
    icon: FileSpreadsheet,
    gradient: "from-teal-500 to-cyan-600",
    accept: ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  {
    id: "pdf-to-powerpoint",
    label: "PDF → PowerPoint",
    description: "Convert PDF slides into editable presentations",
    inputExt: [".pdf"],
    outputExt: "pptx",
    icon: Presentation,
    gradient: "from-orange-500 to-rose-600",
    accept: ".pdf,application/pdf",
  },
  {
    id: "powerpoint-to-pdf",
    label: "PowerPoint → PDF",
    description: "Turn presentations into portable PDFs",
    inputExt: [".ppt", ".pptx"],
    outputExt: "pdf",
    icon: Presentation,
    gradient: "from-rose-500 to-pink-600",
    accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  {
    id: "pdf-to-jpg",
    label: "PDF → JPG",
    description: "Export each PDF page as a high-quality image",
    inputExt: [".pdf"],
    outputExt: "jpg",
    icon: FileImage,
    gradient: "from-yellow-500 to-orange-500",
    accept: ".pdf,application/pdf",
  },
  {
    id: "image-to-pdf",
    label: "Image → PDF",
    description: "Merge JPG/PNG images into a single PDF",
    inputExt: [".jpg", ".jpeg", ".png", ".webp"],
    outputExt: "pdf",
    icon: FileImage,
    gradient: "from-violet-500 to-purple-600",
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
  },
];

// ── Conversion history item ────────────────────────────────────────────────────
interface HistoryItem {
  id: string;
  fileName: string;
  conversion: string;
  signedUrl: string;
  outputFileName: string;
  timestamp: Date;
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ConversionsPage() {
  const [selectedConversion, setSelectedConversion] = useState<ConversionType>(CONVERSIONS[0]);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState<"idle" | "uploading" | "processing" | "saving" | "done">("idle");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Drag & drop handlers ───────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [selectedConversion]);

  const handleFile = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!selectedConversion.inputExt.includes(ext)) {
      toast.error(`Invalid file type. Expected: ${selectedConversion.inputExt.join(", ")}`);
      return;
    }
    setDroppedFile(file);
    setProgress("idle");
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Conversion handler ─────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (!droppedFile) return;

    setConverting(true);
    setProgress("uploading");

    try {
      // Get authenticated session with access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !session?.access_token) {
        toast.error("You must be logged in to convert files.");
        setConverting(false);
        return;
      }

      const userId    = session.user.id;
      const timestamp = Date.now();
      const sourcePath = `${userId}/${timestamp}_${droppedFile.name}`;

      // Step 1: Upload source file to Supabase storage using session-scoped client
      setProgress("uploading");
      const { createClient } = await import("@supabase/supabase-js");
      const authClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${session.access_token}` } } }
      );

      const { error: uploadError } = await authClient.storage
        .from("conversions")
        .upload(sourcePath, droppedFile, { upsert: true });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Step 2: Call edge function — pass session JWT explicitly so edge fn can identify user
      setProgress("processing");
      const { data, error: fnError } = await supabase.functions.invoke("file-converter", {
        body: { source_path: sourcePath, target_format: selectedConversion.id },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) {
        console.error("Edge function error:", fnError);
        throw new Error(fnError.message || "Edge function failed");
      }
      if (!data?.success) throw new Error(data?.error || "Conversion failed");


      setProgress("saving");

      // Step 3: Record in local history
      const historyItem: HistoryItem = {
        id: `${timestamp}`,
        fileName: droppedFile.name,
        conversion: selectedConversion.label,
        signedUrl: data.signed_url,
        outputFileName: data.file_name,
        timestamp: new Date(),
      };

      setHistory((prev) => [historyItem, ...prev]);
      setProgress("done");

      toast.success("✅ File converted successfully!", {
        description: `${droppedFile.name} → ${data.file_name}`,
      });

    } catch (err: any) {
      console.error("Conversion error:", err);
      toast.error("Conversion failed", { description: err.message });
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
    done: "Done!",
  }[progress];

  const progressPercent = {
    idle: 0,
    uploading: 25,
    processing: 65,
    saving: 90,
    done: 100,
  }[progress];

  return (
    <ChatLayout activeThreadId={null}>
      <div className="flex flex-col h-full overflow-y-auto bg-background">

        {/* ── Hero Header ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 px-6 py-10 md:px-10 md:py-14 shrink-0">
          {/* Background grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30">
                <FileOutput className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                Powered by iLoveAPI
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
              File Converter
            </h1>
            <p className="text-white/75 text-sm md:text-base max-w-xl">
              Convert PDFs, Word docs, spreadsheets, presentations and images — instantly and securely.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                { icon: Zap,        label: "Fast conversion" },
                { icon: Shield,     label: "Encrypted & private" },
                { icon: Clock,      label: "1h download link" },
                { icon: Sparkles,   label: "8 format types" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-white/90 text-xs font-medium ring-1 ring-white/20"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────────────────────── */}
        <div className="flex-1 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">

          {/* ── Left column: Converter UI ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1: Format Selector */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${selectedConversion.gradient} flex items-center justify-center`}>
                    <selectedConversion.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider">
                    Step 1 — Select Conversion
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Conversion type grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONVERSIONS.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversion(conv);
                        setDroppedFile(null);
                        setProgress("idle");
                      }}
                      className={`
                        group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center
                        transition-all duration-200 cursor-pointer
                        ${selectedConversion.id === conv.id
                          ? "border-primary bg-primary/8 shadow-sm"
                          : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/60"
                        }
                      `}
                    >
                      <div className={`
                        h-8 w-8 rounded-lg flex items-center justify-center
                        bg-gradient-to-br ${conv.gradient} shadow-sm
                        transition-transform duration-200 group-hover:scale-105
                      `}>
                        <conv.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[10px] font-semibold text-foreground leading-tight">
                        {conv.label}
                      </span>
                      {selectedConversion.id === conv.id && (
                        <div className="absolute top-1.5 right-1.5">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  {selectedConversion.description} · Accepts: {selectedConversion.inputExt.join(", ")} · Output: .{selectedConversion.outputExt}
                </p>
              </CardContent>
            </Card>

            {/* Step 2: Drop Zone */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
                    <Upload className="h-3.5 w-3.5 text-white" />
                  </div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider">
                    Step 2 — Upload File
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {!droppedFile ? (
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative flex flex-col items-center justify-center gap-4
                      rounded-2xl border-2 border-dashed p-10 cursor-pointer
                      transition-all duration-300
                      ${isDragging
                        ? "border-primary bg-primary/8 scale-[1.01]"
                        : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                      }
                    `}
                  >
                    <div className={`
                      h-16 w-16 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br ${selectedConversion.gradient} shadow-lg
                      transition-transform duration-300
                      ${isDragging ? "scale-110" : ""}
                    `}>
                      <selectedConversion.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">
                        {isDragging ? "Drop it here!" : "Drag & drop your file"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or click to browse · {selectedConversion.inputExt.join(", ")} · max 50 MB
                      </p>
                    </div>

                    {/* Animated ring when dragging */}
                    {isDragging && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20" />
                    )}
                  </div>
                ) : (
                  /* File selected state */
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/30">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${selectedConversion.gradient} shadow-sm shrink-0`}>
                      <selectedConversion.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{droppedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(droppedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to convert
                      </p>
                    </div>
                    <button
                      onClick={resetState}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedConversion.accept}
                  onChange={onFileInputChange}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Step 3: Convert + Progress */}
            <Card className="border-border/60">
              <CardContent className="pt-5 pb-5 space-y-4">
                {/* Progress bar (shown when converting) */}
                {converting && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-medium text-foreground">{progressLabel}</p>
                      <p className="text-xs text-muted-foreground">{progressPercent}%</p>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${selectedConversion.gradient} rounded-full transition-all duration-700`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success result */}
                {progress === "done" && history.length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Conversion complete!</p>
                      <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 truncate">{history[0].outputFileName}</p>
                    </div>
                    <a
                      href={history[0].signedUrl}
                      download={history[0].outputFileName}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="h-8 text-xs px-3 bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </a>
                  </div>
                )}

                {/* Convert button */}
                <Button
                  onClick={handleConvert}
                  disabled={!droppedFile || converting}
                  className={`
                    w-full h-11 text-sm font-semibold gap-2
                    bg-gradient-to-r ${selectedConversion.gradient} text-white
                    hover:opacity-90 disabled:opacity-40
                    transition-all duration-200
                    ${!droppedFile || converting ? "cursor-not-allowed" : "hover:scale-[1.01] active:scale-[0.99]"}
                  `}
                >
                  {converting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {progressLabel}
                    </>
                  ) : (
                    <>
                      <FileOutput className="h-4 w-4" />
                      Convert {droppedFile ? `"${droppedFile.name}"` : "File"}
                    </>
                  )}
                </Button>

                {progress !== "done" && (
                  <p className="text-[10px] text-center text-muted-foreground">
                    Files are processed securely via iLoveAPI · Download links expire in 1 hour
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right column: Info + History ─────────────────────────── */}
          <div className="space-y-5">

            {/* Supported formats info */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  Supported Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                {CONVERSIONS.map((conv) => (
                  <div key={conv.id} className="flex items-center gap-2.5">
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center bg-gradient-to-br ${conv.gradient}`}>
                      <conv.icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] text-foreground font-medium">{conv.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Session history */}
            {history.length > 0 && (
              <Card className="border-border/60">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    Recent Conversions
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Links valid for 1 hour
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/40"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-foreground truncate">{item.outputFileName}</p>
                        <p className="text-[9px] text-muted-foreground">{item.conversion}</p>
                      </div>
                      <a
                        href={item.signedUrl}
                        download={item.outputFileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 border-border/50"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="border-border/60 bg-gradient-to-br from-violet-500/5 to-blue-500/5">
              <CardContent className="pt-4 pb-4 space-y-3">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-violet-500" />
                  Privacy & Security
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Files are stored in your private folder only",
                    "iLoveAPI auto-deletes files after processing",
                    "All storage is protected by Row Level Security",
                    "Signed download URLs expire after 1 hour",
                  ].map((tip) => (
                    <li key={tip} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
