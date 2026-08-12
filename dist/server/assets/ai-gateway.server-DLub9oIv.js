import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
function getAiModel(modelName = "llama-3.3-70b-versatile") {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (groqKey && !groqKey.includes("your_") && groqKey.length > 5) {
    const provider = createOpenAICompatible({
      name: "groq",
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: groqKey
    });
    return provider(modelName);
  }
  if (openaiKey && !openaiKey.includes("your_") && openaiKey.length > 5) {
    const provider = createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      apiKey: openaiKey
    });
    return provider("gpt-4o-mini");
  }
  if (geminiKey && !geminiKey.includes("your_") && geminiKey.length > 5) {
    const provider = createOpenAICompatible({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: geminiKey
    });
    return provider("gemini-1.5-flash");
  }
  return null;
}
function getAiModelWithCustomKey(customKey, provider) {
  if (!customKey) return getAiModel();
  if (provider === "OpenAI") {
    const p2 = createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      apiKey: customKey
    });
    return p2("gpt-4o-mini");
  }
  if (provider === "Gemini") {
    const p2 = createOpenAICompatible({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: customKey
    });
    return p2("gemini-1.5-flash");
  }
  const p = createOpenAICompatible({
    name: "groq-custom",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: customKey
  });
  return p("llama-3.3-70b-versatile");
}
export {
  getAiModelWithCustomKey as a,
  getAiModel as g
};
