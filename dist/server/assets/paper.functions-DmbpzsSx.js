import { c as createServerRpc } from "./createServerRpc-LnQmho66.js";
import { a as createServerFn } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
import { generateText } from "ai";
import { a as getAiModelWithCustomKey, g as getAiModel } from "./ai-gateway.server-DLub9oIv.js";
import { s as supabaseServer } from "./supabase.server-BXfiGlvE.js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:dns";
import "node:crypto";
import "@supabase/supabase-js";
import "@ai-sdk/openai-compatible";
import "dotenv";
const PaperInputSchema = z.object({
  fileName: z.string(),
  fileContent: z.string(),
  // Base64 encoded file data
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional()
});
const uploadAndAnalyzePaper_createServerFn_handler = createServerRpc({
  id: "b864881ebda058fd7fe211b2ff03ce320363964dadcd542a5c194f45876a3203",
  name: "uploadAndAnalyzePaper",
  filename: "src/lib/paper.functions.ts"
}, (opts) => uploadAndAnalyzePaper.__executeServer(opts));
const uploadAndAnalyzePaper = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => PaperInputSchema.parse(input)).handler(uploadAndAnalyzePaper_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const tempDir = path.join(process.cwd(), "temp_uploads");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, {
      recursive: true
    });
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
  const truncatedText = paperText.slice(0, 2e4);
  const customKey = data.custom_key?.trim();
  process.env.LOVABLE_API_KEY;
  process.env.GEMINI_API_KEY;
  process.env.OPENAI_API_KEY;
  let model;
  try {
    if (customKey) {
      model = getAiModelWithCustomKey(customKey, data.provider);
    } else {
      model = getAiModel();
    }
    const prompt = `You are an expert AI Research Assistant. Analyze the research paper text below and return a valid JSON object (no markdown blocks) with this schema: {"plainEnglishSummary":"","problemStatement":{"solving":"","whyItMatters":""},"keyFindings":[],"methodology":{"approach":"","algorithms":"","dataset":"","tools":""},"keywords":[],"researchGap":{"missing":"","limitations":"","challenges":""},"futureScope":{"improvements":"","extensions":""},"vivaPrep":[],"quickRevision":{"summary":"","bulletPoints":[]},"confidenceMeter":{"summaryScore":0,"extractionScore":0},"analytics":{"readingDifficulty":0,"researchComplexity":0,"studentUnderstanding":0}}

Paper Text:
${truncatedText}`;
    const response = await generateText({
      model,
      prompt
    });
    let text = response.text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?/im, "").replace(/```$/m, "").trim();
    }
    const analysisResult = JSON.parse(text);
    const {
      data: row,
      error
    } = await supabaseServer.from("paper_analyses").insert([{
      user_id: userId,
      file_name: data.fileName,
      num_pages: numPages,
      status: "Completed",
      result: analysisResult
    }]).select().single();
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
  } catch (e) {
    console.error("Paper analysis failed:", e);
    throw new Error(e.message || "Failed to analyze paper contents via AI.");
  }
});
const listPaperAnalyses_createServerFn_handler = createServerRpc({
  id: "9d31a0c5e0323d8f1e4a599365927fa8d2ae3db65c02cced968934ffc2139847",
  name: "listPaperAnalyses",
  filename: "src/lib/paper.functions.ts"
}, (opts) => listPaperAnalyses.__executeServer(opts));
const listPaperAnalyses = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listPaperAnalyses_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const {
    data,
    error
  } = await supabaseServer.from("paper_analyses").select("id, file_name, num_pages, status, result, created_at").eq("user_id", userId).order("created_at", {
    ascending: false
  });
  if (error) {
    console.error("Error listing paper analyses:", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    file_name: r.file_name,
    num_pages: r.num_pages,
    status: r.status,
    upload_date: r.created_at,
    result: typeof r.result === "string" ? JSON.parse(r.result) : r.result
  }));
});
const deletePaperAnalysis_createServerFn_handler = createServerRpc({
  id: "bcfa5e3cb5b13000d2dde6f4a096e7b946de892afd899c05366b0101343ad179",
  name: "deletePaperAnalysis",
  filename: "src/lib/paper.functions.ts"
}, (opts) => deletePaperAnalysis.__executeServer(opts));
const deletePaperAnalysis = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string()
}).parse(input)).handler(deletePaperAnalysis_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    error
  } = await supabaseServer.from("paper_analyses").delete().eq("id", data.id).eq("user_id", userId);
  if (error) {
    throw new Error("Failed to delete paper analysis: " + error.message);
  }
  return {
    ok: true
  };
});
export {
  deletePaperAnalysis_createServerFn_handler,
  listPaperAnalyses_createServerFn_handler,
  uploadAndAnalyzePaper_createServerFn_handler
};
