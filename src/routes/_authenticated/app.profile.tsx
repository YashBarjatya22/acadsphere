import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAnalyticsSummary, updateProfile } from "@/lib/analytics.functions";
import { toast } from "sonner";
import { User, GraduationCap, Briefcase, Edit3, Check, X, Loader2, Star, TrendingUp, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const updateProfileFn = useServerFn(updateProfile);

  const { data: analytics, isLoading } = useQuery({
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

  const startEdit = () => {
    if (analytics?.profile) {
      setProfileForm({
        fullName: analytics.profile.fullName || "",
        degree: analytics.profile.degree || "",
        semester: analytics.profile.semester || "",
        targetRole: analytics.profile.targetRole || "",
        skills: Array.isArray(analytics.profile.skills) ? analytics.profile.skills.join(", ") : "",
      });
      setIsEditing(true);
    }
  };

  const saveProfile = useMutation({
    mutationFn: (data: typeof profileForm) => updateProfileFn({ data }),
    onSuccess: () => {
      toast.success("Profile saved successfully!");
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ["analyticsSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  if (isLoading) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-background text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading academic profile...</span>
        </div>
      </ChatLayout>
    );
  }

  const profile = analytics?.profile;
  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "AS";

  const STAT_CARDS = [
    { label: "Roadmap Progress", value: `${analytics?.metrics?.roadmapProgress ?? 0}%`, color: "from-blue-500 to-indigo-600", icon: TrendingUp },
    { label: "Resume Strength", value: `${analytics?.metrics?.resumeStrength ?? 0}%`, color: "from-violet-500 to-purple-600", icon: Star },
    { label: "Placement Score", value: `${analytics?.metrics?.placementReadiness ?? 0}%`, color: "from-emerald-500 to-teal-600", icon: Target },
  ];

  return (
    <ChatLayout activeThreadId={null}>
      <div className="h-full bg-background text-foreground overflow-y-auto scrollbar-thin transition-colors duration-200">

        {/* Gradient Header */}
        <div className="relative overflow-hidden px-6 md:px-8 py-8 border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-violet-500/5 pointer-events-none" />
          <div className="absolute right-8 top-4 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/15 to-violet-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/25">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {profile?.fullName || "Your Profile"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">{profile?.targetRole || "Configure your target role below"}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {profile?.degree && (
                  <span className="text-[10px] font-semibold bg-card border border-border px-2.5 py-1 rounded-full text-foreground">
                    🎓 {profile.degree}
                  </span>
                )}
                {profile?.semester && (
                  <span className="text-[10px] font-semibold bg-card border border-border px-2.5 py-1 rounded-full text-foreground">
                    📅 Semester {profile.semester}
                  </span>
                )}
              </div>
            </div>

            {!isEditing && (
              <Button onClick={startEdit} variant="outline" size="sm" className="h-8 text-xs border-border gap-1.5 shrink-0">
                <Edit3 className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            )}
          </div>

          {/* Stats Row */}
          <div className="relative flex gap-3 mt-5 flex-wrap">
            {STAT_CARDS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border shadow-sm">
                  <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-black text-foreground">{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 md:px-8 py-6 grid gap-6 md:grid-cols-3">

          {/* Left: Quick Info */}
          <div className="space-y-4">
            <Card className="card-gradient border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Academic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  { label: "Full Name", value: profile?.fullName },
                  { label: "Degree / Major", value: profile?.degree },
                  { label: "Current Semester", value: profile?.semester },
                  { label: "Target Role", value: profile?.targetRole },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="font-semibold text-foreground mt-0.5">{item.value || <span className="text-muted-foreground italic">Not set</span>}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="card-gradient border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  { icon: GraduationCap, color: "text-blue-500 bg-blue-500/10", label: "Syllabus Completion", sub: "Unit 5 DBMS remaining" },
                  { icon: Briefcase, color: "text-emerald-500 bg-emerald-500/10", label: "Placement Target", sub: "Product Engineer · 12 LPA" },
                ].map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`h-7 w-7 rounded-lg ${m.color} flex items-center justify-center shrink-0`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{m.label}</p>
                        <p className="text-[9px] text-muted-foreground">{m.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right: Profile Form */}
          <div className="md:col-span-2">
            <Card className="card-gradient border-border shadow-sm h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/60">
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">Profile Parameters</CardTitle>
                  <CardDescription className="text-[10px] mt-0.5">
                    {isEditing ? "Edit and save your academic details." : "Click 'Edit Profile' to update your details."}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-5 pb-6">
                {!isEditing ? (
                  <div className="space-y-5">
                    {[
                      { label: "Full Name", value: profile?.fullName },
                      { label: "Degree & Academic Major", value: profile?.degree },
                    ].map((f) => (
                      <div key={f.label}>
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">{f.label}</Label>
                        <p className="text-sm font-semibold text-foreground mt-1">{f.value || <span className="text-muted-foreground italic text-xs">Not set</span>}</p>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Current Semester", value: profile?.semester },
                        { label: "Target Career Role", value: profile?.targetRole },
                      ].map((f) => (
                        <div key={f.label}>
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">{f.label}</Label>
                          <p className="text-sm font-semibold text-foreground mt-1">{f.value || <span className="text-muted-foreground italic text-xs">Not set</span>}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Skills</Label>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {profile?.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill: string) => (
                            <span key={skill} className="text-[10px] bg-primary/8 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No skills cataloged yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); saveProfile.mutate(profileForm); }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="fullName" className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</Label>
                      <Input id="fullName" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="h-9 text-xs bg-muted/40 border-border mt-1" required />
                    </div>
                    <div>
                      <Label htmlFor="degree" className="text-[10px] font-bold text-muted-foreground uppercase">Degree & Major</Label>
                      <Input id="degree" value={profileForm.degree} onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })} className="h-9 text-xs bg-muted/40 border-border mt-1" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="semester" className="text-[10px] font-bold text-muted-foreground uppercase">Semester</Label>
                        <Input id="semester" value={profileForm.semester} onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })} className="h-9 text-xs bg-muted/40 border-border mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor="targetRole" className="text-[10px] font-bold text-muted-foreground uppercase">Target Role</Label>
                        <Input id="targetRole" value={profileForm.targetRole} onChange={(e) => setProfileForm({ ...profileForm, targetRole: e.target.value })} className="h-9 text-xs bg-muted/40 border-border mt-1" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="skills" className="text-[10px] font-bold text-muted-foreground uppercase">Skills (comma-separated)</Label>
                      <Input id="skills" placeholder="e.g. SQL, Python, Java, React" value={profileForm.skills} onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })} className="h-9 text-xs bg-muted/40 border-border mt-1" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button type="submit" disabled={saveProfile.isPending} className="flex-1 h-9 text-xs bg-primary hover:bg-blue-700 text-white font-bold">
                        {saveProfile.isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving...</> : <><Check className="h-3.5 w-3.5 mr-1.5" /> Save Profile</>}
                      </Button>
                      <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="flex-1 h-9 text-xs border-border">
                        <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </ChatLayout>
  );
}
