# Implementation Tasks

## Phase 1: Foundation and Core Infrastructure (Week 1)

### 1. Setup and Constants

- [ ] Add OS integration constants to `src/common/constants.js`:
  - Tray event constants (TRAY_CLICK, TRAY_MENU_ITEM)
  - Shortcut event constants (SHORTCUT_REGISTERED, SHORTCUT_FAILED)
  - Progress state constants (NORMAL, PAUSED, ERROR, INDETERMINATE)
  - Notification event constants (NOTIFICATION_CLICK, NOTIFICATION_ACTION, NOTIFICATION_CLOSED)
- [ ] Add IPC channel constants for OS integration features
- [ ] Create platform detection utilities in `src/common/constants.js`
- [ ] Add JSDoc type definitions to `src/common/types.js` for all OS integration APIs

### 2. System Tray Implementation

- [ ] Create `src/main/tray.js` with TrayManager class
- [ ] Implement `createTray()` method with platform-specific icon selection
- [ ] Add template image support for macOS (icon-Template.png)
- [ ] Add standard PNG icons for Windows/Linux (16x16, 32x32)
- [ ] Implement `setIcon()` method for dynamic icon updates
- [ ] Implement `setTooltip()` method for hover text
- [ ] Add tray icon click handler (show/hide main window)
- [ ] Implement `show()` and `hide()` methods for visibility control
- [ ] Add `destroy()` method for cleanup on app quit
- [ ] Add configuration option in `src/main/config.js` for tray enabled/disabled
- [ ] Test tray icon appears on app startup
- [ ] Test tray icon persists when all windows are closed
- [ ] Test tray icon click shows/focuses main window
- [ ] Document TrayManager API with JSDoc

### 3. Tray Context Menu

- [ ] Implement `setContextMenu()` method in TrayManager
- [ ] Create default menu template with "Open" and "Quit" actions
- [ ] Add separator support for menu organization
- [ ] Implement menu item click handlers
- [ ] Add support for custom menu items via `addMenuItem()`
- [ ] Implement submenu support for nested items
- [ ] Add menu item enable/disable functionality
- [ ] Implement dynamic menu updates (e.g., pause/resume toggle)
- [ ] Add keyboard accelerator display in menu items
- [ ] Create `src/main/ipc/handlers/tray.js` for tray IPC handlers
- [ ] Expose tray menu control via IPC (update menu, add items)
- [ ] Test tray menu opens on right-click
- [ ] Test menu items trigger correct actions
- [ ] Test dynamic menu updates reflect app state
- [ ] Document tray menu customization patterns

## Phase 2: Input and Shortcuts (Week 1-2)

### 4. Global Shortcuts Module

- [ ] Create `src/main/shortcuts.js` with ShortcutManager class
- [ ] Implement `register(accelerator, handler)` method
- [ ] Add conflict detection and error handling
- [ ] Implement platform-specific accelerator conversion (CommandOrControl)
- [ ] Add shortcut validation (format, reserved shortcuts)
- [ ] Create whitelist of allowed shortcuts for security
- [ ] Implement `unregister(accelerator)` method
- [ ] Add `unregisterAll()` method for cleanup
- [ ] Implement automatic unregistration on app quit
- [ ] Add shortcut status query methods (`isRegistered()`, `listActive()`)
- [ ] Create `src/main/ipc/handlers/shortcuts.js` for shortcut IPC
- [ ] Expose shortcut registration via IPC with whitelist validation
- [ ] Test shortcuts trigger when app is not focused
- [ ] Test conflict detection returns error when shortcut already taken
- [ ] Test shortcuts unregister on app quit
- [ ] Test cross-platform accelerator formats (Cmd on macOS, Ctrl on Windows/Linux)
- [ ] Document shortcut patterns and security considerations

### 5. Global Shortcuts Integration

- [ ] Add example global shortcuts in config (e.g., "CommandOrControl+Shift+K" for quick open)
- [ ] Implement fallback shortcuts when primary shortcut conflicts
- [ ] Add user notification when fallback shortcut is used
- [ ] Create settings UI for custom shortcut configuration (future enhancement)
- [ ] Test multiple shortcuts function independently
- [ ] Document common shortcut patterns and platform differences

## Phase 3: Visual Feedback Features (Week 2)

### 6. Progress Indicator Module

- [ ] Create `src/main/progress.js` with utility functions
- [ ] Implement `setProgress(windowId, value)` method
- [ ] Add progress value validation (0.0-1.0 range or -1 for indeterminate)
- [ ] Implement progress state support for Windows (normal, paused, error)
- [ ] Add `clearProgress(windowId)` method
- [ ] Implement automatic progress cleanup on window close
- [ ] Add progress update throttling (max 10/second)
- [ ] Create IPC handlers in `src/main/ipc/handlers/window.js` (extend existing)
- [ ] Expose `setProgress()` and `clearProgress()` via IPC
- [ ] Test progress displays on Windows taskbar
- [ ] Test progress displays on macOS dock
- [ ] Test progress clears when set to 1.0 or explicitly cleared
- [ ] Test indeterminate progress mode (value: -1)
- [ ] Test progress states on Windows (normal, paused, error colors)
- [ ] Document progress indicator usage patterns

### 7. Progress Indicator Integration

- [ ] Add progress tracking to auto-updater download progress
- [ ] Create example implementation for file download with progress
- [ ] Update existing long-running operations to show progress
- [ ] Test progress updates during actual operations
- [ ] Document integration patterns with existing features

## Phase 4: File and Document Management (Week 2-3)

### 8. Recent Documents Module

- [ ] Create `src/main/recent-docs.js` with utility functions
- [ ] Implement `addRecentDocument(path)` with file existence validation
- [ ] Add path sanitization and security validation
- [ ] Implement platform limit enforcement (max 10-20 documents)
- [ ] Add `clearRecentDocuments()` method
- [ ] Create configuration option for disabling recent documents
- [ ] Add file type whitelist for security
- [ ] Create IPC handlers in `src/main/ipc/handlers/app.js` (extend existing)
- [ ] Expose recent document APIs via IPC
- [ ] Test recent documents appear in macOS Dock menu
- [ ] Test recent documents appear in Windows Jump List
- [ ] Test file path validation rejects invalid paths
- [ ] Test clearRecentDocuments() removes all entries
- [ ] Document recent documents integration patterns

### 9. Recent Documents Integration

- [ ] Integrate with file dialog handlers (automatically track on open/save)
- [ ] Add "Recent Files" submenu to application File menu
- [ ] Implement click handling to open recent documents
- [ ] Add "Clear Recent Documents" option in settings
- [ ] Test automatic tracking on file operations
- [ ] Test recent files menu in application UI
- [ ] Document privacy considerations and configuration

## Phase 5: Enhanced Protocol Handler (Week 3)

### 10. Protocol Handler URL Parsing

- [ ] Enhance `src/main/lifecycle.js` handleDeepLink() method
- [ ] Implement URL query parameter parsing
- [ ] Add URL path segment extraction
- [ ] Implement URL validation (max length 2048 chars)
- [ ] Add parameter sanitization and escaping
- [ ] Add file path validation (prevent directory traversal)
- [ ] Test URL parsing with various formats
- [ ] Test parameter extraction and decoding
- [ ] Test security validation rejects malicious URLs
- [ ] Document URL format and parameter guidelines

### 11. Protocol Handler Routing

- [ ] Create routing table in lifecycle.js (map paths to actions)
- [ ] Implement route pattern matching (e.g., "note/:id")
- [ ] Add parameter extraction from route patterns
- [ ] Create IPC event to send parsed deep link to renderer
- [ ] Add handler registration API for custom routes
- [ ] Implement default route for unknown paths
- [ ] Test route matching with various URL patterns
- [ ] Test parameter extraction from URL paths
- [ ] Test IPC event delivery to renderer
- [ ] Document routing patterns and examples

### 12. Protocol Handler Integration

- [ ] Add example routes (settings, new document, open file)
- [ ] Update renderer to handle deep link IPC events
- [ ] Implement view navigation based on deep link routes
- [ ] Add error handling for not-found routes
- [ ] Test deep links navigate to correct views
- [ ] Test file opening via deep links
- [ ] Test multi-instance handling (focus existing window)
- [ ] Document deep link URL patterns and use cases

## Phase 6: Native OS Notifications (Week 3-4)

### 13. Notification Module

- [ ] Create `src/main/notifications.js` with NotificationManager class
- [ ] Implement `showNotification(options)` method
- [ ] Add Notification builder pattern for fluent API
- [ ] Implement notification with title, body, icon support
- [ ] Add action button support (with platform detection)
- [ ] Implement silent mode for notifications
- [ ] Add notification click handler
- [ ] Add action button click handlers
- [ ] Implement notification close handler
- [ ] Add notification rate limiting (max 10/minute)
- [ ] Implement notification history tracking (last 50)
- [ ] Add notification tag support for replacement
- [ ] Implement content sanitization (escape HTML)
- [ ] Add icon path validation (local files only)
- [ ] Test notifications display on macOS
- [ ] Test notifications display on Windows
- [ ] Test notification click focuses app
- [ ] Test action buttons on supported platforms
- [ ] Test rate limiting prevents spam
- [ ] Document notification API and platform differences

### 14. Notification IPC Integration

- [ ] Create `src/main/ipc/handlers/notifications.js`
- [ ] Implement IPC handlers for showing notifications
- [ ] Add IPC handlers for notification actions
- [ ] Expose notification history query via IPC
- [ ] Update `src/preload.js` to expose notification API
- [ ] Add JSDoc documentation for notification API
- [ ] Test notifications triggered from renderer
- [ ] Test notification action callbacks to renderer
- [ ] Document IPC notification API

### 15. Notification Permission Handling

- [ ] Implement permission check before showing notification
- [ ] Add macOS notification permission request
- [ ] Handle denied permission gracefully (log error, show in-app fallback)
- [ ] Add configuration option for fallback behavior
- [ ] Test permission request on first notification
- [ ] Test graceful degradation when permission denied
- [ ] Document permission handling per platform

### 16. Notification Integration with Existing Features

- [ ] Replace UpdateNotification component with native notifications (optional)
- [ ] Add native notifications for crash recovery
- [ ] Add native notifications for security events (if configured)
- [ ] Add notifications for long-running task completion
- [ ] Test native notifications integrate with existing features
- [ ] Document when to use native notifications vs in-app notifications

## Phase 7: Assets and Resources (Week 4)

### 17. Tray Icon Assets

- [ ] Create tray icon assets in appropriate sizes:
  - macOS: icon-Template.png and icon-Template@2x.png (monochrome)
  - Windows/Linux: icon-16.png, icon-32.png, icon-64.png (colored)
- [ ] Add badge overlay icons for notification indicators
- [ ] Test icons display correctly on all platforms
- [ ] Test icons adapt to dark/light mode on macOS
- [ ] Document icon specifications and guidelines

### 18. Notification Icons

- [ ] Ensure app icon is suitable for notifications
- [ ] Create custom notification icons if needed
- [ ] Add icon size variants for different platforms
- [ ] Test notification icons display correctly
- [ ] Document icon requirements for notifications

## Phase 8: Testing and Validation (Week 4)

### 19. Cross-Platform Testing

- [ ] Test all features on macOS (Big Sur+)
- [ ] Test all features on Windows 10/11
- [ ] Test all features on Linux (Ubuntu, Fedora)
- [ ] Test tray icon on different DPI settings
- [ ] Test notifications on different desktop environments (Linux)
- [ ] Document platform-specific behaviors and limitations
- [ ] Create platform compatibility matrix

### 20. Integration Testing

- [ ] Test tray icon + tray menu interaction
- [ ] Test global shortcuts + window management
- [ ] Test progress indicator during real operations
- [ ] Test recent documents + file operations
- [ ] Test deep links + window navigation
- [ ] Test notifications + action handlers
- [ ] Test all features with single instance lock
- [ ] Test graceful degradation when features not supported
- [ ] Document integration patterns

### 21. Security Testing

- [ ] Test shortcut whitelist blocks malicious shortcuts
- [ ] Test protocol handler validates and sanitizes URLs
- [ ] Test file path validation prevents directory traversal
- [ ] Test notification content sanitization prevents XSS
- [ ] Test rate limiting prevents notification spam
- [ ] Review security audit logs for all OS integration events
- [ ] Document security considerations and best practices

### 22. Error Handling and Edge Cases

- [ ] Test behavior when tray icon creation fails
- [ ] Test behavior when shortcut registration fails (conflict)
- [ ] Test behavior when notification permission denied
- [ ] Test behavior on platforms without feature support
- [ ] Test app quit with active notifications/shortcuts
- [ ] Test window close with active progress indicator
- [ ] Document error handling patterns

### 23. Unit Tests

- [ ] Create unit tests for URL parsing and validation
- [ ] Create unit tests for shortcut validation
- [ ] Create unit tests for progress value validation
- [ ] Create unit tests for notification builder
- [ ] Create unit tests for platform detection
- [ ] Achieve >80% code coverage for OS integration modules
- [ ] Run tests on CI for all platforms

## Phase 9: Documentation and Examples (Week 4)

### 24. API Documentation

- [ ] Document TrayManager API with JSDoc
- [ ] Document ShortcutManager API with JSDoc
- [ ] Document progress indicator utilities with JSDoc
- [ ] Document recent documents utilities with JSDoc
- [ ] Document NotificationManager API with JSDoc
- [ ] Document enhanced protocol handler routing
- [ ] Generate API documentation (if using doc generator)

### 25. User Documentation

- [ ] Create user guide for tray icon and menu
- [ ] Document available global shortcuts
- [ ] Document deep link URL patterns
- [ ] Document notification behavior and permissions
- [ ] Add screenshots for each OS integration feature
- [ ] Create troubleshooting guide for common issues
- [ ] Update main README.md with OS integration overview

### 26. Developer Documentation

- [ ] Create integration guide in DEVELOPMENT.md
- [ ] Document how to customize tray menu
- [ ] Document how to add custom shortcuts
- [ ] Document how to define custom protocol routes
- [ ] Document notification best practices
- [ ] Create code examples for each feature
- [ ] Document platform-specific considerations

### 27. Configuration Documentation

- [ ] Document all OS integration configuration options
- [ ] Create configuration examples for common scenarios
- [ ] Document how to disable features selectively
- [ ] Document security configuration options
- [ ] Add configuration reference to QUICK_REFERENCE.md

## Validation Checklist

- [ ] All 7 capability specs pass `openspec validate --strict`
- [ ] All tasks marked as complete
- [ ] All tests passing on all platforms
- [ ] Documentation complete and reviewed
- [ ] Security review completed
- [ ] Performance benchmarks meet requirements
- [ ] Ready for production deployment
