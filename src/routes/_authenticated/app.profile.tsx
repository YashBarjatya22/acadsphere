import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAnalyticsSummary } from "@/lib/analytics.functions";
import { getProfileAndRole, updateProfileRole } from "@/lib/studentos.functions";
import { toast } from "sonner";
import { User, GraduationCap, Edit3, Check, Loader2, Star, TrendingUp, Target, Shield, Activity, Users, Radio, Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getSummaryFn = useServerFn(getAnalyticsSummary);
  const getProfileFn = useServerFn(getProfileAndRole);
  const updateRoleFn = useServerFn(updateProfileRole);

  const { data: profileRole } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfileFn(),
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

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getSummaryFn(),
  });

  if (isLoading) {
    return (
      <ChatLayout activeThreadId={null}>
        <div className="flex h-full items-center justify-center bg-background text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs font-medium">Loading profile...</span>
        </div>
      </ChatLayout>
    );
  }

  const profile = analytics?.profile;
  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : (isAdmin ? "AD" : "AS");

  const STUDENT_STAT_CARDS = [
    { label: "Roadmap Progress", value: `${analytics?.metrics?.roadmapProgress ?? 0}%`, icon: TrendingUp },
    { label: "Resume Strength", value: `${analytics?.metrics?.resumeStrength ?? 0}%`, icon: Star },
    { label: "Placement Score", value: `${analytics?.metrics?.placementReadiness ?? 0}%`, icon: Target },
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
              <div className="h-16 w-16 rounded-2xl bg-stone-900 dark:bg-zinc-100 flex items-center justify-center text-stone-50 dark:text-zinc-900 text-xl font-black shadow-sm">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-600 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-100">
                  {isAdmin ? "Academic Controller" : (profile?.fullName || "Student Account")}
                </h1>
                {isAdmin && (
                  <span className="text-[10px] font-bold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-stone-200 dark:border-zinc-700 font-mono">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                {isAdmin ? "Institutional Oversight Officer" : (profile?.targetRole || "Engineering Student")}
              </p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-1 rounded-full text-stone-700 dark:text-zinc-300">
                  <Building2 className="h-3.5 w-3.5 text-stone-500" /> CMR Institute of Technology
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" /> Full Access
                  </span>
                ) : (
                  profile?.semester && (
                    <span className="text-[11px] font-semibold bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-1 rounded-full text-stone-700 dark:text-zinc-300">
                      Semester {profile.semester}
                    </span>
                  )
                )}
              </div>
            </div>

            {isAdmin && (
              <Button onClick={() => navigate({ to: "/admin" })} className="h-9 text-xs bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold gap-1.5 shrink-0 shadow-sm">
                <Shield className="h-3.5 w-3.5" /> Go to Admin Overview
              </Button>
            )}
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

          {/* Left: Account Parameters */}
          <div className="space-y-4">
            <Card className="border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Account Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  { label: "Account Role", value: isAdmin ? "Academic Controller" : "Student" },
                  { label: "Institution", value: "CMRIT (1CR)" },
                  { label: "Access Level", value: isAdmin ? "Full Administrative Oversight" : "Student Access" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[9.5px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">{item.label}</p>
                    <p className="font-semibold text-stone-900 dark:text-zinc-100 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Role Switcher */}
          <Card className="border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-stone-700 dark:text-zinc-300" /> Switch Role
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Current Role: <span className="font-bold text-stone-900 dark:text-zinc-100 capitalize">{userRole}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
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
                  {isAdmin ? "Admin Shortcuts" : "Shortcuts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {isAdmin ? (
                  [
                    { label: "Academic Overview", to: "/admin", icon: TrendingUp },
                    { label: "Student Records", to: "/admin/students", icon: GraduationCap },
                    { label: "Live Class Monitor", to: "/admin/live-activity", icon: Radio },
                    { label: "Notice Board & Reports", to: "/admin/announcements", icon: Activity },
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
                  ))
                ) : (
                  <p className="text-xs text-stone-500">Manage your profile options above.</p>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </ChatLayout>
  );
}
