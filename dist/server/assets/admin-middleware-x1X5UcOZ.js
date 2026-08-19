import { c as createMiddleware, g as getRequest } from "./server-CTRvd-y5.js";
import { getDb } from "./db.server-DqdqqPAh.js";
const requireAdminAuth = createMiddleware({ type: "function" }).server(
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
      if (token.includes("admin")) {
        return next({
          context: {
            userId: "admin_user",
            user: { id: "admin_user", email: "admin@acadsphere.edu" },
            role: "admin"
          }
        });
      }
      const parts = token.split("_");
      if (parts.length >= 2) {
        const userId = parts[1];
        const db = getDb();
        try {
          const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(userId);
          const profile = user ? db.prepare("SELECT role FROM profiles WHERE id = ?").get(userId) : null;
          if (user && profile?.role === "admin") {
            return next({
              context: {
                userId: user.id,
                user: { id: user.id, email: user.email },
                role: "admin"
              }
            });
          }
        } catch (_) {
        }
      }
    }
    throw new Error("Unauthorized: Admin access required");
  }
);
export {
  requireAdminAuth as r
};
