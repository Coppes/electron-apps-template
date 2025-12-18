# Tasks: Enhance Native & OS Integration

## Core Architecture
- [ ] Update `package.json` to include `fileAssociations` configuration mock (for dev) and build settings.
- [ ] Create `src/main/file-handlers.js` to manage file opening logic (cold/warm start).
- [ ] Create `src/main/dock.js` module for Dock/Taskbar abstractions.
- [ ] Create `src/main/power.js` module for `powerMonitor` handling.

## Capabilities Implementation

### File Associations
- [ ] Implement `app.on('open-file')` handler for macOS.
- [ ] Implement `process.argv` parsing for Windows inside `main.js`.
- [ ] Add `IPC` channel `app:file-opened` to send file content/path to renderer.
- [ ] Verify security validation for opened file paths.

### Dock & Taskbar Badges/Menus
- [ ] Implement `updateBadge(text)` in `src/main/dock.js`.
- [ ] Implement `setDockMenu` / `setUserTasks` in `src/main/dock.js`.
- [ ] Create IPC handlers `dock:set-badge` and `dock:set-menu`.
- [ ] Add renderer hook `useDock` to control badge and menu.

### Dynamic System Tray
- [ ] Extend `src/main/tray.js` with `setIconByStatus(status)` method.
- [ ] Add status-based icons to `assets/`.
- [ ] expose `tray:set-status` in IPC.

### Native Spellchecker
- [ ] Enable `spellcheck: true` in `BrowserWindow` config.
- [ ] Implement context menu building in `main.js` (`webContents.on('context-menu')`) to show spelling suggestions.

### Power Monitor
- [ ] Implement `powerMonitor` listeners in `src/main/power.js`.
- [ ] Create IPC channel `power:status-change` to push updates.
- [ ] Create `usePowerMonitor` hook in renderer to expose interaction state.

## Verification
- [ ] Add manual verification steps for each OS-specific feature (since automated testing of OS UI is limited).
- [ ] Create a "OS Integration" demo page section.
- [ ] Verify battery saver mode triggers correctly.
