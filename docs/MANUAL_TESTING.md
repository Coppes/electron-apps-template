# Manual Testing Guide - OS Integration Features

This guide provides step-by-step procedures to manually test all OS integration features.

## Prerequisites

Before testing, ensure:
- ✅ Application is built and running: `npm run dev` or `npm start`
- ✅ You have appropriate OS permissions (notifications, file access, etc.)
- ✅ You're testing on your target platform (macOS, Windows, or Linux)

## Navigation

1. Launch the application
2. In the sidebar, navigate to **Demos → 💻 OS Integration**
3. You'll see 5 tabs: System Tray, Shortcuts, Progress, Notifications, Recent Docs

---

## 1. System Tray Testing

### Test 1.1: Create and Destroy Tray Icon

**Steps:**
1. Click the **System Tray** tab
2. Click **"Create Tray"** button
3. **Verify:** A tray icon appears in:
   - **macOS:** Menu bar (top-right corner)
   - **Windows:** System tray (bottom-right, near clock)
   - **Linux:** System tray (varies by desktop environment)
4. Click **"Destroy Tray"** button
5. **Verify:** Tray icon disappears

**Expected Result:** ✅ Icon appears and disappears correctly

---

### Test 1.2: Context Menu

**Steps:**
1. Click **"Create Tray"**
2. Right-click (or Ctrl+Click on macOS) the tray icon
3. **Verify:** Context menu shows:
   - "Show Window"
   - Separator line
   - "Quit"
4. Click "Show Window"
5. **Verify:** Application window comes to front

**Expected Result:** ✅ Menu displays and items are clickable

---

### Test 1.3: Tooltip

**Steps:**
1. With tray icon created, hover over the icon
2. **Verify:** Default tooltip shows "My Electron App"
3. In the app, change tooltip text to "Custom Tooltip"
4. Click **"Update"** button
5. Hover over tray icon again
6. **Verify:** Tooltip now shows "Custom Tooltip"

**Expected Result:** ✅ Tooltip updates correctly

---

### Test 1.4: Dynamic Menu Modification

**Steps:**
1. Click **"+ Add Item"** button
2. **Verify:** New "New Item" appears in menu list
3. Click **"Apply Menu Changes"**
4. Right-click tray icon
5. **Verify:** New item appears in context menu
6. Uncheck the checkbox next to "Show Window"
7. Click **"Apply Menu Changes"**
8. Right-click tray icon
9. **Verify:** "Show Window" is grayed out (disabled)

**Expected Result:** ✅ Menu items can be added, removed, and toggled

---

## 2. Global Shortcuts Testing

### Test 2.1: Register Shortcut

**Steps:**
1. Click the **Shortcuts** tab
2. Click one of the common shortcuts: **CommandOrControl+Shift+K**
3. Click **"Register"** button
4. **Verify:** Success message appears
5. **Verify:** Shortcut appears in "Registered Shortcuts" list

**Expected Result:** ✅ Shortcut registered successfully

---

### Test 2.2: Trigger Shortcut

**Steps:**
1. With shortcut registered, press the keyboard combination:
   - **macOS:** Cmd+Shift+K
   - **Windows/Linux:** Ctrl+Shift+K
2. **Verify:** Entry appears in "Shortcut Triggers" log at bottom
3. **Verify:** Log shows timestamp and shortcut accelerator
4. Press the shortcut again
5. **Verify:** New entry appears at top of log

**Expected Result:** ✅ Shortcut triggers are logged in real-time

---

### Test 2.3: Multiple Shortcuts

**Steps:**
1. Register **CommandOrControl+Shift+L**
2. Register **Alt+Shift+A**
3. Register **F1**
4. **Verify:** All 4 shortcuts appear in registered list
5. Press each shortcut
6. **Verify:** Each trigger is logged separately

**Expected Result:** ✅ Multiple shortcuts work independently

---

### Test 2.4: Check Availability

**Steps:**
1. Enter **CommandOrControl+Shift+K** (already registered)
2. Click **"Check Available"**
3. **Verify:** Message says "already registered"
4. Enter **CommandOrControl+Shift+Z** (not registered)
5. Click **"Check Available"**
6. **Verify:** Message says "is available"

**Expected Result:** ✅ Availability check works correctly

---

### Test 2.5: Unregister Shortcuts

**Steps:**
1. Click the **X** button next to one shortcut
2. **Verify:** Shortcut removed from list
3. Press that keyboard combination
4. **Verify:** No trigger logged (shortcut inactive)
5. Click **"Clear All"** button
6. **Verify:** All shortcuts removed
7. Press previously registered shortcuts
8. **Verify:** No triggers logged

**Expected Result:** ✅ Unregistering works correctly

---

## 3. Progress Indicator Testing

### Test 3.1: Automatic Progress Simulation

**Steps:**
1. Click the **Progress** tab
2. Look at your taskbar/dock icon
3. Click **"Start Simulation"**
4. **Verify:** Progress bar appears on icon:
   - **macOS:** Progress bar on dock icon
   - **Windows:** Progress bar overlay on taskbar button (blue/green)
   - **Linux:** Varies by desktop environment
5. **Verify:** Progress animates from 0% to 100% over ~4 seconds
6. **Verify:** Progress bar disappears when complete

**Expected Result:** ✅ Progress animates smoothly on OS icon

---

### Test 3.2: Manual Progress Control

**Steps:**
1. Drag the slider to 50%
2. **Verify:** Progress bar shows 50% on taskbar/dock icon
3. Click **"75%"** button
4. **Verify:** Progress immediately jumps to 75%
5. Drag slider to 100%
6. **Verify:** Progress bar fills completely

**Expected Result:** ✅ Manual control updates progress immediately

---

### Test 3.3: Indeterminate Progress

**Steps:**
1. Click **"Indeterminate"** button
2. **Verify:** Progress display changes:
   - **macOS:** Icon bounces in dock
   - **Windows:** Progress bar scrolls/pulses
   - **Linux:** Varies by DE

**Expected Result:** ✅ Indeterminate mode shows continuous activity

---

### Test 3.4: Progress Modes (Windows Only)

**Note:** Visual differences are most apparent on Windows 10/11

**Steps:**
1. Set progress to 50%
2. Click **"Normal"** mode
3. **Verify (Windows):** Blue/green progress bar
4. Click **"Error"** mode
5. **Verify (Windows):** Red progress bar
6. Click **"Paused"** mode
7. **Verify (Windows):** Yellow/orange progress bar

**Expected Result:** ✅ Different modes show different colors (Windows)

---

### Test 3.5: Clear Progress

**Steps:**
1. Set progress to any value
2. Click **"Clear"** button
3. **Verify:** Progress bar disappears from taskbar/dock icon
4. **Verify:** UI slider resets to 0%

**Expected Result:** ✅ Progress clears completely

---

## 4. Native Notifications Testing

### Test 4.1: Quick Notifications

**Steps:**
1. Click the **Notifications** tab
2. Click **✓ Success** button
3. **Verify:** OS notification appears with "Success" title
4. Click **⚠ Warning** button
5. **Verify:** Warning notification appears
6. Try all 4 quick notification buttons
7. **Verify:** Each shows different title and message

**Expected Result:** ✅ All quick notifications display correctly

**Note:** Notification appearance varies by OS:
- **macOS:** Top-right corner
- **Windows 10+:** Bottom-right Action Center
- **Linux:** Varies by desktop environment (usually top-right)

---

### Test 4.2: Custom Notifications

**Steps:**
1. Change title to: "Test Notification"
2. Change body to: "This is a custom message"
3. Click **"Send Notification"**
4. **Verify:** Notification displays with custom text
5. **Verify:** Event log shows "sent" entry

**Expected Result:** ✅ Custom notification displays correctly

---

### Test 4.3: Notification Click Events

**Steps:**
1. Send any notification
2. **Click** on the notification when it appears
3. **Verify:** Event log shows "click" event
4. **Verify:** Timestamp is recorded

**Expected Result:** ✅ Click events are logged

---

### Test 4.4: Silent Notifications

**Steps:**
1. Check the **"Silent"** checkbox
2. Send a notification
3. **Verify:** Notification appears WITHOUT sound
4. Uncheck "Silent"
5. Send another notification
6. **Verify:** Notification plays sound (if system sounds enabled)

**Expected Result:** ✅ Silent mode prevents sound

---

### Test 4.5: Urgency Levels

**Steps:**
1. Set urgency to **"Low"**
2. Send notification
3. Set urgency to **"Critical"**
4. Send notification
5. **Verify (some platforms):** Critical notifications may:
   - Stay on screen longer
   - Make louder sound
   - Require dismissal

**Expected Result:** ✅ Urgency affects behavior (platform-dependent)

---

### Test 4.6: Notification Actions (macOS/Windows 10+)

**Steps:**
1. Check **"With Actions"** checkbox
2. Send a notification
3. **Verify:** Notification shows "Open" and "Dismiss" buttons
4. Click one of the buttons
5. **Verify:** Event log shows "action" event with button name

**Expected Result:** ✅ Actions work (if platform supports them)

**Note:** Linux support for actions varies by desktop environment

---

### Test 4.7: Rate Limiting

**Steps:**
1. Rapidly click **✓ Success** button 15+ times
2. **Verify:** After ~10 notifications, error appears
3. **Verify:** Error mentions rate limiting (10 per minute)
4. Wait 60 seconds
5. Try sending again
6. **Verify:** Notifications work again

**Expected Result:** ✅ Rate limiting prevents spam

---

## 5. Recent Documents Testing

### Test 5.1: Add Real Document

**Steps:**
1. Click the **Recent Docs** tab
2. Create a test file on your system:
   - **macOS/Linux:** `touch ~/test-document.pdf`
   - **Windows:** Create empty file `C:\Users\[YourName]\test-document.pdf`
3. Enter the FULL path to that file in the input
4. Click **"Add to Recent Documents"**
5. **Verify:** File appears in "Added Documents" list
6. **Verify:** Success message shows path

**Expected Result:** ✅ Document added to list

---

### Test 5.2: Check OS Recent List

**Steps:**
1. With document added, check your OS:
   
   **macOS:**
   - Click **Apple menu → Recent Items → Documents**
   - **Verify:** Your file is listed
   
   **Windows:**
   - Open **File Explorer**
   - Click **Quick Access → Recent**
   - **Verify:** Your file is listed
   - OR right-click taskbar icon and check Jump List
   
   **Linux (varies):**
   - Check file manager's recent files section

**Expected Result:** ✅ File appears in OS recent list

---

### Test 5.3: Sample Paths

**Steps:**
1. Click one of the sample paths
2. **Verify:** Path populates in input field
3. Click **"Add to Recent Documents"**
4. **Verify:** Error appears (file doesn't exist)

**Expected Result:** ✅ Validation prevents non-existent files

---

### Test 5.4: Extension Validation

**Steps:**
1. Create a test file: `~/test.exe` (executable)
2. Try to add it
3. **Verify:** Error appears about invalid extension
4. Try these valid extensions:
   - `.pdf`
   - `.txt`
   - `.jpg`
5. **Verify:** Only allowed extensions work

**Expected Result:** ✅ Only whitelisted extensions accepted

---

### Test 5.5: Clear Recent Documents

**Steps:**
1. Add 2-3 documents
2. Click **"Clear All"** button
3. **Verify:** List empties in app
4. Check OS recent list
5. **Verify:** Documents removed from OS list

**Expected Result:** ✅ Clear removes all documents

---

## Cross-Platform Testing Matrix

Test each feature on all target platforms:

| Feature | macOS | Windows 10/11 | Linux (Ubuntu/Fedora) |
|---------|-------|---------------|------------------------|
| System Tray | ⬜ | ⬜ | ⬜ |
| Global Shortcuts | ⬜ | ⬜ | ⬜ |
| Progress Indicator | ⬜ | ⬜ | ⬜ |
| Notifications | ⬜ | ⬜ | ⬜ |
| Recent Documents | ⬜ | ⬜ | ⬜ |

**Check each box (✅) after successfully testing on that platform**

---

## Known Platform Differences

### macOS
- Tray icons support template images (auto-adapt to dark mode)
- Dock progress shows as overlay on icon
- Notifications support replies and inline actions
- Recent documents appear in Apple menu

### Windows 10/11
- Tray icons in system tray (may be hidden)
- Taskbar progress shows colored overlays
- Notifications in Action Center with actions support
- Recent documents in File Explorer Quick Access and Jump Lists
- Different progress modes show different colors (normal/error/paused)

### Linux
- Support varies by desktop environment:
  - **GNOME:** Good support for all features
  - **KDE Plasma:** Excellent support
  - **XFCE/MATE:** Limited notification actions
  - **Cinnamon:** Good overall support
- Tray icons may not work on newer GNOME versions
- Unity launcher progress works well (if available)

---

## Troubleshooting

### Tray Icon Not Appearing
- **macOS:** Check System Preferences → Dock & Menu Bar → Show in Menu Bar
- **Windows:** Check system tray overflow (click arrow near clock)
- **Linux:** Ensure desktop environment supports tray icons

### Shortcuts Not Working
- Check if shortcut is already used by OS or other app
- Try different key combinations
- macOS: System shortcuts take precedence

### Notifications Not Showing
- **macOS:** System Preferences → Notifications → Enable for your app
- **Windows:** Settings → System → Notifications → Enable for your app
- **Linux:** Check notification daemon is running (`notify-send test` in terminal)

### Recent Documents Not Appearing
- Ensure file actually exists
- Check file has allowed extension
- macOS: Recent items may be disabled in System Preferences
- Windows: Check privacy settings for recent documents

---

## Regression Testing Checklist

Run this after any code changes:

- [ ] All 5 tabs load without errors
- [ ] Tray can be created and destroyed
- [ ] At least one shortcut works
- [ ] Progress simulation completes
- [ ] Notifications display
- [ ] Recent document with existing file works
- [ ] No console errors during use
- [ ] App doesn't crash with rapid interactions

---

## Reporting Issues

When reporting bugs, include:

1. **Platform:** macOS/Windows/Linux (with version)
2. **Desktop Environment:** (Linux only)
3. **Steps to reproduce**
4. **Expected behavior**
5. **Actual behavior**
6. **Console errors** (if any)
7. **Screenshots/videos** (if applicable)

---

## Test Results Template

```markdown
## Test Session

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Platform:** [macOS 14.0 / Windows 11 / Ubuntu 22.04]
**Build:** [Version/Commit]

### Results

#### System Tray
- [ ] Create/Destroy: Pass/Fail - Notes:
- [ ] Context Menu: Pass/Fail - Notes:
- [ ] Tooltip: Pass/Fail - Notes:

#### Global Shortcuts
- [ ] Registration: Pass/Fail - Notes:
- [ ] Triggering: Pass/Fail - Notes:
- [ ] Conflicts: Pass/Fail - Notes:

#### Progress Indicator
- [ ] Simulation: Pass/Fail - Notes:
- [ ] Manual Control: Pass/Fail - Notes:
- [ ] Modes: Pass/Fail - Notes:

#### Notifications
- [ ] Display: Pass/Fail - Notes:
- [ ] Click Events: Pass/Fail - Notes:
- [ ] Actions: Pass/Fail - Notes:

#### Recent Documents
- [ ] Add Document: Pass/Fail - Notes:
- [ ] OS Integration: Pass/Fail - Notes:
- [ ] Validation: Pass/Fail - Notes:

### Issues Found
[List any bugs or unexpected behavior]

### Overall Status
[ ] All tests passed
[ ] Minor issues (non-blocking)
[ ] Major issues (blocking release)
```

---

## Quick Test (5 minutes)

For rapid verification:

1. Create tray → Right-click menu → Works? ✅
2. Register `Cmd/Ctrl+Shift+K` → Press it → Logged? ✅
3. Start progress simulation → Shows on icon? ✅
4. Click Success notification → Appears? ✅
5. Add existing file to recent docs → Shows in OS? ✅

**All ✅ = Core functionality working!**
