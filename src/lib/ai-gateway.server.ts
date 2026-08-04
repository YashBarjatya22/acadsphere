import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { config } from "dotenv";
import path from "node:path";

// Ensure environment variables from .env.local and .env are loaded
if (typeof process !== "undefined" && process.cwd) {
  config({ path: path.resolve(process.cwd(), ".env.local") });
  config({ path: path.resolve(process.cwd(), ".env") });
}

/**
 * Returns a Vercel AI SDK-compatible model instance using Groq API.
 * Uses Groq's high-speed OpenAI-compatible REST endpoint (specification version v2).
 *
 * Primary Model: llama-3.3-70b-versatile (ultra fast, high intelligence)
 * Backup Models: llama-3.1-8b-instant, mixtral-8x7b-32768
 */
export function getAiModel(modelName: string = "llama-3.3-70b-versatile") {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  if (groqKey && !groqKey.includes("your_") && groqKey.length > 5) {
    const provider = createOpenAICompatible({
      name: "groq",
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: groqKey,
    });
    return provider(modelName);
  }

  if (openaiKey && !openaiKey.includes("your_") && openaiKey.length > 5) {
    const provider = createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      apiKey: openaiKey,
    });
    return provider("gpt-4o-mini");
  }

  if (geminiKey && !geminiKey.includes("your_") && geminiKey.length > 5) {
    const provider = createOpenAICompatible({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: geminiKey,
    });
    return provider("gemini-1.5-flash");
  }

  return null;
}

/**
 * Returns a model using a user-supplied custom key.
 * Falls back to getAiModel() if no custom key is provided.
 */
export function getAiModelWithCustomKey(
  customKey?: string,
  provider?: "Groq" | "Gemini" | "OpenAI"
) {
  if (!customKey) return getAiModel();

  if (provider === "OpenAI") {
    const p = createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      apiKey: customKey,
    });
    return p("gpt-4o-mini");
  }

  // Default: Groq API key
  const p = createOpenAICompatible({
    name: "groq-custom",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: customKey,
  });
  return p("llama-3.3-70b-versatile");
}
