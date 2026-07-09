import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

// ─── Shared AI provider helper ───────────────────────────────────────────────
function getAiModel(customKey?: string, provider?: string) {
  const key = customKey?.trim() || process.env.LOVABLE_API_KEY || "";
  if (!key) {
    throw new Error("No AI API key available. Please configure a key in Settings.");
  }
  const gateway = createLovableAiGatewayProvider(key);
  return gateway("gemini-2.0-flash");
}

// ─── Viva Simulator: Generate a Question ────────────────────────────────────
export const generateVivaQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      subject: z.string(),
      previousQuestions: z.array(z.string()).optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      customKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { subject, previousQuestions = [], difficulty, customKey } = data;

    const prevQuestionsText =
      previousQuestions.length > 0
        ? `\n\nPrevious questions already asked (DO NOT repeat these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
        : "";

    const prompt = `You are a strict external examiner conducting an oral viva examination for a ${subject} course at an engineering college.

Generate ONE ${difficulty}-level examination question on ${subject} that:
- Tests deep conceptual understanding, not just definitions
- Is commonly asked in engineering university exams
- Requires a structured, multi-part explanation
- Is clear and unambiguous${prevQuestionsText}

Respond with ONLY the question. No preamble, no numbering, no explanation.`;

    try {
      const model = getAiModel(customKey);
      const { text } = await generateText({ model, prompt, maxTokens: 150 });
      return { question: text.trim() };
    } catch (e: any) {
      // Fallback questions by subject
      const fallbacks: Record<string, string[]> = {
        "Computer Networks": [
          "Explain the differences between TCP and UDP. In which scenarios would you prefer UDP over TCP?",
          "What is the purpose of ARP? How does it resolve IP addresses to MAC addresses on a LAN?",
          "Describe the TCP three-way handshake. What happens if the SYN-ACK is lost?",
          "Explain subnetting. How do you calculate the subnet mask for a /26 network?",
          "What is OSPF and how does it differ from RIP in terms of routing algorithm?",
        ],
        "Database Management Systems": [
          "What is Database Normalization? Explain the conditions required for 3NF with an example.",
          "What is the difference between primary key, foreign key, and candidate key?",
          "Explain ACID properties in database transactions. How does 'Isolation' prevent dirty reads?",
          "Describe B+ Tree indexing. Why is it preferred over a B-Tree for databases?",
          "What is a deadlock in DBMS? How does the Wait-Die scheme prevent it?",
        ],
        "Operating Systems": [
          "What is thrashing in operating systems? How does the working set model prevent it?",
          "Explain the differences between processes and threads. How does the OS scheduler handle context switching?",
          "What is a page fault? Describe the steps the OS takes to resolve it.",
          "Explain Banker's Algorithm for deadlock avoidance. What is its main limitation?",
          "What is the difference between preemptive and non-preemptive CPU scheduling? Give an example of each.",
        ],
      };
      const subjectFallbacks =
        fallbacks[subject] || fallbacks["Computer Networks"];
      const idx = previousQuestions.length % subjectFallbacks.length;
      return { question: subjectFallbacks[idx] };
    }
  });

// ─── Viva Simulator: Grade an Answer ─────────────────────────────────────────
export const gradeVivaAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      subject: z.string(),
      question: z.string(),
      answer: z.string(),
      customKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { subject, question, answer, customKey } = data;

    if (!answer.trim()) {
      return { score: 0, feedback: "No answer provided.", grade: "F" };
    }

    const prompt = `You are an examiner for a ${subject} viva examination. Grade the following student answer.

Question: ${question}

Student's Answer: ${answer}

Evaluate on:
1. Correctness of core concept (0-4 points)
2. Clarity and structure (0-3 points)  
3. Use of technical terminology (0-2 points)
4. Real-world application knowledge (0-1 point)

Respond ONLY in this exact JSON format:
{
  "score": <number 0-10>,
  "grade": "<A/B/C/D/F>",
  "feedback": "<2-3 sentence constructive feedback>",
  "keyMissing": "<most important concept the student missed, or empty string>"
}`;

    try {
      const model = getAiModel(customKey);
      const { text } = await generateText({ model, prompt, maxTokens: 250 });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(10, Math.max(0, Number(parsed.score) || 5)),
          grade: parsed.grade || "C",
          feedback: parsed.feedback || "Good attempt.",
          keyMissing: parsed.keyMissing || "",
        };
      }
    } catch (e) {
      // ignore
    }

    // Fallback scoring
    const len = answer.trim().length;
    const score = len < 30 ? 3 : len < 100 ? 5 : len < 200 ? 7 : 8;
    return {
      score,
      grade: score >= 8 ? "A" : score >= 6 ? "B" : score >= 4 ? "C" : "D",
      feedback:
        score >= 7
          ? "Good answer! Cover edge cases and application examples for a perfect score."
          : score >= 5
          ? "Decent attempt. Elaborate more on the mechanism and add real-world use cases."
          : "Answer is too brief. Structure your response: define → explain → example.",
      keyMissing: "",
    };
  });

// ─── Lab Buddy: Generate Code from Exercise Description ──────────────────────
export const generateLabCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      subject: z.string(),
      exerciseDescription: z.string().max(2000),
      language: z.string().default("auto"),
      customKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { subject, exerciseDescription, language, customKey } = data;

    const langHint =
      language === "auto"
        ? "Choose the most appropriate language for this subject (SQL for DBMS, C/Java for OS/Networks, Python otherwise)"
        : `Use ${language}`;

    const prompt = `You are an expert teaching assistant helping an engineering student complete their lab exercise.

Subject: ${subject}
Exercise: ${exerciseDescription}

Generate a complete, well-commented, working implementation. ${langHint}.

Your response MUST be in this exact JSON format:
{
  "language": "<programming language used>",
  "code": "<complete working code with comments>",
  "explanation": "<2-3 sentence plain-English explanation of the approach>",
  "testCases": "<2-3 sample test cases or expected outputs>",
  "notes": "<any important notes about running or modifying the code>"
}

Make the code clean, properly indented, and educational with inline comments.`;

    try {
      const model = getAiModel(customKey);
      const { text } = await generateText({ model, prompt, maxTokens: 1500 });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          language: parsed.language || "code",
          code: parsed.code || text,
          explanation: parsed.explanation || "",
          testCases: parsed.testCases || "",
          notes: parsed.notes || "",
        };
      }
      return { language: "code", code: text, explanation: "", testCases: "", notes: "" };
    } catch (e: any) {
      throw new Error(
        e?.message?.includes("API key")
          ? "No AI API key configured. Please add your Gemini API key in Settings."
          : "Failed to generate code. Please try again."
      );
    }
  });

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

    const todayStr = "2026-07-09"; // Pin to current local date in sandbox

    const prompt = `You are "Settler", the autonomous AI DevOps and configuration agent for AcadSphere.
Your job is to assist the user by changing settings, fixing dashboard items, or creating new reminders, posts, or profile configs based on their natural language request.

Today's date is: ${todayStr} (Thursday).

Based on the user's instruction, determine if it maps to any of these action types:
1. "theme": Change theme. Params: {"value": "dark" | "light"}
2. "accent": Change color accent. Params: {"value": "blue" | "violet" | "emerald" | "rose" | "amber" | "cyan"}
3. "profile": Update academic details. Params: {"fullName": string, "degree": string, "semester": string, "targetRole": string, "skills": string} (Include only updated params)
4. "exam": Add a new CIA exam countdown. Params: {"subject": string, "date": "YYYY-MM-DD" (calculate relative to today), "syllabus": string, "type": "CIA-1" | "CIA-2" | "Model" | "Semester"}
5. "community": Write a community post. Params: {"content": string, "channel": "#placement-prep" | "#dbms-lab" | "#viva-questions" | "#general-chat" | "#study-groups"}

Respond ONLY in this exact JSON format:
{
  "response": "<friendly, professional confirmation message detailing what you successfully configured or fixed>",
  "action": {
    "type": "theme" | "accent" | "profile" | "exam" | "community" | null,
    "params": { ... }
  }
}

User Instruction: "${instruction}"

If the instruction doesn't map to any of these, set "action": null and explain how the user can format their request so you can help them.`;

    try {
      const model = getAiModel(customKey);
      const { text } = await generateText({ model, prompt, maxTokens: 400 });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: parsed.response || "Instruction processed.",
          action: parsed.action || null
        };
      }
    } catch (_) {}

    // Graceful fallback
    return {
      response: "I received your instruction. Please format it clearly (e.g. 'set theme to light', 'change role to Analyst') so I can configure it for you.",
      action: null
    };
  });

