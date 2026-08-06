document.addEventListener("DOMContentLoaded", () => {
  const userIdInput = document.getElementById("userId");
  const syncBtn = document.getElementById("syncBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Load saved userId from chrome.storage.local
  chrome.storage.local.get(["userId"], (result) => {
    if (result.userId) {
      userIdInput.value = result.userId;
    }
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

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes("cue.christuniversity.in")) {
      showStatus("Please navigate to cue.christuniversity.in in your browser first.", "error");
      syncBtn.disabled = false;
      syncBtn.textContent = "Sync to AcadSphere";
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          showStatus("Error executing script: " + chrome.runtime.lastError.message, "error");
          syncBtn.disabled = false;
          syncBtn.textContent = "Sync to AcadSphere";
          return;
        }

        // Send message to content script with userId
        chrome.tabs.sendMessage(tab.id, { action: "sync_attendance", userId: userId }, (response) => {
          syncBtn.disabled = false;
          syncBtn.textContent = "Sync to AcadSphere";

          if (chrome.runtime.lastError) {
            showStatus("Content script error: " + chrome.runtime.lastError.message, "error");
            return;
          }

          if (response && response.success) {
            showStatus(`Successfully synced ${response.count} subject(s) to AcadSphere!`, "success");
          } else {
            showStatus(response?.error || "Failed to extract attendance data from current tab.", "error");
          }
        });
      }
    );
  });

  function showStatus(msg, type) {
    statusMsg.className = "status " + type;
    statusMsg.textContent = msg;
  }
});
