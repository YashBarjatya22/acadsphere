import https from "node:https";
import crypto from "node:crypto";

const agent = new https.Agent({ rejectUnauthorized: false });

const KC_TOKEN_URL = "https://studentespro.christuniversity.in:8010/auth/realms/Student/protocol/openid-connect/token";
const KC_CLIENT_ID = "react-app";
const ESPRO_BASE = "https://espro.christuniversity.in:84";

function b64url(buf) {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Buffer.from(arr).toString("base64url");
}

function encodeJson(obj) {
  return b64url(Buffer.from(JSON.stringify(obj)));
}

async function buildDPoP(keyPair, method, url, nonce, accessToken) {
  const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const publicJwk = { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y };
  const header = { alg: "ES256", typ: "dpop+jwt", jwk: publicJwk };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    jti: crypto.randomUUID(),
    htm: method.toUpperCase(),
    htu: url,
    iat: now,
  };
  if (nonce) payload.nonce = nonce;
  if (accessToken) {
    const hash = await crypto.subtle.digest("SHA-256", Buffer.from(accessToken));
    payload.ath = b64url(hash);
  }

  const signingInput = `${encodeJson(header)}.${encodeJson(payload)}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    keyPair.privateKey,
    Buffer.from(signingInput)
  );
  return `${signingInput}.${b64url(sig)}`;
}

async function testLogin(username, password) {
  console.log("Generating EC P-256 keypair for DPoP...");
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
  
  console.log("Posting token request with DPoP...");
  let res = await fetch(KC_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      DPoP: dpopProof1,
    },
    body: baseParams.toString(),
    // @ts-ignore
    agent,
  }).catch((e) => console.error("Fetch err:", e));

  if (!res) return;
  console.log("Token response status:", res.status);
  const text = await res.text();
  console.log("Token response body:", text);
}

testLogin("2547244", "test");
