// supabase/functions/file-converter/index.ts
// Full-stack file conversion bridge using iLoveAPI REST engine.
// Accepts: { source_path, target_format }
// Flow:    Supabase storage → iLoveAPI (JWT auth) → convert → save output → return signed URL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Environment ───────────────────────────────────────────────────────────────
const SUPABASE_URL    = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ILOVEPDF_PUBLIC = Deno.env.get("ILOVEPDF_PUBLIC_KEY")!;
const ILOVEPDF_SECRET = Deno.env.get("ILOVEPDF_SECRET_KEY")!;

// ── CORS ──────────────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Format → iLoveAPI tool map ────────────────────────────────────────────────
const TOOL_MAP: Record<string, { tool: string; ext: string }> = {
  "pdf-to-word":        { tool: "pdftodoc",        ext: "docx" },
  "pdf-to-excel":       { tool: "pdftoexcel",       ext: "xlsx" },
  "pdf-to-powerpoint":  { tool: "pdftopowerpoint",  ext: "pptx" },
  "pdf-to-jpg":         { tool: "pdftojpg",         ext: "jpg"  },
  "word-to-pdf":        { tool: "officepdf",        ext: "pdf"  },
  "excel-to-pdf":       { tool: "officepdf",        ext: "pdf"  },
  "powerpoint-to-pdf":  { tool: "officepdf",        ext: "pdf"  },
  "image-to-pdf":       { tool: "imagepdf",         ext: "pdf"  },
  "jpg-to-pdf":         { tool: "imagepdf",         ext: "pdf"  },
  "png-to-pdf":         { tool: "imagepdf",         ext: "pdf"  },
};

// ── iLoveAPI JWT Auth (HS256 HMAC) ────────────────────────────────────────────
function base64url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getIloveToken(): Promise<string> {
  const encoder = new TextEncoder();
  const now     = Math.floor(Date.now() / 1000);

  const header  = base64url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = base64url(encoder.encode(JSON.stringify({
    iss: ILOVEPDF_PUBLIC,
    iat: now,
    exp: now + 7200,
    nbf: now - 60,
  })));

  const sigInput  = `${header}.${payload}`;
  const keyData   = encoder.encode(ILOVEPDF_SECRET);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig       = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(sigInput));
  const signature = base64url(new Uint8Array(sig));

  return `${sigInput}.${signature}`;
}

// ── iLoveAPI fetch helper ─────────────────────────────────────────────────────
// path can be a relative path (e.g. "/start/pdftodoc") OR a full URL
async function iloveJSON(
  method: string,
  url: string,
  token: string,
  body?: unknown,
): Promise<any> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`iLoveAPI ${res.status} [${method} ${url}]: ${text}`);
  }
  return res.json();
}

async function iloveUpload(
  url: string,
  token: string,
  form: FormData,
): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`iLoveAPI upload ${res.status}: ${text}`);
  }
  return res.json();
}

async function iloveDownload(url: string, token: string): Promise<ArrayBuffer> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`iLoveAPI download ${res.status}: ${text}`);
  }
  return res.arrayBuffer();
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  try {
    // ── 1. Authenticate caller using service-role client ──────────────────────
    const authHeader = req.headers.get("Authorization") || "";
    const userJwt    = authHeader.replace("Bearer ", "").trim();

    if (!userJwt) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing Authorization header" }),
        { status: 401, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // Use the admin client to verify the user JWT — correct pattern
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: { user }, error: authError } = await adminClient.auth.getUser(userJwt);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: " + (authError?.message || "invalid token") }),
        { status: 401, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // ── 2. Parse body ─────────────────────────────────────────────────────────
    const { source_path, target_format } = await req.json() as {
      source_path:   string;
      target_format: string;
    };

    if (!source_path || !target_format) {
      return new Response(
        JSON.stringify({ success: false, error: "source_path and target_format are required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    const conversion = TOOL_MAP[target_format];
    if (!conversion) {
      return new Response(
        JSON.stringify({ success: false, error: `Unsupported format: ${target_format}` }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // ── 3. Download source file from Supabase storage ─────────────────────────
    const { data: fileBlob, error: downloadErr } = await adminClient
      .storage.from("conversions").download(source_path);

    if (downloadErr || !fileBlob) {
      throw new Error(`Storage download failed: ${downloadErr?.message ?? "no data"}`);
    }

    const fileBuffer  = await fileBlob.arrayBuffer();
    const fileName    = source_path.split("/").pop() || "file.pdf";

    console.log(`Converting "${fileName}" (${fileBuffer.byteLength} bytes) via tool: ${conversion.tool}`);

    // ── 4. Authenticate with iLoveAPI ─────────────────────────────────────────
    const iloveToken = await getIloveToken();

    // ── 5. Start task ─────────────────────────────────────────────────────────
    const task = await iloveJSON(
      "GET",
      `https://api.ilovepdf.com/v1/start/${conversion.tool}`,
      iloveToken,
    ) as { server: string; task: string };

    console.log(`iLoveAPI task started: ${task.task} on server: ${task.server}`);

    // Fresh token for subsequent calls
    const taskToken = await getIloveToken();

    // ── 6. Upload file to iLoveAPI ────────────────────────────────────────────
    const form = new FormData();
    form.append("task", task.task);
    form.append("file", new Blob([fileBuffer]), fileName);

    const uploaded = await iloveUpload(
      `https://${task.server}/v1/upload`,
      taskToken,
      form,
    ) as { server_filename: string };

    console.log(`File uploaded to iLoveAPI: ${uploaded.server_filename}`);

    // ── 7. Process the file ───────────────────────────────────────────────────
    const freshToken = await getIloveToken();
    await iloveJSON(
      "POST",
      `https://${task.server}/v1/process`,
      freshToken,
      {
        task:  task.task,
        tool:  conversion.tool,
        files: [{ server_filename: uploaded.server_filename, filename: fileName }],
      },
    );

    console.log(`iLoveAPI processing complete`);

    // ── 8. Download converted file ────────────────────────────────────────────
    const dlToken       = await getIloveToken();
    const convertedBuffer = await iloveDownload(
      `https://${task.server}/v1/download/${task.task}`,
      dlToken,
    );

    console.log(`Downloaded converted file: ${convertedBuffer.byteLength} bytes`);

    // ── 9. Save output to Supabase storage ────────────────────────────────────
    const ts         = Date.now();
    const baseName   = fileName.replace(/\.[^.]+$/, "");
    const outputPath = `${user.id}/${ts}_${baseName}_converted.${conversion.ext}`;

    const { error: uploadErr } = await adminClient
      .storage.from("conversions").upload(outputPath, convertedBuffer, {
        contentType: getMimeType(conversion.ext),
        upsert: true,
      });

    if (uploadErr) {
      throw new Error(`Failed to save converted file: ${uploadErr.message}`);
    }

    // ── 10. Create signed download URL (1 hour) ───────────────────────────────
    const { data: signedData, error: signErr } = await adminClient
      .storage.from("conversions").createSignedUrl(outputPath, 3600);

    if (signErr || !signedData) {
      throw new Error(`Failed to create signed URL: ${signErr?.message}`);
    }

    console.log(`Conversion complete → ${outputPath}`);

    return new Response(
      JSON.stringify({
        success:     true,
        output_path: outputPath,
        signed_url:  signedData.signedUrl,
        file_name:   `${baseName}_converted.${conversion.ext}`,
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
    );

  } catch (err: any) {
    console.error("file-converter error:", err?.message || err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});

// ── MIME type helper ──────────────────────────────────────────────────────────
function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    pdf:  "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    png:  "image/png",
  };
  return map[ext] || "application/octet-stream";
}
