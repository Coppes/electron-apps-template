# Tasks: Enhance Interface & UX Experience

## Core Implementation
- [x] Update `WindowManager` class to support multiple tracked windows (`auxiliaryWindows` Map).
- [x] Create `useSound` hook and add sound assets to `public/sounds/`.
- [x] Implement `ThemeManager` in renderer to handle CSS variable injection.

## Feature Implementation

### Multi-Window & Tear-out Tabs
- [x] Implement `window:create` IPC handler in Main.
- [x] Add drag-and-drop logic to `TabBar.jsx` to detect window exit.
- [x] Implement state synchronization (ensure Redux/Context updates propagate to all windows).
- [x] create `PopoutLayout` component for secondary windows (maybe without sidebar).

### Custom Themes
- [x] Create `ThemeEditor` component (color pickers).
- [x] Update `src/css/globals.css` to ensure all colors use CSS variables.
- [x] Implement persistence logic in `electron-store`.

### Sound Feedback
- [x] Add sound triggers to `Button`, `Toast`, and `Modal` components.
- [x] Add "Sound" section to Settings page (Volume/Mute controls).

### What's New
- [x] Implement version check logic in `src/main/main.js` or `lifecycle.js`.
- [x] Create `WhatsNewModal` component.
- [x] Define "Release Notes" data source (static JSON or parsed from Markdown).

## Verification
- [x] Verify memory usage does not explode with multiple windows.
- [x] Verify accessibility of the Theme Editor (labeled inputs).
- [x] Test sound playback behavior when system audio is muted.
