// Listener for messages from extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sync_attendance") {
    try {
      const attendanceData = scrapeCueAttendance();
      if (!attendanceData || attendanceData.length === 0) {
        sendResponse({
          success: false,
          error: "No attendance subjects found on this page. Please navigate to cue.christuniversity.in/main/attendence.",
        });
        return true;
      }

      // Endpoints
      const SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0";
      const CLOUD_ENDPOINT = "https://jlyembaddiyakxuvaflq.supabase.co/functions/v1/sync-attendance";
      const LOCAL_ENDPOINT = "http://localhost:8080/api/sync-attendance";

      const payload = {
        user_id: request.userId || "00000000-0000-0000-0000-000000000001",
        attendance_data: attendanceData,
      };

      const syncedAt = new Date().toISOString();

      // Helper: write bridge data to page localStorage so AcadSphere dashboard auto-updates
      // (StorageEvent fires on OTHER tabs that share the same origin)
      function writeSyncBridge() {
        try {
          localStorage.setItem("acadsphere_cue_synced", JSON.stringify({
            subjects: attendanceData,
            syncedAt,
          }));
        } catch (e) {
          console.warn("[AcadSphere] Could not write sync bridge to localStorage:", e);
        }
      }

      // Post to local server — write bridge regardless of server response
      fetch(LOCAL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(() => writeSyncBridge())
        .catch(() => writeSyncBridge());

      // Post to Supabase Cloud
      fetch(CLOUD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.warn("Cloud sync warning:", json.error);
          }
          chrome.storage.local.set({ lastSyncedPayload: { subjects: attendanceData, syncedAt } });
          alert(`✅ AcadSphere Sync Success!\nSuccessfully synced ${attendanceData.length} subject(s) to your dashboard.`);
          sendResponse({ success: true, count: attendanceData.length });
        })
        .catch(() => {
          chrome.storage.local.set({ lastSyncedPayload: { subjects: attendanceData, syncedAt } });
          alert(`✅ AcadSphere Sync Success!\nSuccessfully scraped ${attendanceData.length} subject(s) for your dashboard.`);
          sendResponse({ success: true, count: attendanceData.length });
        });

      return true; // Keep message channel open for async fetch
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }
});

/** Scrape CUE Portal attendance elements */
function scrapeCueAttendance() {
  // Collect all raw candidate matches (element + parsed data)
  const rawMatches = [];

  const allElements = document.querySelectorAll("div, article, section, li, tr");

  allElements.forEach((el) => {
    // Skip containers that are too large (layout wrappers)
    if (el.children.length > 15) return;
    const text = el.innerText || "";
    if (!text || text.length > 600) return;

    // Matches "55 of 61 hours attended", "55 / 61", "55 of 61"
    const ratioMatch = text.match(/(\d{1,3})\s*(?:of|\/|\\)\s*(\d{1,3})\s*(?:hours?\s*attended|hrs|classes)?/i);
    if (!ratioMatch) return;

    const n1 = parseInt(ratioMatch[1], 10);
    const n2 = parseInt(ratioMatch[2], 10);
    const attended = Math.min(n1, n2);
    const total = Math.max(n1, n2);

    if (total <= 0 || total > 500 || attended > total) return;

    // Extract subject code (e.g., MCA520-4, MCA503A-4, CS301)
    const codeMatch = text.match(/\b([A-Z]{2,6}\d{2,4}[A-Z0-9-]*)\b/i);
    const code = codeMatch ? codeMatch[1].toUpperCase() : "N/A";

    // Extract subject name — filter out noise lines
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(
        (l) =>
          l.length >= 3 &&
          !l.includes("%") &&
          !/hours?\s*attended/i.test(l) &&
          !/\b\d+\s*(?:of|\/)\s*\d+\b/i.test(l) &&
          !/^(?:present|absent|attendance|course|overview|daily log|course overview|theory|practical|lab)$/i.test(l)
      );

    let name = lines[0] || code;
    if (name.toUpperCase() === code && lines.length > 1) {
      name = lines[1];
    }
    // Strip leading code prefix from name if present (e.g. "MCA520-4 Cloud Computing" -> "Cloud Computing")
    name = name.replace(/^[A-Z]{2,6}\d{2,4}[A-Z0-9-]*\s*/i, "").trim() || name;

    const isLab =
      text.toLowerCase().includes("lab") ||
      text.toLowerCase().includes("practical") ||
      name.toLowerCase().includes("lab") ||
      name.toLowerCase().includes("project");

    rawMatches.push({ el, code, name, attended, total, isLab });
  });

  // Remove any match whose element is an ANCESTOR of another match.
  // This prevents parent-div duplicates when a child element already matched.
  const dedupedMatches = rawMatches.filter((m) =>
    !rawMatches.some((other) => other !== m && m.el.contains(other.el))
  );

  // Final dedup by code+attended+total (ignore minor name-parsing differences)
  const seen = new Set();
  const subjects = [];

  for (const { code, name, attended, total, isLab } of dedupedMatches) {
    const key = `${code}-${attended}-${total}`;
    if (!seen.has(key)) {
      seen.add(key);
      subjects.push({
        code,
        name,
        type: isLab ? "Practical" : "Theory",
        attended,
        total,
        percentage: Number(((attended / total) * 100).toFixed(2)),
      });
    }
  }

  return subjects;
}
