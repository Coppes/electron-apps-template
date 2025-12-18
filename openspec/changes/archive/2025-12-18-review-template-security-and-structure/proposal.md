# Security & Configuration Audit Proposal

## Goal Description
Conduct a comprehensive review of the Electron template project to identify security misconfigurations, potential architectural improvements, and dependency validity. The primary focus is to enforce the "Sandbox: MUST be enabled" constraint which is currently violated in `window-manager.js`.

## User Review Required
> [!IMPORTANT]
> **Breaking Change**: Enabling `sandbox: true` may affect how the preload script interacts with Node.js APIs. While `contextBridge` is compatible, any legacy direct Node usage in preload (if any exists beyond standard IPC) will break. The current preload seems well-structured for sandbox, but verification is required.

## Proposed Changes
### Security Hardening
#### [MODIFY] [window-manager.js](file:///Users/yuricoppe/Code/electron-apps-template/src/main/window-manager.js)
- Update `webPreferences` to set `sandbox: true`.

### Documentation & Standards
- Verify compliance with `openspec/project.md`.
- No other major violations found.

## Verification Plan
### Automated Tests
- Run `npm test` to ensure unit tests still pass.
- Creates a new test or verify existing test in `src/main/window-manager.js` to assert `webPreferences.sandbox` is `true`.

### Manual Verification
1. Start the app in dev mode: `npm run dev`.
2. Verify application launches without "module not found" or "require is not defined" errors in the renderer console.
3. Check all exposed APIs (Window, Store, Dialog, etc.) in the demo page to ensure IPC still functions correctly across the bridge.
