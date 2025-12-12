# Tasks: Add Custom Title Bar

## Implementation

- [x] **1. Configuration Update**
    - [x] Update `DEFAULT_WINDOW_CONFIG` in `src/common/constants.js` to set `titleBarStyle: 'hidden'` and `trafficLightPosition`.
    - [x] Add platform check helper if needed to apply `frame: false` only for Windows/Linux in `src/main/window-manager.js` (or handle via constants).

- [x] **2. Render Process Generic Components**
    - [x] Create `src/renderer/components/layout/WindowControls.jsx` (Buttons for Min/Max/Close).
    - [x] Create `src/renderer/components/layout/TitleBar.jsx` (Main container, drag region, optional slots).

- [x] **3. Integration**
    - [x] Import and place `<TitleBar />` in `src/renderer/components/layout/AppShell.jsx`.
    - [x] Verify Z-index and layout flow (ensure it doesn't overlap content unintentionally).

- [x] **4. Polish**
    - [x] Add specific CSS for `-webkit-app-region: drag` and `no-drag` in `src/renderer/index.css` or Tailwind utilities.
    - [x] Ensure hover states for window controls match native OS feel (e.g. red close button).
    - [x] Verify behavior on maximize/unmaximize (update icon in `WindowControls`).

## Verification

- [x] **5. Visual Verification**
    - [x] Verify macOS traffic lights position.
    - [x] Verify Windows buttons appearance.
- [x] **6. Functional Verification**
    - [x] Test dragging functionality.
    - [x] Test minimize, maximize, restore, close actions.
    - [x] Test double-click to maximize/restore.
