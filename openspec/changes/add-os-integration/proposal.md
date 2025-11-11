# Change: Add OS Integration Features

## Why

The current Electron application has basic protocol handler support but lacks deep operating system integration features that make desktop applications feel native and professionally integrated. Production desktop applications need system tray presence for background operations, global keyboard shortcuts for quick access, taskbar/dock progress indicators for long-running tasks, recent documents integration for file workflows, and native OS notifications for user engagement. These features distinguish professional desktop software from basic web wrappers and significantly improve user experience by leveraging OS-native capabilities.

## What Changes

- **System Tray**: Add persistent tray icon in system notification area (Windows/Linux) or menu bar (macOS) that remains visible when main window is hidden or minimized
- **Tray Context Menu**: Implement right-click menu on tray icon with common actions (Open Window, Quick Actions, Settings, Quit) and dynamic menu items based on application state
- **Global Shortcuts**: Register application-wide keyboard shortcuts (e.g., Cmd+Shift+Space) that work even when app is not focused, with conflict detection and graceful fallback
- **Progress Indicator**: Display task progress (0-100%) on taskbar icon (Windows) or dock icon (macOS) for long-running operations like downloads, exports, or processing
- **Recent Documents**: Track recently opened/saved files and integrate with OS recent documents menu for quick file access across application sessions
- **Enhanced Protocol Handler**: Extend existing basic protocol support with URL parameter parsing, validation, deep link routing to specific views, and multi-instance handling
- **Native OS Notifications**: Implement rich OS notification system with actions, icons, sounds, and proper notification center integration (replaces basic in-app notification banners)

## Impact

- **Affected specs**: Creates 7 new capabilities:
  - `system-tray` - System tray icon and visibility management
  - `tray-menu` - Tray context menu and actions
  - `global-shortcuts` - Application-wide keyboard shortcuts
  - `progress-indicator` - Taskbar/dock progress display
  - `recent-documents` - OS recent documents integration
  - `protocol-handler-enhanced` - Deep linking and URL routing (extends existing basic protocol handler)
  - `native-notifications` - OS notification center integration

- **Affected code**:
  - `src/main/tray.js` (new) - System tray management
  - `src/main/shortcuts.js` (new) - Global shortcut registration
  - `src/main/progress.js` (new) - Progress indicator management
  - `src/main/recent-docs.js` (new) - Recent documents tracking
  - `src/main/lifecycle.js` (modified) - Enhanced deep linking with routing
  - `src/main/notifications.js` (new) - Native notification system
  - `src/main/ipc/handlers/tray.js` (new) - Tray IPC handlers
  - `src/main/ipc/handlers/shortcuts.js` (new) - Shortcut IPC handlers
  - `src/main/ipc/handlers/notifications.js` (new) - Notification IPC handlers
  - `src/main/config.js` (modified) - Configuration for OS integration features
  - `src/preload.js` (modified) - Expose OS integration APIs to renderer
  - `src/common/constants.js` (modified) - Add IPC channels and constants
  - Platform-specific icons/assets for tray icons

- **Breaking changes**: None - all additions are backward compatible. Existing protocol handler behavior is preserved and enhanced.

## Dependencies

- No new npm dependencies required - all features use built-in Electron APIs
- Requires platform-specific tray icon assets (16x16, 32x32 PNG for Windows/Linux; template images for macOS)
- Requires app icon for notifications (if not already configured)

## Success Criteria

- [ ] All 7 capability specs pass `openspec validate --strict`
- [ ] System tray icon appears and persists when main window is closed
- [ ] Tray menu opens on right-click with functional actions
- [ ] Global shortcuts trigger even when app is not focused
- [ ] Shortcut registration fails gracefully when shortcuts are already in use
- [ ] Progress indicator updates smoothly on taskbar/dock during long tasks
- [ ] Recent documents appear in OS recent files menu after file operations
- [ ] Protocol handler routes deep links to correct views with parameter extraction
- [ ] Native notifications appear in OS notification center with actions
- [ ] Notification click actions focus app and navigate to relevant view
- [ ] All OS integration features work cross-platform (macOS, Windows, Linux) or degrade gracefully
- [ ] All new code includes JSDoc type annotations
- [ ] Unit tests cover platform detection and feature availability
- [ ] Documentation includes platform-specific behavior differences
