// background.js — AcadSphere CUE Attendance Headless Auto-Sync
// Service Worker for MV3 Chrome Extension
// Fires every 6 hours to silently scrape and sync attendance without user interaction.

const SUPABASE_URL = "https://jlyembaddiyakxuvaflq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0";
const CLOUD_ENDPOINT = `${SUPABASE_URL}/functions/v1/sync-attendance`;
const CUE_ATTENDANCE_URL = "https://cue.christuniversity.in/main/attendence";
const ALARM_NAME = "acadSphereAutoSync";

// ── Setup alarm on install / service worker startup ───────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["autoSyncEnabled"], (result) => {
    if (result.autoSyncEnabled !== false) {
      scheduleAutoSync();
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["autoSyncEnabled"], (result) => {
    if (result.autoSyncEnabled !== false) {
      scheduleAutoSync();
    }
  });
});

// ── Schedule alarm (every 6 hours) ───────────────────────────────────────────
function scheduleAutoSync() {
  chrome.alarms.get(ALARM_NAME, (existing) => {
    if (!existing) {
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: 1,           // first run after 1 min
        periodInMinutes: 360,        // then every 6 hours
      });
      console.log("[AcadSphere] Auto-sync alarm scheduled every 6 hours.");
    }
  });
}

function clearAutoSync() {
  chrome.alarms.clear(ALARM_NAME, (wasCleared) => {
    console.log("[AcadSphere] Auto-sync alarm cleared:", wasCleared);
  });
}

// ── Listen for popup toggle messages ─────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enable_auto_sync") {
    chrome.storage.local.set({ autoSyncEnabled: true });
    scheduleAutoSync();
    sendResponse({ ok: true });
  } else if (request.action === "disable_auto_sync") {
    chrome.storage.local.set({ autoSyncEnabled: false });
    clearAutoSync();
    sendResponse({ ok: true });
  } else if (request.action === "trigger_manual_bg_sync") {
    // Popup can trigger an immediate headless sync
    runHeadlessSync().then((result) => sendResponse(result)).catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // async
  }
});

// ── Alarm fires → run headless sync ──────────────────────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log("[AcadSphere] Auto-sync alarm fired at", new Date().toISOString());
    runHeadlessSync()
      .then((result) => {
        console.log("[AcadSphere] Auto-sync complete:", result);
        chrome.storage.local.set({
          lastAutoSync: new Date().toISOString(),
          lastAutoSyncResult: result,
        });
      })
      .catch((err) => {
        console.error("[AcadSphere] Auto-sync failed:", err.message);
        chrome.storage.local.set({
          lastAutoSync: new Date().toISOString(),
          lastAutoSyncResult: { success: false, error: err.message },
        });
      });
  }
});

// ── Core headless sync logic ──────────────────────────────────────────────────
async function runHeadlessSync() {
  // 1. Load userId from storage
  const stored = await chrome.storage.local.get(["userId"]);
  const userId = stored.userId;

  if (!userId || userId === "00000000-0000-0000-0000-000000000001") {
    console.warn("[AcadSphere] No userId set — skipping auto-sync. Open the extension popup and paste your User ID.");
    return { success: false, error: "No User ID configured. Open extension popup to set it." };
  }

  // 2. Create hidden inactive tab pointing to CUE attendance page
  console.log("[AcadSphere] Opening hidden CUE tab for headless sync...");
  const tab = await new Promise((resolve, reject) => {
    chrome.tabs.create(
      { url: CUE_ATTENDANCE_URL, active: false },
      (newTab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(newTab);
        }
      }
    );
  });

  const tabId = tab.id;

  try {
    // 3. Wait for page to fully load (poll until status === 'complete', max 30s)
    await waitForTabLoad(tabId, 30000);

    // 4. Inject scraping script and run sync
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: headlessScrapeAndSync,
      args: [userId, CLOUD_ENDPOINT, SUPABASE_ANON_KEY],
    });

    const result = results?.[0]?.result || { success: false, error: "No result from injected script" };
    return result;
  } finally {
    // 5. Always close the hidden tab (even on failure)
    chrome.tabs.remove(tabId, () => {
      if (chrome.runtime.lastError) {
        console.warn("[AcadSphere] Could not close hidden tab:", chrome.runtime.lastError.message);
      } else {
        console.log("[AcadSphere] Hidden CUE tab closed.");
      }
    });
  }
}

// ── Wait for a tab to finish loading ─────────────────────────────────────────
function waitForTabLoad(tabId, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error(`Tab ${tabId} did not finish loading within ${timeoutMs}ms`));
    }, timeoutMs);

    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        // Extra 2s buffer for JS frameworks to render the attendance table
        setTimeout(resolve, 2000);
      }
    }

    chrome.tabs.onUpdated.addListener(listener);

    // Also check if it's already complete
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        clearTimeout(timeout);
        reject(new Error(chrome.runtime.lastError.message));
      } else if (tab.status === "complete") {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 2000);
      }
    });
  });
}

// ── Injected into hidden tab: scrape + POST to Supabase ──────────────────────
// This function runs inside the CUE page context (NOT in the service worker)
function headlessScrapeAndSync(userId, cloudEndpoint, supabaseAnonKey) {
  // ── Scraping logic (mirrors content.js scrapeCueAttendance) ──
  const subjectsMap = new Map();

  function addSubject(code, name, attended, total, isLab) {
    if (!total || total < 3 || total > 150 || attended < 0 || attended > total) return;
    const cleanCode = (code || "N/A").toUpperCase().trim();
    let cleanName = (name || cleanCode).trim();
    cleanName = cleanName.replace(/^[A-Z0-9-]{3,12}\s*/i, "").trim() || cleanName;
    const key = cleanCode !== "N/A" ? cleanCode : cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const percentage = Number(((attended / total) * 100).toFixed(2));
    const type = isLab ||
      cleanName.toLowerCase().includes("lab") ||
      cleanName.toLowerCase().includes("practical") ||
      cleanName.toLowerCase().includes("project")
        ? "Practical" : "Theory";
    if (!subjectsMap.has(key)) {
      subjectsMap.set(key, { code: cleanCode, name: cleanName, type, attended, total, percentage });
    }
  }

  // Strategy A: table rows
  document.querySelectorAll("tr").forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll("td, th")).map((c) => c.innerText.trim());
    if (cells.length < 3) return;
    const rowText = cells.join(" ");
    const ratioMatch = rowText.match(/(\d{1,3})\s*(?:of|\/|\\)\s*(\d{1,3})/i);
    if (ratioMatch) {
      const n1 = parseInt(ratioMatch[1], 10), n2 = parseInt(ratioMatch[2], 10);
      const attended = Math.min(n1, n2), total = Math.max(n1, n2);
      const codeMatch = rowText.match(/\b([A-Z0-9]{2,6}-?\d{2,4}[A-Z0-9-]*)\b/i);
      const code = codeMatch ? codeMatch[1] : "N/A";
      const nameCell = cells.find((c) =>
        c.length > 3 && !/\d{1,3}\s*(?:of|\/)\s*\d{1,3}/.test(c) && !/^\d+$/.test(c) &&
        !/^(?:theory|practical|lab|present|absent)$/i.test(c)
      ) || code;
      addSubject(code, nameCell, attended, total, rowText.toLowerCase().includes("lab"));
    }
  });

  // Strategy B: leaf card elements
  const candidates = [];
  document.querySelectorAll("div, article, section, li").forEach((el) => {
    if (el.children.length > 12) return;
    const text = (el.innerText || "").trim();
    if (!text || text.length > 400) return;
    const ratioMatch = text.match(/(\d{1,3})\s*(?:of|\/|\\)\s*(\d{1,3})\s*(?:hours?\s*attended|hrs|classes)?/i);
    if (!ratioMatch) return;
    const n1 = parseInt(ratioMatch[1], 10), n2 = parseInt(ratioMatch[2], 10);
    candidates.push({ el, text, attended: Math.min(n1, n2), total: Math.max(n1, n2) });
  });

  const leafCandidates = candidates.filter((c) => !candidates.some((o) => o !== c && c.el.contains(o.el)));
  leafCandidates.forEach(({ text, attended, total }) => {
    const codeMatch = text.match(/\b([A-Z0-9]{2,6}-?\d{2,4}[A-Z0-9-]*)\b/i);
    const code = codeMatch ? codeMatch[1] : "N/A";
    const lines = text.split("\n").map((l) => l.trim()).filter((l) =>
      l.length >= 3 && !l.includes("%") && !/hours?\s*attended/i.test(l) &&
      !/\b\d+\s*(?:of|\/)\s*\d+\b/i.test(l) &&
      !/^(?:present|absent|attendance|course|overview|daily log|course overview|theory|practical|lab)$/i.test(l)
    );
    let name = lines[0] || code;
    if (name.toUpperCase() === code.toUpperCase() && lines.length > 1) name = lines[1];
    addSubject(code, name, attended, total, text.toLowerCase().includes("lab"));
  });

  const attendanceData = Array.from(subjectsMap.values());

  if (!attendanceData || attendanceData.length === 0) {
    return Promise.resolve({ success: false, error: "No attendance data found on page. Is this the CUE attendance page?" });
  }

  // POST to Supabase Edge Function
  return fetch(cloudEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseAnonKey}`,
      "apikey": supabaseAnonKey,
    },
    body: JSON.stringify({ user_id: userId, attendance_data: attendanceData }),
  })
    .then(async (res) => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: json.error || `HTTP ${res.status}` };
      }
      return { success: true, count: attendanceData.length, syncedAt: new Date().toISOString() };
    })
    .catch((err) => ({ success: false, error: err.message }));
}
