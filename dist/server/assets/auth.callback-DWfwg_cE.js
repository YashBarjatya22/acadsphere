import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { supabase } from "./client-h4N4kZKq.js";
import "@supabase/supabase-js";
function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Extracting security tokens...");
  const [errorLog, setErrorLog] = useState(null);
  const hasProcessed = useRef(false);
  useEffect(() => {
    if (hasProcessed.current) return;
    const processImplicitFlow = async () => {
      try {
        hasProcessed.current = true;
        const hash = window.location.hash;
        const search = window.location.search;
        const qp = new URLSearchParams(search);
        const hashClean = hash.replace(/^#/, "");
        const hp = new URLSearchParams(hashClean);
        const oauthError = qp.get("error_description") || qp.get("error") || hp.get("error_description") || hp.get("error");
        if (oauthError) {
          throw new Error(`OAuth Error: ${decodeURIComponent(oauthError)}`);
        }
        const code = qp.get("code");
        if (code) {
          setStatus("Exchanging authorization code...");
          const {
            data,
            error
          } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data?.session) {
            await finalizeSession(data.session);
            return;
          }
        }
        if (hash && hash.length > 1) {
          setStatus("Validating tokens...");
          const accessToken = hp.get("access_token");
          const refreshToken = hp.get("refresh_token");
          const providerToken = hp.get("provider_token");
          if (!accessToken || !refreshToken) {
            throw new Error("Missing access_token or refresh_token in the URL redirect.");
          }
          setStatus("Establishing secure session...");
          const {
            data,
            error
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) throw error;
          if (data?.session) {
            const sessionWithToken = {
              ...data.session,
              provider_token: data.session.provider_token || providerToken || void 0
            };
            await finalizeSession(sessionWithToken);
            return;
          }
        }
        const {
          data: existing
        } = await supabase.auth.getSession();
        if (existing?.session) {
          await finalizeSession(existing.session);
          return;
        }
        throw new Error("No authentication tokens found in the URL and no active session detected.");
      } catch (err) {
        console.error("Auth Callback Error:", err);
        setErrorLog(err?.message || "A fatal error occurred during token extraction.");
      }
    };
    const finalizeSession = async (session) => {
      const user = session.user;
      const meta = user?.user_metadata || {};
      const fullName = meta.full_name || meta.name || user?.email?.split("@")[0] || "Student";
      const avatarUrl = meta.avatar_url || meta.picture || "";
      const finalProviderToken = session.provider_token || "";
      setStatus("Persisting Classroom credentials...");
      if (typeof window !== "undefined") {
        localStorage.setItem("demo_session_token", session.access_token);
        localStorage.setItem("demo_user_id", user.id);
        localStorage.setItem("demo_user_email", user.email || "");
        localStorage.setItem("demo_user_name", fullName);
        if (avatarUrl) localStorage.setItem("demo_user_avatar", avatarUrl);
        if (finalProviderToken) {
          localStorage.setItem("google_provider_token", finalProviderToken);
        }
        localStorage.setItem("demo_user_role", "student");
      }
      supabase.from("profiles").upsert([{
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }]).then(({
        error
      }) => {
        if (error) console.warn("[auth/callback] Profile upsert non-critical:", error.message);
      });
      window.history.replaceState(null, "", window.location.pathname);
      setStatus("✅ Success! Redirecting to Workspace...");
      setTimeout(() => {
        navigate({
          to: "/app",
          replace: true
        });
      }, 400);
    };
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") && session && !hasProcessed.current) {
        hasProcessed.current = true;
        await finalizeSession(session);
      }
    });
    processImplicitFlow();
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  if (errorLog) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen p-8 bg-[#FAFAF8] text-[#0A0A0A] font-sans", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-red-600 font-bold text-xl mb-4", children: "Authentication Failed" }),
      /* @__PURE__ */ jsx("div", { className: "p-4 bg-red-950 text-red-300 font-mono text-sm rounded-xl max-w-lg text-center shadow whitespace-pre-wrap border border-red-800", children: errorLog }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => navigate({
          to: "/auth",
          replace: true
        }), className: "px-5 py-2.5 bg-[#0A0A0A] text-white hover:bg-[#222222] rounded-xl transition-all text-xs font-bold shadow", children: "Back to Sign In" }),
        /* @__PURE__ */ jsx("button", { onClick: () => {
          localStorage.setItem("demo_session_token", "demo_emergency_session");
          localStorage.setItem("demo_user_id", "demo_user");
          localStorage.setItem("demo_user_email", "student@christuniversity.in");
          localStorage.setItem("demo_user_role", "student");
          navigate({
            to: "/app",
            replace: true
          });
        }, className: "px-5 py-2.5 bg-[#EAE7DC] text-[#0A0A0A] hover:bg-[#DDD9C9] rounded-xl transition-all text-xs font-bold border border-[#E0DDD4]", children: "Continue as Guest / Demo" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen bg-[#FAFAF8] text-[#0A0A0A] font-sans", children: [
    /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4" }),
    /* @__PURE__ */ jsx("p", { className: "font-bold text-sm", children: status })
  ] });
}
export {
  AuthCallbackPage as component
};
