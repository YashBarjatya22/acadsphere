import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

// In development, ensure environment variables from .env.local are loaded
if (process.env.NODE_ENV !== "production") {
    config({ path: path.resolve(process.cwd(), ".env.local") });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase variables in .env.local (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
}

// Server-side Supabase client using Service Role Key to bypass RLS for internal operations
// (RLS is enforced manually or via user-forwarded auth depending on context)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
