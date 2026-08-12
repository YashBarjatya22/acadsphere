import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Returns a Vercel AI SDK-compatible model instance using Groq API.
 * Uses Groq's high-speed OpenAI-compatible REST endpoint.
 *
 * Primary Model: llama-3.3-70b-versatile (ultra fast, high intelligence)
 * Reads GROQ_API_KEY from the environment (set in .env.local).
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

  // No key configured — return null, caller handles fallback
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

  if (provider === "Gemini") {
    const p = createOpenAICompatible({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: customKey,
    });
    return p("gemini-1.5-flash");
  }

  // Default: treat as Groq API key
  const p = createOpenAICompatible({
    name: "groq-custom",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: customKey,
  });
  return p("llama-3.3-70b-versatile");
}
