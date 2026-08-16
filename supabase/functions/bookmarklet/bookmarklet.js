/**
 * AcadSphere CUE Sync Bookmarklet
 * ──────────────────────────────────────────────────────────────────────────────
 * Run this while logged in to cue.christuniversity.in.
 * It reads your access token from localStorage/sessionStorage (already set by
 * the CUE portal), fetches attendance from the ESPRO API using your existing
 * session, then upserts it to AcadSphere via the sync-attendance edge function.
 *
 * To generate the minified bookmarklet URL, run:
 *   node supabase/functions/bookmarklet/build.mjs
 */

(async function acadSphereCueSync() {
  // ── Config (injected at build time) ────────────────────────────────────────
  const SUPABASE_URL = "__SUPABASE_URL__";
  const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";
  const SYNC_URL = `${SUPABASE_URL}/functions/v1/sync-attendance`;

  // ── Step 1: Retrieve the OIDC access token the CUE portal already stored ──
  function getToken() {
    // Keycloak stores the token in localStorage/sessionStorage under various keys
    for (const store of [localStorage, sessionStorage]) {
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (!key) continue;
        try {
          const val = JSON.parse(store.getItem(key) || "");
          if (val && val.access_token) return val.access_token;
          if (val && val.token) return val.token;
          if (typeof val === "string" && val.startsWith("eyJ")) return val;
        } catch {}
        const raw = store.getItem(key) || "";
        if (raw.startsWith("eyJ")) return raw; // raw JWT
      }
    }
    // Last resort: try Keycloak's default key pattern
    const kcKey = Object.keys(localStorage).find(
      (k) => k.includes("token") || k.includes("kc-")
    );
    if (kcKey) return localStorage.getItem(kcKey);
    return null;
  }

  // ── Step 2: Fetch semesters then attendance from ESPRO API ─────────────────
  const ESPRO_BASE = "https://espro.christuniversity.in:84";
  const SEM_URL = `${ESPRO_BASE}/ClassRoomAttendanceServices/Student/StudentAttendance/getStudentSemesters`;

  async function fetchWithToken(url, method, body, token) {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    return fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  }

  function normalise(raw) {
    const seen = new Set();
    return raw
      .map((item) => {
        const code = String(
          item.subjectCode ?? item.courseCode ?? item.subject_code ?? item.code ?? "N/A"
        ).trim();
        const name = String(
          item.subjectName ?? item.courseName ?? item.subject_name ??
          item.course_name ?? item.name ?? item.subject ?? ""
        ).trim();
        const attended = Math.max(
          0,
          Number(
            item.attendedHours ?? item.attended_hours ?? item.attendedClasses ??
            item.classesAttended ?? item.attended ?? item.present ?? 0
          )
        );
        const total = Math.max(
          0,
          Number(
            item.conductedHours ?? item.conducted_hours ?? item.totalHours ??
            item.total_hours ?? item.totalClasses ?? item.classesConducted ??
            item.total ?? item.conducted ?? 0
          )
        );
        if (!name && code === "N/A") return null;
        const subjectName = name || code;
        const key = `${code}-${subjectName}`.toLowerCase();
        if (seen.has(key)) return null;
        seen.add(key);
        const isLab =
          String(item.type ?? item.courseType ?? item.subject_type ?? "")
            .toLowerCase()
            .includes("lab") ||
          subjectName.toLowerCase().includes("lab") ||
          subjectName.toLowerCase().includes("practical");
        return {
          code,
          name: subjectName,
          type: isLab ? "Practical" : "Theory",
          attended: Math.round(attended),
          total: Math.round(total),
          percentage: total > 0 ? Math.round((attended / total) * 10000) / 100 : 100,
        };
      })
      .filter(Boolean);
  }

  // ── Prompt for User ID ──────────────────────────────────────────────────────
  const userId = prompt(
    "🎓 AcadSphere CUE Sync\n\nPaste your AcadSphere User ID below.\n(Find it on the Attendance page → Sync button)",
    ""
  );
  if (!userId || !userId.trim()) {
    alert("❌ Cancelled — no user ID provided.");
    return;
  }

  // ── Status overlay ──────────────────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;top:20px;right:20px;z-index:999999;background:#1e1b4b;color:#fff;border-radius:12px;padding:16px 22px;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.4);min-width:260px;line-height:1.6;border:1px solid rgba(255,255,255,0.1)";
  overlay.innerHTML = "🔄 AcadSphere<br><span style='opacity:0.7;font-weight:400'>Fetching your attendance...</span>";
  document.body.appendChild(overlay);

  const setStatus = (html) => { overlay.innerHTML = html; };

  try {
    // ── Try to get token from storage ────────────────────────────────────────
    const token = getToken();

    let subjects = [];

    if (token) {
      setStatus("🔄 AcadSphere<br><span style='opacity:0.7;font-weight:400'>Fetching semester list...</span>");

      const semRes = await fetchWithToken(SEM_URL, "POST", {}, token);
      if (!semRes.ok) throw new Error(`Semester API returned ${semRes.status}`);

      const semJson = await semRes.json();
      const semesters = Array.isArray(semJson)
        ? semJson
        : semJson?.data ?? semJson?.semesters ?? semJson?.response ?? [];

      const currentSem =
        semesters.find(
          (s) => s.isCurrent === true || s.isCurrent === "Y" || s.isCurrent === 1 || s.isCurrentSemester === true
        ) ?? semesters[0];

      if (!currentSem) throw new Error("Could not detect current semester");

      const useNew =
        currentSem.callKpServiceNew === true ||
        currentSem.callKpServiceNew === "true" ||
        currentSem.callKpServiceNew === 1;
      const termNo = String(currentSem.termNumber ?? currentSem.termNo ?? "");
      const sessionId = String(currentSem.sessionId ?? currentSem.session_id ?? "");

      let attUrl = useNew && termNo
        ? `${ESPRO_BASE}/KPServiceNew/rest/getAttendanceDetailsBySemester?termNo=${termNo}`
        : sessionId
        ? `${ESPRO_BASE}/ClassRoomAttendanceServices/Student/StudentAttendance/getCourseWiseAttendance?sessionId=${sessionId}`
        : "";

      if (!attUrl) throw new Error("Could not determine attendance API URL");

      setStatus("🔄 AcadSphere<br><span style='opacity:0.7;font-weight:400'>Fetching attendance data...</span>");

      const attRes = await fetchWithToken(attUrl, "GET", undefined, token);
      if (!attRes.ok) throw new Error(`Attendance API returned ${attRes.status}`);

      const attJson = await attRes.json();
      const rawList =
        attJson?.attendanceDetails ??
        attJson?.courseWiseAttendance ??
        attJson?.subjects ??
        attJson?.courses ??
        attJson?.data ??
        (Array.isArray(attJson) ? attJson : []);

      subjects = normalise(rawList);
    }

    if (subjects.length === 0) {
      throw new Error("No attendance data found. Make sure you are on cue.christuniversity.in and logged in.");
    }

    // ── Sync to AcadSphere ──────────────────────────────────────────────────
    setStatus(`🔄 AcadSphere<br><span style='opacity:0.7;font-weight:400'>Syncing ${subjects.length} subjects...</span>`);

    const syncRes = await fetch(SYNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ user_id: userId.trim(), attendance_data: subjects }),
    });

    const syncData = await syncRes.json();
    if (!syncRes.ok || syncData.error) throw new Error(syncData.error || "Sync failed");

    setStatus(`✅ Synced!<br><span style='opacity:0.7;font-weight:400'>${syncData.count} subjects → AcadSphere</span>`);
    setTimeout(() => overlay.remove(), 4000);
  } catch (err) {
    setStatus(`❌ Error<br><span style='opacity:0.7;font-weight:400;font-size:11px'>${err.message}</span><br><br><span style='font-size:11px;opacity:0.6;cursor:pointer' onclick='this.parentElement.parentElement.remove()'>Click to dismiss</span>`);
    console.error("[AcadSphere Bookmarklet]", err);
  }
})();
