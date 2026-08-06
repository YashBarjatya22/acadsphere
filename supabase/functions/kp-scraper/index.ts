/**
 * Supabase Edge Function: kp-scraper
 * ─────────────────────────────────────────────────────────────────────────────
 * Authenticates with Christ University CUE Portal via Keycloak OIDC.
 * Uses the Resource Owner Password Credentials (ROPC) grant with DPoP
 * (Demonstrating Proof-of-Possession) to obtain a DPoP-bound access token.
 * Then fetches real attendance data from espro.christuniversity.in:84 API.
 *
 * Auth Flow:
 *   1. Generate an ephemeral EC P-256 key pair for DPoP signing.
 *   2. POST username/password + DPoP proof to Keycloak token endpoint.
 *   3. Receive DPoP-bound access_token (re-send with server nonce if required).
 *   4. Fetch semester list from espro API with DPoP-signed GET requests.
 *   5. Fetch course-wise attendance for the current semester.
 *   6. Normalise raw JSON → apply margin engine → return 200 JSON to frontend.
 *
 * Endpoints discovered via live browser network interception:
 *   Auth:     https://studentespro.christuniversity.in:8010/auth/realms/Student/protocol/openid-connect/token
 *   Semesters: https://espro.christuniversity.in:84/ClassRoomAttendanceServices/Student/StudentAttendance/getStudentSemesters
 *   Attendance (new): https://espro.christuniversity.in:84/KPServiceNew/rest/getAttendanceDetailsBySemester?termNo=<termNo>
 *   Attendance (old): https://espro.christuniversity.in:84/ClassRoomAttendanceServices/Student/StudentAttendance/getCourseWiseAttendance?sessionId=<sessionId>
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ── Constants ─────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

// Keycloak OIDC token endpoint (discovered via browser network interception)
const KC_TOKEN_URL =
  "https://studentespro.christuniversity.in:8010/auth/realms/Student/protocol/openid-connect/token";
const KC_CLIENT_ID = "react-app";

// ESPRO REST API base (discovered via browser network interception)
const ESPRO_BASE = "https://espro.christuniversity.in:84";
const SEMESTER_URL = `${ESPRO_BASE}/ClassRoomAttendanceServices/Student/StudentAttendance/getStudentSemesters`;
const ATT_NEW_URL = (termNo: string) =>
  `${ESPRO_BASE}/KPServiceNew/rest/getAttendanceDetailsBySemester?termNo=${termNo}`;
const ATT_OLD_URL = (sessionId: string) =>
  `${ESPRO_BASE}/ClassRoomAttendanceServices/Student/StudentAttendance/getCourseWiseAttendance?sessionId=${sessionId}`;

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Margin Engine ─────────────────────────────────────────────────────────────

function calculateMargin(
  attended: number,
  total: number,
  targetPct: number
): MarginTarget {
  if (total <= 0) return { status: "SAFE", leavesAllowed: 0, classesNeeded: 0 };
  const r = targetPct / 100;
  const current = (attended / total) * 100;
  if (current >= targetPct) {
    return {
      status: "SAFE",
      leavesAllowed: Math.max(0, Math.floor((attended - r * total) / r)),
      classesNeeded: 0,
    };
  }
  return {
    status: "NEED_ATTENDANCE",
    leavesAllowed: 0,
    classesNeeded: Math.max(0, Math.ceil((r * total - attended) / (1 - r))),
  };
}

// ── Base64URL helpers ─────────────────────────────────────────────────────────

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function encodeJson(obj: unknown): string {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}

// ── DPoP JWT Builder ──────────────────────────────────────────────────────────

/**
 * Creates a DPoP proof JWT signed with an ephemeral EC P-256 key pair.
 * Optionally includes a server nonce and/or an access token hash (ath).
 */
async function buildDPoP(
  keyPair: CryptoKeyPair,
  method: string,
  url: string,
  nonce?: string,
  accessToken?: string
): Promise<string> {
  const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const publicJwk = { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y };
  const header = { alg: "ES256", typ: "dpop+jwt", jwk: publicJwk };

  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    jti: crypto.randomUUID(),
    htm: method.toUpperCase(),
    htu: url,
    iat: now,
  };
  if (nonce) payload.nonce = nonce;
  if (accessToken) {
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(accessToken)
    );
    payload.ath = b64url(hash);
  }

  const signingInput = `${encodeJson(header)}.${encodeJson(payload)}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    keyPair.privateKey,
    new TextEncoder().encode(signingInput)
  );
  return `${signingInput}.${b64url(sig)}`;
}

// ── Keycloak ROPC Authentication ──────────────────────────────────────────────

/**
 * Authenticates via Keycloak's Resource Owner Password Credentials grant.
 * Attempts with DPoP first; handles server nonce challenges; falls back
 * to a plain password grant if the server does not require DPoP.
 *
 * Returns { accessToken, keyPair, dpopBound } where dpopBound indicates
 * whether the token is DPoP-bound (true) or a plain Bearer token (false).
 */
async function keycloakLogin(
  username: string,
  password: string
): Promise<{ accessToken: string; keyPair: CryptoKeyPair; dpopBound: boolean }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

  const baseParams = new URLSearchParams({
    grant_type: "password",
    client_id: KC_CLIENT_ID,
    username: username.trim(),
    password,
    scope: "openid profile",
  });

  // ── Attempt 1: with DPoP ──────────────────────────────────────────────────
  const dpopProof1 = await buildDPoP(keyPair, "POST", KC_TOKEN_URL);
  let res = await fetch(KC_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": BROWSER_UA,
      DPoP: dpopProof1,
    },
    body: baseParams.toString(),
  });

  // ── Handle server-side DPoP nonce requirement ─────────────────────────────
  if (res.status === 400) {
    const serverNonce = res.headers.get("dpop-nonce");
    if (serverNonce) {
      const dpopProof2 = await buildDPoP(keyPair, "POST", KC_TOKEN_URL, serverNonce);
      res = await fetch(KC_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": BROWSER_UA,
          DPoP: dpopProof2,
        },
        body: baseParams.toString(),
      });
    }
  }

  if (res.ok) {
    const json = await res.json();
    if (json.access_token) {
      return { accessToken: json.access_token, keyPair, dpopBound: true };
    }
  }

  // ── Attempt 2: plain password grant (no DPoP) ─────────────────────────────
  const resFallback = await fetch(KC_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": BROWSER_UA,
    },
    body: baseParams.toString(),
  });

  if (resFallback.ok) {
    const json = await resFallback.json();
    if (json.access_token) {
      return { accessToken: json.access_token, keyPair, dpopBound: false };
    }
  }

  const errBody = await resFallback.text().catch(() => "");
  console.error("[kp-scraper] Auth failed:", resFallback.status, errBody.slice(0, 300));
  throw new Error("Authentication failed. Please verify credentials.");
}

// ── Authenticated ESPRO API helpers ───────────────────────────────────────────

function authHeader(token: string, dpopBound: boolean): string {
  return dpopBound ? `DPoP ${token}` : `Bearer ${token}`;
}

async function esproFetch(
  url: string,
  method: "GET" | "POST",
  body: unknown,
  token: string,
  keyPair: CryptoKeyPair,
  dpopBound: boolean,
  nonce?: string
): Promise<Response> {
  const dpopProof = dpopBound
    ? await buildDPoP(keyPair, method, url, nonce, token)
    : undefined;

  const headers: Record<string, string> = {
    Authorization: authHeader(token, dpopBound),
    "User-Agent": BROWSER_UA,
    Accept: "application/json",
  };
  if (dpopProof) headers["DPoP"] = dpopProof;
  if (method === "POST") headers["Content-Type"] = "application/json";

  return fetch(url, {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

// ── JSON normaliser → ProcessedSubject[] ─────────────────────────────────────

// deno-lint-ignore no-explicit-any
function normaliseSubjects(raw: any[]): ProcessedSubject[] {
  const seen = new Set<string>();
  const results: ProcessedSubject[] = [];

  for (const item of raw) {
    const code = String(
      item.subjectCode ?? item.courseCode ?? item.subject_code ?? item.code ?? "N/A"
    ).trim();
    const name = String(
      item.subjectName ?? item.courseName ?? item.subject_name ??
      item.course_name ?? item.name ?? item.subject ?? ""
    ).trim();

    const attended = Math.max(
      0,
      Number(
        item.attendedHours ?? item.attended_hours ?? item.attendedClasses ??
        item.classesAttended ?? item.attended ?? item.present ?? 0
      )
    );
    const total = Math.max(
      0,
      Number(
        item.conductedHours ?? item.conducted_hours ?? item.totalHours ??
        item.total_hours ?? item.totalClasses ?? item.classesConducted ??
        item.total ?? item.conducted ?? 0
      )
    );

    if (!name && code === "N/A") continue;
    const subjectName = name || code;
    const key = `${code}-${subjectName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const percentage = total > 0 ? Math.round((attended / total) * 10000) / 100 : 100;
    const isLab =
      String(item.type ?? item.courseType ?? item.subject_type ?? "")
        .toLowerCase()
        .includes("lab") ||
      subjectName.toLowerCase().includes("lab") ||
      subjectName.toLowerCase().includes("practical");

    results.push({
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

  return results;
}

// deno-lint-ignore no-explicit-any
function extractList(json: any): any[] {
  if (Array.isArray(json)) return json;
  return (
    json?.attendanceDetails ??
    json?.courseWiseAttendance ??
    json?.subjects ??
    json?.courses ??
    json?.data ??
    []
  );
}

// ── Serve Handler ─────────────────────────────────────────────────────────────

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
    // Parse request body — frontend sends strictly { username, password }
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
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // ── Phase 1: Keycloak OIDC ROPC + DPoP ──────────────────────────────────
    let accessToken: string;
    let keyPair: CryptoKeyPair;
    let dpopBound: boolean;
    try {
      ({ accessToken, keyPair, dpopBound } = await keycloakLogin(username, password));
    } catch (authErr: unknown) {
      return new Response(
        JSON.stringify({ error: "Authentication failed. Please verify credentials." }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    // ── Phase 2: Fetch Semesters → detect current semester ───────────────────
    // deno-lint-ignore no-explicit-any
    let rawAttendance: any[] = [];
    let dpopNonce: string | undefined;

    const semRes = await esproFetch(
      SEMESTER_URL, "POST", {}, accessToken, keyPair, dpopBound, dpopNonce
    );
    if (semRes.headers.get("dpop-nonce")) {
      dpopNonce = semRes.headers.get("dpop-nonce")!;
    }

    if (semRes.ok) {
      try {
        const semJson = await semRes.json();
        // deno-lint-ignore no-explicit-any
        const semesters: any[] = Array.isArray(semJson)
          ? semJson
          : semJson?.data ?? semJson?.semesters ?? semJson?.response ?? [];

        // Find the current semester
        // deno-lint-ignore no-explicit-any
        const currentSem: any =
          semesters.find(
            // deno-lint-ignore no-explicit-any
            (s: any) =>
              s.isCurrent === true ||
              s.isCurrent === "Y" ||
              s.isCurrent === 1 ||
              s.isCurrentSemester === true
          ) ?? semesters[0];

        if (currentSem) {
          const useNew =
            currentSem.callKpServiceNew === true ||
            currentSem.callKpServiceNew === "true" ||
            currentSem.callKpServiceNew === 1;
          const termNo = String(currentSem.termNumber ?? currentSem.termNo ?? "");
          const sessionId = String(currentSem.sessionId ?? currentSem.session_id ?? "");

          let attUrl = "";
          let attMethod: "GET" | "POST" = "GET";
          if (useNew && termNo) {
            attUrl = ATT_NEW_URL(termNo);
          } else if (sessionId) {
            attUrl = ATT_OLD_URL(sessionId);
          }

          if (attUrl) {
            const attRes = await esproFetch(
              attUrl, attMethod, undefined, accessToken, keyPair, dpopBound, dpopNonce
            );
            if (attRes.headers.get("dpop-nonce")) {
              dpopNonce = attRes.headers.get("dpop-nonce")!;
            }

            if (attRes.ok) {
              const attJson = await attRes.json().catch(() => null);
              if (attJson) rawAttendance = extractList(attJson);
            } else {
              console.warn("[kp-scraper] Attendance API returned:", attRes.status);
            }
          }
        }
      } catch (semErr) {
        console.warn("[kp-scraper] Semester processing error:", semErr);
      }
    } else {
      console.warn("[kp-scraper] Semester API returned:", semRes.status);
    }

    // ── Phase 3: Margin Engine & Return Contract ──────────────────────────────
    const subjects = normaliseSubjects(rawAttendance);
    const totalAttended = subjects.reduce((s, x) => s + x.attended, 0);
    const totalConducted = subjects.reduce((s, x) => s + x.total, 0);
    const overallPercentage =
      totalConducted > 0
        ? Math.round((totalAttended / totalConducted) * 10000) / 100
        : 100;

    return new Response(
      JSON.stringify({
        success: true,
        count: subjects.length,
        subjects,
        overall: {
          percentage: overallPercentage,
          attended: totalAttended,
          total: totalConducted,
          target85: calculateMargin(totalAttended, totalConducted, 85),
          target75: calculateMargin(totalAttended, totalConducted, 75),
        },
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[kp-scraper] Unhandled error:", msg);
    return new Response(
      JSON.stringify({ error: "Authentication failed. Please verify credentials." }),
      { status: 401, headers: JSON_HEADERS }
    );
  }
});
