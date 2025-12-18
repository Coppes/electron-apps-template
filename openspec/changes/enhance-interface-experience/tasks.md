# Tasks: Enhance Interface & UX Experience

## Core Implementation
- [ ] Update `WindowManager` class to support multiple tracked windows (`auxiliaryWindows` Map).
- [ ] Create `useSound` hook and add sound assets to `public/sounds/`.
- [ ] Implement `ThemeManager` in renderer to handle CSS variable injection.

## Feature Implementation

### Multi-Window & Tear-out Tabs
- [ ] Implement `window:create` IPC handler in Main.
- [ ] Add drag-and-drop logic to `TabBar.jsx` to detect window exit.
- [ ] Implement state synchronization (ensure Redux/Context updates propagate to all windows).
- [ ] create `PopoutLayout` component for secondary windows (maybe without sidebar).

### Custom Themes
- [ ] Create `ThemeEditor` component (color pickers).
- [ ] Update `src/css/globals.css` to ensure all colors use CSS variables.
- [ ] Implement persistence logic in `electron-store`.

### Sound Feedback
- [ ] Add sound triggers to `Button`, `Toast`, and `Modal` components.
- [ ] Add "Sound" section to Settings page (Volume/Mute controls).

### What's New
- [ ] Implement version check logic in `src/main/main.js` or `lifecycle.js`.
- [ ] Create `WhatsNewModal` component.
- [ ] Define "Release Notes" data source (static JSON or parsed from Markdown).

## Verification
- [ ] Verify memory usage does not explode with multiple windows.
- [ ] Verify accessibility of the Theme Editor (labeled inputs).
- [ ] Test sound playback behavior when system audio is muted.
