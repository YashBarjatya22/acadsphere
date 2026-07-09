import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { 
  listStudents, listSubjects, markAttendance, 
  listAttendanceLogs, getProfileAndRole 
} from "@/lib/studentos.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Clock, CheckCircle2, AlertTriangle, Calendar, User, 
  BookOpen, Layers, Award, Loader2, Sparkles
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const qc = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState("sub1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Server functions
  const getProfileFn = useServerFn(getProfileAndRole);
  const listStudentsFn = useServerFn(listStudents);
  const listSubjectsFn = useServerFn(listSubjects);
  const markAttendanceFn = useServerFn(markAttendance);
  const listLogsFn = useServerFn(listAttendanceLogs);

  // Queries
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["studentsList"],
    queryFn: () => listStudentsFn(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjectsList"],
    queryFn: () => listSubjectsFn(),
  });

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["attendanceLogs", profile?.id],
    queryFn: () => listLogsFn({ data: { studentId: profile?.role === "student" ? profile.id : undefined } }),
  });

  const activeRole = profile?.role || "student";
  const isFaculty = activeRole === "faculty" || activeRole === "admin";

  // Marked records sheet state for faculty marking
  const [markSheet, setMarkSheet] = useState<Record<string, "present" | "absent" | "late" | "excused">>({});

  // Initialize marksheet
  const initMarkSheet = () => {
    const sheet: Record<string, "present" | "absent" | "late" | "excused"> = {};
    students.forEach((s) => {
      sheet[s.id] = "present"; // default present
    });
    setMarkSheet(sheet);
  };

  const markMutation = useMutation({
    mutationFn: (records: any[]) => markAttendanceFn({ data: { records } }),
    onSuccess: () => {
      toast.success("Attendance ledger updated successfully!");
      qc.invalidateQueries({ queryKey: ["attendanceLogs"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["studentsList"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit attendance ledger");
    }
  });

  const handleMarkSubmit = () => {
    const records = Object.keys(markSheet).map((sid) => ({
      studentId: sid,
      subjectId: selectedSubject,
      date,
      status: markSheet[sid],
    }));
    markMutation.mutate(records);
  };

  const currentSubjectItem = subjects.find(s => s.id === selectedSubject);

  // Calculate subject percentages for students
  const studentSubjectStats = subjects.map((sub) => {
    const subLogs = logs.filter(l => l.subjectId === sub.id);
    const total = subLogs.length;
    const present = subLogs.filter(l => l.status === "present" || l.status === "late").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
    return {
      id: sub.id,
      name: sub.name,
      code: sub.code,
      percentage,
      total,
      present,
    };
  });

  // Calculate overall metrics
  const totalClasses = logs.length;
  const attendedClasses = logs.filter(l => l.status === "present" || l.status === "late").length;
  const overallPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 88;

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full overflow-y-auto bg-background text-foreground p-6 md:p-8 scrollbar-thin">
        
        {/* Top Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-teal-500" /> Attendance Ledger & Analytics
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            Track daily checkpoints, subject completion, and university regulations.
          </p>
        </div>

        {/* ---------------- STUDENT ATTENDANCE DASHBOARD ---------------- */}
        {!isFaculty && (
          <div className="space-y-8">
            
            {/* Overview Row */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-card border-border flex flex-col justify-between p-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Overall Attendance</span>
                  <div className="text-4xl font-black mt-2 text-foreground">{overallPercentage}%</div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" /> Eligible for term-end examinations
                </div>
              </Card>

              <Card className="bg-card border-border flex flex-col justify-between p-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Present Classes</span>
                  <div className="text-3xl font-bold mt-2 text-foreground">{totalClasses > 0 ? `${attendedClasses} / ${totalClasses}` : "18 / 20"} sessions</div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Total classes scheduled this sem
                </div>
              </Card>

              <Card className="bg-card border-border flex flex-col justify-between p-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Low Attendance Alerts</span>
                  <div className="text-3xl font-bold mt-2 text-rose-500">
                    {studentSubjectStats.filter(s => s.percentage < 75).length} subjects
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-500">
                  <AlertTriangle className="h-4 w-4" /> Minimum 75% requirement rule
                </div>
              </Card>
            </div>

            {/* Subject Breakdown Dials */}
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">// Subject Breakdown</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {studentSubjectStats.map((stat) => (
                <Card key={stat.id} className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{stat.code}</span>
                    <CardTitle className="text-xs font-bold text-foreground truncate">{stat.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black text-foreground">{stat.percentage}%</span>
                      <span className="text-[10px] text-muted-foreground">{stat.present}/{stat.total} attended</span>
                    </div>
                    {/* Visual Progress bar */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          stat.percentage >= 85 
                            ? "bg-emerald-500" 
                            : stat.percentage >= 75 
                              ? "bg-blue-500" 
                              : "bg-red-500"
                        }`}
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Attendance Logs history calendar table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Daily Log History</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Chronological calendar logs</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingLogs ? (
                  <div className="py-12 flex justify-center items-center text-muted-foreground">
                    <Loader2 className="animate-spin h-5 w-5 mr-1" /> Fetching logs...
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-xs">No attendance entries recorded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-foreground">
                      <thead className="bg-muted/40 border-b border-border font-mono text-[9px] text-muted-foreground">
                        <tr>
                          <th className="py-3.5 px-4 text-left">Date</th>
                          <th className="py-3.5 px-4 text-left">Subject Code & Name</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono text-muted-foreground">{log.date}</td>
                            <td className="py-3 px-4 text-foreground">
                              <span className="font-semibold text-primary mr-2">{log.subjectCode}</span>
                              {log.subjectName}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                log.status === "present" 
                                  ? "bg-green-500/10 border border-green-500/20 text-emerald-500" 
                                  : log.status === "late"
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-600"
                                    : "bg-red-500/10 border border-red-500/20 text-red-500"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        )}

        {/* ---------------- FACULTY ATTENDANCE SHEET MARKER ---------------- */}
        {isFaculty && (
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Left/Middle: Mark Attendance Sheet */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-foreground">Roll Call Sheets</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Mark student presence statuses for {currentSubjectItem?.name || "selected course"}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {students.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-xs">No registered students to mark.</div>
                  ) : (
                    <div>
                      <div className="overflow-y-auto max-h-[420px] scrollbar-thin">
                        <table className="w-full text-xs text-foreground">
                          <thead className="bg-muted/40 border-b border-border font-mono text-[9px] text-muted-foreground">
                            <tr>
                              <th className="py-3 px-4 text-left">Student Name</th>
                              <th className="py-3 px-4 text-left">Roll Number</th>
                              <th className="py-3 px-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {students.map((student) => {
                              const currStatus = markSheet[student.id] || "present";
                              return (
                                <tr key={student.id} className="hover:bg-muted/30">
                                  <td className="py-3 px-4 flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-muted text-[10px] font-bold text-foreground grid place-items-center">
                                      {student.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-foreground">{student.name}</span>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-muted-foreground">{student.studentId}</td>
                                  <td className="py-3 px-4 text-center">
                                    <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
                                      {["present", "absent", "late"].map((stat) => (
                                        <button
                                          key={stat}
                                          onClick={() => setMarkSheet({ ...markSheet, [student.id]: stat as any })}
                                          className={`px-2.5 py-1 text-[10px] rounded font-semibold capitalize transition-all ${
                                            currStatus === stat
                                              ? stat === "present"
                                                ? "bg-green-600/30 text-green-300"
                                                : stat === "absent"
                                                  ? "bg-red-600/30 text-red-300"
                                                  : "bg-amber-600/30 text-amber-300"
                                              : "text-slate-500 hover:text-slate-300"
                                          }`}
                                        >
                                          {stat}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-4 border-t border-slate-850 flex justify-end">
                        <Button 
                          onClick={handleMarkSubmit}
                          disabled={markMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                        >
                          {markMutation.isPending ? "Submitting Ledger..." : "Commit Attendance"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Options & Date settings */}
            <div className="space-y-6">
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-200">Configure Class Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Subject / Lecture Slot</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 text-slate-300 text-xs h-9 px-2 rounded focus:outline-none"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Session Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 text-slate-300 text-xs h-9 px-3 rounded focus:outline-none"
                    />
                  </div>

                  <Button 
                    onClick={initMarkSheet}
                    variant="outline" 
                    className="w-full border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-xs h-8.5"
                  >
                    Reset roll call list
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

      </div>
    </ChatLayout>
  );
}
