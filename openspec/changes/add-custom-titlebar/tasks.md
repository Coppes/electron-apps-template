# Tasks: Add Custom Title Bar

## Implementation

- [ ] **1. Configuration Update**
    - [ ] Update `DEFAULT_WINDOW_CONFIG` in `src/common/constants.js` to set `titleBarStyle: 'hidden'` and `trafficLightPosition`.
    - [ ] Add platform check helper if needed to apply `frame: false` only for Windows/Linux in `src/main/window-manager.js` (or handle via constants).

- [ ] **2. Render Process Generic Components**
    - [ ] Create `src/renderer/components/layout/WindowControls.jsx` (Buttons for Min/Max/Close).
    - [ ] Create `src/renderer/components/layout/TitleBar.jsx` (Main container, drag region, optional slots).

- [ ] **3. Integration**
    - [ ] Import and place `<TitleBar />` in `src/renderer/components/layout/AppShell.jsx`.
    - [ ] Verify Z-index and layout flow (ensure it doesn't overlap content unintentionally).

- [ ] **4. Polish**
    - [ ] Add specific CSS for `-webkit-app-region: drag` and `no-drag` in `src/renderer/index.css` or Tailwind utilities.
    - [ ] Ensure hover states for window controls match native OS feel (e.g. red close button).
    - [ ] Verify behavior on maximize/unmaximize (update icon in `WindowControls`).

## Verification

- [ ] **5. Visual Verification**
    - [ ] Verify macOS traffic lights position.
    - [ ] Verify Windows buttons appearance.
- [ ] **6. Functional Verification**
    - [ ] Test dragging functionality.
    - [ ] Test minimize, maximize, restore, close actions.
    - [ ] Test double-click to maximize/restore.
