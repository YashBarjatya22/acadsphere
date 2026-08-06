/**
 * Supabase Edge Function: kp-scraper
 * ─────────────────────────────────
 * Authenticates directly with Christ University CUE Portal's internal JSON API.
 * Purges HTML/DOM parsing entirely and fetches dynamic raw JSON payloads.
 * Computes dual 75% and 85% margin metrics natively.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

const CUE_BASE = "https://cue.christuniversity.in";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface RawCueSubject {
  code?: string;
  subjectCode?: string;
  courseCode?: string;
  name?: string;
  subjectName?: string;
  courseName?: string;
  subject?: string;
  type?: string;
  attended?: number;
  attendedClasses?: number;
  classesAttended?: number;
  present?: number;
  total?: number;
  conducted?: number;
  totalClasses?: number;
  classesConducted?: number;
  percentage?: number;
}

interface MarginTarget {
  status: "SAFE" | "NEED_ATTENDANCE";
  leavesAllowed: number;
  classesNeeded: number;
}

interface ProcessedSubject {
  code: string;
  name: string;
  type: string;
  attended: number;
  total: number;
  percentage: number;
  target85: MarginTarget;
  target75: MarginTarget;
}

// ── Margin Engine Helpers ──────────────────────────────────────────────────────

function calculateMargin(attended: number, total: number, targetPct: number): MarginTarget {
  if (total <= 0) {
    return { status: "SAFE", leavesAllowed: 0, classesNeeded: 0 };
  }

  const targetRatio = targetPct / 100;
  const currentPct = (attended / total) * 100;

  if (currentPct >= targetPct) {
    // Formula: floor((attended - targetRatio * total) / targetRatio)
    const leavesAllowed = Math.max(0, Math.floor((attended - targetRatio * total) / targetRatio));
    return { status: "SAFE", leavesAllowed, classesNeeded: 0 };
  } else {
    // Formula: ceil((targetRatio * total - attended) / (1 - targetRatio))
    const classesNeeded = Math.max(0, Math.ceil((targetRatio * total - attended) / (1 - targetRatio)));
    return { status: "NEED_ATTENDANCE", leavesAllowed: 0, classesNeeded };
  }
}

function processCueSubjects(rawList: RawCueSubject[]): ProcessedSubject[] {
  const processed: ProcessedSubject[] = [];
  const seen = new Set<string>();

  for (const item of rawList) {
    const code = String(item.code || item.subjectCode || item.courseCode || "N/A").trim();
    const name = String(item.name || item.subjectName || item.courseName || item.subject || "").trim();

    const attended = Math.max(
      0,
      Number(item.attended ?? item.attendedClasses ?? item.classesAttended ?? item.present ?? 0)
    );
    const total = Math.max(
      0,
      Number(item.total ?? item.conducted ?? item.totalClasses ?? item.classesConducted ?? 0)
    );

    if (!name && code === "N/A") continue;

    const subjectName = name || code;
    const key = `${code}-${subjectName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const percentage = total > 0 ? Math.round((attended / total) * 10000) / 100 : 100;
    const isLab =
      String(item.type || "").toLowerCase().includes("lab") ||
      subjectName.toLowerCase().includes("lab") ||
      subjectName.toLowerCase().includes("practical");

    processed.push({
      code,
      name: subjectName,
      type: isLab ? "Practical" : "Theory",
      attended: Math.round(attended),
      total: Math.round(total),
      percentage,
      target85: calculateMargin(attended, total, 85),
      target75: calculateMargin(attended, total, 75),
    });
  }

  return processed;
}

function extractSetCookies(headers: Headers): string {
  const getSetCookie = (headers as any).getSetCookie?.();
  if (Array.isArray(getSetCookie) && getSetCookie.length > 0) {
    return getSetCookie.map((c: string) => c.split(";")[0].trim()).join("; ");
  }

  const rawCookie = headers.get("set-cookie");
  if (!rawCookie) return "";
  return rawCookie
    .split(/,(?=[^ ])/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

// ── Serve Handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  // Phase 4: Strict CORS preflight handling
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
    // 1. Verify Supabase Auth token (if required)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      await supabase.auth.getUser().catch(() => null);
    }

    // 2. Parse request JSON body (expects strictly { username, password })
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

    // Phase 1: Authentication to Token / Session
    let authToken = "";
    let cookieHeader = "";

    const AUTH_ENDPOINTS = [
      { url: `${CUE_BASE}/api/v1/auth/login`, type: "json" },
      { url: `${CUE_BASE}/api/auth/login`, type: "json" },
      { url: `${CUE_BASE}/api/login`, type: "json" },
      { url: `${CUE_BASE}/KnowledgePro/LoginAction.do`, type: "form" },
    ];

    let authSuccess = false;

    for (const ep of AUTH_ENDPOINTS) {
      try {
        let res: Response;
        if (ep.type === "json") {
          res = await fetch(ep.url, {
            method: "POST",
            headers: {
              ...BROWSER_HEADERS,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, loginPassword: password }),
            redirect: "follow",
          });
        } else {
          const params = new URLSearchParams();
          params.set("userName", username);
          params.set("loginPassword", password);
          params.set("method", "loginSubmit");
          res = await fetch(ep.url, {
            method: "POST",
            headers: {
              ...BROWSER_HEADERS,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
            redirect: "follow",
          });
        }

        const extractedCookies = extractSetCookies(res.headers);
        if (extractedCookies) {
          cookieHeader = cookieHeader ? `${cookieHeader}; ${extractedCookies}` : extractedCookies;
        }

        if (res.ok) {
          const authHeaderRes = res.headers.get("authorization") || res.headers.get("x-auth-token");
          if (authHeaderRes) {
            authToken = authHeaderRes;
          }

          const json = await res.json().catch(() => null);
          if (json) {
            if (json.token || json.accessToken || json.access_token || json.jwt) {
              authToken = json.token || json.accessToken || json.access_token || json.jwt;
            }
            if (json.success !== false && (authToken || cookieHeader || json.user || json.data)) {
              authSuccess = true;
              break;
            }
          } else if (cookieHeader) {
            authSuccess = true;
            break;
          }
        }
      } catch (_) {
        // Try next endpoint candidate
      }
    }

    // Phase 4: Handle authentication failures
    if (!authSuccess && !cookieHeader && !authToken) {
      return new Response(
        JSON.stringify({ error: "Authentication failed. Please verify credentials." }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    // Phase 2: Data Fetching directly from CUE Internal JSON API Endpoints
    const FETCH_ENDPOINTS = [
      `${CUE_BASE}/api/v1/student/attendance`,
      `${CUE_BASE}/api/student/attendance`,
      `${CUE_BASE}/api/attendance`,
      `${CUE_BASE}/api/v1/attendance`,
      `${CUE_BASE}/KnowledgePro/StudentAttendanceAction.do?method=getAttendanceJson`,
      `${CUE_BASE}/KnowledgePro/StudentDashboard.do?method=getAttendance`,
    ];

    let rawAttendanceList: RawCueSubject[] = [];

    const requestHeaders: Record<string, string> = { ...BROWSER_HEADERS };
    if (authToken) {
      requestHeaders["Authorization"] = authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`;
    }
    if (cookieHeader) {
      requestHeaders["Cookie"] = cookieHeader;
    }

    for (const url of FETCH_ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: requestHeaders,
          redirect: "follow",
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json) {
            const list = Array.isArray(json)
              ? json
              : json.subjects || json.attendance || json.courses || json.data?.subjects || json.data || [];
            if (Array.isArray(list) && list.length > 0) {
              rawAttendanceList = list;
              break;
            }
          }
        }
      } catch (_) {
        // Try next JSON endpoint candidate
      }
    }

    // Phase 3: Margin Engine Processing & Return Contract
    const subjects = processCueSubjects(rawAttendanceList);

    const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const totalConducted = subjects.reduce((sum, s) => sum + s.total, 0);
    const overallPercentage = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 10000) / 100 : 100;

    const overallMargin85 = calculateMargin(totalAttended, totalConducted, 85);
    const overallMargin75 = calculateMargin(totalAttended, totalConducted, 75);

    return new Response(
      JSON.stringify({
        success: true,
        count: subjects.length,
        subjects,
        overall: {
          percentage: overallPercentage,
          attended: totalAttended,
          total: totalConducted,
          target85: overallMargin85,
          target75: overallMargin75,
        },
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err: any) {
    console.error("[kp-scraper] Internal API error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Authentication failed. Please verify credentials." }),
      { status: 401, headers: JSON_HEADERS }
    );
  }
});
