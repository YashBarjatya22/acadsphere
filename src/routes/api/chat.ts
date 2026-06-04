import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { STUDENT_OS_SYSTEM_PROMPT } from "@/lib/student-os-prompt";

type ChatBody = { messages?: unknown; threadId?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId } = (await request.json()) as ChatBody;

        if (!Array.isArray(messages) || typeof threadId !== "string") {
          return new Response("Bad request", { status: 400 });
        }

        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length);

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claims.claims.sub as string;

        const { data: thread } = await supabase
          .from("threads")
          .select("id, title")
          .eq("id", threadId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const uiMessages = messages as UIMessage[];
        const latestUser = [...uiMessages].reverse().find((m) => m.role === "user");

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: STUDENT_OS_SYSTEM_PROMPT,
          messages: await convertToModelMessages(uiMessages),
          onError: ({ error }) => {
            console.error("StudentOS stream error:", error);
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ messages: finalMessages }) => {
            try {
              // Persist the latest user message + the new assistant message(s)
              const knownIds = new Set(uiMessages.map((m) => m.id));
              const toInsert = finalMessages
                .filter((m) => !knownIds.has(m.id) || m.id === latestUser?.id)
                .map((m) => ({
                  thread_id: threadId,
                  user_id: userId,
                  role: m.role,
                  parts: m.parts as unknown as object,
                }));

              if (toInsert.length > 0) {
                const { error: insErr } = await supabase.from("messages").insert(toInsert);
                if (insErr) console.error("[chat] insert messages error", insErr);
              }

              // Auto-title from first user message if still default
              if (thread.title === "New chat" && latestUser) {
                const text = latestUser.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join(" ")
                  .trim()
                  .slice(0, 80);
                if (text) {
                  await supabase.from("threads").update({ title: text }).eq("id", threadId);
                }
              } else {
                await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
              }
            } catch (e) {
              console.error("[chat] persist error", e);
            }
          },
        });
      },
    },
  },
});
