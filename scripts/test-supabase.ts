import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

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
      console.error("❌ Connection failed or Error querying:", error.message);
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
