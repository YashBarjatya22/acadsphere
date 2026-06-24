import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import crypto from "node:crypto";
import { supabaseServer } from "@/integrations/supabase/supabase.server";
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

        const { data: authData, error: authError } = await supabaseServer.auth.getUser(token);
        if (authError || !authData.user) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = authData.user.id;

        // Verify thread ownership in Supabase
        const { data: thread, error: threadError } = await supabaseServer
          .from("threads")
          .select("id, title")
          .eq("id", threadId)
          .eq("user_id", userId)
          .single();

        if (threadError || !thread) {
          return new Response("Thread not found", { status: 404 });
        }

        // Determine LLM provider based on available environment keys
        let model: any;
        if (process.env.LOVABLE_API_KEY) {
          const key = process.env.LOVABLE_API_KEY;
          const gateway = createLovableAiGatewayProvider(key);
          model = gateway("google/gemini-3-flash-preview");
        } else if (process.env.GEMINI_API_KEY) {
          const key = process.env.GEMINI_API_KEY;
          const provider = createOpenAICompatible({
            name: "gemini",
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
            headers: {
              Authorization: `Bearer ${key}`,
            },
          });
          model = provider("gemini-1.5-flash");
        } else if (process.env.OPENAI_API_KEY) {
          const key = process.env.OPENAI_API_KEY;
          const provider = createOpenAICompatible({
            name: "openai",
            baseURL: "https://api.openai.com/v1",
            headers: {
              Authorization: `Bearer ${key}`,
            },
          });
          model = provider("gpt-4o-mini");
        } else {
          return new Response(
            "Missing AI configuration. Please configure LOVABLE_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in your .env file.",
            { status: 500 },
          );
        }

        const uiMessages = messages as UIMessage[];
        const latestUser = [...uiMessages].reverse().find((m) => m.role === "user");

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
              const toInsert = finalMessages.filter(
                (m) => !knownIds.has(m.id) || m.id === latestUser?.id,
              );

              if (toInsert.length > 0) {
                const messageRecords = toInsert.map((m) => ({
                  id: m.id || crypto.randomUUID(),
                  thread_id: threadId,
                  user_id: userId,
                  role: m.role,
                  parts: m.parts,
                }));
                
                await supabaseServer.from("messages").insert(messageRecords);
              }

              // Auto-title from first user message if still default
              if (thread.title === "New chat" && latestUser) {
                const text = latestUser.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join(" ")
                  .trim()
                  .slice(0, 80);
                  
                if (text) {
                  await supabaseServer
                    .from("threads")
                    .update({ title: text, updated_at: new Date().toISOString() })
                    .eq("id", threadId);
                }
              } else {
                await supabaseServer
                  .from("threads")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", threadId);
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
