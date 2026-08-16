/**
 * Supabase Edge Function: kp-scraper (CAPTCHA-Aware + Form/PKCE + ROPC)
 * ─────────────────────────────────────────────────────────────────────────────
 * Authenticates with Christ University CUE Portal via:
 * 1. Form-Submission + PKCE authorization code exchange (supports CAPTCHAs and avoids ROPC blocks).
 * 2. Fallback to direct Keycloak ROPC OIDC grant with DPoP.
 *
 * Scrapes attendance from espro.christuniversity.in:84 and upserts directly to Supabase.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Constants ─────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

const KC_TOKEN_URL =
  "https://studentespro.christuniversity.in:8010/auth/realms/Student/protocol/openid-connect/token";
const KC_CLIENT_ID = "react-app";
const ESPRO_BASE = "https://espro.christuniversity.in:84";
const SEMESTER_URL = `${ESPRO_BASE}/ClassRoomAttendanceServices/Student/StudentAttendance/getStudentSemesters`;

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

// ── Form-Based Authentication with PKCE (CAPTCHA-aware) ───────────────────────

async function authenticateWithFormPKCE(
  username: string,
  password: string,
  formActionUrl: string,
  sessionCookie: string,
  codeVerifier: string,
  captchaText?: string
): Promise<{ accessToken: string; keyPair: CryptoKeyPair; dpopBound: boolean }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

  const formBody = new URLSearchParams();
  formBody.set("username", username.trim());
  formBody.set("password", password);
  formBody.set("credentialId", "");

  if (captchaText && captchaText.trim()) {
    formBody.set("captchaCode", captchaText.trim());
    formBody.set("captcha", captchaText.trim());
    formBody.set("captchaAnswer", captchaText.trim());
  }

  // Submit the login form to Keycloak
  const formRes = await fetch(formActionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": BROWSER_UA,
      Cookie: sessionCookie,
      Referer: formActionUrl,
    },
    body: formBody.toString(),
    redirect: "manual", // Prevent automatic following of redirect to capture 302 Location header
  });

  const location = formRes.headers.get("location") || "";

  // 1. Check for success redirect containing authorization code
  let authCode: string | null = null;
  if (location) {
    try {
      const locUrl = new URL(location, "https://cue.christuniversity.in");
      authCode = locUrl.searchParams.get("code");
      const err = locUrl.searchParams.get("error");
      const errDesc = locUrl.searchParams.get("error_description");

      if (err) {
        if (err.includes("captcha") || (errDesc && errDesc.includes("captcha"))) {
          const e: any = new Error("Invalid CAPTCHA code entered.");
          e.isCaptchaError = true;
          throw e;
        }
        const e: any = new Error(errDesc || "Authentication rejected: " + err);
        e.isCredentialError = true;
        throw e;
      }
    } catch (parseErr: any) {
      if (parseErr.isCaptchaError || parseErr.isCredentialError) throw parseErr;
    }
  }

  // 2. If no redirect location or status 200, examine HTML for error messages
  if (!authCode) {
    const resHtml = await formRes.text().catch(() => "");
    if (resHtml.toLowerCase().includes("invalid username") || resHtml.toLowerCase().includes("invalid password") || resHtml.toLowerCase().includes("invalid_user_credentials")) {
      const e: any = new Error("Invalid username or password.");
      e.isCredentialError = true;
      throw e;
    }
    if (resHtml.toLowerCase().includes("invalid captcha") || resHtml.toLowerCase().includes("captcha code")) {
      const e: any = new Error("Invalid CAPTCHA code entered. Please try again.");
      e.isCaptchaError = true;
      throw e;
    }
    if (resHtml.includes("kc-captcha-image") || resHtml.includes("captcha")) {
      const e: any = new Error("CAPTCHA verification required. Please solve the CAPTCHA.");
      e.isCaptchaError = true;
      throw e;
    }
    throw new Error("Login failed. Check username and password.");
  }

  // 3. Exchange auth code for DPoP access token
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: KC_CLIENT_ID,
    code: authCode,
    redirect_uri: "https://cue.christuniversity.in",
    code_verifier: codeVerifier,
  });

  const dpopProof = await buildDPoP(keyPair, "POST", KC_TOKEN_URL);
  let tokenRes = await fetch(KC_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": BROWSER_UA,
      DPoP: dpopProof,
    },
    body: tokenParams.toString(),
  });

  if (tokenRes.status === 400) {
    const serverNonce = tokenRes.headers.get("dpop-nonce");
    if (serverNonce) {
      const dpopProof2 = await buildDPoP(keyPair, "POST", KC_TOKEN_URL, serverNonce);
      tokenRes = await fetch(KC_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": BROWSER_UA,
          DPoP: dpopProof2,
        },
        body: tokenParams.toString(),
      });
    }
  }

  if (!tokenRes.ok) {
    // Fallback: try token exchange without DPoP
    const tokenResFallback = await fetch(KC_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": BROWSER_UA,
      },
      body: tokenParams.toString(),
    });

    if (tokenResFallback.ok) {
      const json = await tokenResFallback.json();
      if (json.access_token) {
        return { accessToken: json.access_token, keyPair, dpopBound: false };
      }
    }

    const errTxt = await tokenRes.text().catch(() => "");
    console.error("[kp-scraper] Code exchange failed:", tokenRes.status, errTxt);
    throw new Error("Failed to exchange authorization code for access token.");
  }

  const tokenJson = await tokenRes.json();
  return { accessToken: tokenJson.access_token, keyPair, dpopBound: true };
}

// ── Direct Keycloak ROPC (Fallback) ───────────────────────────────────────────

async function keycloakROPCLogin(
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

  // Fallback plain Bearer
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

  throw new Error("Invalid username or password.");
}

// ── Authenticated ESPRO API Fetcher ───────────────────────────────────────────

async function esproFetch(
  url: string,
  method: "GET" | "POST",
  body: unknown,
  token: string,
  keyPair: CryptoKeyPair,
  dpopBound: boolean
): Promise<Response> {
  const dpopProof = dpopBound
    ? await buildDPoP(keyPair, method, url, undefined, token)
    : undefined;

  const headers: Record<string, string> = {
    Authorization: dpopBound ? `DPoP ${token}` : `Bearer ${token}`,
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

// ── Subject Data Normalizer ───────────────────────────────────────────────────

function normaliseAttendanceData(raw: any): ProcessedSubject[] {
  const seen = new Set<string>();
  const results: ProcessedSubject[] = [];

  const addSubject = (code: string, name: string, type: string, attended: number, total: number) => {
    if (!name && (!code || code === "N/A")) return;
    const finalName = name || code;
    const key = `${code}-${finalName}-${type}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const safeAttended = Math.round(Math.max(0, attended));
    const safeTotal = Math.round(Math.max(0, total));
    const pct =
      safeTotal > 0
        ? Math.round((safeAttended / safeTotal) * 10000) / 100
        : 100;

    results.push({
      code: code || "N/A",
      name: finalName,
      type: type || "Theory",
      attended: safeAttended,
      total: safeTotal,
      percentage: pct,
      target85: calculateMargin(safeAttended, safeTotal, 85),
      target75: calculateMargin(safeAttended, safeTotal, 75),
    });
  };

  // 1. Structure: Object keyed by course ID with Theory / Practical sub-objects
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const skip = new Set(["AllCodes", "TotalClasses", "totalClassesPresent", "TotalPercentage", "AllPercentage"]);
    for (const [codeKey, item] of Object.entries(raw)) {
      if (isNaN(Number(codeKey)) || skip.has(codeKey) || !item || typeof item !== "object") continue;
      const subItem = item as any;

      for (const type of ["Theory", "Practical"]) {
        const d = subItem[type];
        if (d && (d.SubjectName || d.subjectName)) {
          const subName = d.SubjectName || d.subjectName;
          const att = parseFloat(d.SubjectClassesAttended || d.attended || "0");
          const tot = parseFloat(d.SubjectClassesHeld || d.total || "0");
          addSubject(codeKey, subName, type, att, tot);
        }
      }

      // If no nested Theory/Practical, check root of item
      if (!subItem.Theory && !subItem.Practical) {
        const subName = subItem.SubjectName || subItem.subjectName || subItem.courseName || codeKey;
        const att = parseFloat(subItem.TotalSubjectClassesAtt || subItem.attended || "0");
        const tot = parseFloat(subItem.TotalSubjectClasses || subItem.total || "0");
        const isLab = String(subItem.type || "").toLowerCase().includes("lab") || subName.toLowerCase().includes("lab") || subName.toLowerCase().includes("practical");
        addSubject(codeKey, subName, isLab ? "Practical" : "Theory", att, tot);
      }
    }
  }

  // 2. Structure: Array of subjects
  const list = Array.isArray(raw)
    ? raw
    : raw?.attendanceDetails ?? raw?.courseWiseAttendance ?? raw?.subjects ?? raw?.courses ?? raw?.data ?? [];

  if (Array.isArray(list)) {
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const code = String(item.subjectCode ?? item.courseCode ?? item.code ?? "N/A").trim();
      const name = String(item.subjectName ?? item.courseName ?? item.name ?? "").trim();
      const attended = Number(item.attendedHours ?? item.attended_hours ?? item.attendedClasses ?? item.attended ?? item.present ?? 0);
      const total = Number(item.conductedHours ?? item.conducted_hours ?? item.totalHours ?? item.totalClasses ?? item.total ?? item.conducted ?? 0);
      const isLab = String(item.type ?? item.courseType ?? "").toLowerCase().includes("lab") || name.toLowerCase().includes("lab") || name.toLowerCase().includes("practical");
      addSubject(code, name, isLab ? "Practical" : "Theory", attended, total);
    }
  }

  return results;
}

// ── Main Request Handler ──────────────────────────────────────────────────────

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
    const {
      username,
      password,
      captchaText,
      formActionUrl,
      sessionCookie,
      codeVerifier,
      user_id,
    } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required." }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // Authenticate
    let authResult: { accessToken: string; keyPair: CryptoKeyPair; dpopBound: boolean };

    if (formActionUrl && sessionCookie && codeVerifier) {
      // Flow 1: CAPTCHA-aware form submission with PKCE
      authResult = await authenticateWithFormPKCE(
        username,
        password,
        formActionUrl,
        sessionCookie,
        codeVerifier,
        captchaText
      );
    } else {
      // Flow 2: Direct ROPC fallback
      authResult = await keycloakROPCLogin(username, password);
    }

    const { accessToken, keyPair, dpopBound } = authResult;

    // Fetch Semesters
    const semRes = await esproFetch(
      SEMESTER_URL,
      "POST",
      {},
      accessToken,
      keyPair,
      dpopBound
    );

    if (!semRes.ok) {
      throw new Error(`Failed to fetch semesters (HTTP ${semRes.status})`);
    }

    const semJson = await semRes.json();
    const semesters = Array.isArray(semJson)
      ? semJson
      : semJson?.data ?? semJson?.semesters ?? semJson?.response ?? [];

    const currentSem =
      semesters.find(
        (s: any) =>
          s.isCurrent === true ||
          s.isCurrent === "Y" ||
          s.isCurrent === 1 ||
          s.isCurrentSemester === true
      ) ?? semesters[0];

    if (!currentSem) {
      throw new Error("Could not detect active semester.");
    }

    const useNew =
      currentSem.callKpServiceNew === true ||
      currentSem.callKpServiceNew === "true" ||
      currentSem.callKpServiceNew === 1;
    const termNo = String(currentSem.termNumber ?? currentSem.termNo ?? "");
    const sessionId = String(currentSem.sessionId ?? currentSem.session_id ?? "");

    const attUrl =
      useNew && termNo
        ? `${ESPRO_BASE}/KPServiceNew/rest/getAttendanceDetailsBySemester?termNo=${termNo}`
        : sessionId
        ? `${ESPRO_BASE}/ClassRoomAttendanceServices/Student/StudentAttendance/getCourseWiseAttendance?sessionId=${sessionId}`
        : "";

    if (!attUrl) {
      throw new Error("Could not determine attendance API endpoint.");
    }

    // Fetch Attendance
    const attRes = await esproFetch(
      attUrl,
      "GET",
      undefined,
      accessToken,
      keyPair,
      dpopBound
    );

    if (!attRes.ok) {
      throw new Error(`Attendance fetch failed (HTTP ${attRes.status})`);
    }

    const attJson = await attRes.json();
    const subjects = normaliseAttendanceData(attJson);

    if (!subjects.length) {
      throw new Error("No attendance records found for the current semester.");
    }

    // Direct Database Upsert if user_id is provided
    if (user_id) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
          Deno.env.get("SUPABASE_ANON_KEY") ??
          ""
      );

      const recordsToInsert = subjects.map((sub) => ({
        user_id,
        subject_code: sub.code,
        subject_name: sub.name,
        subject_type: sub.type,
        attended_classes: sub.attended,
        total_classes: sub.total,
        percentage: sub.percentage,
        last_synced_at: new Date().toISOString(),
      }));

      await supabaseAdmin
        .from("student_attendance")
        .upsert(recordsToInsert, { onConflict: "user_id,subject_code" });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: subjects.length,
        subjects,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err: any) {
    console.error("[kp-scraper] Error:", err.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Failed to sync attendance",
        isCredentialError: !!err.isCredentialError,
        isCaptchaError: !!err.isCaptchaError,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  }
});
