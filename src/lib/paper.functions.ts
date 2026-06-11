import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { getDb } from "./db.server";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const PaperInputSchema = z.object({
  fileName: z.string(),
  fileContent: z.string(), // Base64 encoded file data
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional(),
});

// Server function to upload and analyze paper
export const uploadAndAnalyzePaper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PaperInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    // 1. Write the file locally
    const tempDir = path.join(process.cwd(), "temp_uploads");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const cleanFileName = data.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const tempFilePath = path.join(tempDir, `paper_${Date.now()}_${cleanFileName}`);
    fs.writeFileSync(tempFilePath, Buffer.from(data.fileContent, "base64"));

    let paperText = "";
    let numPages = 1;

    try {
      // 2. Run the python extraction bridge
      const pythonPath = "python";
      const scriptPath = path.join(process.cwd(), "extract_text.py");
      const buffer = execFileSync(pythonPath, [scriptPath, tempFilePath]);
      const rawOutput = buffer.toString("utf-8");

      // Extract page count from standard prefix
      const pageCountMatch = rawOutput.match(/---PAGE_COUNT:(\d+)---/);
      if (pageCountMatch) {
        numPages = parseInt(pageCountMatch[1], 10);
      }
      
      // Extract text content and remove page count header
      paperText = rawOutput.replace(/---PAGE_COUNT:\d+---/, "").trim();
    } catch (e) {
      console.error("PDF text extraction failed:", e);
      throw new Error("Failed to parse the uploaded research paper.");
    } finally {
      // 3. Clean up the temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }

    if (!paperText || paperText.trim().length === 0) {
      throw new Error("The uploaded document appears to be empty or unscannable.");
    }

    // Truncate text to avoid token limits (keep first 20,000 characters)
    const truncatedText = paperText.slice(0, 20000);

    const customKey = data.custom_key?.trim();
    const systemLovableKey = process.env.LOVABLE_API_KEY;
    const systemGeminiKey = process.env.GEMINI_API_KEY;
    const systemOpenaiKey = process.env.OPENAI_API_KEY;

    let model: any;

    try {
      // Setup LLM provider
      if (data.provider === "OpenAI" && customKey) {
        const provider = createOpenAICompatible({
          name: "openai",
          baseURL: "https://api.openai.com/v1",
          headers: { Authorization: `Bearer ${customKey}` },
        });
        model = provider("gpt-4o-mini");
      } else if (data.provider === "Gemini" && customKey) {
        const provider = createOpenAICompatible({
          name: "gemini",
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          headers: { Authorization: `Bearer ${customKey}` },
        });
        model = provider("gemini-1.5-flash");
      } else if (systemLovableKey) {
        const gateway = createLovableAiGatewayProvider(systemLovableKey);
        model = gateway("google/gemini-3-flash-preview");
      } else if (systemGeminiKey) {
        const provider = createOpenAICompatible({
          name: "gemini",
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          headers: { Authorization: `Bearer ${systemGeminiKey}` },
        });
        model = provider("gemini-1.5-flash");
      } else if (systemOpenaiKey) {
        const provider = createOpenAICompatible({
          name: "openai",
          baseURL: "https://api.openai.com/v1",
          headers: { Authorization: `Bearer ${systemOpenaiKey}` },
        });
        model = provider("gpt-4o-mini");
      } else {
        throw new Error("No AI Configuration found. Please configure GEMINI_API_KEY or upload a custom key.");
      }

      const prompt = `
      You are an expert AI Research Assistant. Your task is to analyze the research paper text provided below and output a comprehensive structured response inside a JSON object.
      Explain complex concepts in simple plain English suitable for MCA, BCA, and B.Tech students preparing for project reviews, presentation slide decks, and viva examinations.

      Research Paper Text:
      ${truncatedText}

      Return your response as a valid JSON object. Do not include markdown code block formatting (like \`\`\`json) or any prefix/suffix outside the JSON.
      The JSON must strictly match the following schema:
      {
        "plainEnglishSummary": "<A simple, high-level explanation of the paper. Maximum 5 paragraphs. Written in an encouraging and accessible style.>",
        "problemStatement": {
          "solving": "<What problem are the researchers solving?>",
          "whyItMatters": "<Why does this research problem matter to the field and industry?>"
        },
        "keyFindings": [
          "<Top discovery 1>",
          "<Top discovery 2>",
          "<Top discovery 3>",
          "<Top discovery 4>",
          "<Top discovery 5>"
        ],
        "methodology": {
          "approach": "<Research approach/architecture summary>",
          "algorithms": "<Algorithms, equations, or mathematical models used (or state none)>",
          "dataset": "<Dataset used for training, testing, or simulation (or state none)>",
          "tools": "<Software tools, frameworks, hardware, or languages used (e.g. Python, TensorFlow)>"
        },
        "keywords": [
          { "word": "<keyword 1>", "definition": "<definition 1>" },
          { "word": "<keyword 2>", "definition": "<definition 2>" },
          { "word": "<keyword 3>", "definition": "<definition 3>" },
          { "word": "<keyword 4>", "definition": "<definition 4>" }
        ],
        "researchGap": {
          "missing": "<What areas did the researchers miss or skip?>",
          "limitations": "<Limitations of the current study (e.g. sample size, compute capacity)>",
          "challenges": "<Open challenges or vulnerabilities of the proposed approach>"
        },
        "futureScope": {
          "improvements": "<Recommended future improvements to this approach>",
          "extensions": "<Extension or scaling opportunities (e.g. porting to real-time mobile app)>"
        },
        "vivaPrep": [
          { "question": "<viva question 1>", "expectedAnswer": "<expected answer 1>", "difficulty": "Easy" },
          { "question": "<viva question 2>", "expectedAnswer": "<expected answer 2>", "difficulty": "Easy" },
          { "question": "<viva question 3>", "expectedAnswer": "<expected answer 3>", "difficulty": "Easy" },
          { "question": "<viva question 4>", "expectedAnswer": "<expected answer 4>", "difficulty": "Medium" },
          { "question": "<viva question 5>", "expectedAnswer": "<expected answer 5>", "difficulty": "Medium" },
          { "question": "<viva question 6>", "expectedAnswer": "<expected answer 6>", "difficulty": "Medium" },
          { "question": "<viva question 7>", "expectedAnswer": "<expected answer 7>", "difficulty": "Medium" },
          { "question": "<viva question 8>", "expectedAnswer": "<expected answer 8>", "difficulty": "Hard" },
          { "question": "<viva question 9>", "expectedAnswer": "<expected answer 9>", "difficulty": "Hard" },
          { "question": "<viva question 10>", "expectedAnswer": "<expected answer 10>", "difficulty": "Hard" }
        ],
        "quickRevision": {
          "summary": "<One-page level revision summary review>",
          "bulletPoints": [
            "<Key takeaway point 1>",
            "<Key takeaway point 2>",
            "<Key takeaway point 3>",
            "<Key takeaway point 4>",
            "<Key takeaway point 5>"
          ]
        },
        "confidenceMeter": {
          "summaryScore": <Integer from 50 to 100 representing confidence in summary accuracy>,
          "extractionScore": <Integer from 50 to 100 representing quality of details extraction>
        },
        "analytics": {
          "readingDifficulty": <Integer from 10 to 100 representing how difficult the vocabulary is>,
          "researchComplexity": <Integer from 10 to 100 representing implementation/algorithm complexity>,
          "studentUnderstanding": <Integer from 10 to 100 representing expected student understanding rate>
        }
      }
      `;

      const response = await generateText({
        model,
        prompt,
      });

      let text = response.text.trim();
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?/im, "").replace(/```$/m, "").trim();
      }

      const analysisResult = JSON.parse(text);
      const analysisId = crypto.randomUUID();

      // Save to SQLite
      const insertStmt = db.prepare(`
        INSERT INTO paper_analyses (id, user_id, file_name, num_pages, status, result)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(analysisId, userId, data.fileName, numPages, "Completed", JSON.stringify(analysisResult));

      return {
        id: analysisId,
        file_name: data.fileName,
        num_pages: numPages,
        status: "Completed",
        result: analysisResult
      };
    } catch (e: any) {
      console.error("Gemini analysis failed:", e);
      throw new Error(e.message || "Failed to analyze paper contents via AI.");
    }
  });

// Server function to list user analyses
export const listPaperAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      SELECT id, file_name, num_pages, status, result, created_at as upload_date
      FROM paper_analyses
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId) || [];
    return rows.map((r: any) => ({
      id: r.id,
      file_name: r.file_name,
      num_pages: r.num_pages,
      status: r.status,
      upload_date: r.upload_date,
      result: r.result ? JSON.parse(r.result) : null
    }));
  });

// Server function to delete a paper analysis
export const deletePaperAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare(`
      DELETE FROM paper_analyses
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(data.id, userId);
    return { ok: true };
  });
