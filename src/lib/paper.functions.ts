import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { supabaseServer } from "@/integrations/supabase/supabase.server";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PaperInputSchema = z.object({
  fileName: z.string(),
  fileContent: z.string(), // Base64 encoded file data
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional(),
});

export const uploadAndAnalyzePaper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PaperInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

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
      const pythonPath = "python";
      const scriptPath = path.join(process.cwd(), "extract_text.py");
      const buffer = execFileSync(pythonPath, [scriptPath, tempFilePath]);
      const rawOutput = buffer.toString("utf-8");

      const pageCountMatch = rawOutput.match(/---PAGE_COUNT:(\d+)---/);
      if (pageCountMatch) {
        numPages = parseInt(pageCountMatch[1], 10);
      }
      paperText = rawOutput.replace(/---PAGE_COUNT:\d+---/, "").trim();
    } catch (e) {
      console.error("PDF text extraction failed:", e);
      throw new Error("Failed to parse the uploaded research paper.");
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }

    if (!paperText || paperText.trim().length === 0) {
      throw new Error("The uploaded document appears to be empty or unscannable.");
    }

    const truncatedText = paperText.slice(0, 20000);

    const customKey = data.custom_key?.trim();
    const systemLovableKey = process.env.LOVABLE_API_KEY;
    const systemGeminiKey = process.env.GEMINI_API_KEY;
    const systemOpenaiKey = process.env.OPENAI_API_KEY;

    let model: any;

    try {
      if (data.provider === "OpenAI" && customKey) {
        const provider = createOpenAICompatible({ name: "openai", baseURL: "https://api.openai.com/v1", headers: { Authorization: `Bearer ${customKey}` } });
        model = provider("gpt-4o-mini");
      } else if (data.provider === "Gemini" && customKey) {
        const provider = createOpenAICompatible({ name: "gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", headers: { Authorization: `Bearer ${customKey}` } });
        model = provider("gemini-1.5-flash");
      } else if (systemLovableKey) {
        model = createLovableAiGatewayProvider(systemLovableKey)("google/gemini-3-flash-preview");
      } else if (systemGeminiKey) {
        const provider = createOpenAICompatible({ name: "gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", headers: { Authorization: `Bearer ${systemGeminiKey}` } });
        model = provider("gemini-1.5-flash");
      } else if (systemOpenaiKey) {
        const provider = createOpenAICompatible({ name: "openai", baseURL: "https://api.openai.com/v1", headers: { Authorization: `Bearer ${systemOpenaiKey}` } });
        model = provider("gpt-4o-mini");
      } else {
        throw new Error("No AI Configuration found. Please configure GEMINI_API_KEY or upload a custom key.");
      }

      const prompt = `You are an expert AI Research Assistant. Analyze the research paper text below and return a valid JSON object (no markdown blocks) with this schema: {"plainEnglishSummary":"","problemStatement":{"solving":"","whyItMatters":""},"keyFindings":[],"methodology":{"approach":"","algorithms":"","dataset":"","tools":""},"keywords":[],"researchGap":{"missing":"","limitations":"","challenges":""},"futureScope":{"improvements":"","extensions":""},"vivaPrep":[],"quickRevision":{"summary":"","bulletPoints":[]},"confidenceMeter":{"summaryScore":0,"extractionScore":0},"analytics":{"readingDifficulty":0,"researchComplexity":0,"studentUnderstanding":0}}\n\nPaper Text:\n${truncatedText}`;

      const response = await generateText({ model, prompt });

      let text = response.text.trim();
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?/im, "").replace(/```$/m, "").trim();
      }

      const analysisResult = JSON.parse(text);

      const { data: row, error } = await supabaseServer
        .from("paper_analyses")
        .insert([{
          user_id: userId,
          file_name: data.fileName,
          num_pages: numPages,
          status: "Completed",
          result: analysisResult,
        }])
        .select()
        .single();

      if (error || !row) {
        throw new Error("Failed to save paper analysis: " + error?.message);
      }

      return {
        id: row.id,
        file_name: data.fileName,
        num_pages: numPages,
        status: "Completed",
        result: analysisResult
      };
    } catch (e: any) {
      console.error("Paper analysis failed:", e);
      throw new Error(e.message || "Failed to analyze paper contents via AI.");
    }
  });

export const listPaperAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await supabaseServer
      .from("paper_analyses")
      .select("id, file_name, num_pages, status, result, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listing paper analyses:", error);
      return [];
    }

    return (data ?? []).map((r: any) => ({
      id: r.id,
      file_name: r.file_name,
      num_pages: r.num_pages,
      status: r.status,
      upload_date: r.created_at,
      result: typeof r.result === "string" ? JSON.parse(r.result) : r.result,
    }));
  });

export const deletePaperAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabaseServer
      .from("paper_analyses")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) {
      throw new Error("Failed to delete paper analysis: " + error.message);
    }

    return { ok: true };
  });
