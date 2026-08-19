import { c as createServerRpc } from "./createServerRpc-Cnm9kkK3.js";
import { c as createServerFn } from "./server-CYaDwdxI.js";
import { z } from "zod";
import { s as supabaseServer } from "./supabase.server-BXfiGlvE.js";
import { getDb } from "./db.server-DqdqqPAh.js";
import crypto from "node:crypto";
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
import "@supabase/supabase-js";
import "dotenv";
import "node:sqlite";
import "node:path";
import "node:dns";
const bypassSignup_createServerFn_handler = createServerRpc({
  id: "b272cbeb163c485d101e80b1bb37e8ff29ffa31bbe3eb6a24d063016c2ed628a",
  name: "bypassSignup",
  filename: "src/lib/auth.functions.ts"
}, (opts) => bypassSignup.__executeServer(opts));
const bypassSignup = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
}).parse(input)).handler(bypassSignup_createServerFn_handler, async ({
  data
}) => {
  const {
    data: user,
    error
  } = await supabaseServer.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.name
    }
  });
  if (error) throw new Error(error.message);
  return {
    success: true,
    userId: user.user.id
  };
});
const localDemoLogin_createServerFn_handler = createServerRpc({
  id: "9b075d64629f28a178b2216ca82061a296e868b579ed47ce954ba0b92c063625",
  name: "localDemoLogin",
  filename: "src/lib/auth.functions.ts"
}, (opts) => localDemoLogin.__executeServer(opts));
const localDemoLogin = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().optional()
}).parse(input)).handler(localDemoLogin_createServerFn_handler, async ({
  data
}) => {
  const db = getDb();
  const pwHash = crypto.createHash("sha256").update(data.password).digest("hex");
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(data.email);
  if (!user) {
    const newId = crypto.randomUUID();
    db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(newId, data.email, pwHash);
    try {
      db.prepare("INSERT INTO profiles (id, full_name) VALUES (?, ?)").run(newId, data.name || data.email.split("@")[0]);
    } catch (_) {
    }
    user = {
      id: newId,
      email: data.email
    };
  } else {
    if (user.password_hash !== pwHash) {
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(pwHash, user.id);
    }
  }
  const token = `demo_${user.id}_${Buffer.from(data.email).toString("base64")}`;
  let role = "student";
  try {
    const profile = db.prepare("SELECT role FROM profiles WHERE id = ?").get(user.id);
    if (profile?.role) role = profile.role;
  } catch (_) {
  }
  return {
    success: true,
    userId: user.id,
    token,
    email: user.email,
    name: data.name || user.name || user.email.split("@")[0],
    role
  };
});
export {
  bypassSignup_createServerFn_handler,
  localDemoLogin_createServerFn_handler
};
