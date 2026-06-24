import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { supabaseServer } from "@/integrations/supabase/supabase.server";

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await supabaseServer
      .from("threads")
      .select("id, title, module, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error listing threads:", error);
      return [];
    }

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
    const title = data.title ?? "New chat";
    const module = data.module ?? null;

    const { data: thread, error } = await supabaseServer
      .from("threads")
      .insert([{ user_id: userId, title, module }])
      .select("id, title, module, updated_at")
      .single();

    if (error || !thread) {
      throw new Error("Failed to create thread: " + error?.message);
    }

    return thread;
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), title: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabaseServer
      .from("threads")
      .update({ title: data.title, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) {
      throw new Error("Failed to rename thread: " + error.message);
    }

    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabaseServer
      .from("threads")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) {
      throw new Error("Failed to delete thread: " + error.message);
    }

    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Verify thread ownership
    const { data: thread, error: threadError } = await supabaseServer
      .from("threads")
      .select("id, title, module")
      .eq("id", data.threadId)
      .eq("user_id", userId)
      .single();

    if (threadError || !thread) {
      return { thread: null, messages: [] };
    }

    const { data: rows, error: msgError } = await supabaseServer
      .from("messages")
      .select("id, role, parts, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });

    if (msgError) {
      console.error("Error fetching messages:", msgError);
      return { thread, messages: [] };
    }

    const messages = (rows ?? []).map((r: any) => ({
      id: r.id,
      role: r.role,
      parts: typeof r.parts === "string" ? JSON.parse(r.parts) : r.parts,
    }));

    return { thread, messages };
  });
