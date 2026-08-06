/**
 * Supabase Edge Function: kp-scraper
 * ─────────────────────────────────
 * Securely logs into the Christ University KP/CUE portal with the user-provided
 * credentials (held only for the duration of this function call), scrapes the
 * attendance table, and returns structured JSON.
 *
 * Credentials are NEVER stored, logged, or forwarded anywhere.
 * The calling client must supply a valid Supabase JWT.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

// ── Portal base URLs ──────────────────────────────────────────────────────────
const PORTAL_BASES: Record<string, string> = {
  kp: "https://kp.christuniversity.in",
  cue: "https://cue.christuniversity.in",
};

// ── Common browser-like headers ───────────────────────────────────────────────
const BROWSER = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip HTML tags and decode common entities. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/** Extract all <input type="hidden" name="..." value="..."> pairs. */
function extractHiddenFields(html: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const re = /<input[^>]+type=["']?hidden["']?[^>]*>/gi;
  for (const match of html.matchAll(new RegExp(re.source, "gi"))) {
    const nm = match[0].match(/name=["']([^"']+)["']/i);
    const vl = match[0].match(/value=["']([^"']*)["']/i);
    if (nm) fields[nm[1]] = vl ? vl[1] : "";
  }
  return fields;
}

/** Extract Set-Cookie values matching the key pattern (JSESSIONID etc.). */
function buildCookieString(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  // set-cookie may arrive as comma-separated list of individual cookie directives
  return setCookieHeader
    .split(/,(?=[^ ])/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

/** Merge two cookie strings, with later values winning for duplicate keys. */
function mergeCookies(a: string, b: string): string {
  const map = new Map<string, string>();
  const parse = (s: string) =>
    s.split(";").forEach((c) => {
      const [k, ...rest] = c.trim().split("=");
      if (k) map.set(k.trim(), rest.join("="));
    });
  parse(a);
  parse(b);
  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

/** Determine if login failed (we were redirected back to login page). */
function isLoginFailure(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes("invalid user") ||
    lower.includes("invalid password") ||
    lower.includes("login failed") ||
    lower.includes("incorrect password") ||
    lower.includes("authentication failed") ||
    lower.includes("invalid credentials") ||
    // Still on login page with a form
    (lower.includes("loginpassword") && lower.includes("<form"))
  );
}

interface CueSubject {
  name: string;
  code: string;
  type: string;
  attended: number;
  total: number;
  percentage: number;
}

/**
 * Parse the attendance HTML table.
 *
 * The KP portal renders a table with columns roughly:
 * [S.No] [Course Code] [Course Name] [T/P] [Conducted] [Attended] [Percentage]
 *
 * We detect columns heuristically rather than relying on fixed column indices,
 * so we're robust to minor layout changes.
 */
function parseAttendanceHtml(html: string): CueSubject[] {
  const subjects: CueSubject[] = [];

  // --- Attempt 1: row-by-row table parsing ---
  const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];

  for (const table of tableMatch) {
    const rows = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    for (const row of rows) {
      // Skip header rows
      if (/<th[^>]*>/i.test(row)) continue;

      const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map(stripHtml);
      if (cells.length < 4) continue;

      // Find numeric cells (class counts, percentage)
      const numericCells = cells
        .map((c, i) => ({ i, v: parseFloat(c.replace("%", "").trim()) }))
        .filter(({ v }) => !isNaN(v) && v >= 0 && v <= 1000);

      if (numericCells.length < 2) continue;

      // Percentage is likely the last numeric cell OR has a % sign
      let percentage = 0;
      let conducted = 0;
      let attended = 0;

      const pctCell = cells.findIndex((c) => c.includes("%") && parseFloat(c) <= 100);
      if (pctCell >= 0) {
        percentage = parseFloat(cells[pctCell]);
        // The two numeric cells just before percentage should be conducted / attended
        const numericsBeforePct = numericCells.filter(({ i }) => i < pctCell);
        if (numericsBeforePct.length >= 2) {
          const last2 = numericsBeforePct.slice(-2);
          conducted = Math.max(last2[0].v, last2[1].v);
          attended = Math.min(last2[0].v, last2[1].v);
        }
      } else {
        // No % sign — use last 3 numerics as conducted, attended, pct
        if (numericCells.length >= 3) {
          const last3 = numericCells.slice(-3);
          conducted = last3[0].v;
          attended = last3[1].v;
          percentage = last3[2].v;
        } else if (numericCells.length === 2) {
          conducted = Math.max(numericCells[0].v, numericCells[1].v);
          attended = Math.min(numericCells[0].v, numericCells[1].v);
          percentage = conducted > 0 ? Math.round((attended / conducted) * 100) : 0;
        }
      }

      if (conducted <= 0) continue;

      // Extract course code (alphanumeric string that looks like a code)
      const codeCell = cells.find((c) => /^[A-Z0-9]{3,12}$/i.test(c.trim()) && !/^\d+$/.test(c));
      const code = codeCell?.trim() || "N/A";

      // Subject name: longest non-numeric, non-code text cell
      const name = cells
        .filter((c) => c !== code && !/^\d+\.?\d*%?$/.test(c) && c.length > 3 && isNaN(Number(c)))
        .sort((a, b) => b.length - a.length)[0] || "";

      if (!name || name.length < 3) continue;

      // Determine theory vs practical
      const rowText = row.toLowerCase();
      const type =
        rowText.includes("practical") || rowText.includes("lab") || cells.some((c) => /^p$/i.test(c.trim()))
          ? "Practical"
          : "Theory";

      subjects.push({
        name,
        code,
        type,
        attended: Math.round(attended),
        total: Math.round(conducted),
        percentage: Math.round(percentage),
      });
    }
    if (subjects.length > 0) break; // Use first table that yielded results
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return subjects.filter((s) => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  try {
    // ── 1. Verify Supabase JWT ────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Authentication required. Please log in to AcadSphere first." }), {
        status: 401,
        headers: JSON_HEADERS,
      });
    }

    // ── 2. Parse request body ─────────────────────────────────────────────────
    let body: { username?: string; password?: string; portal?: "kp" | "cue" };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const { username, password, portal = "kp" } = body;
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Username and password are required" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const BASE = PORTAL_BASES[portal] ?? PORTAL_BASES.kp;
    const LOGIN_PAGE = `${BASE}/KnowledgePro/Login.jsp`;
    const LOGIN_POST = `${BASE}/KnowledgePro/LoginAction.do`;
    const ATTENDANCE_URL = `${BASE}/KnowledgePro/StudentAttendanceAction.do?method=showAttendance`;
    const ALT_ATTENDANCE = `${BASE}/KnowledgePro/viewStudentAttendance`;

    // ── 3. GET login page (grab cookies + hidden fields) ──────────────────────
    const loginPageRes = await fetch(LOGIN_PAGE, {
      headers: { ...BROWSER, Referer: BASE },
      redirect: "follow",
    });

    const loginPageHtml = await loginPageRes.text();
    let cookieStr = buildCookieString(loginPageRes.headers.get("set-cookie"));
    const hiddenFields = extractHiddenFields(loginPageHtml);

    // ── 4. POST credentials ───────────────────────────────────────────────────
    const formBody = new URLSearchParams();
    // Common username field names used by JSP portals
    formBody.set("userName", username);
    formBody.set("loginPassword", password);
    // Some portals use alternative field names
    formBody.set("username", username);
    formBody.set("password", password);
    formBody.set("userId", username);
    // Append any hidden CSRF / viewstate fields
    for (const [k, v] of Object.entries(hiddenFields)) {
      formBody.set(k, v);
    }

    const loginRes = await fetch(LOGIN_POST, {
      method: "POST",
      headers: {
        ...BROWSER,
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookieStr,
        Referer: LOGIN_PAGE,
      },
      body: formBody.toString(),
      redirect: "follow",
    });

    const loginCookies = buildCookieString(loginRes.headers.get("set-cookie"));
    cookieStr = mergeCookies(cookieStr, loginCookies);
    const loginHtml = await loginRes.text();

    if (isLoginFailure(loginHtml)) {
      return new Response(
        JSON.stringify({
          error: "Invalid username or password. Please check your CUE/KP portal credentials and try again.",
        }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    // ── 5. Fetch attendance page ──────────────────────────────────────────────
    const attendRes = await fetch(ATTENDANCE_URL, {
      headers: {
        ...BROWSER,
        Cookie: cookieStr,
        Referer: `${BASE}/KnowledgePro/StudentDashboard.do`,
      },
      redirect: "follow",
    });

    const attendCookies = buildCookieString(attendRes.headers.get("set-cookie"));
    cookieStr = mergeCookies(cookieStr, attendCookies);
    const attendHtml = await attendRes.text();

    let subjects = parseAttendanceHtml(attendHtml);

    // ── 6. Try alternative URL if no subjects found ───────────────────────────
    if (subjects.length === 0) {
      const altRes = await fetch(ALT_ATTENDANCE, {
        headers: { ...BROWSER, Cookie: cookieStr },
        redirect: "follow",
      });
      const altHtml = await altRes.text();
      subjects = parseAttendanceHtml(altHtml);
    }

    if (subjects.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "Login succeeded but no attendance records were found. " +
            "The portal layout may have changed. Please check kp.christuniversity.in directly.",
        }),
        { status: 422, headers: JSON_HEADERS }
      );
    }

    return new Response(JSON.stringify({ subjects, count: subjects.length }), {
      headers: JSON_HEADERS,
    });

  } catch (err) {
    console.error("[kp-scraper] Unhandled error:", err);
    return new Response(
      JSON.stringify({
        error:
          "Could not reach the CUE/KP portal. The university server may be down or unreachable. Try again in a few minutes.",
      }),
      { status: 502, headers: JSON_HEADERS }
    );
  }
});
