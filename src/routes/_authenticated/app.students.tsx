import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { listStudents, createStudent, updateStudent, deleteStudent, getProfileAndRole } from "@/lib/studentos.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Plus, Search, Edit3, Trash2, Download, Filter, 
  X, GraduationCap, School, Layers, AlertCircle, RefreshCw 
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/students")({
  component: StudentRegistryPage,
});

function StudentRegistryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");

  // Edit / Add modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    phone: "",
    department: "Computer Science",
    semester: "Semester 6",
    section: "A",
    cgpa: 8.0,
    attendancePercentage: 90,
  });

  // Server functions
  const listFn = useServerFn(listStudents);
  const createFn = useServerFn(createStudent);
  const updateFn = useServerFn(updateStudent);
  const deleteFn = useServerFn(deleteStudent);
  const getProfileFn = useServerFn(getProfileAndRole);

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn(),
  });

  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ["studentsList", search, deptFilter, semFilter],
    queryFn: () => listFn({ data: { search, department: deptFilter, semester: semFilter } }),
  });

  const activeRole = profile?.role || "student";
  const canManage = activeRole === "admin" || activeRole === "faculty";

  // Mutations
  const saveMut = useMutation({
    mutationFn: (data: typeof form & { id?: string }) => {
      if (data.id) {
        return updateFn({ data });
      }
      return createFn({ data });
    },
    onSuccess: () => {
      toast.success(editingStudent ? "Student updated successfully!" : "Student registered successfully!");
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["studentsList"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Operation failed");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Student registry record deleted");
      qc.invalidateQueries({ queryKey: ["studentsList"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    }
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setForm({
      studentId: `ST${Math.floor(10000 + Math.random() * 90000)}`,
      name: "",
      phone: "",
      department: "Computer Science",
      semester: "Semester 6",
      section: "A",
      cgpa: 8.0,
      attendancePercentage: 85,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setForm({
      studentId: student.studentId,
      name: student.name,
      phone: student.phone || "",
      department: student.department,
      semester: student.semester,
      section: student.section,
      cgpa: student.cgpa,
      attendancePercentage: student.attendancePercentage,
    });
    setModalOpen(true);
  };

  // CSV Export
  const exportCSV = () => {
    if (students.length === 0) return;
    const headers = ["Student ID", "Name", "Department", "Semester", "Section", "CGPA", "Attendance %", "Phone"];
    const rows = students.map(s => [
      s.studentId,
      s.name,
      s.department,
      s.semester,
      s.section,
      s.cgpa,
      s.attendancePercentage,
      s.phone || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StudentOS_Registry_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full overflow-y-auto bg-[#0B0F19] text-slate-100 p-6 md:p-8 scrollbar-thin">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-500" /> Student Registry Management
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Search, filter, and review active university admissions and metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={exportCSV} variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-xs h-8">
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
            {canManage && (
              <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Student
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid gap-4 sm:grid-cols-4 items-center mb-6 bg-slate-900/40 p-4 rounded-lg border border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-slate-950/40 border-slate-800 text-slate-200 text-xs h-9 placeholder-slate-500"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-slate-950/40 border border-slate-800 text-slate-300 text-xs h-9 px-2.5 rounded focus:outline-none"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          <div>
            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="w-full bg-slate-950/40 border border-slate-800 text-slate-300 text-xs h-9 px-2.5 rounded focus:outline-none"
            >
              <option value="">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 8">Semester 8</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => { setSearch(""); setDeptFilter(""); setSemFilter(""); }} variant="ghost" className="text-slate-400 hover:text-white text-xs h-9">
              Clear filters
            </Button>
          </div>
        </div>

        {/* Student list grid table */}
        <Card className="bg-slate-900/30 border-slate-800">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 flex justify-center items-center text-slate-400 gap-2">
                <RefreshCw className="animate-spin h-5 w-5 text-blue-500" /> Loading student database...
              </div>
            ) : students.length === 0 ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-slate-600" />
                <span className="text-sm">No student records found matching filters.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-mono">
                    <tr>
                      <th className="text-left py-3 px-4">Student Details</th>
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-center py-3 px-4">Class</th>
                      <th className="text-center py-3 px-4">CGPA</th>
                      <th className="text-center py-3 px-4">Attendance</th>
                      {canManage && <th className="text-right py-3 px-4">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-[11px] grid place-items-center">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100">{student.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{student.phone || "No phone record"}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{student.studentId}</td>
                        <td className="py-3.5 px-4 text-slate-300">{student.department}</td>
                        <td className="py-3.5 px-4 text-center text-slate-400">{student.semester} - Sec {student.section}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-blue-400">{student.cgpa.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            student.attendancePercentage >= 80 
                              ? "bg-green-950/20 border-green-800 text-green-400" 
                              : "bg-red-950/20 border-red-800 text-red-400"
                          }`}>
                            {student.attendancePercentage}%
                          </span>
                        </td>
                        {canManage && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleOpenEdit(student)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Edit Student">
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => { if(confirm("Are you sure?")) deleteMut.mutate(student.id); }} className="p-1 hover:bg-red-950/30 rounded text-slate-500 hover:text-red-400" title="Delete record">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add / Edit Drawer Modal Overlay */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4">
            <Card className="bg-[#0F172A] border-slate-850 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
              
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <School className="h-4.5 w-4.5 text-blue-400" />
                  {editingStudent ? "Edit Student Details" : "Register New Student"}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 text-left">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  saveMut.mutate(editingStudent ? { ...form, id: editingStudent.id } : form);
                }} className="space-y-4">
                  
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Student Name</label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Student ID / Roll No</label>
                      <Input
                        required
                        value={form.studentId}
                        onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                        placeholder="e.g. ST22045"
                        className="bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Phone Number</label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="e.g. +91 9876543210"
                        className="bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Semester</label>
                      <select
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: e.target.value })}
                        className="w-full bg-slate-950/40 border border-slate-850 text-slate-300 text-xs h-8 px-2 rounded focus:outline-none"
                      >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 4">Semester 4</option>
                        <option value="Semester 6">Semester 6</option>
                        <option value="Semester 8">Semester 8</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Section</label>
                      <Input
                        required
                        value={form.section}
                        onChange={(e) => setForm({ ...form, section: e.target.value })}
                        placeholder="e.g. A"
                        className="bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Initial CGPA</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={form.cgpa}
                        onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Initial Attendance %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={form.attendancePercentage}
                        onChange={(e) => setForm({ ...form, attendancePercentage: parseInt(e.target.value) || 0 })}
                        className="bg-slate-950/40 border-slate-850 text-slate-200 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={saveMut.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                      {saveMut.isPending ? "Processing..." : "Save Record"}
                    </Button>
                    <Button type="button" onClick={() => setModalOpen(false)} variant="outline" className="border-slate-800 text-slate-400 text-xs h-8">
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
