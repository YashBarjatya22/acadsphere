// ─── AcadSphere CUE Sync — Console Script ───────────────────────────────────
// Run this in Chrome DevTools Console (F12) while on cue.christuniversity.in
// Paste the entire block below and press Enter
// ────────────────────────────────────────────────────────────────────────────

(async () => {
  const SUPABASE_URL = "https://jlyembaddiyakxuvaflq.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0";
  const ESPRO_BASE = "https://espro.christuniversity.in:84";

  // Step 1: Find the Keycloak access token from storage
  let token = null;
  for (const store of [localStorage, sessionStorage]) {
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      const raw = store.getItem(k) || "";
      try {
        const p = JSON.parse(raw);
        if (p?.access_token) { token = p.access_token; break; }
        if (p?.token && typeof p.token === "string" && p.token.startsWith("eyJ")) { token = p.token; break; }
      } catch {}
      if (raw.startsWith("eyJ") && raw.includes(".")) { token = raw; break; }
    }
    if (token) break;
  }
  console.log("[AcadSphere] Token found:", !!token, token ? token.slice(0,30)+"..." : "");

  // Step 2: Ask for AcadSphere User ID
  const userId = prompt("🎓 AcadSphere Sync\n\nPaste your AcadSphere User ID:\n(Find it in AcadSphere → Attendance → Sync button)");
  if (!userId?.trim()) { console.log("[AcadSphere] Cancelled."); return; }

  // Step 3: Show overlay
  const overlay = document.createElement("div");
  overlay.id = "__acadsphere_overlay__";
  overlay.style.cssText = "position:fixed;top:20px;right:20px;z-index:2147483647;background:#1e1b4b;color:#fff;border-radius:12px;padding:16px 22px;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.5);min-width:280px;line-height:1.6;border:1px solid rgba(255,255,255,0.12)";
  const set = (html) => { overlay.innerHTML = html; };
  set("🔄 AcadSphere<br><span style='opacity:0.7;font-weight:400'>Fetching semester list...</span>");
  document.body.appendChild(overlay);

  try {
    if (!token) throw new Error("No Keycloak token found in storage. Make sure you are logged in.");

    // Step 4: Fetch semesters
    const semRes = await fetch(`${ESPRO_BASE}/ClassRoomAttendanceServices/Student/StudentAttendance/getStudentSemesters`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include"
    });
    if (!semRes.ok) throw new Error(`Semester API: HTTP ${semRes.status}`);
    const semJson = await semRes.json();
    console.log("[AcadSphere] Semesters:", semJson);

    const sems = Array.isArray(semJson) ? semJson : (semJson?.data ?? semJson?.semesters ?? semJson?.response ?? []);
    const sem = sems.find(s => s.isCurrent === true || s.isCurrent === "Y" || s.isCurrent === 1 || s.isCurrentSemester === true) ?? sems[0];
    if (!sem) throw new Error("No semester found in response: " + JSON.stringify(semJson).slice(0, 200));

    console.log("[AcadSphere] Current semester:", sem);
    const useNew = sem.callKpServiceNew === true || sem.callKpServiceNew === "true" || sem.callKpServiceNew === 1;
    const termNo = String(sem.termNumber ?? sem.termNo ?? "");
    const sessionId = String(sem.sessionId ?? sem.session_id ?? "");
    const attUrl = useNew && termNo
      ? `${ESPRO_BASE}/KPServiceNew/rest/getAttendanceDetailsBySemester?termNo=${termNo}`
      : sessionId
      ? `${ESPRO_BASE}/ClassRoomAttendanceServices/Student/StudentAttendance/getCourseWiseAttendance?sessionId=${sessionId}`
      : "";
    if (!attUrl) throw new Error("Cannot determine attendance URL. Semester data: " + JSON.stringify(sem).slice(0,200));

    // Step 5: Fetch attendance
    set("🔄 AcadSphere<br><span style='opacity:0.7;font-weight:400'>Fetching attendance data...</span>");
    const attRes = await fetch(attUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      credentials: "include"
    });
    if (!attRes.ok) throw new Error(`Attendance API: HTTP ${attRes.status}`);
    const attJson = await attRes.json();
    console.log("[AcadSphere] Raw attendance:", attJson);

    const rawList = attJson?.attendanceDetails ?? attJson?.courseWiseAttendance ?? attJson?.subjects ?? attJson?.courses ?? attJson?.data ?? (Array.isArray(attJson) ? attJson : []);
    if (!rawList.length) throw new Error("Empty attendance list in response. Check console for raw data.");

    // Step 6: Normalise
    const seen = new Set();
    const subjects = rawList.map(item => {
      const code = String(item.subjectCode ?? item.courseCode ?? item.subject_code ?? item.code ?? "N/A").trim();
      const name = String(item.subjectName ?? item.courseName ?? item.subject_name ?? item.course_name ?? item.name ?? item.subject ?? "").trim();
      const attended = Math.max(0, Number(item.attendedHours ?? item.attended_hours ?? item.attendedClasses ?? item.classesAttended ?? item.attended ?? item.present ?? 0));
      const total = Math.max(0, Number(item.conductedHours ?? item.conducted_hours ?? item.totalHours ?? item.total_hours ?? item.totalClasses ?? item.classesConducted ?? item.total ?? item.conducted ?? 0));
      if (!name && code === "N/A") return null;
      const subjectName = name || code;
      const key = `${code}-${subjectName}`.toLowerCase();
      if (seen.has(key)) return null;
      seen.add(key);
      const isLab = String(item.type ?? item.courseType ?? item.subject_type ?? "").toLowerCase().includes("lab") || subjectName.toLowerCase().includes("lab") || subjectName.toLowerCase().includes("practical");
      return { code, name: subjectName, type: isLab ? "Practical" : "Theory", attended: Math.round(attended), total: Math.round(total), percentage: total > 0 ? Math.round((attended/total)*10000)/100 : 100 };
    }).filter(Boolean);

    console.log("[AcadSphere] Parsed subjects:", subjects);
    if (!subjects.length) throw new Error("No subjects could be parsed from attendance data.");

    // Step 7: Sync to Supabase
    set(`🔄 AcadSphere<br><span style='opacity:0.7;font-weight:400'>Syncing ${subjects.length} subjects...</span>`);
    const syncRes = await fetch(`${SUPABASE_URL}/functions/v1/sync-attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ user_id: userId.trim(), attendance_data: subjects })
    });
    const syncData = await syncRes.json();
    console.log("[AcadSphere] Sync result:", syncData);
    if (!syncRes.ok || syncData.error) throw new Error(syncData.error || "Supabase sync failed");

    set(`✅ Synced!<br><span style='opacity:0.7;font-weight:400'>${syncData.count} subjects → AcadSphere</span>`);
    setTimeout(() => overlay.remove(), 5000);
    console.log(`[AcadSphere] ✅ Done! Synced ${syncData.count} subjects.`);
  } catch (err) {
    set(`❌ Error<br><span style='opacity:0.7;font-weight:400;font-size:11px'>${err.message}</span><br><br><span style='font-size:11px;opacity:0.6;cursor:pointer' onclick='document.getElementById("__acadsphere_overlay__").remove()'>Click to dismiss</span>`);
    console.error("[AcadSphere] Error:", err);
  }
})();
