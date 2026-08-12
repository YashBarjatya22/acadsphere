import { jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
function AuthenticatedLayout() {
  useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
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
          supabase.from("profiles").upsert([{
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            degree: "MSc Big Data Analytics",
            target_role: "Software Engineer / Data Scientist",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }]).then(() => {
          });
        } catch (_) {
        }
      }
    });
  }, []);
  return /* @__PURE__ */ jsx(Outlet, {});
}
export {
  AuthenticatedLayout as component
};
