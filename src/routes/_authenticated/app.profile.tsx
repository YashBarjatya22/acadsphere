import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAnalyticsSummary, updateProfile } from "@/lib/analytics.functions";
import { getProfileAndRole, updateProfileRole } from "@/lib/studentos.functions";
import { toast } from "sonner";
import {
  User,
  GraduationCap,
  Edit3,
  Check,
  Loader2,
  Star,
  TrendingUp,
  Target,
  Shield,
  Activity,
  Users,
  Radio,
  Building2,
  Mail,
  Award
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const getProfileFn = useServerFn(getProfileAndRole);
  const updateRoleFn = useServerFn(updateProfileRole);
  const updateProfileFn = useServerFn(updateProfile);

  const { data: profileRole } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn(),
  });

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getSummaryFn(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    degree: "",
    semester: "",
    targetRole: "",
    skills: "",
  });

  const userRole = typeof window !== "undefined"
    ? (localStorage.getItem("demo_user_role") || profileRole?.role || "student")
    : (profileRole?.role || "student");
  const isAdmin = userRole === "admin";

  const switchRole = useMutation({
    mutationFn: (role: "student" | "faculty" | "admin") => updateRoleFn({ data: { role } }),
    onSuccess: (_, role) => {
      localStorage.setItem("demo_user_role", role);
      toast.success(`Role switched to ${role.charAt(0).toUpperCase() + role.slice(1)}`);
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      qc.invalidateQueries({ queryKey: ["analyticsSummary"] });
      if (role === "admin") {
        navigate({ to: "/admin" });
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to switch role"),
  });

  const saveProfile = useMutation({
    mutationFn: (data: typeof profileForm) => updateProfileFn({ data }),
    onSuccess: (_, variables) => {
      localStorage.setItem("demo_user_name", variables.fullName);
      toast.success("Academic profile updated!");
      setIsEditing(false);
      refetch();
      qc.invalidateQueries({ queryKey: ["analyticsSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    }
  });

  const [sessionUser, setSessionUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || meta.name || u.email?.split("@")[0] || "Christ Student";
        const email = u.email || "";
        const avatar = meta.avatar_url || meta.picture || "";

        setSessionUser({ name, email, avatar });

        if (typeof window !== "undefined") {
          localStorage.setItem("demo_user_name", name);
          localStorage.setItem("demo_user_email", email);
          if (avatar) localStorage.setItem("demo_user_avatar", avatar);
        }
      }
    });
  }, []);

  const storedName = typeof window !== "undefined" ? localStorage.getItem("demo_user_name") : null;
  const storedEmail = typeof window !== "undefined" ? localStorage.getItem("demo_user_email") : null;
  const storedAvatar = typeof window !== "undefined" ? localStorage.getItem("demo_user_avatar") : null;

  const profile = analytics?.profile;
  const displayName = isAdmin
    ? "Academic Controller"
    : (sessionUser?.name || storedName || profile?.fullName || storedEmail?.split("@")[0] || "Christ Student");
  const displayEmail = sessionUser?.email || storedEmail || "student@christuniversity.in";
  const displayAvatar = sessionUser?.avatar || storedAvatar || "";
  const displayDegree = profile?.degree || "MSc Big Data Analytics / MCA";
  const displayRole = isAdmin ? "Institutional Oversight Officer" : (profile?.targetRole || "Software Engineer / Data Scientist");

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .join("")
    .substring(0, 2)
    .toUpperCase() || "CS";

  const startEdit = () => {
    setProfileForm({
      fullName: displayName,
      degree: displayDegree,
      semester: profile?.semester || "Semester 4",
      targetRole: profile?.targetRole || "Software Engineer / Data Scientist",
      skills: Array.isArray(profile?.skills) ? profile.skills.join(", ") : "SQL, Python, React",
    });
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-background text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs font-medium">Loading student profile...</span>
        </div>
      </ChatLayout>
    );
  }

  const STUDENT_STAT_CARDS = [
    { label: "Roadmap Progress", value: `${(analytics as any)?.metrics?.roadmapProgress ?? analytics?.studentMetrics?.roadmap_progress ?? 67}%`, icon: TrendingUp },
    { label: "Resume Strength", value: `${(analytics as any)?.metrics?.resumeStrength ?? analytics?.studentMetrics?.resume_strength ?? 85}%`, icon: Star },
    { label: "Placement Score", value: `${(analytics as any)?.metrics?.placementReadiness ?? analytics?.studentMetrics?.placement_readiness ?? 78}%`, icon: Target },
  ];

  const ADMIN_STAT_CARDS = [
    { label: "Total Enrolled", value: "1,140", icon: Users },
    { label: "Active Now", value: "342", icon: Radio },
    { label: "Active Sessions", value: "218", icon: Activity },
  ];

  const STAT_CARDS = isAdmin ? ADMIN_STAT_CARDS : STUDENT_STAT_CARDS;

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 overflow-y-auto scrollbar-thin transition-colors duration-200 font-sans">

        {/* Natural Header */}
        <div className="relative overflow-hidden px-6 md:px-8 py-8 border-b border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="relative flex items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-16 w-16 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800">
                <AvatarImage src={storedAvatar || ""} alt={displayName} />
                <AvatarFallback className="bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-black text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-600 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-100">
                  {displayName}
                </h1>
                {isAdmin && (
                  <span className="text-[10px] font-bold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-stone-200 dark:border-zinc-700 font-mono">
                    Admin Controller
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400 mt-1">
                <Mail className="h-3.5 w-3.5" />
                <span className="font-mono text-xs text-stone-700 dark:text-zinc-300 font-semibold">{displayEmail}</span>
              </div>

              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                {displayDegree} · {displayRole}
              </p>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-1 rounded-full text-stone-700 dark:text-zinc-300">
                  <Building2 className="h-3.5 w-3.5 text-stone-500" /> Christ University (Bangalore)
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" /> Full Access
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-1 rounded-full text-stone-700 dark:text-zinc-300">
                    {profile?.semester || "Semester 4"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isAdmin && !isEditing && (
                <Button onClick={startEdit} variant="outline" className="h-9 text-xs font-bold gap-1.5 border-stone-200 dark:border-zinc-700">
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              )}

              {isAdmin && (
                <Button onClick={() => navigate({ to: "/admin" })} className="h-9 text-xs bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold gap-1.5 shrink-0 shadow-sm">
                  <Shield className="h-3.5 w-3.5" /> Admin Overview
                </Button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="relative flex gap-3 mt-6 flex-wrap">
            {STAT_CARDS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-800 shadow-sm">
                  <div className="h-8 w-8 rounded-lg bg-stone-200 dark:bg-zinc-700 flex items-center justify-center text-stone-800 dark:text-zinc-200 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9.5px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-black text-stone-900 dark:text-zinc-100">{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 md:px-8 py-6 grid gap-6 md:grid-cols-3">

          {/* Left: Account Parameters / Edit Form */}
          <div className="space-y-4 md:col-span-1">
            {isEditing ? (
              <Card className="border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                    Edit Profile Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveProfile.mutate(profileForm);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <Label htmlFor="fullName" className="text-[10px] font-bold uppercase text-stone-500">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="degree" className="text-[10px] font-bold uppercase text-stone-500">Degree & Specialization</Label>
                      <Input
                        id="degree"
                        value={profileForm.degree}
                        onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                        className="h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="semester" className="text-[10px] font-bold uppercase text-stone-500">Semester</Label>
                        <Input
                          id="semester"
                          value={profileForm.semester}
                          onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                          className="h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetRole" className="text-[10px] font-bold uppercase text-stone-500">Target Role</Label>
                        <Input
                          id="targetRole"
                          value={profileForm.targetRole}
                          onChange={(e) => setProfileForm({ ...profileForm, targetRole: e.target.value })}
                          className="h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="skills" className="text-[10px] font-bold uppercase text-stone-500">Skills (Comma-separated)</Label>
                      <Input
                        id="skills"
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                        className="h-8 text-xs bg-stone-50 dark:bg-zinc-800 border-stone-200 mt-1 font-semibold"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={saveProfile.isPending} className="flex-1 h-8 text-xs bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold">
                        {saveProfile.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="flex-1 h-8 text-xs border-stone-200">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {[
                    { label: "Full Name", value: displayName },
                    { label: "Email Address", value: displayEmail },
                    { label: "Institution", value: "Christ University (Bangalore)" },
                    { label: "Account Role", value: isAdmin ? "Academic Controller" : "Student" },
                    { label: "Degree", value: displayDegree },
                    { label: "Access Level", value: isAdmin ? "Full Administrative Oversight" : "Student Command Center" },
                  ].map((item) => (
                    <div key={item.label} className="border-b border-stone-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0">
                      <p className="text-[9.5px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">{item.label}</p>
                      <p className="font-semibold text-stone-900 dark:text-zinc-100 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Role Switcher */}
          <Card className="border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-stone-700 dark:text-zinc-300" /> Switch Workspace Role
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Active Mode: <span className="font-bold text-stone-900 dark:text-zinc-100 capitalize">{userRole}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {(["student", "faculty", "admin"] as const).map((role) => (
                <Button
                  key={role}
                  onClick={() => switchRole.mutate(role)}
                  disabled={switchRole.isPending || userRole === role}
                  variant={userRole === role ? "default" : "outline"}
                  className={`w-full h-9 text-xs capitalize ${
                    userRole === role
                      ? "bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold"
                      : "border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {switchRole.isPending && userRole !== role ? (
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  ) : userRole === role ? (
                    <Check className="h-3 w-3 mr-1.5" />
                  ) : null}
                  {role === "admin" ? "Academic Controller Mode" : role === "faculty" ? "Faculty Mode" : "Student Mode"}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Core Shortcuts */}
          <div className="md:col-span-1">
            <Card className="border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl h-full">
              <CardHeader className="pb-3 border-b border-stone-100 dark:border-zinc-800">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  {isAdmin ? "Admin Shortcuts" : "Quick Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {[
                  { label: "Classroom Submissions", to: "/app/classroom", icon: GraduationCap },
                  { label: "AI Academic Mentoring", to: "/app/ai-assistant", icon: Star },
                  { label: "Smart Notes & Audits", to: "/app/notes", icon: Award },
                  { label: "Settings", to: "/app/settings", icon: User },
                ].map((item) => (
                  <Button
                    key={item.to}
                    onClick={() => navigate({ to: item.to as any })}
                    variant="outline"
                    className="w-full justify-start text-xs h-9 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 gap-2 font-semibold"
                  >
                    <item.icon className="h-4 w-4 text-stone-500" />
                    {item.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </ChatLayout>
  );
}
