// supabase/functions/send-sms-reminders/index.ts
// Triggered by pg_cron every 15 minutes.
// Uses raw fetch() to Twilio REST API — no heavy SDK needed in Deno/Edge.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL   = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_SID     = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_TOKEN   = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_FROM    = Deno.env.get("TWILIO_PHONE_FROM") || Deno.env.get("TWILIO_PHONE_NUMBER")!;   // e.g. +1415XXXXXXX

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Twilio SMS helper ─────────────────────────────────────────────────────────
async function sendSms(to: string, body: string): Promise<void> {
  const creds = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }).toString(),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twilio ${res.status}: ${err}`);
  }
}

// ── Time helpers ──────────────────────────────────────────────────────────────
const HOUR = 60 * 60 * 1000;
const DAY  = 24 * HOUR;

function hoursUntil(due: Date, now: Date): number {
  return (due.getTime() - now.getTime()) / HOUR;
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async () => {
  const now = new Date();

  // 1. Fetch all PENDING tasks joined with phone_number from profiles
  const { data: tasks, error } = await supabase
    .from("classroom_tasks")
    .select(`
      id,
      user_id,
      title,
      course_name,
      due_date,
      notified_24h,
      notified_6h,
      notified_1h,
      last_overdue_notice,
      profiles!inner(phone_number, sms_notifications_enabled)
    `)
    .eq("status", "PENDING")
    .not("profiles.phone_number", "is", null)
    .eq("profiles.sms_notifications_enabled", true);

  if (error) {
    console.error("DB fetch error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!tasks || tasks.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  // 2. Build SMS jobs and DB updates concurrently
  const smsJobs:   Promise<void>[]                     = [];
  const dbUpdates: { id: string; patch: Record<string, unknown> }[] = [];

  for (const task of tasks) {
    const profile = (task as any).profiles;
    const phone: string = profile?.phone_number;
    if (!phone) continue;

    // Tasks without a due date cannot be timed — skip
    if (!task.due_date) continue;

    const due   = new Date(task.due_date);
    const diff  = hoursUntil(due, now); // negative = past due
    const patch: Record<string, unknown> = {};

    // ── Pre-due notifications ─────────────────────────────────────────────────

    // 24h reminder
    if (!task.notified_24h && diff > 0 && diff <= 24) {
      const msg = `📚 AcadSphere Reminder: "${task.title}" (${task.course_name}) is due in ~${Math.ceil(diff)}h. Don't miss it!`;
      smsJobs.push(sendSms(phone, msg).catch(console.error));
      patch.notified_24h = true;
    }

    // 6h reminder
    if (!task.notified_6h && diff > 0 && diff <= 6) {
      const msg = `⏰ AcadSphere: "${task.title}" is due in ~${Math.ceil(diff)}h. Submit soon!`;
      smsJobs.push(sendSms(phone, msg).catch(console.error));
      patch.notified_6h = true;
    }

    // 1h reminder
    if (!task.notified_1h && diff > 0 && diff <= 1) {
      const msg = `🚨 FINAL REMINDER: "${task.title}" is due in under 1 hour! Submit now.`;
      smsJobs.push(sendSms(phone, msg).catch(console.error));
      patch.notified_1h = true;
    }

    // ── Overdue daily notifications ───────────────────────────────────────────
    if (diff < 0) {
      const daysOverdue = Math.abs(diff) / 24;

      // Stop after 14 days past due (business logic cutoff)
      if (daysOverdue <= 14) {
        const lastNotice = task.last_overdue_notice
          ? new Date(task.last_overdue_notice)
          : null;
        const shouldSend =
          !lastNotice || now.getTime() - lastNotice.getTime() >= DAY;

        if (shouldSend) {
          const daysText = Math.ceil(daysOverdue);
          const msg = `⚠️ AcadSphere: "${task.title}" (${task.course_name}) is ${daysText} day${daysText > 1 ? "s" : ""} overdue. Please submit as soon as possible.`;
          smsJobs.push(sendSms(phone, msg).catch(console.error));
          patch.last_overdue_notice = now.toISOString();
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      dbUpdates.push({ id: task.id, patch });
    }
  }

  // 3. Fire all SMS concurrently
  await Promise.allSettled(smsJobs);

  // 4. Write DB flag updates concurrently to prevent duplicate sends on next cron run
  await Promise.allSettled(
    dbUpdates.map(({ id, patch }) =>
      supabase.from("classroom_tasks").update(patch).eq("id", id)
    )
  );

  console.log(`SMS cron ran: ${smsJobs.length} message(s) queued, ${dbUpdates.length} row(s) updated.`);

  return new Response(
    JSON.stringify({ sent: smsJobs.length, updated: dbUpdates.length }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
});
