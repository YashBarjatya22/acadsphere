import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // 1. Check for demo session token (local SQLite auth — works offline)
    const demoToken = typeof window !== "undefined"
      ? localStorage.getItem("demo_session_token")
      : null;
    if (demoToken && demoToken.startsWith("demo_")) {
      const userId = localStorage.getItem("demo_user_id") || "demo";
      const email = localStorage.getItem("demo_user_email") || "demo@acadsphere.local";
      return { user: { id: userId, email } };
    }

    // 2. Fall back to Supabase session (with 2s timeout in case project is paused)
    try {
      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) => 
        setTimeout(() => reject(new Error("Supabase timeout")), 2000)
      );
      const { data, error } = await Promise.race([
        supabase.auth.getUser(),
        timeoutPromise
      ]);
      if (!error && data?.user) return { user: data.user };
    } catch (_) {
      // Supabase unreachable or timed out
    }

    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
