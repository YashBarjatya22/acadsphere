import { signUpFn, signInFn, getUserFn } from "@/lib/auth.functions";

type AuthListener = (event: string, session: any) => void;
const listeners = new Set<AuthListener>();

let currentUser: any = null;
let currentSession: any = null;

// Helper to trigger state change listeners
function triggerAuthChange(event: string, session: any) {
  listeners.forEach((cb) => cb(event, session));
}

// In the browser, try to restore the session from localStorage
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("studentos_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      currentSession = parsed.session;
      currentUser = parsed.user;
    }
  } catch (e) {
    console.error("Failed to parse saved session", e);
  }
}

export const supabase = {
  auth: {
    async getUser() {
      if (!currentUser && currentSession?.access_token) {
        // Try fetching user from server to verify token
        try {
          const res = await getUserFn({ data: { token: currentSession.access_token } });
          if (res.user) {
            currentUser = res.user;
            localStorage.setItem(
              "studentos_session",
              JSON.stringify({ session: currentSession, user: currentUser }),
            );
          } else {
            currentUser = null;
            currentSession = null;
            localStorage.removeItem("studentos_session");
          }
        } catch (e) {
          currentUser = null;
          currentSession = null;
          localStorage.removeItem("studentos_session");
        }
      }
      return {
        data: { user: currentUser },
        error: currentUser ? null : new Error("No user session"),
      };
    },

    async getSession() {
      return { data: { session: currentSession }, error: null };
    },

    async setSession(tokens: any) {
      const tokenObj = tokens || {};
      currentSession = {
        access_token: tokenObj.access_token || tokenObj.accessToken,
        refresh_token: tokenObj.refresh_token || tokenObj.refreshToken,
        user: tokenObj.user,
      };
      currentUser = tokenObj.user || null;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "studentos_session",
          JSON.stringify({ session: currentSession, user: currentUser }),
        );
      }
      triggerAuthChange("SIGNED_IN", currentSession);
      return { data: { session: currentSession, user: currentUser }, error: null };
    },

    async signUp({ email, password, options }: any) {
      try {
        const fullName = options?.data?.full_name || "";
        const res = await signUpFn({ data: { email, password, fullName } });
        if (res.error) throw new Error(res.error);

        currentUser = res.user;
        currentSession = {
          access_token: res.token,
          user: res.user,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "studentos_session",
            JSON.stringify({ session: currentSession, user: currentUser }),
          );
        }
        triggerAuthChange("SIGNED_IN", currentSession);
        return { data: { user: currentUser, session: currentSession }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: err };
      }
    },

    async signInWithPassword({ email, password }: any) {
      try {
        const res = await signInFn({ data: { email, password } });
        if (res.error) throw new Error(res.error);

        currentUser = res.user;
        currentSession = {
          access_token: res.token,
          user: res.user,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "studentos_session",
            JSON.stringify({ session: currentSession, user: currentUser }),
          );
        }
        triggerAuthChange("SIGNED_IN", currentSession);
        return { data: { user: currentUser, session: currentSession }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: err };
      }
    },

    async signInWithOAuth({ provider, options }: any) {
      try {
        const email = `${provider}.user@example.com`;
        const fullName = `Mock ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;

        let res = await signUpFn({
          data: { email, password: "mock-oauth-password-123456", fullName },
        });
        if (res.error && res.error.includes("already exists")) {
          res = await signInFn({ data: { email, password: "mock-oauth-password-123456" } });
        }
        if (res.error) throw new Error(res.error);

        currentUser = res.user;
        currentSession = {
          access_token: res.token,
          user: res.user,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "studentos_session",
            JSON.stringify({ session: currentSession, user: currentUser }),
          );
        }
        triggerAuthChange("SIGNED_IN", currentSession);

        const redirectTo = options?.redirectTo || window.location.origin + "/app";
        return { data: { provider, url: redirectTo }, error: null };
      } catch (err: any) {
        return { data: { provider: null, url: null }, error: err };
      }
    },

    async signOut() {
      currentUser = null;
      currentSession = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("studentos_session");
      }
      triggerAuthChange("SIGNED_OUT", null);
      return { error: null };
    },

    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback);
      // Immediately call with current session
      callback(currentUser ? "SIGNED_IN" : "SIGNED_OUT", currentSession);
      return {
        data: {
          subscription: {
            unsubscribe() {
              listeners.delete(callback);
            },
          },
        },
      };
    },
  },
};
