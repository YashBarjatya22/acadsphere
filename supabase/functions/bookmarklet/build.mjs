/**
 * Builds the AcadSphere CUE Sync bookmarklet.
 * Run: node supabase/functions/bookmarklet/build.mjs
 *
 * Output: a javascript: URL you can drag to your bookmarks bar.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../../..");

// Load .env from project root
config({ path: resolve(ROOT, ".env") });
config({ path: resolve(ROOT, ".env.local"), override: false });

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL || "";

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

// Read bookmarklet source
let src = readFileSync(resolve(__dirname, "bookmarklet.js"), "utf-8");

// Inject config
src = src
  .replace("__SUPABASE_URL__", SUPABASE_URL)
  .replace("__SUPABASE_ANON_KEY__", SUPABASE_ANON_KEY);

// Strip comments and minify (simple single-line)
const minified = src
  .split("\n")
  .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*") && !line.trim().startsWith("/**"))
  .join(" ")
  .replace(/\s+/g, " ")
  .trim();

const bookmarkletUrl = "javascript:" + encodeURIComponent(`(function(){${minified}})();`);

// Write output
const outPath = resolve(__dirname, "bookmarklet.url.txt");
writeFileSync(outPath, bookmarkletUrl, "utf-8");

console.log("✅  Bookmarklet built!\n");
console.log("📁  Saved to: supabase/functions/bookmarklet/bookmarklet.url.txt\n");
console.log("─".repeat(60));
console.log("HOW TO USE:");
console.log("1. Open Chrome / Edge");
console.log("2. Press Ctrl+Shift+B to show Bookmarks Bar");
console.log("3. Right-click the bar → 'Add page'");
console.log("4. Name it: 'AcadSphere Sync'");
console.log("5. Paste the entire content of bookmarklet.url.txt as the URL");
console.log("6. Click Save");
console.log("");
console.log("USING IT:");
console.log("1. Log in to cue.christuniversity.in");
console.log("2. Navigate to your Attendance page");
console.log("3. Click the 'AcadSphere Sync' bookmark");
console.log("4. Paste your AcadSphere User ID when prompted");
console.log("5. Done — attendance syncs automatically!\n");
console.log("─".repeat(60));
console.log(`\nURL preview (first 120 chars): ${bookmarkletUrl.slice(0, 120)}...\n`);
