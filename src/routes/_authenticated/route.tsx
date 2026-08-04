import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Check role from localStorage
    const role = typeof window !== "undefined"
      ? localStorage.getItem("demo_user_role")
      : null;

    // Strict redirect: Admin users MUST be sent to /admin
    if (role === "admin") {
      throw redirect({ to: "/admin" });
    }

    // 1. Try fetching active Supabase session
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const session = data.session;
        const user = session.user;
        const meta = user.user_metadata || {};
        const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "Christ Student";
        const avatarUrl = meta.avatar_url || meta.picture || "";
        const providerToken = session.provider_token || "";

        if (typeof window !== "undefined") {
          localStorage.setItem("demo_session_token", session.access_token);
          localStorage.setItem("demo_user_id", user.id);
          localStorage.setItem("demo_user_email", user.email || "");
          localStorage.setItem("demo_user_name", fullName);
          if (avatarUrl) localStorage.setItem("demo_user_avatar", avatarUrl);
          if (providerToken) localStorage.setItem("google_provider_token", providerToken);
        }

        return { user };
      }
    } catch (_) {}

    // 2. Check demo token
    const demoToken = typeof window !== "undefined"
      ? localStorage.getItem("demo_session_token")
      : null;

    if (demoToken) {
      const userId = localStorage.getItem("demo_user_id") || "demo";
      const email = localStorage.getItem("demo_user_email") || "student@christuniversity.in";
      return { user: { id: userId, email } };
    }

    throw redirect({ to: "/auth" });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        const session = data.session;
        const user = session.user;
        const meta = user.user_metadata || {};
        const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "Christ Student";
        const avatarUrl = meta.avatar_url || meta.picture || "";
        const providerToken = session.provider_token || "";

        localStorage.setItem("demo_session_token", session.access_token);
        localStorage.setItem("demo_user_id", user.id);
        localStorage.setItem("demo_user_email", user.email || "");
        localStorage.setItem("demo_user_name", fullName);
        if (avatarUrl) localStorage.setItem("demo_user_avatar", avatarUrl);
        if (providerToken) localStorage.setItem("google_provider_token", providerToken);

        try {
          supabase
            .from("profiles")
            .upsert([
              {
                id: user.id,
                full_name: fullName,
                avatar_url: avatarUrl,
                degree: "MSc Big Data Analytics",
                target_role: "Software Engineer / Data Scientist",
                updated_at: new Date().toISOString(),
              },
            ])
            .then(() => {});
        } catch (_) {}
      }
    });
  }, []);

  return <Outlet />;
}
