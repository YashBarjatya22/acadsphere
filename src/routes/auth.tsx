import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/studentos-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · StudentOS" },
      { name: "description", content: "Sign in or create a free StudentOS account." },
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/app",
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app",
    });
    if (res.error) {
      toast.error(res.error.message || "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (res.redirected) return;
    navigate({ to: "/app", replace: true });
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute left-1/2 top-1/3 -z-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <img src={logo} alt="StudentOS" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-lg font-semibold">StudentOS</span>
        </Link>

        <div className="w-full rounded-2xl border border-border bg-surface/80 p-8 backdrop-blur">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue your journey." : "Free forever. Start in 30 seconds."}
          </p>

          <Button onClick={handleGoogle} disabled={loading} variant="outline" className="mt-6 w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.97h5.27c-.23 1.4-1.66 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85 0-3.23 2.59-5.85 5.76-5.85 1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.83 3.84 14.78 3 12.18 3 6.99 3 2.8 7.19 2.8 12.38c0 5.18 4.19 9.37 9.38 9.37 5.41 0 9-3.8 9-9.16 0-.62-.07-1.09-.15-1.49Z"/></svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Priya Sharma" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" minLength={6} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "New to StudentOS? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
