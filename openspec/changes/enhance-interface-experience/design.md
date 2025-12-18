# Design: Enhance Interface & UX Experience

## Architecture Overview

### Multi-Window Architecture
The `WindowManager` (Main Process) typically manages a single `mainWindow`. We will extend this to manage a `Map<id, BrowserWindow>` of auxiliary windows.
*   **State Sharing**: Aux windows will load the same React app but route to specific URLs (e.g., `#/popout/tab-id`).
*   **IPC**: `window-manager.js` will broadcast shared state updates (like Theme or Auth) to ALL open windows, not just the main one.

### Tear-out Tabs
This requires coordination between Renderer (detecting drag exit) and Main (creating window).
1.  **Renderer**: `TabBar` detects a drag operation leaving the window bounds.
2.  **IPC**: Renderer sends `window:create-from-tab` with the tab's state/URL.
3.  **Main**: Creates a new window at the drop coordinates.
4.  **Renderer**: The original tab is closed/transferred to the new window.

### Custom Themes
We already use Tailwind + CSS Variables.
*   **Storage**: User themes stored in `electron-store` as JSON objects mapping semantic names to hex codes (e.g., `{ "primary": "#ff0000" }`).
*   **Injection**: `ThemeProvider` reads this config and injects a `<style>` tag or updates `document.documentElement.style` variables at runtime.

### Sound System
*   **Renderer-only**: To minimise latency, sounds play in the renderer.
*   **Assets**: Small, optimized `.mp3` or `.wav` files bundled in `public/sounds`.
*   **State**: Mute preference stored in `electron-store`.

### What's New Logic
*   **Main**: On startup, checks `currentVersion` vs `lastRunVersion` in storage.
*   **Condition**: If `current > last`, set a flag `showChangelog: true` in the initial state payload or send an IPC event.
*   **Renderer**: Displays the Modal if the flag is true, then sends an IPC message to update `lastRunVersion` to current.

## Security Considerations
*   **Custom Themes**: Users might try to inject malicious CSS. Use CSS Variables (`--primary-color: <value>`) rather than raw CSS injection where possible. If raw CSS is needed, sanitize it.
*   **New Windows**: Ensure secondary windows have the same strict CSP and security settings as the main window (Context Isolation, Sandbox).

## Performance
*   **Multi-window**: Each Electron window is a separate process with significant memory overhead. We should limit the number of open windows or warn the user.
*   **Sounds**: Preload sounds to avoid UI jank during interactions.
