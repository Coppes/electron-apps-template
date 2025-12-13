<!-- Task list for polish-app-experience -->

1.  **General & Code Quality**
    - [x] Audit codebase for duplicate and legacy code (remove 'Legacy Demo' references if any remain).
    - [x] Implement custom Scroll Bar component globally (CSS/Component).
    - [ ] Setup Storybook for components.

2.  **Fix Connectivity & Data APIs**
    - [x] Fix `preload.js` to expose `getSyncQueueStatus` (aliasing `syncQueueStatus` or renaming).
    - [x] Fix `ImportExportDialog.jsx` to pass arguments correctly to `window.electronAPI.data.import`.
    - [x] Fix `BackupPage.jsx` to pass arguments correctly to `window.electronAPI.data.restoreBackup`.
    - [x] Fix Backup Date position in UI (CSS fix in `BackupPage.jsx` or `BackupRow`).

3.  **Theme System Enhancements**
    - [x] Update `SettingsContext` or `AppShell` to correctly apply the theme (light/dark) class to `document.documentElement` based on settings.
    - [x] Update `SettingsPage` to use a tri-state toggle (System | Light | Dark).

4.  **Localization Fixes**
    - [x] Create/Update `public/locales/{lang}/onboarding.json`.
    - [x] Ensure `Onboarding.jsx` uses the correct namespace and keys.
    - [x] Add missing translations for History & Undo features.

5.  **Tab Management**
    - [x] Implement Drag-and-Drop reordering for Tabs in `TabContext`/`Tabs` component.
    - [x] Implement Middle-click to close tab.
    - [x] Implement Middle-click on empty area to add tab.

6.  **Split View Functionality**
    - [x] Update `TabContext` to support split states (active groups).
    - [x] Implement "Drag to content area" to trigger Split View.
    - [x] Add Context Menu to Tabs for Split View control (Split Right, Split Down).
    - [x] Register Keyboard Shortcuts for Split View (Add/Remove col, Move focus).

7.  **Verification**
    - [x] Manual verification of all fixed bugs.
    - [x] Verify new Tab and Split View interactions.
