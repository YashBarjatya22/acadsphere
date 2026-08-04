import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getAiModel } from "@/lib/ai-gateway.server";
import crypto from "node:crypto";
import { getStudentOsSystemPrompt } from "@/lib/student-os-prompt";
import { generateAcademicResponse } from "@/lib/academic-ai.engine";

type ChatBody = { messages?: unknown; threadId?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let messages: any[] = [];
        let threadId = "demo-thread-1";

        try {
          const body = await request.json();
          messages = body.messages || [];
          threadId = body.threadId || "demo-thread-1";
        } catch {
          // Empty body fallback
        }

        const uiMessages = messages as UIMessage[];
        const latestUser = [...uiMessages].reverse().find((m) => m.role === "user");
        const promptText = latestUser
          ? latestUser.parts?.map((p) => (p.type === "text" ? p.text : "")).join(" ") || "Academic query"
          : "Academic query";

        // Try environment LLM models first if key available
        let model: any = null;
        try {
          model = getAiModel();
        } catch (e) {
          console.warn("[api/chat] LLM model init warning:", e);
        }

        if (model) {
          try {
            const result = streamText({
              model,
              system: getStudentOsSystemPrompt(),
              messages: await convertToModelMessages(uiMessages),
              maxRetries: 0,
              onError: ({ error }) => {
                console.error("StudentOS stream error:", error);
              },
            });
            return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
          } catch (err) {
            console.warn("[api/chat] Live LLM streaming failed, serving intelligent fallback response", err);
          }
        }

        // Return instant intelligent streaming response in official AI SDK v6 UI Message stream format
        const fallbackText = generateAcademicResponse(promptText);
        const encoder = new TextEncoder();
        const msgId = "fallback-" + crypto.randomUUID();

        const customStream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: {"type":"text-start","id":${JSON.stringify(msgId)}}\n\n`));
            controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":${JSON.stringify(msgId)},"delta":${JSON.stringify(fallbackText)}}\n\n`));
            controller.enqueue(encoder.encode(`data: {"type":"text-end","id":${JSON.stringify(msgId)}}\n\n`));
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          },
        });

        return new Response(customStream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
