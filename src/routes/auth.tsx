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
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

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
    // Check Supabase session
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app", replace: true });
    }).catch(() => {});
    // Check demo session
    const demoToken = localStorage.getItem("demo_session_token");
    if (demoToken) navigate({ to: "/app", replace: true });
  }, [navigate]);

  // ─── Demo / Local Login (works offline) ─────────────────────────────────
  async function handleDemoLogin() {
    setDemoLoading(true);
    try {
      const demoEmail = "demo@acadsphere.local";
      const demoPassword = "demo123456";
      const result = await localLoginFn({
        data: { email: demoEmail, password: demoPassword, name: "Demo Student" },
      });
      localStorage.setItem("demo_session_token", result.token);
      localStorage.setItem("demo_user_id", result.userId);
      localStorage.setItem("demo_user_email", result.email);
      toast.success("Signed in as Demo Student 🎉");
      navigate({ to: "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  }

  // ─── Local Email/Password Login ──────────────────────────────────────────
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

  // ─── Supabase Google OAuth ────────────────────────────────────────────────
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
    <div className="relative min-h-screen bg-background flex items-center justify-center px-6 py-12">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[400px] rounded-full bg-violet-500/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-2">
          <div className="relative flex items-center justify-center p-0.5 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-400 to-indigo-600 shadow-md">
            <img src={logo} alt="AcadSphere" className="h-8 w-8 rounded-[10px] bg-background p-1" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-500 bg-clip-text text-transparent">
            AcadSphere
          </span>
        </Link>

        {/* Demo Login Card — prominent */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-bold text-foreground">Quick Demo Access</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No account needed. Instantly explore all 13 modules with a demo session stored locally on your device.
          </p>
          <Button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-sm"
          >
            {demoLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Enter as Demo Student <ArrowRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>

        {/* Email/Password Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-7 space-y-5">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              {mode === "signin" ? "Sign in to your account" : "Create your account"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {mode === "signin"
                ? "Works offline — stored locally on your device."
                : "Free account stored locally. No email confirmation needed."}
            </p>
          </div>

          {/* Google */}
          <Button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            variant="outline"
            className="w-full border-border"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.97h5.27c-.23 1.4-1.66 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85 0-3.23 2.59-5.85 5.76-5.85 1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.83 3.84 14.78 3 12.18 3 6.99 3 2.8 7.19 2.8 12.38c0 5.18 4.19 9.37 9.38 9.37 5.41 0 9-3.8 9-9.16 0-.62-.07-1.09-.15-1.49Z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleLocalEmail} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name" className="text-xs">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="Yash Barjatya"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-9"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-9"
                minLength={6}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-9 bg-primary hover:bg-blue-700 text-white font-bold text-sm">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Please wait...</>
              ) : (
                mode === "signin" ? "Sign in" : "Create account"
              )}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "signin"
              ? "New to AcadSphere? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
