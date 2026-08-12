import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const SUPABASE_URL = "https://jlyembaddiyakxuvaflq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function exportEmails() {
  console.log("Fetching all student emails from Supabase...\n");

  // Try the get_all_students RPC first (used by the community page)
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_all_students");

  let emails = [];

  if (!rpcError && rpcData && rpcData.length > 0) {
    console.log(`Found ${rpcData.length} students via get_all_students RPC`);
    emails = rpcData
      .filter((s) => s.email)
      .map((s) => s.email.trim().toLowerCase())
      .sort();
  } else {
    // Fallback: query profiles table directly
    console.log("Falling back to profiles table...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .order("email", { ascending: true });

    if (profileError) {
      console.error("profiles table error:", profileError.message);
    } else if (profileData && profileData.length > 0) {
      console.log(`Found ${profileData.length} students in profiles table`);
      emails = profileData
        .filter((p) => p.email)
        .map((p) => p.email.trim().toLowerCase())
        .sort();
    }
  }

  if (emails.length === 0) {
    // Last resort: try student_profiles table
    const { data: spData, error: spError } = await supabase
      .from("student_profiles")
      .select("email")
      .order("email", { ascending: true });

    if (!spError && spData) {
      emails = spData
        .filter((p) => p.email)
        .map((p) => p.email.trim().toLowerCase())
        .sort();
      console.log(`Found ${emails.length} students in student_profiles table`);
    }
  }

  if (emails.length === 0) {
    console.error("❌ Could not fetch emails — no data found in any table.");
    process.exit(1);
  }

  // Remove duplicates
  const uniqueEmails = [...new Set(emails)];

  const outputPath = "./scratch/student_emails.txt";
  writeFileSync(outputPath, uniqueEmails.join("\n") + "\n", "utf-8");

  console.log(`\n✅ Exported ${uniqueEmails.length} unique emails to: ${outputPath}`);
  console.log("\n--- Preview (first 10) ---");
  uniqueEmails.slice(0, 10).forEach((e) => console.log(" ", e));
  if (uniqueEmails.length > 10) {
    console.log(`  ... and ${uniqueEmails.length - 10} more`);
  }
}

exportEmails().catch(console.error);
