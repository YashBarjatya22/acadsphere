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
      <div className="h-full overflow-y-auto bg-background text-foreground p-6 md:p-8">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1">Library</p>
            <h1 className="font-sans font-extrabold text-foreground" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", letterSpacing: "-0.03em" }}>
              Study Notes &amp; Slides
            </h1>
            <p className="font-sans text-[12px] text-muted-foreground mt-1">
              Browse slides, lecture notes, textbook chapters, and bookmark favorites.
            </p>
          </div>

          {canUpload && (
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Upload Note
            </Button>
          )}
        </div>

        {/* Categories / Folders Row */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSubId("")}
            className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-[0.08em] border transition-colors duration-[120ms] ${
              selectedSubId === ""
                ? "bg-foreground text-background border-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            All Folders
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubId(sub.id)}
              className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-[0.08em] border transition-colors duration-[120ms] flex items-center gap-1.5 ${
                selectedSubId === sub.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Folder className="h-3 w-3" />
              {sub.code}
            </button>
          ))}
        </div>

        {/* Search Panel */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search notes, slides or cheat sheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          
          {/* Notes Card list (Col span 3) */}
          <div className="lg:col-span-3 space-y-4">
            {loadingNotes ? (
              <div className="py-20 flex justify-center items-center text-muted-foreground">
                <RefreshCw className="animate-spin h-4 w-4 mr-2" /> Loading notes vault...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">No notes matching filter.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="flex flex-col justify-between hover:bg-accent transition-colors duration-[120ms]">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border border-border bg-background text-muted-foreground flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5" /> {note.category}
                        </span>
                        
                        <button 
                          onClick={() => favMut.mutate(note.id)}
                          className={`p-1 rounded-md transition-colors ${note.isFavorite ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Star className="h-4 w-4" fill={note.isFavorite ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <CardTitle className="font-sans font-semibold text-[13px] text-foreground mt-2">{note.title}</CardTitle>
                      <CardDescription className="font-mono text-[10px] uppercase tracking-[0.06em]">{note.subjectCode} — {note.subjectName}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-2">
                      <p className="font-sans text-[12px] text-muted-foreground leading-relaxed mb-4">{note.description}</p>
                      
                      <div className="flex justify-end pt-3 border-t border-border">
                        <Button 
                          onClick={() => toast.success(`Simulating download of notes: ${note.fileUrl}`)}
                          size="sm"
                          variant="ghost" 
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
          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                  <Star className="h-3.5 w-3.5" /> Bookmarked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {materials.filter(m => m.isFavorite).length === 0 ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">No bookmarks saved yet.</p>
                ) : (
                  materials.filter(m => m.isFavorite).map((note) => (
                    <div key={note.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-2.5">
                      <span className="font-sans text-[12px] text-foreground truncate pr-2">{note.title}</span>
                      <button onClick={() => favMut.mutate(note.id)} className="text-muted-foreground hover:text-foreground transition-colors p-0.5 shrink-0">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Recently Downloaded
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-center">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-sans text-[12px] text-foreground truncate">DBMS Normalization Notes.pdf</span>
                </div>
                <div className="flex gap-2 items-center">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-sans text-[12px] text-foreground truncate">CPU Scheduling Cheat Sheet.pdf</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* FACULTY UPLOAD NOTE DIALOG MODAL */}
        {uploadOpen && (
          <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm grid place-items-center p-4">
            <Card className="w-full max-w-sm relative">
              <button onClick={() => setUploadOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
              
              <CardHeader>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-0.5">Faculty Upload</p>
                <CardTitle className="font-sans font-semibold text-foreground">Catalog Study Note</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  uploadMut.mutate(newNote);
                }} className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground block mb-1.5">Subject / Lecture Slot</label>
                    <select
                      value={newNote.subjectId}
                      onChange={(e) => setNewNote({ ...newNote, subjectId: e.target.value })}
                      className="w-full border border-border bg-background text-foreground font-sans text-[13px] h-9 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/10"
                      required
                    >
                      <option value="">Select subject...</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground block mb-1.5">Note Title</label>
                    <Input
                      required
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="e.g. Normalization and BCNF Lecture Slides"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground block mb-1.5">Topic Description</label>
                    <textarea
                      value={newNote.description}
                      onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                      placeholder="Provide summaries or chapters covered..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-border bg-background text-foreground font-sans text-[13px] focus:outline-none focus:ring-2 focus:ring-foreground/10 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground block mb-1.5">Category</label>
                      <select
                        value={newNote.category}
                        onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                        className="w-full border border-border bg-background text-foreground font-sans text-[13px] h-9 px-3 rounded-xl focus:outline-none"
                      >
                        <option value="Lecture Slides">Lecture Slides</option>
                        <option value="Cheat Sheets">Cheat Sheets</option>
                        <option value="Lab Sheets">Lab Sheets</option>
                        <option value="Previous Papers">Previous Papers</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground block mb-1.5">File Name</label>
                      <Input
                        required
                        value={newNote.fileUrl}
                        onChange={(e) => setNewNote({ ...newNote, fileUrl: e.target.value })}
                        placeholder="normal_form_slides.pdf"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button type="submit" disabled={uploadMut.isPending} className="flex-1">
                      {uploadMut.isPending ? "Uploading..." : "Save Material"}
                    </Button>
                    <Button type="button" onClick={() => setUploadOpen(false)} variant="outline" className="flex-1">
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
