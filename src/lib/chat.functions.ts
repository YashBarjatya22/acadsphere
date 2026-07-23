import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { supabaseServer } from "@/integrations/supabase/supabase.server";

// Fallback in-memory store for demo/offline threads
const localThreadsStore: Array<{ id: string; user_id: string; title: string; module: string | null; updated_at: string }> = [
  {
    id: "demo-thread-1",
    user_id: "demo-user-id",
    title: "DBMS Normalization & BCNF Notes",
    module: "smart-notes",
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-thread-2",
    user_id: "demo-user-id",
    title: "Operating Systems Viva Simulator",
    module: "viva",
    updated_at: new Date().toISOString(),
  },
];

const localMessagesStore: Array<{ id: string; thread_id: string; role: string; parts: any; created_at: string }> = [
  {
    id: "m-1",
    thread_id: "demo-thread-1",
    role: "user",
    parts: [{ type: "text", text: "Explain 3NF vs BCNF normalization." }],
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "m-2",
    thread_id: "demo-thread-1",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "### 📚 Database Normalization: 3NF vs BCNF\n\n- **3NF**: A table is in 3NF if for every functional dependency X -> Y, X is a superkey OR Y is a prime attribute.\n- **BCNF**: Strictly requires X to be a superkey for ALL non-trivial dependencies X -> Y.\n\nBCNF eliminates redundancy caused by candidate key overlaps.",
      },
    ],
    created_at: new Date(Date.now() - 3500000).toISOString(),
  },
];

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    try {
      const { data, error } = await supabaseServer
        .from("threads")
        .select("id, title, module, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase thread list fallback", e);
    }

    return localThreadsStore.filter((t) => t.user_id === userId || userId === "demo-user-id");
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
    const title = data.title ?? "New Chat Thread";
    const module = data.module ?? null;

    try {
      const { data: thread, error } = await supabaseServer
        .from("threads")
        .insert([{ user_id: userId, title, module }])
        .select("id, title, module, updated_at")
        .single();

      if (!error && thread) {
        return thread;
      }
    } catch (e) {
      console.warn("Supabase create thread fallback", e);
    }

    const newThread = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      module,
      updated_at: new Date().toISOString(),
    };
    localThreadsStore.unshift(newThread);
    return newThread;
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string(), title: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    try {
      const { error } = await supabaseServer
        .from("threads")
        .update({ title: data.title, updated_at: new Date().toISOString() })
        .eq("id", data.id)
        .eq("user_id", userId);

      if (!error) return { ok: true };
    } catch (e) {
      console.warn("Supabase rename thread fallback", e);
    }

    const item = localThreadsStore.find((t) => t.id === data.id);
    if (item) {
      item.title = data.title;
      item.updated_at = new Date().toISOString();
    }
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    try {
      const { error } = await supabaseServer
        .from("threads")
        .delete()
        .eq("id", data.id)
        .eq("user_id", userId);

      if (!error) return { ok: true };
    } catch (e) {
      console.warn("Supabase delete thread fallback", e);
    }

    const index = localThreadsStore.findIndex((t) => t.id === data.id);
    if (index !== -1) {
      localThreadsStore.splice(index, 1);
    }
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    try {
      const { data: thread, error: threadError } = await supabaseServer
        .from("threads")
        .select("id, title, module")
        .eq("id", data.threadId)
        .single();

      if (!threadError && thread) {
        const { data: rows } = await supabaseServer
          .from("messages")
          .select("id, role, parts, created_at")
          .eq("thread_id", data.threadId)
          .order("created_at", { ascending: true });

        const messages = (rows ?? []).map((r: any) => ({
          id: r.id,
          role: r.role,
          parts: typeof r.parts === "string" ? JSON.parse(r.parts) : r.parts,
        }));

        return { thread, messages };
      }
    } catch (e) {
      console.warn("Supabase get messages fallback", e);
    }

    let localThread = localThreadsStore.find((t) => t.id === data.threadId);
    if (!localThread) {
      localThread = {
        id: data.threadId,
        user_id: userId,
        title: "Academic AI Assistant",
        module: null,
        updated_at: new Date().toISOString(),
      };
      localThreadsStore.unshift(localThread);
    }

    const localMsgs = localMessagesStore.filter((m) => m.thread_id === data.threadId);
    return {
      thread: localThread,
      messages: localMsgs.map((r) => ({ id: r.id, role: r.role, parts: r.parts })),
    };
  });
