import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { getDb } from "./db.server";

const JWT_SECRET = process.env.JWT_SECRET || "studentos-super-secret-key-12345";

export function signToken(userId: string, email: string): string {
  const payload = JSON.stringify({ sub: userId, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

export function verifyToken(token: string): { sub: string; email: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [base64Payload, signature] = parts;
  if (!base64Payload || !signature) return null;
  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(base64Payload)
    .digest("base64url");
  if (signature !== expectedSignature) return null;
  try {
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8"));
    if (payload.exp < Date.now()) return null; // expired
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  if (!salt || !hash) return false;
  const verifyHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return verifyHash === hash;
}

export const signUpFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      fullName: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) return { error: "Database not initialized" };

    try {
      const email = data.email.toLowerCase().trim();

      // Check if user exists
      const checkStmt = db.prepare("SELECT id FROM users WHERE email = ?");
      const existing = checkStmt.get(email);
      if (existing) {
        return { error: "User already exists with this email" };
      }

      // Hash password and generate user UUID
      const passwordHash = hashPassword(data.password);
      const userId = crypto.randomUUID();

      // Insert user
      const userStmt = db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)");
      userStmt.run(userId, email, passwordHash);

      // Insert profile
      const profileStmt = db.prepare("INSERT INTO profiles (id, full_name) VALUES (?, ?)");
      profileStmt.run(userId, data.fullName);

      // Sign token
      const token = signToken(userId, email);

      return {
        user: { id: userId, email, user_metadata: { full_name: data.fullName } },
        token,
      };
    } catch (e: any) {
      console.error("Signup error:", e);
      return { error: e.message || "Failed to create account" };
    }
  });

export const signInFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) return { error: "Database not initialized" };

    try {
      const email = data.email.toLowerCase().trim();

      // Fetch user and profile
      const stmt = db.prepare(`
        SELECT u.id, u.email, u.password_hash, p.full_name 
        FROM users u 
        LEFT JOIN profiles p ON u.id = p.id 
        WHERE u.email = ?
      `);
      const user = stmt.get(email);
      if (!user) {
        return { error: "Invalid email or password" };
      }

      // Verify password
      const isValid = verifyPassword(data.password, user.password_hash);
      if (!isValid) {
        return { error: "Invalid email or password" };
      }

      // Sign token
      const token = signToken(user.id, user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { full_name: user.full_name || "" },
        },
        token,
      };
    } catch (e: any) {
      console.error("Login error:", e);
      return { error: e.message || "Failed to sign in" };
    }
  });

export const getUserFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) return { error: "Database not initialized" };

    try {
      const payload = verifyToken(data.token);
      if (!payload) return { error: "Invalid or expired token" };

      const stmt = db.prepare(`
        SELECT u.id, u.email, p.full_name 
        FROM users u 
        LEFT JOIN profiles p ON u.id = p.id 
        WHERE u.id = ?
      `);
      const user = stmt.get(payload.sub);
      if (!user) return { error: "User not found" };

      return {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { full_name: user.full_name || "" },
        },
      };
    } catch (e: any) {
      return { error: e.message || "Authentication failed" };
    }
  });
