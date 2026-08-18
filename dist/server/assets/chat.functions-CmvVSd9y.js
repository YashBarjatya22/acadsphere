import { c as createServerRpc } from "./createServerRpc-4A5G9ChI.js";
import { a as createServerFn } from "./server-C5bjec8z.js";
import { r as requireSupabaseAuth } from "./auth-middleware-0D9COL9P.js";
import { z } from "zod";
import { s as supabaseServer } from "./supabase.server-BXfiGlvE.js";
import { getDb } from "./db.server-DqdqqPAh.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
import "dotenv";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
const listThreads_createServerFn_handler = createServerRpc({
  id: "81f8d6ada944895e886fc9c1b3ea8c0e3fdfbdbcd7073b5a3e588f55517524dd",
  name: "listThreads",
  filename: "src/lib/chat.functions.ts"
}, (opts) => listThreads.__executeServer(opts));
const listThreads = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listThreads_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const threadsMap = /* @__PURE__ */ new Map();
  try {
    if (supabaseServer) {
      const {
        data,
        error
      } = await supabaseServer.from("threads").select("id, user_id, title, module, updated_at").eq("user_id", userId).order("updated_at", {
        ascending: false
      }).limit(100);
      if (!error && data) {
        for (const t of data) {
          threadsMap.set(t.id, t);
        }
      }
    }
  } catch (e) {
    console.warn("[chat.functions] Supabase thread list warning", e);
  }
  try {
    const db = getDb();
    if (db) {
      const rows = db.prepare("SELECT id, user_id, title, module, updated_at FROM threads WHERE user_id = ? ORDER BY updated_at DESC").all(userId);
      for (const row of rows) {
        if (!threadsMap.has(row.id)) {
          threadsMap.set(row.id, row);
        }
      }
    }
  } catch (e) {
    console.warn("[chat.functions] SQLite thread list warning", e);
  }
  return Array.from(threadsMap.values()).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
});
const createThread_createServerFn_handler = createServerRpc({
  id: "0e7b69b1d91bc88e34354aa34e93348913ee48b5657a1700135375a79d4eb416",
  name: "createThread",
  filename: "src/lib/chat.functions.ts"
}, (opts) => createThread.__executeServer(opts));
const createThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(120).optional(),
  module: z.string().max(80).optional()
}).parse(input ?? {})).handler(createThread_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const threadId = data.id || crypto.randomUUID();
  const title = data.title ?? "New Chat Thread";
  const module = data.module ?? null;
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const newThread = {
    id: threadId,
    user_id: userId,
    title,
    module,
    updated_at: nowIso
  };
  try {
    if (supabaseServer) {
      await supabaseServer.from("threads").upsert([{
        id: threadId,
        user_id: userId,
        title,
        module,
        updated_at: nowIso
      }]);
    }
  } catch (e) {
    console.warn("[chat.functions] Supabase create thread warning", e);
  }
  try {
    const db = getDb();
    if (db) {
      db.prepare("INSERT OR REPLACE INTO threads (id, user_id, title, module, updated_at) VALUES (?, ?, ?, ?, ?)").run(threadId, userId, title, module, nowIso);
    }
  } catch (e) {
    console.warn("[chat.functions] SQLite create thread warning", e);
  }
  return newThread;
});
const renameThread_createServerFn_handler = createServerRpc({
  id: "152f66fb380cff85728c8839358f8222dd36daa7e513c551908a3b962311dbbc",
  name: "renameThread",
  filename: "src/lib/chat.functions.ts"
}, (opts) => renameThread.__executeServer(opts));
const renameThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string(),
  title: z.string().min(1).max(120)
}).parse(input)).handler(renameThread_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  try {
    if (supabaseServer) {
      await supabaseServer.from("threads").update({
        title: data.title,
        updated_at: nowIso
      }).eq("id", data.id).eq("user_id", userId);
    }
  } catch (e) {
    console.warn("[chat.functions] Supabase rename thread warning", e);
  }
  try {
    const db = getDb();
    if (db) {
      db.prepare("UPDATE threads SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?").run(data.title, nowIso, data.id, userId);
    }
  } catch (e) {
    console.warn("[chat.functions] SQLite rename thread warning", e);
  }
  return {
    ok: true
  };
});
const deleteThread_createServerFn_handler = createServerRpc({
  id: "e1c7e871a6ff3195deaf3eaa0b7cef206138273224933ee87c94a4e4f020e775",
  name: "deleteThread",
  filename: "src/lib/chat.functions.ts"
}, (opts) => deleteThread.__executeServer(opts));
const deleteThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string()
}).parse(input)).handler(deleteThread_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  try {
    if (supabaseServer) {
      await supabaseServer.from("threads").delete().eq("id", data.id).eq("user_id", userId);
    }
  } catch (e) {
    console.warn("[chat.functions] Supabase delete thread warning", e);
  }
  try {
    const db = getDb();
    if (db) {
      db.prepare("DELETE FROM messages WHERE thread_id = ?").run(data.id);
      db.prepare("DELETE FROM threads WHERE id = ? AND user_id = ?").run(data.id, userId);
    }
  } catch (e) {
    console.warn("[chat.functions] SQLite delete thread warning", e);
  }
  return {
    ok: true
  };
});
const saveMessage_createServerFn_handler = createServerRpc({
  id: "818d84d8feb96f9e133b53f553d131a1a13d446631c853c0177ecb078188e07c",
  name: "saveMessage",
  filename: "src/lib/chat.functions.ts"
}, (opts) => saveMessage.__executeServer(opts));
const saveMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().optional(),
  threadId: z.string(),
  role: z.enum(["user", "assistant"]),
  parts: z.any()
}).parse(input)).handler(saveMessage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const msgId = data.id || crypto.randomUUID();
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const partsJson = typeof data.parts === "string" ? data.parts : JSON.stringify(data.parts);
  try {
    if (supabaseServer) {
      await supabaseServer.from("messages").upsert([{
        id: msgId,
        thread_id: data.threadId,
        user_id: userId,
        role: data.role,
        parts: data.parts,
        created_at: nowIso
      }]);
      await supabaseServer.from("threads").update({
        updated_at: nowIso
      }).eq("id", data.threadId);
    }
  } catch (e) {
    console.warn("[chat.functions] Supabase save message warning", e);
  }
  try {
    const db = getDb();
    if (db) {
      db.prepare("INSERT OR REPLACE INTO messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)").run(msgId, data.threadId, data.role, partsJson, nowIso);
      db.prepare("UPDATE threads SET updated_at = ? WHERE id = ?").run(nowIso, data.threadId);
    }
  } catch (e) {
    console.warn("[chat.functions] SQLite save message warning", e);
  }
  return {
    ok: true,
    id: msgId
  };
});
const getThreadMessages_createServerFn_handler = createServerRpc({
  id: "bc77fc2e18eb996fb643a2019ea9e4d22e813583b9affd0db1f7ed2849c1e317",
  name: "getThreadMessages",
  filename: "src/lib/chat.functions.ts"
}, (opts) => getThreadMessages.__executeServer(opts));
const getThreadMessages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  threadId: z.string()
}).parse(input)).handler(getThreadMessages_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  try {
    if (supabaseServer) {
      const {
        data: thread
      } = await supabaseServer.from("threads").select("id, title, module, updated_at").eq("id", data.threadId).single();
      const {
        data: rows
      } = await supabaseServer.from("messages").select("id, role, parts, created_at").eq("thread_id", data.threadId).order("created_at", {
        ascending: true
      });
      if (rows && rows.length > 0) {
        const messages = rows.map((r) => ({
          id: r.id,
          role: r.role,
          parts: typeof r.parts === "string" ? JSON.parse(r.parts) : r.parts,
          created_at: r.created_at
        }));
        return {
          thread,
          messages
        };
      }
    }
  } catch (e) {
    console.warn("[chat.functions] Supabase get messages warning", e);
  }
  try {
    const db = getDb();
    if (db) {
      const thread = db.prepare("SELECT id, title, module, updated_at FROM threads WHERE id = ?").get(data.threadId);
      const rows = db.prepare("SELECT id, role, content as parts, created_at FROM messages WHERE thread_id = ? ORDER BY created_at ASC").all(data.threadId);
      const messages = rows.map((r) => {
        let parsedParts = r.parts;
        try {
          parsedParts = typeof r.parts === "string" ? JSON.parse(r.parts) : r.parts;
        } catch (_) {
        }
        return {
          id: r.id,
          role: r.role,
          parts: parsedParts,
          created_at: r.created_at
        };
      });
      return {
        thread: thread || {
          id: data.threadId,
          user_id: userId,
          title: "Academic AI Assistant",
          module: null,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        messages
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
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    messages: []
  };
});
export {
  createThread_createServerFn_handler,
  deleteThread_createServerFn_handler,
  getThreadMessages_createServerFn_handler,
  listThreads_createServerFn_handler,
  renameThread_createServerFn_handler,
  saveMessage_createServerFn_handler
};
