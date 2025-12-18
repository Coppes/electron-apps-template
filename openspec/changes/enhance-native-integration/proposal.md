# Change: Enhance Native & OS Integration

## Why

While basic OS integration exists, the application lacks deeper system-level interactions that users expect from premium desktop software. Features like file associations, dock interactions, and energy awareness are critical for a "native" feel. Users expect to open files directly with the app, see status counts on the dock, access quick actions from the taskbar, and have the app respect battery life. Adding these capabilities bridges the gap between a web wrapper and a true OS-citizen application.

## What Changes

- **File Associations:** Configure the app as the default handler for specific file extensions (e.g., `.myapp` or any user-defined extension), triggering the app to open and handle the file via IPC.
- **Taskbar/Dock Interactions:**
  - **Badges:** Display notification counts or status strings on the app icon (Dock on macOS, overlay on Windows).
  - **Jump Lists / Dock Menu:** Add custom actions to the right-click menu of the Dock/Taskbar icon (e.g., "New Window", "Quick Connect").
- **Dynamic System Tray:** Enhance the existing tray icon to change visually based on app status (Online/Offline, Error, Syncing) without user interaction.
- **Native Spellchecker:** Enable Electron's built-in native spellchecker for text inputs, integrating with the OS dictionary and context menu.
- **Power Monitor:** Listen for AC/Battery state changes and system sleep/resume events to pause resource-intensive tasks (like background sync or animations) when on battery or before sleep.

## Impact

- **Affected specs**: Creates 5 new capabilities:
  - `file-associations` - OS-level file opening handling.
  - `dock-interactions` - Badges and custom dock/taskbar menus.
  - `dynamic-tray` - Status-driven tray icon updates.
  - `native-spellchecker` - Input spellchecking.
  - `power-monitor` - Battery and sleep awareness.

- **Affected code**:
  - `package.json` (modified) - Add `fileAssociations` configuration.
  - `src/main/main.js` (modified) - Handle `open-file` events.
  - `src/main/dock.js` (new) - Manage dock badges and menus.
  - `src/main/branding.js` or `tray.js` (modified) - Dynamic icon logic.
  - `src/main/power.js` (new) - Power monitor event listeners.
  - `src/main/config.js` (modified) - Spellchecker configuration.
  - `src/preload.js` (modified) - Expose power state and dock APIs if needed.

- **Breaking changes**: None.

## Dependencies

- **Electron APIs**: `app.addRecentDocument`, `app.dock`, `app.setUserTasks` (Windows), `powerMonitor`, `session.setSpellCheckerEnabled`.
- **Assets**: Additional icons for dynamic tray states (e.g., `tray-icon-offline.png`, `tray-icon-error.png`).

## Success Criteria

- [ ] `file-associations` spec validation passes.
- [ ] Double-clicking a verified file extension launches the app and passes the file path.
- [ ] Dock/Taskbar badge updates with a count.
- [ ] Right-clicking the Dock/Taskbar icon shows custom actions that trigger app functions.
- [ ] Tray icon updates color/shape when specified application states change.
- [ ] Native spellchecker suggests corrections in text inputs.
- [ ] App receives "on-battery" and "on-ac" events and logs/reacts to them.
