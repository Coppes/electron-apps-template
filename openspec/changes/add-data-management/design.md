# Design: Advanced Data Management

## Overview

This design outlines technical approaches for implementing advanced data management capabilities including native drag-and-drop, backup/restore with versioning, multi-format import/export, file watching for external changes, offline mode detection, and synchronization queue for offline-first data sync.

## Architecture Decisions

### Drag and Drop

**Decision**: Use native Electron drag APIs with React event handlers, enforce security through path validation

**Rationale**:
- Native HTML5 drag-and-drop is well-supported in Chromium
- Electron provides `webContents.startDrag()` for reverse drag (app to desktop)
- Security requires validating file paths in main process before access
- Drop zones can be implemented as React components with event handlers

**Implementation**:

**Drop (External → App)**:
- React components listen to `onDrop`, `onDragOver`, `onDragEnter`, `onDragLeave`
- Extract file list from `event.dataTransfer.files`
- Send file paths via IPC to main process for validation
- Main process validates paths (no traversal, allowed extensions, size limits)
- Main process returns validated file metadata or performs operations

**Drag (App → External)**:
- User initiates drag from app element
- Renderer sends IPC request with file data/path
- Main process prepares temp file if needed
- Main process calls `webContents.startDrag({ file, icon })`
- OS handles native drag operation

**Security**:
- Never trust file paths from renderer
- Validate all paths in main process
- Check file extensions against allowlist
- Limit file sizes to prevent memory exhaustion
- Use temporary directories for generated files

**Trade-offs**:
- (+) Native OS integration, familiar UX
- (+) Works across all platforms
- (+) Secure with proper validation
- (-) File path handling requires careful security checks
- (-) Drag icon customization limited by OS

### Backup and Restore

**Decision**: ZIP-based backups with metadata manifest, support incremental and full backups

**Rationale**:
- ZIP format is universal, compressed, and supports metadata
- Manifest file (JSON) inside ZIP tracks backup type, version, checksum
- Incremental backups reduce size by only backing up changed files
- Full backups ensure complete recovery point

**Implementation**:

**Backup Structure**:
```
backup-2025-11-12-142030.zip
├── manifest.json (metadata: timestamp, version, type, checksum)
├── electron-store/
│   └── config.json (electron-store data)
├── databases/
│   └── app.db (SQLite database, if present)
└── user-files/ (optional: user-generated content)
```

**Backup Types**:
- **Automatic**: Scheduled daily, weekly (configurable), incremental
- **Manual**: User-triggered via settings, full backup
- **Pre-update**: Triggered before app updates, full backup

**Backup Manager**:
- Maintains backup history (metadata in electron-store)
- Limits number of stored backups (configurable, default 10)
- Cleanup old backups automatically
- Integrity check before restore (verify checksums)

**Restore Flow**:
1. User selects backup file
2. Validate ZIP structure and manifest
3. Extract to temporary directory
4. Verify checksums
5. Prompt user to confirm restore (destructive operation)
6. Close all app windows
7. Replace current data with backup data
8. Restart application

**Trade-offs**:
- (+) Standard format, easy to inspect
- (+) Compressed, saves disk space
- (+) Metadata enables version tracking
- (-) ZIP extraction can be slow for large files
- (-) Incremental backups add complexity

### Import/Export

**Decision**: Pluggable format handlers with schema validation and transformation pipelines

**Rationale**:
- Different data types need different formats (settings→JSON, tables→CSV)
- Validation ensures imported data is safe and well-formed
- Transformation pipeline allows format conversion (CSV→JSON)
- Extensible architecture supports adding new formats

**Implementation**:

**Format Handlers**:
Each format (JSON, CSV, Markdown) implements interface:
```javascript
{
  canHandle(filePath): boolean,
  export(data, options): Promise<Buffer>,
  import(buffer, options): Promise<Object>,
  validate(data): Promise<ValidationResult>
}
```

**JSON Handler**:
- Export: Serialize data with JSON.stringify(), pretty-print
- Import: Parse with JSON.parse(), validate against JSON Schema
- Validation: Check schema, required fields, data types

**CSV Handler**:
- Export: Use csv-stringify, handle nested objects (flatten)
- Import: Use csv-parse, auto-detect delimiter, handle headers
- Validation: Check column count, data types, handle malformed rows

**Markdown Handler** (optional):
- Export: Convert structured data to Markdown tables/lists
- Import: Parse Markdown using marked, extract structured data
- Validation: Check Markdown syntax, supported features

**Security**:
- Validate file size before parsing (max 100MB default)
- Sandbox parsing operations (catch exceptions)
- Sanitize imported data (XSS prevention)
- Schema validation prevents injection attacks

**Trade-offs**:
- (+) Flexible, supports multiple formats
- (+) Extensible with new format handlers
- (+) Validation ensures data integrity
- (-) More complex than single-format approach
- (-) Performance overhead for validation

### File Watching

**Decision**: Use Node.js fs.watch() with debouncing and conflict resolution UI

**Rationale**:
- fs.watch() is cross-platform and lightweight
- Debouncing prevents rapid-fire change events
- Conflict resolution lets user decide: reload, keep current, merge
- Only watch files explicitly opened by the app

**Implementation**:

**File Watcher Service**:
```javascript
class FileWatcher {
  watchers = new Map(); // filePath → { watcher, metadata }
  
  watch(filePath, options) {
    // Create fs.watch() watcher
    // Debounce events (300ms)
    // Emit 'change' event when file modified externally
  }
  
  unwatch(filePath) {
    // Stop watching, cleanup
  }
}
```

**Conflict Detection**:
- Track file modification time when opened
- On external change event, compare new mtime
- If different, show conflict dialog:
  - "File changed externally"
  - Options: Reload (discard local), Keep (ignore external), Diff (show changes)

**Integration**:
- Document/file opens → start watching
- Document closes → stop watching
- App detects change → show non-blocking notification
- User can choose to ignore and continue editing

**Edge Cases**:
- Handle file deletion (prompt to save elsewhere)
- Handle file move/rename (stop watching, notify user)
- Handle rapid changes (debounce, batch notifications)

**Trade-offs**:
- (+) Prevents data loss from concurrent edits
- (+) User maintains control over conflict resolution
- (+) Lightweight, doesn't poll
- (-) fs.watch() behavior varies slightly by OS
- (-) Can't auto-merge conflicts (requires user decision)

### Offline Mode

**Decision**: Use navigator.onLine with custom connectivity checks for reliability

**Rationale**:
- navigator.onLine is instant but unreliable (only checks network interface)
- Custom checks (ping to known endpoints) verify actual connectivity
- Visual indicator (status bar) keeps user informed
- Graceful degradation: disable sync, show cached data

**Implementation**:

**Connectivity Manager**:
```javascript
class ConnectivityManager extends EventEmitter {
  isOnline = navigator.onLine;
  lastCheck = null;
  
  async checkConnectivity() {
    // Primary: navigator.onLine
    // Secondary: HTTP HEAD request to cdn.example.com
    // Fallback: DNS lookup to google.com
    // Update isOnline state, emit 'change' event
  }
  
  startMonitoring() {
    // Listen to 'online'/'offline' events
    // Periodic connectivity checks (every 30s)
  }
}
```

**Renderer Integration**:
- `useOfflineStatus()` hook returns `{ isOnline, isChecking }`
- OfflineIndicator component shows banner when offline
- Status bar shows connection icon (green=online, red=offline, yellow=checking)

**Behavior Changes When Offline**:
- Disable sync operations
- Show "Offline mode" message
- Cache UI state locally
- Queue operations for later sync
- Don't show errors for expected failures

**Trade-offs**:
- (+) Immediate user feedback
- (+) Prevents confusing errors when offline
- (+) Enables offline-first workflows
- (-) navigator.onLine is unreliable on some systems
- (-) Connectivity checks add network overhead

### Sync Queue

**Decision**: Event-sourced queue with operation log, optimistic updates, and eventual consistency

**Rationale**:
- Event sourcing captures all changes as immutable log
- Optimistic updates keep UI responsive
- Eventual consistency allows offline operation
- Conflict resolution handles concurrent edits

**Implementation**:

**Queue Architecture**:
```javascript
{
  operations: [
    {
      id: 'uuid',
      type: 'create|update|delete',
      entity: 'document',
      entityId: '123',
      data: {...},
      timestamp: 1699999999,
      retries: 0,
      status: 'pending|syncing|synced|failed'
    }
  ],
  lastSync: 1699999999,
  syncInProgress: false
}
```

**Queue Operations**:
- **Enqueue**: Add operation to queue, persist to electron-store
- **Process**: When online, process queue in order (FIFO)
- **Retry**: Failed operations retry with exponential backoff (max 5 attempts)
- **Conflict**: If server rejects (409), invoke conflict resolver
- **Purge**: Remove synced operations older than 7 days

**Sync Flow**:
1. App goes online (or user triggers manual sync)
2. Start processing queue
3. For each pending operation:
   - Send HTTP request to backend
   - On success: mark as synced
   - On conflict: show conflict UI
   - On error: increment retries, backoff
4. Emit 'sync-complete' event

**Conflict Resolution**:
- Server wins: Discard local, apply server version
- Local wins: Force push local version
- Manual merge: Show diff UI, let user merge
- Last-write-wins: Use timestamp to decide

**Backend Agnostic**:
- Sync queue doesn't assume specific backend
- Adapter pattern for different backends (REST, GraphQL, WebSocket)
- Default: mock adapter for testing without backend

**Trade-offs**:
- (+) Reliable offline operation
- (+) User never loses data
- (+) Automatically syncs when online
- (-) Complex conflict resolution
- (-) Requires backend support
- (-) Queue can grow large if offline for extended periods

## Cross-Cutting Concerns

### Security

**File Access**:
- All file paths validated in main process
- No path traversal (../../)
- Extension allowlist for drag-drop
- Size limits for imports (default 100MB)

**Data Validation**:
- Schema validation for imports
- Sanitize all user input
- Prevent code injection in Markdown/CSV
- Verify backup integrity (checksums)

**IPC Security**:
- All data operations require IPC calls
- No direct file access from renderer
- Validate all IPC parameters
- Rate limit file operations

### Performance

**File Operations**:
- Stream large files (don't load into memory)
- Use workers for CPU-intensive tasks (ZIP, CSV parsing)
- Debounce file watch events
- Throttle sync operations

**Memory Management**:
- Cleanup watchers when files close
- Limit queue size (max 10,000 operations)
- Purge old synced operations
- Use weak references for event listeners

### Error Handling

**User-Facing Errors**:
- Show user-friendly error messages
- Provide recovery actions (retry, cancel, ignore)
- Log detailed errors for debugging

**Graceful Degradation**:
- If backup fails, log error but don't crash
- If file watch fails, continue without watching
- If sync fails, queue and retry later

### Testing

**Unit Tests**:
- Test each format handler independently
- Test file watcher debouncing
- Test sync queue state transitions
- Test conflict resolution logic

**Integration Tests**:
- Test full backup/restore flow
- Test import/export round-trip
- Test offline→online sync
- Test file watching with actual files

**Security Tests**:
- Test path traversal prevention
- Test malicious file imports
- Test large file handling
- Test concurrent operation conflicts

## Integration Points

### With Existing Features

**electron-store**: Store backup metadata, sync queue, watch list

**add-secure-storage**: Backup SQLite databases when present

**IPC Bridge**: Use existing schema validation patterns

**Window Manager**: Show dialog prompts for conflicts

**Status Bar** (add-ux-shell-features): Display offline indicator

### With Future Features

**Cloud Storage**: Sync queue can integrate with cloud backends

**Document Editor**: File watching essential for concurrent editing

**Collaboration**: Sync queue enables real-time collaboration

## File Structure

```
src/
  main/
    data/
      backup-manager.js           # Backup orchestration
      import-export.js            # Format handlers
      file-watcher.js             # File change detection
      sync-queue.js               # Offline sync queue
      format-handlers/
        json-handler.js
        csv-handler.js
        markdown-handler.js
    ipc/handlers/
      data.js                     # Data management IPC
      files.js                    # File operations IPC
  renderer/
    hooks/
      useDragDrop.js              # Drag-drop hook
      useOfflineStatus.js         # Connectivity hook
    components/
      DropZone.jsx                # Drop zone component
      OfflineIndicator.jsx        # Connection status UI
      pages/
        BackupPage.jsx            # Backup management UI
```

## Open Questions

1. **Backup Location**: Default to user documents? Allow custom location?
   - **Decision**: Default to app userData/backups, allow custom in settings

2. **Sync Backend**: Support multiple backends or start with one?
   - **Decision**: Generic adapter pattern, start with mock adapter

3. **Conflict UI**: Modal dialog or inline notifications?
   - **Decision**: Non-blocking notifications with actions

4. **File Size Limits**: What's reasonable for imports?
   - **Decision**: 100MB default, configurable in settings

## Success Metrics

- Backup creation completes in < 5s for typical app data (< 50MB)
- File watching detects changes within 500ms
- Offline indicator updates within 2s of connectivity change
- Sync queue processes 100 operations/second
- Import/export handles files up to 100MB without blocking UI
- All file operations complete with < 5% error rate
