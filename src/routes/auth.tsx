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
import { Loader2, ArrowRight, ArrowUpRight } from "lucide-react";

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
    if (demoToken) navigate({ to: "/app", replace: true });
  }, [navigate]);

  async function handleDemoLogin() {
    setDemoLoading(true);
    try {
      const result = await localLoginFn({
        data: { email: "demo@acadsphere.local", password: "demo123456", name: "Demo Student" },
      });
      localStorage.setItem("demo_session_token", result.token);
      localStorage.setItem("demo_user_id", result.userId);
      localStorage.setItem("demo_user_email", result.email);
      toast.success("Signed in as Demo Student");
      navigate({ to: "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  }

  async function handleLocalEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await localLoginFn({
        data: { email, password, name: name || undefined },
      });
      localStorage.setItem("demo_session_token", result.token);
      localStorage.setItem("demo_user_id", result.userId);
      localStorage.setItem("demo_user_email", result.email);
      toast.success(`Welcome, ${result.name || result.email}!`);
      navigate({ to: "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/app" },
      });
      if (error) throw error;
      if (data.url) window.location.assign(data.url);
    } catch (err) {
      toast.error("Google sign-in requires internet. Use the local login below.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* ─── Left editorial panel (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-card border-r border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-6 w-6 rounded-md border border-border bg-foreground overflow-hidden">
            <img
              src={logo}
              alt="AcadSphere"
              className="h-4 w-4 object-contain invert dark:invert-0"
            />
          </div>
          <span className="font-sans font-bold text-sm tracking-tight text-foreground">
            AcadSphere
          </span>
        </Link>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-6">
            AI Academic Operating System
          </p>
          <h2
            className="font-sans font-extrabold text-foreground"
            style={{ fontSize: "clamp(2rem, 3vw, 2.75rem)", letterSpacing: "-0.04em", lineHeight: 1.05 }}
          >
            Your academic
            <br />
            command centre.
          </h2>
          <p className="mt-6 text-sm font-sans text-muted-foreground leading-relaxed max-w-sm">
            13 AI-powered modules to manage notes, simulate viva exams, track attendance,
            build your resume, and accelerate placement — all in one place.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3">
            {[
              "AI Study Assistant & Smart Notes",
              "Viva Simulator with audio feedback",
              "Resume ATS scoring & gap analysis",
              "Career roadmap & placement tracker",
              "Study planner with spaced repetition",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                <span className="text-[13px] font-sans text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          © 2026 AcadSphere Inc. · Version 2.0
        </p>
      </div>

      {/* ─── Right form panel ──────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="flex items-center justify-center h-6 w-6 rounded-md border border-border bg-foreground overflow-hidden">
            <img src={logo} alt="AcadSphere" className="h-4 w-4 object-contain invert dark:invert-0" />
          </div>
          <span className="font-sans font-bold text-sm tracking-tight text-foreground">
            AcadSphere
          </span>
        </Link>

        <div className="w-full max-w-sm space-y-6">

          {/* Demo access */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1.5">
                  Quick Demo
                </p>
                <p className="font-sans text-[13px] text-foreground font-medium">
                  No account needed
                </p>
                <p className="font-sans text-[12px] text-muted-foreground mt-1 leading-relaxed">
                  Instantly explore all 13 modules with a demo session stored locally.
                </p>
              </div>
            </div>
            <Button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full mt-4 h-10"
            >
              {demoLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                <>Enter as Demo Student <ArrowRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Auth card */}
          <div className="rounded-2xl border border-border bg-card p-7 space-y-5">

            {/* Heading */}
            <div>
              <h1 className="font-sans font-bold text-xl tracking-tight text-foreground">
                {mode === "signin" ? "Sign in" : "Create account"}
              </h1>
              <p className="mt-1 font-sans text-[12px] text-muted-foreground">
                {mode === "signin"
                  ? "Works offline — stored locally on your device."
                  : "Free account. No email confirmation needed."}
              </p>
            </div>

            {/* Google */}
            <Button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.97h5.27c-.23 1.4-1.66 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85 0-3.23 2.59-5.85 5.76-5.85 1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.83 3.84 14.78 3 12.18 3 6.99 3 2.8 7.19 2.8 12.38c0 5.18 4.19 9.37 9.38 9.37 5.41 0 9-3.8 9-9.16 0-.62-.07-1.09-.15-1.49Z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleLocalEmail} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Yash Barjatya"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Please wait...</>
                ) : (
                  mode === "signin" ? "Sign in" : "Create account"
                )}
              </Button>
            </form>

            {/* Mode toggle */}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="w-full text-center font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors duration-[120ms]"
            >
              {mode === "signin"
                ? "New to AcadSphere? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
