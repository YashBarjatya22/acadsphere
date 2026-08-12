import { c as createSsrRpc } from "./createSsrRpc-CzYOcfyh.js";
import { a as createServerFn } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  subject: z.string(),
  previousQuestions: z.array(z.string()).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  customKey: z.string().optional()
})).handler(createSsrRpc("1481cb46da6a97581e42e215888daeeb03737ca237f95fccea3f551e93d11934"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  subject: z.string(),
  question: z.string(),
  answer: z.string(),
  customKey: z.string().optional()
})).handler(createSsrRpc("32ba3d22eed69abe6942a0d597192de706f86e0849ad6f5ed820d728047ff8fe"));
const generateLabCode = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  subject: z.string(),
  exerciseDescription: z.string().max(2e3),
  language: z.string().default("auto"),
  customKey: z.string().optional()
})).handler(createSsrRpc("483b3cf204bc0e4e2580baf31d2a0f47e326b8baf9fd5c9d59af098b089eeaab"));
const interpretSettlerInstruction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  instruction: z.string().max(1e3),
  customKey: z.string().optional()
})).handler(createSsrRpc("386dc3c343a7084b5c082350c77dfbcefd5fa9e7d8d1f771a42fbba2c2bf14fe"));
export {
  generateLabCode as g,
  interpretSettlerInstruction as i
};
