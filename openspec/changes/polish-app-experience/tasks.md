<!-- Task list for polish-app-experience -->

1.  **General & Code Quality**
    - [ ] Audit codebase for duplicate and legacy code (remove 'Legacy Demo' references if any remain).
    - [ ] Implement custom Scroll Bar component globally (CSS/Component).
    - [ ] Setup Storybook for components.

2.  **Fix Connectivity & Data APIs**
    - [ ] Fix `preload.js` to expose `getSyncQueueStatus` (aliasing `syncQueueStatus` or renaming).
    - [ ] Fix `ImportExportDialog.jsx` to pass arguments correctly to `window.electronAPI.data.import`.
    - [ ] Fix `BackupPage.jsx` to pass arguments correctly to `window.electronAPI.data.restoreBackup`.
    - [ ] Fix Backup Date position in UI (CSS fix in `BackupPage.jsx` or `BackupRow`).

3.  **Theme System Enhancements**
    - [ ] Update `SettingsContext` or `AppShell` to correctly apply the theme (light/dark) class to `document.documentElement` based on settings.
    - [ ] Update `SettingsPage` to use a tri-state toggle (System | Light | Dark).

4.  **Localization Fixes**
    - [ ] Create/Update `public/locales/{lang}/onboarding.json`.
    - [ ] Ensure `Onboarding.jsx` uses the correct namespace and keys.
    - [ ] Add missing translations for History & Undo features.

5.  **Tab Management**
    - [ ] Implement Drag-and-Drop reordering for Tabs in `TabContext`/`Tabs` component.
    - [ ] Implement Middle-click to close tab.
    - [ ] Implement Middle-click on empty area to add tab.

6.  **Split View Functionality**
    - [ ] Update `TabContext` to support split states (active groups).
    - [ ] Implement "Drag to content area" to trigger Split View.
    - [ ] Add Context Menu to Tabs for Split View control (Split Right, Split Down).
    - [ ] Register Keyboard Shortcuts for Split View (Add/Remove col, Move focus).

7.  **Verification**
    - [ ] Manual verification of all fixed bugs.
    - [ ] Verify new Tab and Split View interactions.
