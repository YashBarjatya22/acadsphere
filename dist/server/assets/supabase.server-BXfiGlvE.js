import { createClient } from "@supabase/supabase-js";
import "dotenv";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️ [Supabase Server Warning] Missing Supabase URL or Key. Server operations will fail or fallback to SQLite.");
}
const supabaseServer = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;
export {
  supabaseServer as s
};
