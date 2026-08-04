// supabase/functions/send-demo-sms/index.ts
// On-demand demo SMS for live presentations.
// Called directly from the browser with live classroom counts.

const TWILIO_SID   = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_FROM  = Deno.env.get("TWILIO_PHONE_FROM") || Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  try {
    // Parse the live classroom data sent from the frontend
    const {
      pending = 0,
      overdue = 0,
      completed = 0,
      total = 0,
      courses = 0,
      phone,
      userName = "Student",
    } = await req.json();

    // Resolve the destination phone number
    const toPhone: string = phone || Deno.env.get("TWILIO_PHONE_NUMBER") || Deno.env.get("TWILIO_PHONE_FROM")!;
    if (!toPhone) {
      return new Response(
        JSON.stringify({ success: false, error: "No destination phone number" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "numeric",
      month: "short",
    });

    const message = [
      `📚 AcadSphere Live Report — ${now}`,
      `Hi ${userName}! Here's your classroom snapshot:`,
      ``,
      `📋 Total Assignments: ${total}`,
      `⏳ Pending Submissions: ${pending}`,
      `🚨 Overdue (Action Needed): ${overdue}`,
      `✅ Submitted / Graded: ${completed}`,
      `📖 Active Subjects: ${courses}`,
      ``,
      overdue > 0
        ? `⚠️ You have ${overdue} overdue assignment${overdue > 1 ? "s" : ""} — submit ASAP!`
        : `🎉 No overdue assignments — great job!`,
    ].join("\n");

    await sendSms(toPhone, message);

    return new Response(
      JSON.stringify({ success: true, sentTo: toPhone }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-demo-sms error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
