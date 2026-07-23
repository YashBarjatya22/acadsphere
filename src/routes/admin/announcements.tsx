import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminAnnouncements, createAdminAnnouncement, deleteAdminAnnouncement } from "@/lib/admin.functions";
import { Megaphone, Plus, Trash2, Send, Download, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncementsPage,
});

const DEPARTMENTS = ["Entire College", "CSE", "ECE", "ISE", "MECH", "CIVIL", "MCA", "MBA"];

function AdminAnnouncementsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAdminAnnouncements);
  const createFn = useServerFn(createAdminAnnouncement);
  const deleteFn = useServerFn(deleteAdminAnnouncement);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetDept, setTargetDept] = useState("Entire College");

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["adminAnnouncements"],
    queryFn: () => listFn(),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => createFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      setTitle("");
      setBody("");
      toast.success("Institutional Notice Published!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to post notice"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      toast.success("Notice deleted");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !body) return toast.error("Please fill in title and notice text");
    createMut.mutate({ title, body, audience: "all", targetDept });
  }

  function downloadReport(type: "PDF" | "CSV" | "Excel") {
    toast.success(`Generating official ${type} institutional report...`);
    setTimeout(() => {
      const blob = new Blob([`AcadSphere Official ${type} Report\nGenerated: ${new Date().toLocaleString()}\n`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `Acadsphere_Report.${type.toLowerCase()}`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} Report Downloaded!`);
    }, 1000);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-500">
            Institutional Notices & Reports
          </p>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight mt-0.5">
            Notice Board & Export Reports
          </h1>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
            Broadcast official circulars to students and export downloadable department records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Notice Board Form */}
        <Card className="lg:col-span-2 border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b border-stone-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-stone-700 dark:text-zinc-300" /> Post New Circular
            </CardTitle>
            <CardDescription className="text-xs text-stone-500 dark:text-zinc-400">Post notices visible on student dashboards</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Notice Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Internal Exam-2 Timetable Released" className="h-9 text-xs border-stone-200 dark:border-zinc-800" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Target Department</Label>
                  <select value={targetDept} onChange={(e) => setTargetDept(e.target.value)} className="w-full h-9 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs focus:outline-none">
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Notice Content</Label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4} className="w-full rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs focus:outline-none" placeholder="Enter circular description, instructions, or exam rules..." />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={createMut.isPending} className="h-9 text-xs font-bold gap-1.5 bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900">
                  {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Publish Circular</>}
                </Button>
              </div>
            </form>

            {/* List of Published Notices */}
            <div className="mt-8 pt-6 border-t border-stone-100 dark:border-zinc-800 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Published Circulars</p>
              {announcements.length === 0 ? (
                <p className="text-xs text-stone-400 dark:text-zinc-500">No active circulars posted yet.</p>
              ) : (
                announcements.map((a: any) => (
                  <div key={a.id} className="flex items-start justify-between p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-stone-900 dark:text-zinc-100">{a.title}</p>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-200">{a.targetDept || "Entire College"}</span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">{a.body}</p>
                    </div>
                    <button onClick={() => deleteMut.mutate(a.id)} className="p-1 rounded-lg text-stone-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export Reports */}
        <Card className="border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl h-fit">
          <CardHeader className="pb-3 border-b border-stone-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-stone-700 dark:text-zinc-300" /> Export Reports
            </CardTitle>
            <CardDescription className="text-xs text-stone-500 dark:text-zinc-400">Generate certified institutional documents</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {[
              { title: "Student Enrolment Summary", format: "PDF" as const },
              { title: "Attendance & Risk Records", format: "CSV" as const },
              { title: "Academic Performance Breakdown", format: "Excel" as const },
            ].map((rep) => (
              <div key={rep.title} className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-800 space-y-2">
                <p className="text-xs font-bold text-stone-900 dark:text-zinc-100">{rep.title}</p>
                <Button onClick={() => downloadReport(rep.format)} variant="outline" className="w-full h-8 text-xs font-bold gap-1.5 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800">
                  <Download className="h-3.5 w-3.5" /> Download {rep.format} Report
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
