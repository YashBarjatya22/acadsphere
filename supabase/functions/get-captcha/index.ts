/**
 * Supabase Edge Function: get-captcha
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches the Keycloak login page for the Christ University CUE portal.
 * Generates PKCE challenge parameters, extracts the form action URL,
 * captures session cookies, and detects/fetches any CAPTCHA image.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ── PKCE Helpers ──────────────────────────────────────────────────────────────

function generateRandomString(length = 43): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256Base64Url(str: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return b64url(digest);
}

// ── Main Handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await sha256Base64Url(codeVerifier);
    const state = generateRandomString(16);
    const nonce = generateRandomString(16);

    const authUrl = new URL(
      "https://studentespro.christuniversity.in:8010/auth/realms/Student/protocol/openid-connect/auth"
    );
    authUrl.searchParams.set("client_id", "react-app");
    authUrl.searchParams.set("redirect_uri", "https://cue.christuniversity.in");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid profile email");
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("nonce", nonce);

    // Fetch with a 6-second timeout to quickly detect firewall/port reachability issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let res: Response;
    try {
      res = await fetch(authUrl.toString(), {
        method: "GET",
        headers: {
          "User-Agent": BROWSER_UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr.name === "AbortError";
      console.warn("[get-captcha] Connection failed to port 8010:", fetchErr.message);
      return new Response(
        JSON.stringify({
          success: false,
          reachable: false,
          error: isTimeout
            ? "Connection to Christ University login server timed out (port 8010 is not reachable from cloud servers)."
            : `Network unreachable: ${fetchErr.message || "Port 8010 blocked"}`,
        }),
        { status: 200, headers: JSON_HEADERS }
      );
    }

    clearTimeout(timeoutId);

    if (!res.ok && res.status >= 500) {
      return new Response(
        JSON.stringify({
          success: false,
          reachable: false,
          error: `Keycloak server responded with HTTP ${res.status}`,
        }),
        { status: 200, headers: JSON_HEADERS }
      );
    }

    // Extract cookies from Set-Cookie headers
    const setCookieHeaders = res.headers.get("set-cookie") || "";
    const cookies: string[] = [];
    if (setCookieHeaders) {
      for (const part of setCookieHeaders.split(/,(?=\s*[^;]+=)/)) {
        const cookieNameVal = part.split(";")[0].trim();
        if (cookieNameVal) cookies.push(cookieNameVal);
      }
    }
    const sessionCookie = cookies.join("; ");

    const html = await res.text();

    // Extract form action URL
    let formActionUrl = "";
    const actionMatch = html.match(/<form[^>]+action=["']([^"']+)["']/i);
    if (actionMatch && actionMatch[1]) {
      formActionUrl = actionMatch[1].replace(/&amp;/g, "&");
      if (formActionUrl.startsWith("/")) {
        formActionUrl = `https://studentespro.christuniversity.in:8010${formActionUrl}`;
      }
    }

    // Check for CAPTCHA image
    let hasCaptcha = false;
    let captchaImageBase64: string | null = null;

    const captchaImgMatch =
      html.match(/<img[^>]+id=["'](?:kc-)?captcha-image["'][^>]+src=["']([^"']+)["']/i) ||
      html.match(/<img[^>]+src=["']([^"']*(?:captcha|challenge)[^"']*)["']/i);

    if (captchaImgMatch && captchaImgMatch[1]) {
      hasCaptcha = true;
      let captchaUrl = captchaImgMatch[1].replace(/&amp;/g, "&");
      if (captchaUrl.startsWith("/")) {
        captchaUrl = `https://studentespro.christuniversity.in:8010${captchaUrl}`;
      }

      // Fetch the captcha image data using the same session cookie
      try {
        const imgRes = await fetch(captchaUrl, {
          headers: {
            "User-Agent": BROWSER_UA,
            Cookie: sessionCookie,
            Referer: authUrl.toString(),
          },
        });
        if (imgRes.ok) {
          const contentType = imgRes.headers.get("content-type") || "image/png";
          const imgBuf = await imgRes.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(imgBuf)));
          captchaImageBase64 = `data:${contentType};base64,${b64}`;
        }
      } catch (imgErr) {
        console.warn("[get-captcha] Failed to fetch captcha image:", imgErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reachable: true,
        hasCaptcha,
        captchaImage: captchaImageBase64,
        formActionUrl: formActionUrl || authUrl.toString(),
        sessionCookie,
        codeVerifier,
        state,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err: any) {
    console.error("[get-captcha] Unexpected error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        reachable: false,
        error: err.message || "Failed to initialize CUE portal login session",
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
});
