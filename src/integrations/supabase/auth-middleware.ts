import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseServer } from "./supabase.server";
import { getDb } from "@/lib/db.server";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      throw new Error("Unauthorized: No authorization header provided");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Only Bearer tokens are supported");
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    // ─── Demo token path (offline / local dev) ──────────────────────────────
    if (token.startsWith("demo_")) {
      // Format: demo_<uuid>_<base64email>
      const parts = token.split("_");
      if (parts.length >= 2) {
        const userId = parts[1];
        // Verify the user exists in SQLite
        try {
          const db = getDb();
          const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(userId) as any;
          if (user) {
            return next({
              context: {
                userId: user.id,
                user: { id: user.id, email: user.email },
              },
            });
          }
        } catch (e) {
          // fall through to Supabase check
        }
      }
    }

    // ─── Supabase token path ────────────────────────────────────────────────
    try {
      const { data, error } = await supabaseServer.auth.getUser(token);
      if (!error && data.user) {
        return next({
          context: {
            userId: data.user.id,
            user: data.user,
          },
        });
      }
    } catch (_) {
      // Supabase unreachable — fall through
    }

    throw new Error("Unauthorized: Invalid or expired token");
  },
);
