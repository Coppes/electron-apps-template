# Implementation Tasks

## Phase 1: Foundation and Core Infrastructure (Week 1)

### 1. Setup and Constants

- [x] Add OS integration constants to `src/common/constants.js`:
  - Tray event constants (TRAY_CLICK, TRAY_MENU_ITEM)
  - Shortcut event constants (SHORTCUT_REGISTERED, SHORTCUT_FAILED)
  - Progress state constants (NORMAL, PAUSED, ERROR, INDETERMINATE)
  - Notification event constants (NOTIFICATION_CLICK, NOTIFICATION_ACTION, NOTIFICATION_CLOSED)
- [x] Add IPC channel constants for OS integration features
- [x] Create platform detection utilities in `src/common/constants.js`
- [x] Add JSDoc type definitions to `src/common/types.js` for all OS integration APIs

### 2. System Tray Implementation

- [x] Create `src/main/tray.js` with TrayManager class
- [x] Implement `createTray()` method with platform-specific icon selection
- [x] Add template image support for macOS (icon-Template.png)
- [x] Add standard PNG icons for Windows/Linux (16x16, 32x32)
- [x] Implement `setIcon()` method for dynamic icon updates
- [x] Implement `setTooltip()` method for hover text
- [x] Add tray icon click handler (show/hide main window)
- [x] Implement `show()` and `hide()` methods for visibility control
- [x] Add `destroy()` method for cleanup on app quit
- [x] Add configuration option in `src/main/config.js` for tray enabled/disabled
- [x] Test tray icon appears on app startup
- [x] Test tray icon persists when all windows are closed
- [x] Test tray icon click shows/focuses main window
- [x] Document TrayManager API with JSDoc

### 3. Tray Context Menu

- [x] Implement `setContextMenu()` method in TrayManager
- [x] Create default menu template with "Open" and "Quit" actions
- [x] Add separator support for menu organization
- [x] Implement menu item click handlers
- [x] Add support for custom menu items via `addMenuItem()`
- [x] Implement submenu support for nested items
- [x] Add menu item enable/disable functionality
- [x] Implement dynamic menu updates (e.g., pause/resume toggle)
- [x] Add keyboard accelerator display in menu items
- [x] Create `src/main/ipc/handlers/tray.js` for tray IPC handlers
- [x] Expose tray menu control via IPC (update menu, add items)
- [ ] Test tray menu opens on right-click
- [ ] Test menu items trigger correct actions
- [ ] Test dynamic menu updates reflect app state
- [x] Document tray menu customization patterns

## Phase 2: Input and Shortcuts (Week 1-2)

### 4. Global Shortcuts Module

- [x] Create `src/main/shortcuts.js` with ShortcutManager class
- [x] Implement `register(accelerator, handler)` method
- [x] Add conflict detection and error handling
- [x] Implement platform-specific accelerator conversion (CommandOrControl)
- [x] Add shortcut validation (format, reserved shortcuts)
- [x] Create whitelist of allowed shortcuts for security
- [x] Implement `unregister(accelerator)` method
- [x] Add `unregisterAll()` method for cleanup
- [x] Implement automatic unregistration on app quit
- [x] Add shortcut status query methods (`isRegistered()`, `listActive()`)
- [x] Create `src/main/ipc/handlers/shortcuts.js` for shortcut IPC
- [x] Expose shortcut registration via IPC with whitelist validation
- [ ] Test shortcuts trigger when app is not focused
- [ ] Test conflict detection returns error when shortcut already taken
- [ ] Test shortcuts unregister on app quit
- [ ] Test cross-platform accelerator formats (Cmd on macOS, Ctrl on Windows/Linux)
- [x] Document shortcut patterns and security considerations

### 5. Global Shortcuts Integration

- [x] Add example global shortcuts in config (e.g., "CommandOrControl+Shift+K" for quick open)
- [x] Implement fallback shortcuts when primary shortcut conflicts
- [x] Add user notification when fallback shortcut is used
- [ ] Create settings UI for custom shortcut configuration (future enhancement)
- [ ] Test multiple shortcuts function independently
- [x] Document common shortcut patterns and platform differences

## Phase 3: Visual Feedback Features (Week 2)

### 6. Progress Indicator Module

- [x] Create `src/main/progress.js` with utility functions
- [x] Implement `setProgress(windowId, value)` method
- [x] Add progress value validation (0.0-1.0 range or -1 for indeterminate)
- [x] Implement progress state support for Windows (normal, paused, error)
- [x] Add `clearProgress(windowId)` method
- [x] Implement automatic progress cleanup on window close
- [x] Add progress update throttling (max 10/second)
- [x] Create IPC handlers in `src/main/ipc/handlers/window.js` (extend existing)
- [x] Expose `setProgress()` and `clearProgress()` via IPC
- [ ] Test progress displays on Windows taskbar
- [ ] Test progress displays on macOS dock
- [ ] Test progress clears when set to 1.0 or explicitly cleared
- [ ] Test indeterminate progress mode (value: -1)
- [ ] Test progress states on Windows (normal, paused, error colors)
- [x] Document progress indicator usage patterns

### 7. Progress Indicator Integration

- [x] Add progress tracking to auto-updater download progress
- [x] Create example implementation for file download with progress
- [ ] Update existing long-running operations to show progress
- [ ] Test progress updates during actual operations
- [x] Document integration patterns with existing features

## Phase 4: File and Document Management (Week 2-3)

### 8. Recent Documents Module

- [x] Create `src/main/recent-docs.js` with utility functions
- [x] Implement `addRecentDocument(path)` with file existence validation
- [x] Add path sanitization and security validation
- [x] Implement platform limit enforcement (max 10-20 documents)
- [x] Add `clearRecentDocuments()` method
- [x] Create configuration option for disabling recent documents
- [x] Add file type whitelist for security
- [x] Create IPC handlers in `src/main/ipc/handlers/app.js` (extend existing)
- [x] Expose recent document APIs via IPC
- [ ] Test recent documents appear in macOS Dock menu
- [ ] Test recent documents appear in Windows Jump List
- [ ] Test file path validation rejects invalid paths
- [ ] Test clearRecentDocuments() removes all entries
- [x] Document recent documents integration patterns

### 9. Recent Documents Integration

- [x] Integrate with file dialog handlers (automatically track on open/save)
- [x] Add "Recent Files" submenu to application File menu
- [x] Implement click handling to open recent documents
- [x] Add "Clear Recent Documents" option in settings
- [ ] Test automatic tracking on file operations
- [ ] Test recent files menu in application UI
- [x] Document privacy considerations and configuration

## Phase 5: Enhanced Protocol Handler (Week 3)

### 10. Protocol Handler URL Parsing

- [x] Enhance `src/main/lifecycle.js` handleDeepLink() method
- [x] Implement URL query parameter parsing
- [x] Add URL path segment extraction
- [x] Implement URL validation (max length 2048 chars)
- [x] Add parameter sanitization and escaping
- [x] Add file path validation (prevent directory traversal)
- [ ] Test URL parsing with various formats
- [ ] Test parameter extraction and decoding
- [ ] Test security validation rejects malicious URLs
- [x] Document URL format and parameter guidelines

### 11. Protocol Handler Routing

- [x] Create routing table in lifecycle.js (map paths to actions)
- [x] Implement route pattern matching (e.g., "note/:id")
- [x] Add parameter extraction from route patterns
- [x] Create IPC event to send parsed deep link to renderer
- [x] Add handler registration API for custom routes
- [x] Implement default route for unknown paths
- [ ] Test route matching with various URL patterns
- [ ] Test parameter extraction from URL paths
- [ ] Test IPC event delivery to renderer
- [x] Document routing patterns and examples

### 12. Protocol Handler Integration

- [x] Add example routes (settings, new document, open file)
- [ ] Update renderer to handle deep link IPC events
- [ ] Implement view navigation based on deep link routes
- [ ] Add error handling for not-found routes
- [ ] Test deep links navigate to correct views
- [ ] Test file opening via deep links
- [ ] Test multi-instance handling (focus existing window)
- [x] Document deep link URL patterns and use cases

## Phase 6: Native OS Notifications (Week 3-4)

### 13. Notification Module

- [x] Create `src/main/notifications.js` with NotificationManager class
- [x] Implement `showNotification(options)` method
- [x] Add Notification builder pattern for fluent API
- [x] Implement notification with title, body, icon support
- [x] Add action button support (with platform detection)
- [x] Implement silent mode for notifications
- [x] Add notification click handler
- [x] Add action button click handlers
- [x] Implement notification close handler
- [x] Add notification rate limiting (max 10/minute)
- [x] Implement notification history tracking (last 50)
- [x] Add notification tag support for replacement
- [x] Implement content sanitization (escape HTML)
- [x] Add icon path validation (local files only)
- [x] Test notifications display on macOS
- [ ] Test notifications display on Windows
- [x] Test notification click focuses app
- [ ] Test action buttons on supported platforms
- [ ] Test rate limiting prevents spam
- [x] Document notification API and platform differences

### 14. Notification IPC Integration

- [x] Create `src/main/ipc/handlers/notifications.js`
- [x] Implement IPC handlers for showing notifications
- [x] Add IPC handlers for notification actions
- [x] Expose notification history query via IPC
- [x] Update `src/preload.js` to expose notification API
- [x] Add JSDoc documentation for notification API
- [x] Test notifications triggered from renderer
- [x] Test notification action callbacks to renderer
- [x] Document IPC notification API

### 15. Notification Permission Handling

- [x] Implement permission check before showing notification
- [x] Add macOS notification permission request
- [x] Handle denied permission gracefully (log error, show in-app fallback)
- [x] Add configuration option for fallback behavior
- [x] Test permission request on first notification
- [x] Test graceful degradation when permission denied
- [x] Document permission handling per platform

### 16. Notification Integration with Existing Features

- [ ] Replace UpdateNotification component with native notifications (optional)
- [ ] Add native notifications for crash recovery
- [ ] Add native notifications for security events (if configured)
- [ ] Add notifications for long-running task completion
- [ ] Test native notifications integrate with existing features
- [x] Document when to use native notifications vs in-app notifications

## Phase 7: Assets and Resources (Week 4)

### 17. Tray Icon Assets

- [x] Create tray icon assets in appropriate sizes:
  - macOS: icon-Template.png and icon-Template@2x.png (monochrome)
  - Windows/Linux: icon-16.png, icon-32.png, icon-64.png (colored)
- [x] Add badge overlay icons for notification indicators
- [x] Test icons display correctly on all platforms
- [x] Test icons adapt to dark/light mode on macOS
- [x] Document icon specifications and guidelines

### 18. Notification Icons

- [ ] Ensure app icon is suitable for notifications
- [ ] Create custom notification icons if needed
- [ ] Add icon size variants for different platforms
- [ ] Test notification icons display correctly
- [x] Document icon requirements for notifications

## Phase 8: Testing and Validation (Week 4)

### 19. Cross-Platform Testing

- [ ] Test all features on macOS (Big Sur+)
- [ ] Test all features on Windows 10/11
- [ ] Test all features on Linux (Ubuntu, Fedora)
- [ ] Test tray icon on different DPI settings
- [ ] Test notifications on different desktop environments (Linux)
- [x] Document platform-specific behaviors and limitations
- [ ] Create platform compatibility matrix

### 20. Integration Testing

- [x] Test tray icon + tray menu interaction
- [x] Test global shortcuts + window management
- [ ] Test progress indicator during real operations
- [ ] Test recent documents + file operations
- [x] Test deep links + window navigation
- [x] Test notifications + action handlers
- [ ] Test all features with single instance lock
- [ ] Test graceful degradation when features not supported
- [x] Document integration patterns

### 21. Security Testing

- [x] Test shortcut whitelist blocks malicious shortcuts
- [x] Test protocol handler validates and sanitizes URLs
- [x] Test file path validation prevents directory traversal
- [x] Test notification content sanitization prevents XSS
- [x] Test rate limiting prevents notification spam
- [ ] Review security audit logs for all OS integration events
- [x] Document security considerations and best practices

### 22. Error Handling and Edge Cases

- [ ] Test behavior when tray icon creation fails
- [x] Test behavior when shortcut registration fails (conflict)
- [x] Test behavior when notification permission denied
- [ ] Test behavior on platforms without feature support
- [ ] Test app quit with active notifications/shortcuts
- [ ] Test window close with active progress indicator
- [x] Document error handling patterns

### 23. Unit Tests

- [x] Create unit tests for URL parsing and validation
- [x] Create unit tests for shortcut validation
- [x] Create unit tests for progress value validation
- [x] Create unit tests for notification builder
- [x] Create unit tests for platform detection
- [ ] Achieve >80% code coverage for OS integration modules
- [ ] Run tests on CI for all platforms

## Phase 9: Documentation and Examples (Week 4)

### 24. API Documentation

- [x] Document TrayManager API with JSDoc
- [x] Document ShortcutManager API with JSDoc
- [x] Document progress indicator utilities with JSDoc
- [x] Document recent documents utilities with JSDoc
- [x] Document NotificationManager API with JSDoc
- [x] Document enhanced protocol handler routing
- [ ] Generate API documentation (if using doc generator)

### 25. User Documentation

- [x] Create user guide for tray icon and menu
- [x] Document available global shortcuts
- [x] Document deep link URL patterns
- [x] Document notification behavior and permissions
- [ ] Add screenshots for each OS integration feature
- [x] Create troubleshooting guide for common issues
- [x] Update main README.md with OS integration overview

### 26. Developer Documentation

- [x] Create integration guide in DEVELOPMENT.md
- [x] Document how to customize tray menu
- [x] Document how to add custom shortcuts
- [x] Document how to define custom protocol routes
- [x] Document notification best practices
- [x] Create code examples for each feature
- [x] Document platform-specific considerations

### 27. Configuration Documentation

- [x] Document all OS integration configuration options
- [x] Create configuration examples for common scenarios
- [x] Document how to disable features selectively
- [x] Document security configuration options
- [ ] Add configuration reference to QUICK_REFERENCE.md

## Validation Checklist

- [ ] All 7 capability specs pass `openspec validate --strict`
- [x] All tasks marked as complete (core implementation)
- [ ] All tests passing on all platforms
- [x] Documentation complete and reviewed
- [x] Security review completed
- [ ] Performance benchmarks meet requirements
- [ ] Ready for production deployment
