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

      // Supabase Edge Function endpoint for sync-attendance
      const SYNC_ENDPOINT = "https://jlyembaddiyakxuvaflq.supabase.co/functions/v1/sync-attendance";

      fetch(SYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: request.userId,
          attendance_data: attendanceData,
        }),
      })
        .then(async (res) => {
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(json.error || `Server returned status ${res.status}`);
          }
          alert(`✅ AcadSphere Sync Success!\nSuccessfully synced ${attendanceData.length} subject(s) to your dashboard.`);
          sendResponse({ success: true, count: attendanceData.length });
        })
        .catch((err) => {
          alert(`❌ AcadSphere Sync Error:\n${err.message}`);
          sendResponse({ success: false, error: err.message });
        });

      return true; // Keep message channel open for async fetch
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }
});

/** Scrape CUE Portal attendance elements */
function scrapeCueAttendance() {
  const subjects = [];

  // Strategy 1: Div / Card Grid Containers (Modern CUE Portal)
  const cards = document.querySelectorAll(
    ".card, .subject-card, .attendance-card, .course-item, div[class*='card'], div[class*='subject'], div[class*='course']"
  );
  if (cards && cards.length > 0) {
    cards.forEach((card) => {
      const text = card.innerText || "";
      const ratioMatch = text.match(/(\d{1,3})\s*[\/|\\]\s*(\d{1,3})/);
      if (ratioMatch) {
        const codeMatch = text.match(/\b([A-Z]{2,4}\d{3,4}[A-Z]?)\b/);
        const code = codeMatch ? codeMatch[1] : "N/A";

        const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 3);
        const name = lines.find((l) => !l.includes("%") && !/\b\d+\/\d+\b/.test(l) && l !== code) || code;

        const n1 = parseInt(ratioMatch[1], 10);
        const n2 = parseInt(ratioMatch[2], 10);
        const attended = Math.min(n1, n2);
        const total = Math.max(n1, n2);

        if (total > 0 && name) {
          subjects.push({
            code,
            name,
            type: text.toLowerCase().includes("lab") ? "Practical" : "Theory",
            attended,
            total,
            percentage: Math.round((attended / total) * 100),
          });
        }
      }
    });
  }

  // Strategy 2: Table Rows
  if (subjects.length === 0) {
    const rows = document.querySelectorAll("tr");
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((c) => c.innerText.trim());
      if (cells.length >= 3) {
        const numbers = cells
          .map((c) => parseFloat(c.replace("%", "")))
          .filter((v) => !isNaN(v) && v >= 0 && v <= 1000);

        if (numbers.length >= 2) {
          const pct = cells.find((c) => c.includes("%"));
          let attended = 0;
          let total = 0;

          if (pct && numbers.length >= 3) {
            total = Math.max(numbers[0], numbers[1]);
            attended = Math.min(numbers[0], numbers[1]);
          } else if (numbers.length >= 2) {
            total = Math.max(numbers[0], numbers[1]);
            attended = Math.min(numbers[0], numbers[1]);
          }

          const code = cells.find((c) => /^[A-Z0-9]{3,12}$/i.test(c) && !/^\d+$/.test(c)) || "N/A";
          const name = cells.find((c) => c !== code && c.length > 3 && isNaN(Number(c))) || "";

          if (total > 0 && name) {
            subjects.push({
              code,
              name,
              type: row.innerText.toLowerCase().includes("lab") ? "Practical" : "Theory",
              attended: Math.round(attended),
              total: Math.round(total),
              percentage: total > 0 ? Math.round((attended / total) * 100) : 0,
            });
          }
        }
      }
    });
  }

  // Strategy 3: Text line regex matching on entire body
  if (subjects.length === 0) {
    const bodyText = document.body.innerText || "";
    const lineRegex = /([A-Z]{2,4}\d{3,4}[A-Z]?)\s*[-:]?\s*([A-Za-z0-9\s&,.-]{4,50})\s+(\d{1,3})\s*[\/|\\]\s*(\d{1,3})/gi;
    for (const match of bodyText.matchAll(lineRegex)) {
      const code = match[1];
      const name = match[2].trim();
      const n1 = parseInt(match[3], 10);
      const n2 = parseInt(match[4], 10);
      const attended = Math.min(n1, n2);
      const total = Math.max(n1, n2);

      if (total > 0 && name) {
        subjects.push({
          code,
          name,
          type: name.toLowerCase().includes("lab") ? "Practical" : "Theory",
          attended,
          total,
          percentage: Math.round((attended / total) * 100),
        });
      }
    }
  }

  // Deduplicate
  const seen = new Set();
  return subjects.filter((s) => {
    const key = (s.code + "-" + s.name).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
