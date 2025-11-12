# Change: Add Advanced Data Management

## Why

Modern desktop applications need robust data management capabilities beyond basic key-value storage. Users expect features like drag-and-drop file handling (as seen in VS Code, Figma, Notion), reliable backup/restore for data safety, portable data formats for migration and interoperability, and seamless offline operation with automatic synchronization. Currently, the application uses basic electron-store but lacks these advanced patterns that are essential for production-grade desktop apps handling user data.

## What Changes

- **Drag and Drop**: Implement native drag-and-drop support for both receiving files (drop zones in React) and exporting content (drag from app to desktop) using Electron's drag APIs and secure file path handling
- **Backup and Restore**: Add automated and manual backup/restore functionality for electron-store data and SQLite databases (when present), with compression, versioning, and integrity validation
- **Import/Export**: Provide data portability through import/export in common formats (JSON, CSV, Markdown) with schema validation, transformation pipelines, and error handling
- **File Watching**: Implement external file change detection using fs.watch() to detect when opened files are modified outside the app, with conflict resolution UI and reload prompts
- **Offline Mode**: Add network connectivity detection using navigator.onLine with visual indicators, event handlers, and graceful degradation when offline
- **Sync Queue**: Create an offline-first synchronization queue that buffers changes locally and syncs to remote backends when connectivity is restored, with retry logic and conflict resolution

## Impact

- **Affected specs**: Creates 6 new capabilities:
  - `drag-drop` - Native file drag-and-drop for receiving and exporting content
  - `backup-restore` - Automated data backup, versioning, and recovery
  - `import-export` - Multi-format data portability (JSON, CSV, Markdown)
  - `file-watching` - External file change detection and conflict resolution
  - `offline-mode` - Network connectivity awareness and UI indicators
  - `sync-queue` - Offline-first synchronization with automatic retry

- **Affected code**:
  - `src/main/data/backup-manager.js` (new) - Backup/restore orchestration
  - `src/main/data/import-export.js` (new) - Format conversion and validation
  - `src/main/data/file-watcher.js` (new) - File change detection service
  - `src/main/data/sync-queue.js` (new) - Offline sync queue management
  - `src/main/ipc/handlers/data.js` (new) - Data management IPC handlers
  - `src/main/ipc/handlers/files.js` (new) - File operations and drag-drop
  - `src/renderer/hooks/useDragDrop.js` (new) - Drag-drop React hook
  - `src/renderer/hooks/useOfflineStatus.js` (new) - Connectivity status hook
  - `src/renderer/components/DropZone.jsx` (new) - Drop zone component
  - `src/renderer/components/OfflineIndicator.jsx` (new) - Connection status UI
  - `src/renderer/components/pages/BackupPage.jsx` (new) - Backup management UI
  - `src/preload.js` - Add data management APIs to contextBridge
  - `package.json` - Add dependencies: archiver, csv-parse, csv-stringify, marked (optional)

- **Breaking changes**: None - all additions are opt-in enhancements
  - Existing electron-store usage remains unchanged
  - File watching only activates when files are explicitly opened
  - Sync queue is optional and requires explicit configuration

## Dependencies

- **Internal**:
  - Extends `add-secure-storage` for SQLite backup support (when database is present)
  - Uses existing window-manager for dialog prompts (conflict resolution)
  - Leverages IPC bridge patterns from `add-electron-core-features`
  - Uses electron-store for storing backup metadata and sync queue state

- **External**:
  - `archiver` - ZIP compression for backups
  - `csv-parse` and `csv-stringify` - CSV import/export
  - `marked` (optional) - Markdown parsing for import/export
  - All use Node.js fs/path modules (no additional native dependencies)

- **Sequencing**:
  - Can be developed in parallel with other active changes
  - SQLite backup features activate only if `add-secure-storage` is implemented
  - Sync queue is generic and doesn't require specific backend implementation

## Success Criteria

- [ ] All 6 capability specs pass `openspec validate --strict`
- [ ] Users can drag files into drop zones and app receives file paths securely
- [ ] Users can drag content from app to desktop (e.g., export as file)
- [ ] Automated backups create compressed archives in user-configured location
- [ ] Manual backup/restore works for electron-store data
- [ ] SQLite database backup/restore works when add-secure-storage is present
- [ ] Import/export supports JSON, CSV formats with validation
- [ ] File watching detects external changes and prompts user to reload
- [ ] Offline indicator updates immediately when network status changes
- [ ] Sync queue buffers operations offline and syncs when online
- [ ] All features work cross-platform (macOS, Windows, Linux)
- [ ] Security validation prevents path traversal and malicious file access
- [ ] Comprehensive error handling for all file operations
- [ ] All new APIs are accessible via contextBridge (no nodeIntegration)
