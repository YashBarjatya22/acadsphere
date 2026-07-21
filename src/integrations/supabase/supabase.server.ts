import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

// In development, ensure environment variables from .env.local are loaded
if (process.env.NODE_ENV !== "production") {
    config({ path: path.resolve(process.cwd(), ".env.local") });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("⚠️ [Supabase Server Warning] Missing Supabase URL or Key. Server operations will fail or fallback to SQLite.");
}

// Server-side Supabase client using Service Role Key (or fallback anon key)
export const supabaseServer = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
      })
    : null as any;
