document.addEventListener("DOMContentLoaded", () => {
  const userIdInput = document.getElementById("userId");
  const syncBtn = document.getElementById("syncBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Load saved userId from chrome.storage.local
  chrome.storage.local.get(["userId"], (result) => {
    userIdInput.value = result.userId || "00000000-0000-0000-0000-000000000001";
  });

  // Save userId automatically on change
  userIdInput.addEventListener("input", () => {
    chrome.storage.local.set({ userId: userIdInput.value.trim() });
  });

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
        chrome.tabs.sendMessage(tab.id, { action: "sync_attendance", userId: userId }, (response) => {
          if (chrome.runtime.lastError) {
            // Inject content script if missing and retry
            chrome.scripting.executeScript(
              { target: { tabId: tab.id }, files: ["content.js"] },
              () => {
                chrome.tabs.sendMessage(tab.id, { action: "sync_attendance", userId: userId }, (res2) => {
                  if (res2 && res2.success) {
                    showStatus(`Successfully synced ${res2.count} subject(s) to AcadSphere!`, "success");
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
            showStatus(`Successfully synced ${response.count} subject(s) to AcadSphere!`, "success");
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
      syncBtn.textContent = "Sync to AcadSphere";
    }
  });

  function showStatus(msg, type) {
    statusMsg.className = "status " + type;
    statusMsg.textContent = msg;
  }
});
