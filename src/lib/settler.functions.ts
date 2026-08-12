import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { getAiModelWithCustomKey } from "./ai-gateway.server";

// ─── Settler: DevOps & Auto-Configuration AI Agent ─────────────────────────
export const interpretSettlerInstruction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      instruction: z.string().max(1000),
      customKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { instruction, customKey } = data;

    const todayStr = "2026-07-09";

    const prompt = `You are "Settler", the autonomous AI DevOps and configuration agent for AcadSphere.
Your job is to assist the user by changing settings, fixing dashboard items, or creating new reminders, posts, or profile configs based on their natural language request.

Today's date is: ${todayStr} (Thursday).

Based on the user's instruction, determine if it maps to any of these action types:
1. "theme": Change theme. Params: {"value": "dark" | "light"}
2. "accent": Change color accent. Params: {"value": "blue" | "violet" | "emerald" | "rose" | "amber" | "cyan"}
3. "profile": Update academic details. Params: {"fullName": string, "degree": string, "semester": string, "targetRole": string, "skills": string} (Include only updated params)
4. "community": Write a community post. Params: {"content": string, "channel": "#placement-prep" | "#dbms-lab" | "#viva-questions" | "#general-chat" | "#study-groups"}

Respond ONLY in this exact JSON format:
{
  "response": "<friendly, professional confirmation message detailing what you successfully configured or fixed>",
  "action": {
    "type": "theme" | "accent" | "profile" | "community" | null,
    "params": { ... }
  }
}

User Instruction: "${instruction}"

If the instruction doesn't map to any of these, set "action": null and explain how the user can format their request so you can help them.`;

    try {
      const model = getAiModelWithCustomKey(customKey);
      if (!model) throw new Error("No AI model available");
      const { text } = await generateText({ model, prompt, maxOutputTokens: 400 } as any);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: parsed.response || "Instruction processed.",
          action: parsed.action || null
        };
      }
    } catch (_) {}

    return {
      response: "I received your instruction. Please format it clearly (e.g. 'set theme to light', 'change role to Analyst') so I can configure it for you.",
      action: null
    };
  });
