import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { bypassSignup, localDemoLogin } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/studentos-logo.png";
import { Loader2, ArrowRight, Shield, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · AcadSphere" },
      { name: "description", content: "Sign in or create a free AcadSphere account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const localLoginFn = useServerFn(localDemoLogin);
  const bypassSignupFn = useServerFn(bypassSignup);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app", replace: true });
    }).catch(() => {});

    const demoToken = localStorage.getItem("demo_session_token");
    const storedRole = localStorage.getItem("demo_user_role");
    if (demoToken) {
      navigate({ to: storedRole === "admin" ? "/admin" : "/app", replace: true });
    }
  }, [navigate]);

  async function handleDemoLogin() {
    setDemoLoading(true);
    try {
      const result = await localLoginFn({
        data: { email: "aadharsh.krishnaa.g@mca.christuniversity.in", password: "2547201", name: "AADHARSH KRISHNAA G" },
      });
      localStorage.setItem("demo_session_token", result.token);
      localStorage.setItem("demo_user_id", result.userId);
      localStorage.setItem("demo_user_email", result.email);
      localStorage.setItem("demo_user_role", "student");
      toast.success("Signed in as AADHARSH KRISHNAA G (2547201)");
      navigate({ to: "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  }

  function handleAdminDemoLogin() {
    localStorage.setItem("demo_session_token", "demo_admin_token");
    localStorage.setItem("demo_user_id", "admin_user");
    localStorage.setItem("demo_user_email", "admin@acadsphere.edu");
    localStorage.setItem("demo_user_role", "admin");
    toast.success("Signed in as Academic Controller");
    navigate({ to: "/admin", replace: true });
  }

  async function handleLocalEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await localLoginFn({
        data: { email, password, name: name || undefined },
      });
      const isRoleAdmin = email.toLowerCase().includes("admin") || result.role === "admin";
      const assignedRole = isRoleAdmin ? "admin" : "student";

      localStorage.setItem("demo_session_token", result.token);
      localStorage.setItem("demo_user_id", result.userId);
      localStorage.setItem("demo_user_email", result.email);
      localStorage.setItem("demo_user_role", assignedRole);
      toast.success(`Welcome, ${result.name || result.email}!`);
      navigate({ to: assignedRole === "admin" ? "/admin" : "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 flex font-sans">

      {/* ─── Left editorial panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-white dark:bg-zinc-900 border-r border-stone-200 dark:border-zinc-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 overflow-hidden">
            <img
              src={logo}
              alt="AcadSphere"
              className="h-4 w-4 object-contain invert dark:invert-0"
            />
          </div>
          <span className="font-sans font-bold text-sm tracking-tight text-stone-900 dark:text-zinc-100">
            AcadSphere
          </span>
        </Link>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-6">
            Academic Management System
          </p>
          <h2
            className="font-sans font-extrabold text-stone-900 dark:text-zinc-100"
            style={{ fontSize: "clamp(2rem, 3vw, 2.75rem)", letterSpacing: "-0.04em", lineHeight: 1.05 }}
          >
            Your academic
            <br />
            command centre.
          </h2>
          <p className="mt-6 text-sm font-sans text-stone-600 dark:text-zinc-400 leading-relaxed max-w-sm">
            Integrated student information system for academic controllers, faculty, and students.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "Real-Time Student Activity Telemetry",
              "Student Directory & Profile Activity Timelines",
              "Interactive Syllabus Notes & Revision",
              "Lab Manual Walkthroughs & Code Templates",
              "Targeted Department Notice Board & Report Exports",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-zinc-100 shrink-0" />
                <span className="text-[13px] font-sans font-medium text-stone-800 dark:text-zinc-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400 dark:text-zinc-500">
          © 2026 AcadSphere Inc. · Version 2.5
        </p>
      </div>

      {/* ─── Right Form Panel ──────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Mobile Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 overflow-hidden">
            <img src={logo} alt="AcadSphere" className="h-4 w-4 object-contain invert dark:invert-0" />
          </div>
          <span className="font-sans font-bold text-sm tracking-tight text-stone-900 dark:text-zinc-100">
            AcadSphere
          </span>
        </Link>

        <div className="w-full max-w-sm space-y-6">

          {/* Quick Access Card */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-sm">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Quick Session Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleDemoLogin}
                disabled={demoLoading}
                variant="outline"
                className="h-10 text-xs font-bold gap-1.5 border-stone-200 dark:border-zinc-800 text-stone-800 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800"
              >
                <GraduationCap className="h-4 w-4 text-stone-600 dark:text-zinc-400" />
                Demo Student
              </Button>
              <Button
                onClick={handleAdminDemoLogin}
                className="h-10 text-xs bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-bold gap-1.5 shadow-sm hover:bg-stone-800"
              >
                <Shield className="h-4 w-4" /> Admin ERP
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-stone-200 dark:bg-zinc-800" />
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-zinc-500">or sign in</span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-zinc-800" />
          </div>

          {/* Auth Card */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-7 space-y-5 shadow-sm">
            <div>
              <h1 className="font-sans font-extrabold text-xl tracking-tight text-stone-900 dark:text-zinc-100">
                {mode === "signin" ? "Sign in" : "Create account"}
              </h1>
              <p className="mt-1 font-sans text-xs text-stone-500 dark:text-zinc-400">
                {mode === "signin"
                  ? "Local device session authentication."
                  : "Free account setup."}
              </p>
            </div>

            <form onSubmit={handleLocalEmail} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-bold text-stone-700 dark:text-zinc-300">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-9 text-xs border-stone-200 dark:border-zinc-800"
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-bold text-stone-700 dark:text-zinc-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@acadsphere.edu or student@acadsphere.edu"
                  className="h-9 text-xs border-stone-200 dark:border-zinc-800"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-bold text-stone-700 dark:text-zinc-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  placeholder="••••••••"
                  className="h-9 text-xs border-stone-200 dark:border-zinc-800"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 font-bold bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
                ) : (
                  mode === "signin" ? "Sign in to Workspace" : "Create Account"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
