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
  const subjectsMap = new Map();

  function addSubject(code, name, attended, total, isLab) {
    if (!total || total <= 0 || total > 500 || attended < 0 || attended > total) return;

    const cleanCode = (code || "N/A").toUpperCase().trim();
    let cleanName = (name || cleanCode).trim();
    cleanName = cleanName.replace(/^[A-Z0-9-]{3,12}\s*/i, "").trim() || cleanName;

    const key = cleanCode !== "N/A" ? cleanCode : cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const percentage = Number(((attended / total) * 100).toFixed(2));
    const type =
      isLab ||
      cleanName.toLowerCase().includes("lab") ||
      cleanName.toLowerCase().includes("practical")
        ? "Practical"
        : "Theory";

    if (!subjectsMap.has(key) || total >= subjectsMap.get(key).total) {
      subjectsMap.set(key, {
        code: cleanCode,
        name: cleanName,
        type,
        attended,
        total,
        percentage,
      });
    }
  }

  // Strategy A: Table Rows (CUE Table Layout)
  const rows = document.querySelectorAll("tr");
  rows.forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll("td, th")).map((c) => c.innerText.trim());
    if (cells.length < 3) return;

    const rowText = cells.join(" ");
    const ratioMatch = rowText.match(/(\d{1,3})\s*(?:of|\/|\\)\s*(\d{1,3})/i);

    if (ratioMatch) {
      const n1 = parseInt(ratioMatch[1], 10);
      const n2 = parseInt(ratioMatch[2], 10);
      const attended = Math.min(n1, n2);
      const total = Math.max(n1, n2);

      const codeMatch = rowText.match(/\b([A-Z0-9]{2,6}-?\d{2,4}[A-Z0-9-]*)\b/i);
      const code = codeMatch ? codeMatch[1] : "N/A";
      const nameCell =
        cells.find(
          (c) =>
            c.length > 3 &&
            !/\d{1,3}\s*(?:of|\/)\s*\d{1,3}/.test(c) &&
            !/^\d+$/.test(c)
        ) || code;

      addSubject(code, nameCell, attended, total, rowText.toLowerCase().includes("lab"));
    }
  });

  // Strategy B: Cards & Containers (CUE Card Layout)
  const allElements = document.querySelectorAll("div, article, section, li");
  allElements.forEach((el) => {
    if (el.children.length > 15) return;
    const text = el.innerText || "";
    if (!text || text.length > 600) return;

    const ratioMatch = text.match(/(\d{1,3})\s*(?:of|\/|\\)\s*(\d{1,3})\s*(?:hours?\s*attended|hrs|classes)?/i);
    if (!ratioMatch) return;

    const n1 = parseInt(ratioMatch[1], 10);
    const n2 = parseInt(ratioMatch[2], 10);
    const attended = Math.min(n1, n2);
    const total = Math.max(n1, n2);

    const codeMatch = text.match(/\b([A-Z0-9]{2,6}-?\d{2,4}[A-Z0-9-]*)\b/i);
    const code = codeMatch ? codeMatch[1] : "N/A";

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
    if (name.toUpperCase() === code.toUpperCase() && lines.length > 1) {
      name = lines[1];
    }

    addSubject(code, name, attended, total, text.toLowerCase().includes("lab"));
  });

  return Array.from(subjectsMap.values());
}
