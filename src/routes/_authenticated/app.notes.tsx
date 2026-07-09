import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { 
  listStudyMaterials, createStudyMaterial, 
  toggleFavoriteMaterial, listSubjects, getProfileAndRole 
} from "@/lib/studentos.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  FileText, Plus, Search, Folder, Star, Download, Upload, 
  BookOpen, Clock, Tag, RefreshCw, X
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/notes")({
  component: NotesLibraryPage,
});

function NotesLibraryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  // New Note state
  const [newNote, setNewNote] = useState({
    title: "",
    description: "",
    subjectId: "",
    fileUrl: "",
    category: "Lecture Slides",
  });

  // Server functions
  const getProfileFn = useServerFn(getProfileAndRole);
  const listMaterialsFn = useServerFn(listStudyMaterials);
  const createMaterialFn = useServerFn(createStudyMaterial);
  const toggleFavFn = useServerFn(toggleFavoriteMaterial);
  const listSubjectsFn = useServerFn(listSubjects);

  // Queries
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn(),
  });

  const { data: materials = [], isLoading: loadingNotes } = useQuery({
    queryKey: ["notesList", selectedSubId],
    queryFn: () => listMaterialsFn({ data: { subjectId: selectedSubId || undefined } }),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjectsList"],
    queryFn: () => listSubjectsFn(),
  });

  const activeRole = profile?.role || "student";
  const canUpload = activeRole === "faculty" || activeRole === "admin";

  // Mutations
  const uploadMut = useMutation({
    mutationFn: (data: typeof newNote) => createMaterialFn({ data }),
    onSuccess: () => {
      toast.success("Study note uploaded and cataloged!");
      setUploadOpen(false);
      setNewNote({ title: "", description: "", subjectId: "", fileUrl: "", category: "Lecture Slides" });
      qc.invalidateQueries({ queryKey: ["notesList"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload study note");
    }
  });

  const favMut = useMutation({
    mutationFn: (materialId: string) => toggleFavFn({ data: { materialId } }),
    onSuccess: (res) => {
      toast.success(res.favorited ? "Added to bookmarks!" : "Removed from bookmarks");
      qc.invalidateQueries({ queryKey: ["notesList"] });
    }
  });

  // Filter notes based on text search
  const filteredNotes = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full overflow-y-auto bg-[#0B0F19] text-slate-100 p-6 md:p-8 scrollbar-thin">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Folder className="h-6 w-6 text-indigo-400" /> Study Notes & Slides Library
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Browse slides, lecture notes, textbook chapters, and bookmark favorites.
            </p>
          </div>

          {canUpload && (
            <Button onClick={() => setUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
              <Plus className="h-3.5 w-3.5 mr-1" /> Upload Note
            </Button>
          )}
        </div>

        {/* Categories / Folders Row */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSubId("")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedSubId === ""
                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"
            }`}
          >
            All Folders
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubId(sub.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                selectedSubId === sub.id
                  ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                  : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Folder className="h-3.5 w-3.5" />
              {sub.code}
            </button>
          ))}
        </div>

        {/* Search Panel */}
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <Input 
            placeholder="Search notes, slides or cheat sheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-slate-900/40 border-slate-800 text-slate-200 text-xs h-9 placeholder-slate-500 rounded"
          />
        </div>

        {/* Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          
          {/* Notes Card list (Col span 3) */}
          <div className="lg:col-span-3 space-y-4">
            {loadingNotes ? (
              <div className="py-20 flex justify-center items-center text-slate-400">
                <RefreshCw className="animate-spin h-5 w-5 mr-1" /> Loading notes vault...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">No notes matching filter.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="bg-slate-900/40 border-slate-800 text-left hover:border-slate-700/80 transition-all flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 bg-slate-950/20 border border-slate-800/40 text-[9px] font-bold text-slate-400 rounded uppercase font-mono flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5" /> {note.category}
                        </span>
                        
                        <button 
                          onClick={() => favMut.mutate(note.id)}
                          className={`p-1 rounded hover:bg-slate-850 transition-colors ${note.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
                        >
                          <Star className="h-4 w-4" fill={note.isFavorite ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <CardTitle className="text-xs font-bold text-slate-200 mt-2">{note.title}</CardTitle>
                      <CardDescription className="text-[10px] text-slate-500">{note.subjectCode} - {note.subjectName}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-2">
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{note.description}</p>
                      
                      <div className="flex justify-end pt-2 border-t border-slate-850/60">
                        <Button 
                          onClick={() => toast.success(`Simulating download of notes: ${note.fileUrl}`)}
                          size="sm"
                          variant="ghost" 
                          className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-950/20"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Bookmarks & Recently Viewed */}
          <div className="space-y-6 text-left">
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Bookmarked Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {materials.filter(m => m.isFavorite).length === 0 ? (
                  <div className="text-[10px] text-slate-500">No bookmarks saved yet.</div>
                ) : (
                  materials.filter(m => m.isFavorite).map((note) => (
                    <div key={note.id} className="p-2 border border-slate-850 bg-slate-950/20 rounded flex items-center justify-between">
                      <span className="text-[11px] text-slate-200 truncate pr-2">{note.title}</span>
                      <button onClick={() => favMut.mutate(note.id)} className="text-slate-500 hover:text-red-400 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" /> Recently Downloaded
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex gap-2 items-center text-[11px] text-slate-300">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  <span className="truncate">DBMS Normalization Notes.pdf</span>
                </div>
                <div className="flex gap-2 items-center text-[11px] text-slate-300">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="truncate">CPU Scheduling Cheat Sheet.pdf</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* FACULTY UPLOAD NOTE DIALOG MODAL */}
        {uploadOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4">
            <Card className="bg-[#0F172A] border-slate-850 w-full max-w-sm shadow-2xl text-left relative">
              <button onClick={() => setUploadOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
              
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-200">Catalog Study Note / Slide</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  uploadMut.mutate(newNote);
                }} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Subject / Lecture Slot</label>
                    <select
                      value={newNote.subjectId}
                      onChange={(e) => setNewNote({ ...newNote, subjectId: e.target.value })}
                      className="w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none"
                      required
                    >
                      <option value="">Select subject...</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Note Title</label>
                    <Input
                      required
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="e.g. Normalization and BCNF Lecture Slides"
                      className="bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Topic Description</label>
                    <textarea
                      value={newNote.description}
                      onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                      placeholder="Provide summaries or chapters covered..."
                      rows={3}
                      className="w-full p-2 rounded bg-slate-950/40 border border-slate-850 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Category</label>
                      <select
                        value={newNote.category}
                        onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                        className="w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none"
                      >
                        <option value="Lecture Slides">Lecture Slides</option>
                        <option value="Cheat Sheets">Cheat Sheets</option>
                        <option value="Lab Sheets">Lab Sheets</option>
                        <option value="Previous Papers">Previous Papers</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">File Name</label>
                      <Input
                        required
                        value={newNote.fileUrl}
                        onChange={(e) => setNewNote({ ...newNote, fileUrl: e.target.value })}
                        placeholder="e.g. normal_form_slides.pdf"
                        className="bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={uploadMut.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
                      {uploadMut.isPending ? "Uploading..." : "Save Material"}
                    </Button>
                    <Button type="button" onClick={() => setUploadOpen(false)} variant="outline" className="border-slate-800 text-slate-400 text-xs h-8">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </ChatLayout>
  );
}
