# AcadSphere CUE Attendance Sync — Chrome Extension

This Chrome Extension securely extracts live attendance records from your logged-in **Christ University CUE Portal** (`cue.christuniversity.in`) and pushes them directly to your **AcadSphere** account.

---

## 🚀 How to Install & Use (Unpacked Extension)

### Step 1: Open Chrome Extensions Page
1. Open Google Chrome.
2. Navigate to `chrome://extensions/` in your address bar (or go to **Menu > Extensions > Manage Extensions**).

### Step 2: Enable Developer Mode
1. In the top-right corner of the Extensions page, toggle **Developer mode** to **ON**.

### Step 3: Load the Unpacked Extension
1. Click the **Load unpacked** button in the top-left corner.
2. Browse to and select the `cue-extension` folder inside the `acadsphere` project root:
   `c:\Users\Roy Mathew\Desktop\spd\acadsphere\cue-extension`
3. Click **Select Folder**. The **AcadSphere CUE Sync** extension will now appear in your extension list!

---

## ⚡ How to Sync Your Attendance

1. **Log into CUE Portal**:
   Open Google Chrome and go to [cue.christuniversity.in](https://cue.christuniversity.in). Log in with your university credentials and navigate to your attendance page (`/main/attendence`).

2. **Copy Your Sync User ID**:
   Open AcadSphere in another tab (`localhost:8081/app/attendance`), and copy your **Sync User ID** from the extension banner.

3. **Open the Extension Popup**:
   Click the **AcadSphere CUE Sync** puzzle icon in your Chrome toolbar.
   Paste your **Sync User ID** into the input field (it will automatically save for future syncs).

4. **Click "Sync to AcadSphere"**:
   Click the **Sync to AcadSphere** button. The extension will extract your subject attendance cards and push them live to your dashboard!
