# Design: Enhance Native & OS Integration

## Architecture Overview

This change leverages Electron's main process APIs to provide deeper OS integration. The logic will be modularized into dedicated files in `src/main/` to keep `main.js` clean, following the existing project pattern.

### Module Breakdown

1.  **File Associations (`src/main/file-handlers.js`)**:
    *   **Configuration**: Add `fileAssociations` to `package.json` build config.
    *   **Runtime**: Listen to `app.on('open-file')` (macOS) and parse `process.argv` (Windows/Linux) in `main.js`.
    *   **IPC**: Send `file-opened` event to renderer when a file is opened via OS association.

2.  **Dock & Taskbar (`src/main/dock.js`)**:
    *   **Badges**: `app.dock.setBadge(string)` (macOS) and `win.setOverlayIcon()` (Windows).
    *   **Menus/JumpLists**: `app.dock.setMenu()` (macOS) and `app.setUserTasks()` (Windows).
    *   **Abstraction**: expose `updateBadge(count)` and `updateQuickActions(actions)` methods.

3.  **Dynamic Tray (`src/main/tray.js`)**:
    *   **Extension**: Add `updateIcon(type)` method to existing `tray.js`.
    *   **Assets**: Load different images based on status (e.g., `tray-offline.png`).

4.  **Spellchecker (`src/main/window-manager.js` & `src/main/context-menu.js`)**:
    *   **Enable**: properties `webPreferences: { spellcheck: true }`.
    *   **Context Menu**: The native spellchecker needs a context menu to show suggestions. If `electron-context-menu` is not used, we must listen to `context-menu` event on `webContents` and build a menu with `params.dictionarySuggestions`.

5.  **Power Monitor (`src/main/power.js`)**:
    *   **Listeners**: `powerMonitor.on('on-battery')`, `powerMonitor.on('on-ac')`, `powerMonitor.on('suspend')`, `powerMonitor.on('resume')`.
    *   **IPC**: Broadcast `power-status-changed` to all windows.

## Implementation Details

### File Associations
Handling `open-file` reliably requires checking if the app is already ready or if it's the second instance.
*   **Cold Start**: File path is available when app launches.
*   **Warm Start**: `second-instance` or `open-file` event fires.
*   **Security**: Validate file paths strictly before passing to renderer.

### Jump Lists & Dock Menu
Cross-platform differences are significant.
*   **macOS**: Dynamic Menu provided to Dock.
*   **Windows**: Static "Tasks" (JumpList). We need to verify if we want dynamic tasks or static. The request says "Quick actions", which implies static or semi-static.

### Spellchecker
We need to ensure the standard right-click context menu works in the Renderer. If the app uses a custom context menu implementation, we must merge spellcheck suggestions into it.

## Security Considerations

*   **File Input**: Malicious files opened via association could exploit renderer vulnerabilities. Ensure file content is treated as untrusted in Renderer.
*   **IPC**: All new ICP channels (`dock:setBadge`, `power:status`, etc.) must be defined in `schema.js` and validated.
