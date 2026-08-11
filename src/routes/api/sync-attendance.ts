import { createFileRoute } from "@tanstack/react-router";

// Helper function to update server database with CUE attendance subjects
async function saveCueSubjectsToServerDb(userId: string, subjects: any[]) {
  try {
    const { getDb } = await import("@/lib/db.server");
    const db = getDb();
    if (!db) return;

    db.exec(`
      CREATE TABLE IF NOT EXISTS subject_attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        subject_name TEXT NOT NULL,
        subject_code TEXT NOT NULL,
        classes_attended INTEGER DEFAULT 0,
        classes_conducted INTEGER DEFAULT 0,
        attendance_percentage REAL DEFAULT 100.0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, subject_id)
      );
    `);

    // Delete default seed data if custom CUE subjects are synced
    db.prepare(`DELETE FROM subject_attendance WHERE student_id IN (?, '00000000-0000-0000-0000-000000000001', 'demo-student-id') AND subject_id LIKE 'sub%'`).run(userId);

    // Clean up stale CUE duplicate rows written under old fallback student IDs
    db.prepare(`DELETE FROM subject_attendance WHERE student_id IN ('00000000-0000-0000-0000-000000000001', 'demo-student-id') AND subject_id LIKE 'cue-%'`).run();

    const upsertStmt = db.prepare(`
      INSERT INTO subject_attendance 
      (id, student_id, subject_id, subject_name, subject_code, classes_attended, classes_conducted, attendance_percentage, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(student_id, subject_id) DO UPDATE SET
        subject_name = excluded.subject_name,
        classes_attended = excluded.classes_attended,
        classes_conducted = excluded.classes_conducted,
        attendance_percentage = excluded.attendance_percentage,
        last_updated = CURRENT_TIMESTAMP
    `);

    for (const sub of subjects) {
        const code = (sub.code || "N/A").trim();
        const name = (sub.name || code).trim();
        const pct =
          total > 0
            ? Number(((attended / total) * 100).toFixed(2))
            : sub.percentage
            ? Number(Number(sub.percentage).toFixed(2))
            : 100;
        const subId = `cue-${code.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

        upsertStmt.run(crypto.randomUUID(), userId, subId, name, code, attended, total, pct);
      }
    console.log(`[sync-attendance] Saved ${subjects.length} CUE subjects into local server DB for user ${userId}`);
  } catch (err) {
    console.error("[sync-attendance] Error saving to server DB:", err);
  }
}

export const Route = createFileRoute("/api/sync-attendance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        };

        try {
          const body = await request.json();
          const { user_id, attendance_data } = body;

          const userId = user_id || "00000000-0000-0000-0000-000000000001";
          const subjects = Array.isArray(attendance_data) ? attendance_data : [];

          if (subjects.length > 0) {
            await saveCueSubjectsToServerDb(userId, subjects);
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: `Successfully synced ${subjects.length} CUE subject(s) to AcadSphere!`,
              count: subjects.length,
              subjects,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || "Failed to sync attendance" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      },
      OPTIONS: async () => {
        return new Response("ok", {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
          },
        });
      },
    },
  },
});
