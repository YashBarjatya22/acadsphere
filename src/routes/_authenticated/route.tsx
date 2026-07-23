import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Check role from localStorage
    const demoToken = typeof window !== "undefined"
      ? localStorage.getItem("demo_session_token")
      : null;
    const role = typeof window !== "undefined"
      ? localStorage.getItem("demo_user_role")
      : null;

    // Strict redirect: Admin users MUST be sent to /admin
    if (role === "admin") {
      throw redirect({ to: "/admin" });
    }

    if (demoToken && demoToken.startsWith("demo_")) {
      const userId = localStorage.getItem("demo_user_id") || "demo";
      const email = localStorage.getItem("demo_user_email") || "demo@acadsphere.local";
      return { user: { id: userId, email } };
    }

    // Fall back to Supabase session with 2s timeout
    try {
      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) => 
        setTimeout(() => reject(new Error("Supabase timeout")), 2000)
      );
      const { data, error } = await Promise.race([
        supabase.auth.getUser(),
        timeoutPromise
      ]);
      if (!error && data?.user) return { user: data.user };
    } catch (_) {}

    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
