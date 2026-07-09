import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import dns from "node:dns";

// DNS patch to bypass local getaddrinfo failures
const originalLookup = dns.lookup;
dns.lookup = function (hostname: string, options: any, callback: any) {
  if (hostname === "icyrztdyrucqmeklgpfs.supabase.co") {
    const cb = typeof options === "function" ? options : callback;
    const opts = typeof options === "object" ? options : {};
    const ip = "172.67.75.143";
    if (cb) {
      if (opts.all) {
        cb(null, [{ address: ip, family: 4 }]);
      } else {
        cb(null, ip, 4);
      }
      return;
    }
  }
  return originalLookup.apply(this, arguments as any);
} as any;

// Load .env.local manually since npx tsx might not load it
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.log("No .env.local found.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySupabase() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  
  try {
    // Attempt to read from the profiles table
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.error("❌ SUCCESSFUL CONNECTION, BUT TABLES ARE MISSING.");
        console.error("Please run the SQL migration in 'supabase/migrations/0001_complete_schema.sql' inside your Supabase Dashboard SQL Editor!");
        return;
      }
      console.error("❌ Connection failed or Error querying:", error);
      return;
    }
    
    console.log("✅ Successfully connected to Supabase and queried tables!");
    console.log("Rows returned:", data?.length);

    // Attempt to check buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("❌ Could not list storage buckets:", bucketError.message);
    } else {
      console.log("✅ Storage buckets configured:", buckets?.map(b => b.name).join(", ") || "None");
    }

  } catch (err: any) {
    console.error("❌ Unexpected error:", err.message);
  }
}

verifySupabase();
