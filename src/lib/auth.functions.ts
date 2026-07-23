import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseServer } from "@/integrations/supabase/supabase.server";
import { getDb } from "@/lib/db.server";
import crypto from "node:crypto";

export const bypassSignup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const { data: user, error } = await supabaseServer.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name },
    });
    if (error) throw new Error(error.message);
    return { success: true, userId: user.user.id };
  });

// ─── Local SQLite Demo Login (works fully offline without Supabase) ──────────
export const localDemoLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
        name: z.string().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const db = getDb();
    const pwHash = crypto.createHash("sha256").update(data.password).digest("hex");

    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(data.email) as any;

    if (!user) {
      // Create new user in SQLite
      const newId = crypto.randomUUID();
      db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(newId, data.email, pwHash);
      try {
        db.prepare("INSERT INTO profiles (id, full_name) VALUES (?, ?)").run(
          newId,
          data.name || data.email.split("@")[0]
        );
      } catch (_) {}
      user = { id: newId, email: data.email };
    } else {
      if (user.password_hash !== pwHash) {
        throw new Error("Incorrect password. Try again or use a different email to create a new account.");
      }
    }

    const token = `demo_${user.id}_${Buffer.from(data.email).toString("base64")}`;

    // Fetch role from profiles
    let role = "student";
    try {
      const profile = db.prepare("SELECT role FROM profiles WHERE id = ?").get(user.id) as any;
      if (profile?.role) role = profile.role;
    } catch (_) {}

    return { success: true, userId: user.id, token, email: user.email, name: data.name || (user as any).name || user.email.split("@")[0], role };

  });
