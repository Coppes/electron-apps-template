# Tasks: Enhance Native & OS Integration

## Core Architecture
- [x] Update `package.json` to include `fileAssociations` configuration mock (for dev) and build settings.
- [x] Create `src/main/file-handlers.js` to manage file opening logic (cold/warm start).
- [x] Create `src/main/dock.js` module for Dock/Taskbar abstractions.
- [x] Create `src/main/power.js` module for `powerMonitor` handling.

## Capabilities Implementation

### File Associations
- [x] Implement `app.on('open-file')` handler for macOS.
- [x] Implement `process.argv` parsing for Windows inside `main.js`.
- [x] Add `IPC` channel `app:file-opened` to send file content/path to renderer.
- [x] Verify security validation for opened file paths.

### Dock & Taskbar Badges/Menus
- [x] Implement `updateBadge(text)` in `src/main/dock.js`.
- [x] Implement `setDockMenu` / `setUserTasks` in `src/main/dock.js`.
- [x] Create IPC handlers `dock:set-badge` and `dock:set-menu`.
- [x] Add renderer hook `useDock` to control badge and menu.

### Dynamic System Tray
- [x] Extend `src/main/tray.js` with `setIconByStatus(status)` method.
- [x] Add status-based icons to `assets/`.
- [x] expose `tray:set-status` in IPC.

### Native Spellchecker
- [x] Enable `spellcheck: true` in `BrowserWindow` config.
- [x] Implement context menu building in `main.js` (`webContents.on('context-menu')`) to show spelling suggestions.

### Power Monitor
- [x] Implement `powerMonitor` listeners in `src/main/power.js`.
- [x] Create IPC channel `power:status-change` to push updates.
- [x] Create `usePowerMonitor` hook in renderer to expose interaction state.

## Verification
- [x] Add manual verification steps for each OS-specific feature (since automated testing of OS UI is limited).
- [x] Create a "OS Integration" demo page section.
- [x] Verify battery saver mode triggers correctly.
