/**
 * Supabase Edge Function: kp-scraper
 * ─────────────────────────────────
 * Exclusively authenticates and scrapes Christ University's CUE Portal (cue.christuniversity.in).
 * Credentials are held ONLY in memory for the single request duration and never logged or stored.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

const CUE_BASE = "https://cue.christuniversity.in";

const BROWSER = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function buildCookieString(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  return setCookieHeader
    .split(/,(?=[^ ])/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

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

function isLoginFailure(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes("invalid user") ||
    lower.includes("invalid password") ||
    lower.includes("login failed") ||
    lower.includes("incorrect password") ||
    lower.includes("authentication failed") ||
    lower.includes("invalid credentials") ||
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
 * Robust Multi-Strategy HTML & Script Parser for CUE Portal.
 * Strategies:
 * 0. Embedded JSON / Script tag parser
 * 1. Div / Card Grid Layout
 * 2. HTML Table (<tr/td>) Parsing
 * 3. Text Line Regex Matching
 */
function parseAttendanceHtml(html: string): CueSubject[] {
  const subjects: CueSubject[] = [];

  // ── Strategy 0: Script tag / Embedded JSON Data ───────────────────────────
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const script of scriptMatches) {
    const text = script.replace(/<[^>]+>/g, "");
    const jsonMatches = text.match(/(\[\s*\{[\s\S]*?\}\s*\]|\{[\s\S]*?"(?:subjects?|attendance|courses?)"[\s\S]*?\})/g) || [];
    for (const jsonStr of jsonMatches) {
      try {
        const parsed = JSON.parse(jsonStr);
        const list = Array.isArray(parsed) ? parsed : (parsed.subjects || parsed.attendance || parsed.courses || []);
        if (Array.isArray(list) && list.length > 0) {
          for (const item of list) {
            const name = item.subjectName || item.subject_name || item.courseName || item.subject || item.name || item.course || "";
            const code = item.subjectCode || item.subject_code || item.courseCode || item.code || "N/A";
            const attended = Number(item.attended || item.classesAttended || item.attendedClasses || item.present || 0);
            const total = Number(item.total || item.conducted || item.classesConducted || item.totalClasses || 0);
            const pct = Number(item.percentage || item.pct || (total > 0 ? Math.round((attended / total) * 100) : 0));

            if (name && (attended > 0 || total > 0 || pct > 0)) {
              subjects.push({
                name: String(name).trim(),
                code: String(code).trim(),
                type: String(name).toLowerCase().includes("lab") ? "Practical" : "Theory",
                attended: Math.round(attended),
                total: Math.round(total),
                percentage: Math.round(pct),
              });
            }
          }
        }
      } catch (_) {}
    }
  }

  // ── Strategy 1: Div / Card Grid Layout (Modern CUE Portal) ───────────────
  if (subjects.length === 0) {
    const containerMatches =
      html.match(/<div[^>]*class=["']?[^"']*(?:card|subject|course|item|grid|box|col|row|panel|attendance|sub)[^"']*["']?[^>]*>[\s\S]*?<\/div>/gi) || [];

    for (const block of containerMatches) {
      const text = stripHtml(block);
      if (!text || text.length < 10) continue;

      const ratioMatch = block.match(/(\d{1,3})\s*[\/|\\]\s*(\d{1,3})/) || text.match(/(\d{1,3})\s*[\/|\\]\s*(\d{1,3})/);
      const pctMatch = text.match(/(\d{1,3}(?:\.\d+)?)\s*%/);

      if (ratioMatch || pctMatch) {
        const codeMatch = text.match(/\b([A-Z]{2,4}\d{3,4}[A-Z]?)\b/);
        const code = codeMatch ? codeMatch[1] : "N/A";

        const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 3);
        const nameLine = lines.find((l) => !l.includes("%") && !/\b\d+\/\d+\b/.test(l) && !/^\d+$/.test(l) && l !== code);
        const name = nameLine || (code !== "N/A" ? code : "");

        if (name && name.length >= 3) {
          let attended = 0;
          let conducted = 0;
          let percentage = 0;

          if (ratioMatch) {
            const n1 = parseInt(ratioMatch[1], 10);
            const n2 = parseInt(ratioMatch[2], 10);
            attended = Math.min(n1, n2);
            conducted = Math.max(n1, n2);
            percentage = conducted > 0 ? Math.round((attended / conducted) * 100) : 0;
          } else if (pctMatch) {
            percentage = Math.round(parseFloat(pctMatch[1]));
          }

          const isLab = text.toLowerCase().includes("lab") || text.toLowerCase().includes("practical");

          subjects.push({
            name: name.replace(/\s+/g, " "),
            code,
            type: isLab ? "Practical" : "Theory",
            attended,
            total: conducted,
            percentage,
          });
        }
      }
    }
  }

  // ── Strategy 2: Table Row Parsing (Classic CUE / JSP Tables) ─────────────
  if (subjects.length === 0) {
    const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];

    for (const table of tableMatch) {
      const rows = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
      for (const row of rows) {
        if (/<th[^>]*>/i.test(row)) continue;

        const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map(stripHtml);
        if (cells.length < 3) continue;

        const numericCells = cells
          .map((c, i) => ({ i, v: parseFloat(c.replace("%", "").trim()) }))
          .filter(({ v }) => !isNaN(v) && v >= 0 && v <= 1000);

        if (numericCells.length < 2) continue;

        let percentage = 0;
        let conducted = 0;
        let attended = 0;

        const pctCell = cells.findIndex((c) => c.includes("%") && parseFloat(c) <= 100);
        if (pctCell >= 0) {
          percentage = parseFloat(cells[pctCell]);
          const numericsBeforePct = numericCells.filter(({ i }) => i < pctCell);
          if (numericsBeforePct.length >= 2) {
            const last2 = numericsBeforePct.slice(-2);
            conducted = Math.max(last2[0].v, last2[1].v);
            attended = Math.min(last2[0].v, last2[1].v);
          }
        } else {
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

        const codeCell = cells.find((c) => /^[A-Z0-9]{3,12}$/i.test(c.trim()) && !/^\d+$/.test(c));
        const code = codeCell?.trim() || "N/A";
        const name =
          cells
            .filter((c) => c !== code && !/^\d+\.?\d*%?$/.test(c) && c.length > 3 && isNaN(Number(c)))
            .sort((a, b) => b.length - a.length)[0] || "";

        if (!name || name.length < 3) continue;

        const rowText = row.toLowerCase();
        const type =
          rowText.includes("practical") || rowText.includes("lab") || cells.some((c) => /^p$/i.test(c.trim()))
            ? "Practical"
            : "Theory";

        subjects.push({
          name: name.trim(),
          code,
          type,
          attended: Math.round(attended),
          total: Math.round(conducted),
          percentage: Math.round(percentage),
        });
      }
      if (subjects.length > 0) break;
    }
  }

  // ── Strategy 3: Global Text Regex Pattern Matching ───────────────────────
  if (subjects.length === 0) {
    const rawText = stripHtml(html);
    const lineRegex = /([A-Z]{2,4}\d{3,4}[A-Z]?)\s*[-:]?\s*([A-Za-z0-9\s&,.-]{4,50})\s+(\d{1,3})\s*[\/|\\]\s*(\d{1,3})/gi;
    for (const match of rawText.matchAll(lineRegex)) {
      const code = match[1];
      const name = match[2].trim();
      const n1 = parseInt(match[3], 10);
      const n2 = parseInt(match[4], 10);
      const attended = Math.min(n1, n2);
      const total = Math.max(n1, n2);
      const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
      subjects.push({
        name,
        code,
        type: name.toLowerCase().includes("lab") ? "Practical" : "Theory",
        attended,
        total,
        percentage: pct,
      });
    }
  }

  // Deduplicate by name or code
  const seen = new Set<string>();
  return subjects.filter((s) => {
    const key = (s.code + "-" + s.name).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Serve Handler ────────────────────────────────────────────────────────────

serve(async (req) => {
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
    // 1. Verify Supabase Auth JWT
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

    // 2. Parse request body (expects { username, password })
    let body: { username?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const { username, password } = body;
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Username and password are required" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    // CUE Portal candidate endpoints
    const LOGIN_PAGE = `${CUE_BASE}/KnowledgePro/Login.jsp`;
    const LOGIN_POST = `${CUE_BASE}/KnowledgePro/LoginAction.do`;
    
    const TARGET_URLS = [
      `${CUE_BASE}/main/attendence`,
      `${CUE_BASE}/KnowledgePro/StudentAttendanceAction.do?method=initAttendance`,
      `${CUE_BASE}/KnowledgePro/StudentAttendanceAction.do?method=showAttendance`,
      `${CUE_BASE}/KnowledgePro/StudentAttendanceAction.do?method=getAttendance`,
      `${CUE_BASE}/KnowledgePro/viewStudentAttendance.do`,
      `${CUE_BASE}/KnowledgePro/StudentDashboard.do`,
      `${CUE_BASE}/main/home`,
    ];

    // 3. GET CUE login page for session cookie + hidden CSRF inputs
    const loginPageRes = await fetch(LOGIN_PAGE, {
      headers: { ...BROWSER, Referer: CUE_BASE },
      redirect: "follow",
    });

    const loginPageHtml = await loginPageRes.text();
    let cookieStr = buildCookieString(loginPageRes.headers.get("set-cookie"));
    const hiddenFields = extractHiddenFields(loginPageHtml);

    // 4. POST credentials to CUE login route
    const formBody = new URLSearchParams();
    formBody.set("userName", username);
    formBody.set("loginPassword", password);
    formBody.set("username", username);
    formBody.set("password", password);
    formBody.set("userId", username);
    formBody.set("method", "loginSubmit");
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
          error: "Invalid username or password. Please check your CUE portal (cue.christuniversity.in) credentials and try again.",
        }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    // Attempt 0: Check if attendance data is ALREADY in the login response HTML
    let subjects = parseAttendanceHtml(loginHtml);

    // Attempt 1..N: Fetch CUE dashboard & attendance endpoints
    if (subjects.length === 0) {
      for (const targetUrl of TARGET_URLS) {
        try {
          const res = await fetch(targetUrl, {
            headers: {
              ...BROWSER,
              Cookie: cookieStr,
              Referer: `${CUE_BASE}/KnowledgePro/StudentDashboard.do`,
            },
            redirect: "follow",
          });
          const resCookies = buildCookieString(res.headers.get("set-cookie"));
          cookieStr = mergeCookies(cookieStr, resCookies);
          const html = await res.text();

          subjects = parseAttendanceHtml(html);
          if (subjects.length > 0) break;
        } catch (_) {}
      }
    }

    if (subjects.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "Login succeeded but no attendance records were found on CUE Portal. " +
            "Please verify your account details on cue.christuniversity.in directly.",
        }),
        { status: 422, headers: JSON_HEADERS }
      );
    }

    return new Response(JSON.stringify({ subjects, count: subjects.length }), {
      headers: JSON_HEADERS,
    });
  } catch (err) {
    console.error("[cue-scraper] Unhandled error:", err);
    return new Response(
      JSON.stringify({
        error:
          "Could not reach CUE Portal (cue.christuniversity.in). The university server may be down or unreachable. Try again in a few minutes.",
      }),
      { status: 502, headers: JSON_HEADERS }
    );
  }
});
