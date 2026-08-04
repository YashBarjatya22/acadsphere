// supabase/functions/file-converter/index.ts
// iLoveAPI-powered file conversion bridge for AcadSphere.
// Auth: POST /v1/auth with public key → Bearer token (no HMAC needed).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Environment (Deno only — never process.env) ───────────────────────────────
const SUPABASE_URL        = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY         = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ILOVEPDF_PUBLIC_KEY = Deno.env.get("ILOVEPDF_PUBLIC_KEY")!;

// ── Mandatory CORS headers — included in EVERY response ───────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: build JSON response with CORS headers always attached
function jsonResp(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ── Strict tool map: frontend format ID → exact iLoveAPI tool + output ext ────
// Tool names are taken verbatim from api.ilovepdf.com/v1/start/{tool}
const TOOL_MAP: Record<string, { tool: string; ext: string }> = {
  "pdf-to-word":        { tool: "pdftodoc",        ext: "docx" },
  "pdf-to-excel":       { tool: "pdftoexcel",       ext: "xlsx" },
  "pdf-to-powerpoint":  { tool: "pdftopowerpoint",  ext: "pptx" },
  "pdf-to-jpg":         { tool: "pdfjpg",           ext: "jpg"  },
  "word-to-pdf":        { tool: "officepdf",        ext: "pdf"  },
  "excel-to-pdf":       { tool: "officepdf",        ext: "pdf"  },
  "powerpoint-to-pdf":  { tool: "officepdf",        ext: "pdf"  },
  "image-to-pdf":       { tool: "imagepdf",         ext: "pdf"  },
  "jpg-to-pdf":         { tool: "imagepdf",         ext: "pdf"  },
  "png-to-pdf":         { tool: "imagepdf",         ext: "pdf"  },
};

// ── JWT payload decoder (Supabase gateway already verifies signature) ──────────
function getUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64  = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return (JSON.parse(json) as { sub?: string }).sub ?? null;
  } catch {
    return null;
  }
}

// ── MIME type lookup ──────────────────────────────────────────────────────────
function getMime(ext: string): string {
  const m: Record<string, string> = {
    pdf:  "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    png:  "image/png",
  };
  return m[ext] ?? "application/octet-stream";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {

  // ── CORS preflight — MUST be first, before any other logic ────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {

    // ── Step 1: Extract user ID from JWT ────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const token      = authHeader.replace(/^Bearer\s+/i, "").trim();
    const userId     = getUserIdFromJwt(token);

    if (!userId) {
      return jsonResp({ error: "Unauthorized: invalid or missing session token. Please log in again." }, 401);
    }

    // ── Step 2: Parse + validate request body ────────────────────────────────
    let source_path: string, target_format: string;
    try {
      ({ source_path, target_format } = await req.json());
    } catch {
      return jsonResp({ error: "Invalid JSON body" }, 400);
    }

    if (!source_path || !target_format) {
      return jsonResp({ error: "Missing fields: source_path and target_format are required" }, 400);
    }

    const conversion = TOOL_MAP[target_format];
    if (!conversion) {
      return jsonResp({
        error: `Unsupported format: "${target_format}". Valid values: ${Object.keys(TOOL_MAP).join(", ")}`,
      }, 400);
    }

    // Path-level security: users can only access their own folder
    if (!source_path.startsWith(`${userId}/`)) {
      return jsonResp({ error: "Forbidden: file path does not belong to your account" }, 403);
    }

    // ── Step 3: Download source file from Supabase Storage ───────────────────
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: blob, error: dlError } = await admin
      .storage.from("conversions").download(source_path);

    if (dlError || !blob) {
      throw new Error(`Storage download failed: ${dlError?.message ?? "no data returned"}`);
    }

    const fileBuffer = await blob.arrayBuffer();
    const fileName   = source_path.split("/").pop() ?? "input.pdf";

    console.log(`[file-converter] user=${userId} | file="${fileName}" | ${fileBuffer.byteLength} bytes | tool=${conversion.tool}`);

    // ─────────────────────────────────────────────────────────────────────────
    // iLoveAPI 4-Step REST Flow
    // ─────────────────────────────────────────────────────────────────────────

    // ── Step A: Auth — POST /v1/auth with public key → get Bearer token ───────
    const authRes = await fetch("https://api.ilovepdf.com/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_key: ILOVEPDF_PUBLIC_KEY }),
    });
    if (!authRes.ok) {
      const txt = await authRes.text();
      throw new Error(`iLoveAPI auth failed (${authRes.status}): ${txt}`);
    }
    const { token: iloveToken } = (await authRes.json()) as { token: string };
    console.log("[file-converter] iLoveAPI auth ✅");

    // ── Step B: Start — GET /v1/start/{tool} → task ID + server ───────────────
    const startRes = await fetch(`https://api.ilovepdf.com/v1/start/${conversion.tool}`, {
      headers: { Authorization: `Bearer ${iloveToken}` },
    });
    if (!startRes.ok) {
      const txt = await startRes.text();
      throw new Error(`iLoveAPI start failed (${startRes.status}): ${txt}`);
    }
    const { server, task } = (await startRes.json()) as { server: string; task: string };
    console.log(`[file-converter] task=${task} | server=${server}`);

    // ── Step C: Upload — POST multipart/form-data to assigned server ───────────
    const form = new FormData();
    form.append("task", task);
    form.append("file", new Blob([fileBuffer]), fileName);

    const uploadRes = await fetch(`https://${server}/v1/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${iloveToken}` },
      body: form,
    });
    if (!uploadRes.ok) {
      const txt = await uploadRes.text();
      throw new Error(`iLoveAPI upload failed (${uploadRes.status}): ${txt}`);
    }
    const { server_filename } = (await uploadRes.json()) as { server_filename: string };
    console.log(`[file-converter] uploaded → server_filename=${server_filename}`);

    // ── Step D1: Process — POST conversion job ────────────────────────────────
    const processRes = await fetch(`https://${server}/v1/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${iloveToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task,
        tool: conversion.tool,
        files: [{ server_filename, filename: fileName }],
      }),
    });
    if (!processRes.ok) {
      const txt = await processRes.text();
      throw new Error(`iLoveAPI process failed (${processRes.status}): ${txt}`);
    }
    console.log("[file-converter] processing complete ✅");

    // ── Step D2: Download — GET converted file binary ─────────────────────────
    const downloadRes = await fetch(`https://${server}/v1/download/${task}`, {
      headers: { Authorization: `Bearer ${iloveToken}` },
    });
    if (!downloadRes.ok) {
      const txt = await downloadRes.text();
      throw new Error(`iLoveAPI download failed (${downloadRes.status}): ${txt}`);
    }
    const convertedBuffer = await downloadRes.arrayBuffer();
    console.log(`[file-converter] download complete: ${convertedBuffer.byteLength} bytes`);

    // ── Step 4: Save converted file back to Supabase Storage ─────────────────
    const ts         = Date.now();
    const baseName   = fileName.replace(/\.[^.]+$/, "");
    const outputPath = `${userId}/${ts}_${baseName}_converted.${conversion.ext}`;

    const { error: saveErr } = await admin.storage
      .from("conversions")
      .upload(outputPath, convertedBuffer, {
        contentType: getMime(conversion.ext),
        upsert: true,
      });
    if (saveErr) throw new Error(`Storage save failed: ${saveErr.message}`);

    // ── Step 5: Generate signed download URL (1 hour) ─────────────────────────
    const { data: signed, error: signErr } = await admin.storage
      .from("conversions")
      .createSignedUrl(outputPath, 3600);
    if (signErr || !signed) throw new Error(`Signed URL failed: ${signErr?.message}`);

    console.log(`[file-converter] ✅ DONE → ${outputPath}`);

    return jsonResp({
      success:     true,
      output_path: outputPath,
      signed_url:  signed.signedUrl,
      file_name:   `${baseName}_converted.${conversion.ext}`,
    }, 200);

  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? String(err);
    console.error("[file-converter] ❌ ERROR:", msg);
    // Return 400 (not 500) with the full error message so frontend can display it
    return jsonResp({ error: msg }, 400);
  }
});
