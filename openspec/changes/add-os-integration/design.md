# Design Document: OS Integration Features

## Architecture Overview

This change adds seven complementary OS integration capabilities that leverage native Electron APIs to provide deep operating system integration. All features are implemented in the main process with IPC bridges to the renderer process for control and status updates. Each capability is designed to degrade gracefully on platforms where features are not available.

## Key Design Decisions

### 1. System Tray Architecture

**Decision**: Single persistent tray icon managed by dedicated `TrayManager` class

**Rationale**:
- Tray icon should persist even when all windows are closed (common desktop app pattern)
- Single tray icon simplifies state management vs multiple tray icons
- Manager class encapsulates platform-specific icon handling (template images on macOS, standard PNGs on Windows/Linux)

**Implementation**:
- `src/main/tray.js` exports singleton TrayManager class
- Lifecycle: created on app startup, destroyed on app quit
- Icon updates: supports dynamic icon changes based on app state (e.g., unread notifications badge)
- Platform detection: automatically selects appropriate icon format
- Visibility control: show/hide tray icon via configuration flag

**Trade-offs**:
- Single icon limits flexibility but ensures consistency
- Template images on macOS adapt to dark/light mode automatically
- Windows/Linux require separate dark/light icons if theme awareness needed

### 2. Tray Context Menu Design

**Decision**: Dynamic menu generation with action callbacks registered via IPC

**Rationale**:
- Menu items need to reflect current application state (e.g., "Pause" vs "Resume")
- Renderer process knows UI state; main process controls tray
- Template-based menu allows easy customization per application

**Implementation**:
- Default menu template in `src/main/tray.js` includes common actions (Open, Quit)
- Custom menu items injected via `setTrayMenu()` method
- Menu actions trigger IPC events back to renderer for state-aware handling
- Separator support for menu organization
- Submenu support for nested actions

**Platform Differences**:
- macOS: Menu appears below menu bar icon
- Windows: Menu appears at cursor position
- Linux: Behavior varies by desktop environment (Gnome, KDE, etc.)

### 3. Global Shortcuts Management

**Decision**: Centralized shortcut registry with conflict detection and automatic unregistration

**Rationale**:
- Global shortcuts are OS-wide resources; must handle conflicts gracefully
- Apps should not leave shortcuts registered after quit
- Multiple shortcuts may be needed for different features

**Implementation**:
- `src/main/shortcuts.js` maintains Map of registered shortcuts
- Registration returns boolean success status
- Conflicts handled via fallback shortcuts or user notification
- All shortcuts automatically unregistered on app quit
- IPC API for runtime registration/unregistration from renderer

**Security Considerations**:
- Renderer cannot register arbitrary shortcuts (whitelist pattern)
- Sensitive shortcuts (Cmd+Q, Alt+F4) are blocked
- Shortcuts validated against common system shortcuts

**Platform Differences**:
- Accelerator format varies: macOS uses `Command`, Windows/Linux use `Ctrl`
- Some shortcuts reserved by OS and cannot be overridden
- Media keys (play/pause) have special handling

### 4. Progress Indicator Design

**Decision**: Window-scoped progress with main window default and percentage-based progress (0-1 range)

**Rationale**:
- Progress tied to window lifecycle (removed when window closes)
- Percentage model (0-1) aligns with Electron API and HTML5 progress element
- Indeterminate progress supported via -1 value

**Implementation**:
- `src/main/progress.js` provides utility functions wrapping `BrowserWindow.setProgressBar()`
- Progress scoped to specific window ID (defaults to main window)
- IPC handlers for setting/clearing progress from renderer
- Automatic cleanup on window close

**Platform Differences**:
- macOS: Progress bar in dock icon
- Windows: Progress overlay on taskbar button with color states (normal, paused, error)
- Linux: Unity launcher support (Ubuntu); limited support elsewhere

**Use Cases**:
- File downloads: 0-1 percentage
- Long exports/imports: 0-1 percentage with status text
- Indeterminate operations: -1 (pulsing animation)
- Error state: Windows supports red progress bar

### 5. Recent Documents Integration

**Decision**: Automatic recent document tracking with manual override and platform-aware limits

**Rationale**:
- OS recent documents provide quick access to user's workflow
- Different platforms have different recent list limits (10-20 items)
- Privacy: apps should allow clearing recent documents

**Implementation**:
- `src/main/recent-docs.js` wraps `app.addRecentDocument()` and `app.clearRecentDocuments()`
- Automatic tracking: called after file save/open operations
- Manual control: IPC handlers for adding/clearing specific documents
- File existence validation before adding to recent list
- Platform limits respected (no overflow)

**Platform Differences**:
- macOS: Recent documents in Dock menu and File menu
- Windows: Recent documents in Jump List (taskbar right-click)
- Linux: Recent documents in file manager (if supported)

**Privacy & Security**:
- Sensitive files can be excluded from recent documents via configuration flag
- Clear all recent documents on user request
- File paths validated (no remote URLs)

### 6. Enhanced Protocol Handler Design

**Decision**: Extend existing protocol handler with URL parsing, routing table, and view navigation

**Rationale**:
- Current implementation only focuses main window on deep link
- Production apps need route-to-view capability (e.g., `myapp://settings/account`)
- URL parameters enable passing data to views (e.g., `myapp://open?file=/path/to/doc`)

**Implementation**:
- Enhance existing `src/main/lifecycle.js` deep link handling
- Add URL parsing with query parameter extraction
- Routing table: maps URL paths to renderer view routes
- IPC event to renderer with parsed deep link data
- Multi-instance handling: focus existing window or pass to second-instance handler

**URL Format**:
```
electronapp://action/path?param1=value1&param2=value2
```

**Example Routes**:
- `electronapp://open` → Open main window
- `electronapp://settings` → Open settings page
- `electronapp://note/123` → Open specific note by ID
- `electronapp://new?type=document` → Create new document

**Security**:
- URL validation: whitelist allowed actions and paths
- Parameter sanitization: prevent injection attacks
- Max URL length enforcement (2048 chars)
- File path parameters validated (no directory traversal)

### 7. Native OS Notifications Architecture

**Decision**: Rich notification system with action buttons, icons, and notification center integration

**Rationale**:
- In-app banners (UpdateNotification component) are not visible when app is in background
- OS notifications reach users even when app is not focused
- Action buttons enable quick responses without opening app

**Implementation**:
- `src/main/notifications.js` wraps Electron Notification API
- Notification builder pattern for complex notifications
- Action callbacks registered via IPC
- Notification history tracking (last 50 notifications)
- Platform-aware feature detection (actions not supported on Linux)

**Notification Structure**:
```javascript
{
  title: 'Update Available',
  body: 'Version 2.0.0 is ready to install',
  icon: '/path/to/icon.png', // optional
  silent: false, // optional
  actions: [
    { type: 'button', text: 'Install Now' },
    { type: 'button', text: 'Remind Me Later' }
  ]
}
```

**Platform Differences**:
- macOS: Full support for actions, icons, sounds; shows in Notification Center
- Windows: Full support for actions and icons; shows in Action Center
- Linux: Limited support; actions not available on most desktop environments

**User Interactions**:
- Click notification body: focus app and trigger click handler
- Click action button: execute action callback without focusing app (optional)
- Close notification: dismissed event triggered
- Notification center: notifications persist for later viewing

**Permissions**:
- Some platforms require explicit notification permission
- Check permission status before showing notification
- Graceful degradation if permission denied

## Cross-Feature Integration Patterns

### Integration with Window Management

- Tray icon click can show/hide main window
- Progress indicator attached to specific windows
- Notifications can focus specific window types (main, settings, etc.)

### Integration with Application Lifecycle

- Tray icon enables "close to tray" behavior (app continues running in background)
- Recent documents cleared on app reset/reinstall
- Global shortcuts unregistered on app quit
- Protocol handler integrates with single-instance lock

### Integration with IPC Bridge

All OS integration features follow established IPC patterns:
- Type-safe IPC channels defined in `src/common/constants.js`
- Input/output validation using schemas
- Error handling with standardized error responses
- Async IPC for long-running operations (e.g., showing notification)

## Security Considerations

### 1. Global Shortcuts
- Whitelist allowed shortcuts to prevent malicious key capture
- Block system-reserved shortcuts (Ctrl+Alt+Del, etc.)
- Validate shortcuts against common system shortcuts before registration

### 2. Protocol Handler
- URL validation: maximum length enforcement (2048 chars)
- Path sanitization: prevent directory traversal (`../` sequences)
- Query parameter validation: escape special characters
- Action whitelist: only allow predefined actions

### 3. Recent Documents
- File path validation: only local file paths allowed
- Existence check before adding to recent list
- Clear recent documents on sensitive data handling

### 4. Notifications
- Content sanitization: escape HTML in notification text
- Icon validation: only local file paths or data URIs
- Rate limiting: max 10 notifications per minute (prevent spam)

### 5. Tray Menu
- Action validation: only allow predefined menu actions
- Menu item limit: max 20 items to prevent UI overflow

## Testing Strategy

### Unit Tests
- Shortcut parsing and validation
- URL parsing and route matching
- Notification builder logic
- Progress percentage validation

### Integration Tests
- Tray icon creation and visibility
- Tray menu item actions trigger correct IPC events
- Global shortcut registration and triggering
- Protocol handler routes to correct views
- Recent documents appear in OS menus

### Platform-Specific Tests
- Template image support on macOS
- Taskbar progress on Windows
- Unity launcher progress on Ubuntu Linux
- Notification actions on macOS/Windows

### Manual Testing Checklist
- Tray icon appears and persists when window closed
- Global shortcuts work when app not focused
- Deep links open app and navigate to correct view
- OS notifications appear in notification center
- Recent documents accessible from OS menus

## Performance Considerations

### 1. Tray Icon Updates
- Debounce icon updates to max 1 per second
- Cache icon images to avoid repeated file reads
- Use template images on macOS for automatic theme adaptation

### 2. Global Shortcuts
- Lazy registration: register shortcuts only when needed
- Unregister unused shortcuts to free OS resources

### 3. Recent Documents
- Limit to 20 most recent documents (align with OS limits)
- Async file existence checks before adding

### 4. Notifications
- Rate limiting: max 10 notifications per minute
- Notification history pruned to last 50 items
- Async notification display (non-blocking)

### 5. Progress Updates
- Throttle progress updates to max 10 per second
- Batch multiple progress updates in single frame

## Migration & Rollout

### Phase 1: Core Features (Week 1)
- System tray and tray menu
- Global shortcuts
- Progress indicator

### Phase 2: Integration Features (Week 2)
- Recent documents
- Enhanced protocol handler

### Phase 3: Notification System (Week 3)
- Native OS notifications with actions

### Phase 4: Testing & Documentation (Week 4)
- Cross-platform testing
- Documentation and examples
- Demo implementations

## Future Enhancements (Out of Scope)

- Multiple tray icons for different features
- Tray icon animations
- Custom notification sounds
- Notification grouping/stacking
- Taskbar thumbnail previews (Windows)
- Dock menu customization (macOS)
- Custom protocol handler UI (choose handler dialog)
