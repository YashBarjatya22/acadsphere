/**
 * Supabase Edge Function: sync-attendance
 * ───────────────────────────────────────
 * Ingestion endpoint for the AcadSphere CUE Chrome Extension.
 * Receives scraped attendance data from cue.christuniversity.in and upserts it for the specified user_id.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

interface CueSubject {
  name: string;
  code: string;
  type: string;
  attended: number;
  total: number;
  percentage: number;
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  try {
    const { user_id, attendance_data } = await req.json();

    if (!user_id || !attendance_data || !Array.isArray(attendance_data)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id and attendance_data array are required." }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // Initialize Supabase Admin Client using Service Role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Upsert each subject into the student_attendance table
    const recordsToInsert = (attendance_data as CueSubject[]).map((sub) => ({
      user_id,
      subject_code: sub.code,
      subject_name: sub.name,
      subject_type: sub.type || "Theory",
      attended_classes: sub.attended,
      total_classes: sub.total,
      percentage:
        sub.total > 0
          ? Number(((sub.attended / sub.total) * 100).toFixed(2))
          : sub.percentage
          ? Number(Number(sub.percentage).toFixed(2))
          : 0,
      last_synced_at: new Date().toISOString(),
    }));

    // Upsert to student_attendance table using unique constraint on (user_id, subject_code)
    const { error: dbErr } = await supabaseAdmin
      .from("student_attendance")
      .upsert(recordsToInsert, { onConflict: "user_id,subject_code" });

    if (dbErr) {
      console.error("[sync-attendance] DB Upsert Error:", dbErr.message);
      return new Response(
        JSON.stringify({ error: `Database upsert failed: ${dbErr.message}` }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${recordsToInsert.length} subject(s) successfully!`,
        count: recordsToInsert.length,
        subjects: recordsToInsert,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err: any) {
    console.error("[sync-attendance] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process attendance ingestion" }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
});
