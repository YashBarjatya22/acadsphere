import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { supabaseServer } from "@/integrations/supabase/supabase.server";
import { getDb } from "@/lib/db.server";

export interface ThreadItem {
  id: string;
  user_id?: string;
  title: string;
  module: string | null;
  updated_at: string;
}

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  parts: any;
  created_at?: string;
}

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const threadsMap = new Map<string, ThreadItem>();

    // 1. Try Supabase
    try {
      if (supabaseServer) {
        const { data, error } = await supabaseServer
          .from("threads")
          .select("id, user_id, title, module, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(100);

        if (!error && data) {
          for (const t of data) {
            threadsMap.set(t.id, t);
          }
        }
      }
    } catch (e) {
      console.warn("[chat.functions] Supabase thread list warning", e);
    }

    // 2. Query persistent local SQLite database
    try {
      const db = getDb();
      if (db) {
        const rows = db.prepare(
          "SELECT id, user_id, title, module, updated_at FROM threads WHERE user_id = ? ORDER BY updated_at DESC"
        ).all(userId) as ThreadItem[];

        for (const row of rows) {
          if (!threadsMap.has(row.id)) {
            threadsMap.set(row.id, row);
          }
        }
      }
    } catch (e) {
      console.warn("[chat.functions] SQLite thread list warning", e);
    }

    return Array.from(threadsMap.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().optional(),
        title: z.string().min(1).max(120).optional(),
        module: z.string().max(80).optional(),
      })
      .parse(input ?? {})
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const threadId = data.id || crypto.randomUUID();
    const title = data.title ?? "New Chat Thread";
    const module = data.module ?? null;
    const nowIso = new Date().toISOString();

    const newThread: ThreadItem = {
      id: threadId,
      user_id: userId,
      title,
      module,
      updated_at: nowIso,
    };

    // 1. Save to Supabase
    try {
      if (supabaseServer) {
        await supabaseServer.from("threads").upsert([
          { id: threadId, user_id: userId, title, module, updated_at: nowIso },
        ]);
      }
    } catch (e) {
      console.warn("[chat.functions] Supabase create thread warning", e);
    }

    // 2. Save to persistent SQLite
    try {
      const db = getDb();
      if (db) {
        db.prepare(
          "INSERT OR REPLACE INTO threads (id, user_id, title, module, updated_at) VALUES (?, ?, ?, ?, ?)"
        ).run(threadId, userId, title, module, nowIso);
      }
    } catch (e) {
      console.warn("[chat.functions] SQLite create thread warning", e);
    }

    return newThread;
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string(), title: z.string().min(1).max(120) }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const nowIso = new Date().toISOString();

    // 1. Supabase
    try {
      if (supabaseServer) {
        await supabaseServer
          .from("threads")
          .update({ title: data.title, updated_at: nowIso })
          .eq("id", data.id)
          .eq("user_id", userId);
      }
    } catch (e) {
      console.warn("[chat.functions] Supabase rename thread warning", e);
    }

    // 2. SQLite
    try {
      const db = getDb();
      if (db) {
        db.prepare(
          "UPDATE threads SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?"
        ).run(data.title, nowIso, data.id, userId);
      }
    } catch (e) {
      console.warn("[chat.functions] SQLite rename thread warning", e);
    }

    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // 1. Supabase
    try {
      if (supabaseServer) {
        await supabaseServer
          .from("threads")
          .delete()
          .eq("id", data.id)
          .eq("user_id", userId);
      }
    } catch (e) {
      console.warn("[chat.functions] Supabase delete thread warning", e);
    }

    // 2. SQLite
    try {
      const db = getDb();
      if (db) {
        db.prepare("DELETE FROM messages WHERE thread_id = ?").run(data.id);
        db.prepare("DELETE FROM threads WHERE id = ? AND user_id = ?").run(data.id, userId);
      }
    } catch (e) {
      console.warn("[chat.functions] SQLite delete thread warning", e);
    }

    return { ok: true };
  });

export const saveMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().optional(),
        threadId: z.string(),
        role: z.enum(["user", "assistant"]),
        parts: z.any(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const msgId = data.id || crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const partsJson = typeof data.parts === "string" ? data.parts : JSON.stringify(data.parts);

    // 1. Supabase
    try {
      if (supabaseServer) {
        await supabaseServer.from("messages").upsert([
          {
            id: msgId,
            thread_id: data.threadId,
            user_id: userId,
            role: data.role,
            parts: data.parts,
            created_at: nowIso,
          },
        ]);
        await supabaseServer
          .from("threads")
          .update({ updated_at: nowIso })
          .eq("id", data.threadId);
      }
    } catch (e) {
      console.warn("[chat.functions] Supabase save message warning", e);
    }

    // 2. SQLite
    try {
      const db = getDb();
      if (db) {
        db.prepare(
          "INSERT OR REPLACE INTO messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)"
        ).run(msgId, data.threadId, data.role, partsJson, nowIso);

        db.prepare("UPDATE threads SET updated_at = ? WHERE id = ?").run(
          nowIso,
          data.threadId
        );
      }
    } catch (e) {
      console.warn("[chat.functions] SQLite save message warning", e);
    }

    return { ok: true, id: msgId };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // 1. Try Supabase
    try {
      if (supabaseServer) {
        const { data: thread } = await supabaseServer
          .from("threads")
          .select("id, title, module, updated_at")
          .eq("id", data.threadId)
          .single();

        const { data: rows } = await supabaseServer
          .from("messages")
          .select("id, role, parts, created_at")
          .eq("thread_id", data.threadId)
          .order("created_at", { ascending: true });

        if (rows && rows.length > 0) {
          const messages = rows.map((r: any) => ({
            id: r.id,
            role: r.role,
            parts: typeof r.parts === "string" ? JSON.parse(r.parts) : r.parts,
            created_at: r.created_at,
          }));
          return { thread, messages };
        }
      }
    } catch (e) {
      console.warn("[chat.functions] Supabase get messages warning", e);
    }

    // 2. Query persistent SQLite
    try {
      const db = getDb();
      if (db) {
        const thread = db
          .prepare("SELECT id, title, module, updated_at FROM threads WHERE id = ?")
          .get(data.threadId) as ThreadItem | undefined;

        const rows = db
          .prepare(
            "SELECT id, role, content as parts, created_at FROM messages WHERE thread_id = ? ORDER BY created_at ASC"
          )
          .all(data.threadId) as any[];

        const messages = rows.map((r) => {
          let parsedParts = r.parts;
          try {
            parsedParts = typeof r.parts === "string" ? JSON.parse(r.parts) : r.parts;
          } catch (_) {}
          return {
            id: r.id,
            role: r.role,
            parts: parsedParts,
            created_at: r.created_at,
          };
        });

        return {
          thread: thread || {
            id: data.threadId,
            user_id: userId,
            title: "Academic AI Assistant",
            module: null,
            updated_at: new Date().toISOString(),
          },
          messages,
        };
      }
    } catch (e) {
      console.warn("[chat.functions] SQLite get messages warning", e);
    }

    return {
      thread: {
        id: data.threadId,
        user_id: userId,
        title: "Academic AI Assistant",
        module: null,
        updated_at: new Date().toISOString(),
      },
      messages: [],
    };
  });

