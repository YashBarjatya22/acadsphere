import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import crypto from "node:crypto";
import { getDb } from "@/lib/db.server";
import { verifyToken } from "@/lib/auth.functions";
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

        const claims = verifyToken(token);
        if (!claims) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claims.sub;

        const db = getDb();
        if (!db) {
          return new Response("Database not initialized", { status: 500 });
        }

        // Verify thread ownership in SQLite
        const threadStmt = db.prepare("SELECT id, title FROM threads WHERE id = ? AND user_id = ?");
        const thread = threadStmt.get(threadId, userId);
        if (!thread) {
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
              const localDb = getDb();
              if (!localDb) return;

              // Persist the latest user message + the new assistant message(s)
              const knownIds = new Set(uiMessages.map((m) => m.id));
              const toInsert = finalMessages.filter(
                (m) => !knownIds.has(m.id) || m.id === latestUser?.id,
              );

              if (toInsert.length > 0) {
                const insertStmt = localDb.prepare(`
                  INSERT INTO messages (id, thread_id, user_id, role, parts) 
                  VALUES (?, ?, ?, ?, ?)
                `);
                for (const m of toInsert) {
                  const messageId = m.id || crypto.randomUUID();
                  const partsJson = JSON.stringify(m.parts);
                  insertStmt.run(messageId, threadId, userId, m.role, partsJson);
                }
              }

              // Auto-title from first user message if still default
              if (thread.title === "New chat" && latestUser) {
                const text = latestUser.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join(" ")
                  .trim()
                  .slice(0, 80);
                if (text) {
                  const updateStmt = localDb.prepare(
                    "UPDATE threads SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                  );
                  updateStmt.run(text, threadId);
                }
              } else {
                const updateStmt = localDb.prepare(
                  "UPDATE threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                );
                updateStmt.run(threadId);
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
