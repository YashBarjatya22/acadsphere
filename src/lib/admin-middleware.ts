import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getDb } from "@/lib/db.server";

/**
 * Admin-only auth middleware.
 * Validates the Bearer token AND ensures the user has role = 'admin'.
 */
export const requireAdminAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers");
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized: No Bearer token");
    }

    const token = authHeader.replace("Bearer ", "");

    if (token.startsWith("demo_")) {
      const parts = token.split("_");
      if (parts.length >= 2) {
        const userId = parts[1];
        const db = getDb();
        try {
          const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(userId) as any;
          const profile = user
            ? (db.prepare("SELECT role FROM profiles WHERE id = ?").get(userId) as any)
            : null;

          if (user && profile?.role === "admin") {
            return next({
              context: {
                userId: user.id,
                user: { id: user.id, email: user.email },
                role: "admin",
              },
            });
          }
        } catch (_) {}
      }
    }

    throw new Error("Unauthorized: Admin access required");
  }
);
