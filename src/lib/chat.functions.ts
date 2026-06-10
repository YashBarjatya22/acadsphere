import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import crypto from "node:crypto";
import { getDb } from "./db.server";

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      SELECT id, title, module, updated_at 
      FROM threads 
      WHERE user_id = ? 
      ORDER BY updated_at DESC 
      LIMIT 100
    `);
    const data = stmt.all(userId);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(1).max(120).optional(),
        module: z.string().max(80).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const threadId = crypto.randomUUID();
    const title = data.title ?? "New chat";
    const module = data.module ?? null;

    const insertStmt = db.prepare(`
      INSERT INTO threads (id, user_id, title, module) 
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(threadId, userId, title, module);

    const selectStmt = db.prepare(`
      SELECT id, title, module, updated_at 
      FROM threads 
      WHERE id = ?
    `);
    return selectStmt.get(threadId);
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), title: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      UPDATE threads 
      SET title = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(data.title, data.id, userId);
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      DELETE FROM threads 
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(data.id, userId);
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    // verify thread ownership
    const threadStmt = db.prepare(`
      SELECT id, title, module 
      FROM threads 
      WHERE id = ? AND user_id = ?
    `);
    const thread = threadStmt.get(data.threadId, userId);
    if (!thread) return { thread: null, messages: [] };

    const messagesStmt = db.prepare(`
      SELECT id, role, parts, created_at 
      FROM messages 
      WHERE thread_id = ? 
      ORDER BY created_at ASC
    `);
    const rows = messagesStmt.all(data.threadId);

    const messages = (rows ?? []).map((r: any) => ({
      id: r.id,
      role: r.role,
      parts: JSON.parse(r.parts),
    }));
    return { thread, messages };
  });
