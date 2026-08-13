document.addEventListener("DOMContentLoaded", () => {
  const userIdInput    = document.getElementById("userId");
  const syncBtn        = document.getElementById("syncBtn");
  const statusMsg      = document.getElementById("statusMsg");
  const autoSyncToggle = document.getElementById("autoSyncToggle");
  const bgSyncBtn      = document.getElementById("bgSyncBtn");
  const lastSyncInfo   = document.getElementById("lastSyncInfo");

  // ── Load persisted state ────────────────────────────────────────────────────
  chrome.storage.local.get(["userId", "autoSyncEnabled", "lastAutoSync", "lastAutoSyncResult"], (result) => {
    userIdInput.value = result.userId || "";
    autoSyncToggle.checked = result.autoSyncEnabled !== false; // default ON
    updateLastSyncDisplay(result.lastAutoSync, result.lastAutoSyncResult);
  });

  // ── Save userId on change ───────────────────────────────────────────────────
  userIdInput.addEventListener("input", () => {
    chrome.storage.local.set({ userId: userIdInput.value.trim() });
  });

  // ── Manual sync (current active CUE tab) ───────────────────────────────────
  syncBtn.addEventListener("click", async () => {
    const userId = userIdInput.value.trim();
    if (!userId) {
      showStatus("Please enter your AcadSphere User ID first.", "error");
      return;
    }

    syncBtn.disabled = true;
    syncBtn.textContent = "Syncing...";
    showStatus("Connecting to active CUE tab...", "info");

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url || !tab.url.includes("cue.christuniversity.in")) {
        showStatus("Please navigate to cue.christuniversity.in in your browser first.", "error");
        return;
      }

      await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: "sync_attendance", userId }, (response) => {
          if (chrome.runtime.lastError) {
            // Inject content script if missing and retry
            chrome.scripting.executeScript(
              { target: { tabId: tab.id }, files: ["content.js"] },
              () => {
                chrome.tabs.sendMessage(tab.id, { action: "sync_attendance", userId }, (res2) => {
                  if (res2 && res2.success) {
                    showStatus(`✅ Synced ${res2.count} subject(s) to AcadSphere!`, "success");
                  } else {
                    showStatus(res2?.error || "Failed to extract attendance data.", "error");
                  }
                  resolve(null);
                });
              }
            );
            return;
          }

          if (response && response.success) {
            showStatus(`✅ Synced ${response.count} subject(s) to AcadSphere!`, "success");
          } else {
            showStatus(response?.error || "Failed to extract attendance data from current tab.", "error");
          }
          resolve(null);
        });
      });
    } catch (err) {
      showStatus(err?.message || "An error occurred during sync.", "error");
    } finally {
      syncBtn.disabled = false;
      syncBtn.textContent = "⚡ Sync to AcadSphere Now";
    }
  });

  // ── Auto-sync toggle ────────────────────────────────────────────────────────
  autoSyncToggle.addEventListener("change", () => {
    const enabled = autoSyncToggle.checked;
    const action = enabled ? "enable_auto_sync" : "disable_auto_sync";
    chrome.runtime.sendMessage({ action }, (response) => {
      if (response?.ok) {
        showStatus(
          enabled
            ? "✅ Auto-sync enabled. Will run every 6 hours in the background."
            : "⏸️ Auto-sync disabled. You can still sync manually above.",
          enabled ? "success" : "info"
        );
      }
    });
  });

  // ── Background sync now button ──────────────────────────────────────────────
  bgSyncBtn.addEventListener("click", async () => {
    const userId = userIdInput.value.trim();
    if (!userId) {
      showStatus("Please enter your AcadSphere User ID first.", "error");
      return;
    }

    bgSyncBtn.disabled = true;
    bgSyncBtn.textContent = "Opening hidden tab...";
    showStatus("Running headless sync (opens & closes a hidden CUE tab)...", "info");

    chrome.runtime.sendMessage({ action: "trigger_manual_bg_sync" }, (result) => {
      bgSyncBtn.disabled = false;
      bgSyncBtn.textContent = "🤖 Run Background Sync Now";

      if (result?.success) {
        const now = new Date().toISOString();
        chrome.storage.local.set({ lastAutoSync: now, lastAutoSyncResult: result });
        showStatus(`✅ Background sync complete! ${result.count} subject(s) synced.`, "success");
        updateLastSyncDisplay(now, result);
      } else {
        showStatus(result?.error || "Background sync failed. Check the console for details.", "error");
      }
    });
  });

  // ── Storage change listener (updates last sync display in real-time) ────────
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.lastAutoSync || changes.lastAutoSyncResult) {
      chrome.storage.local.get(["lastAutoSync", "lastAutoSyncResult"], (r) => {
        updateLastSyncDisplay(r.lastAutoSync, r.lastAutoSyncResult);
      });
    }
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function showStatus(msg, type) {
    statusMsg.className = "status " + type;
    statusMsg.textContent = msg;
  }

  function updateLastSyncDisplay(lastSyncTs, lastResult) {
    if (!lastSyncTs) {
      lastSyncInfo.textContent = "No auto-sync run yet.";
      return;
    }
    const date = new Date(lastSyncTs);
    const formatted = date.toLocaleString();
    if (lastResult?.success) {
      lastSyncInfo.innerHTML = `Last auto-sync: <span class="ok">✓ ${lastResult.count} subjects</span> · ${formatted}`;
    } else {
      lastSyncInfo.innerHTML = `Last auto-sync: <span class="fail">✗ ${lastResult?.error || "failed"}</span> · ${formatted}`;
    }
  }
});
