# Tasks: Add Advanced Data Management

## Phase 1: Foundation & Core Services (Sequential)

### Drag and Drop Infrastructure (10 tasks)

- [x] 1. Install archiver dependency for ZIP operations (`npm install archiver`)
- [x] 2. Create `src/main/data/` directory for data management modules
- [x] 3. Create `src/main/ipc/handlers/files.js` for file operation IPC handlers
- [x] 4. Implement file path validation function in files.js (prevent traversal, check extensions)
- [x] 5. Add file operation IPC channels to `src/common/constants.js` (FILE_DROP, FILE_DRAG_START)
- [x] 6. Create useDragDrop hook in `src/renderer/hooks/useDragDrop.js`
- [x] 7. Create DropZone component in `src/renderer/components/DropZone.jsx` with drag event handlers
- [x] 8. Implement startDrag IPC handler for dragging files from app to desktop
- [x] 9. Add file drop IPC handler with security validation
- [ ] 10. Write tests for file path validation and security checks

### Backup Manager Core (12 tasks)

- [x] 11. Create `src/main/data/backup-manager.js` with BackupManager class
- [x] 12. Implement createBackup method (collect electron-store data, create manifest)
- [x] 13. Implement ZIP compression using archiver library
- [x] 14. Add backup metadata storage in electron-store (history, timestamps)
- [x] 15. Implement listBackups method to retrieve backup history
- [x] 16. Implement deleteBackup method with confirmation
- [x] 17. Implement restoreBackup method with validation and extraction
- [x] 18. Add checksum calculation and verification (SHA-256)
- [x] 19. Create backup retention policy (auto-delete old backups, configurable limit)
- [x] 20. Add IPC handlers in `src/main/ipc/handlers/data.js` for backup operations
- [x] 21. Integrate SQLite backup support (conditional on add-secure-storage presence)
- [ ] 22. Write tests for backup creation, restoration, and integrity checks

### File Watching Service (8 tasks)

- [x] 23. Create `src/main/data/file-watcher.js` with FileWatcher class
- [x] 24. Implement watch method using fs.watch() with debouncing (300ms)
- [x] 25. Implement unwatch method with cleanup
- [x] 26. Add file metadata tracking (mtime, size) for conflict detection
- [x] 27. Create IPC event emitter for file change notifications (FILE_CHANGED)
- [x] 28. Handle edge cases (file deletion, rename, rapid changes)
- [x] 29. Add file watcher registry to track active watchers
- [ ] 30. Write tests for file watching, debouncing, and conflict detection

## Phase 2: Import/Export System (Sequential)

### Format Handler Architecture (10 tasks)

- [x] 31. Install CSV and Markdown dependencies (`npm install csv-parse csv-stringify marked`)
- [x] 32. Create `src/main/data/import-export.js` with ImportExportManager class
- [x] 33. Create `src/main/data/format-handlers/` directory
- [x] 34. Define FormatHandler interface (canHandle, export, import, validate)
- [x] 35. Implement JsonHandler in `format-handlers/json-handler.js`
- [x] 36. Implement CsvHandler in `format-handlers/csv-handler.js` with csv-parse/stringify
- [x] 37. Implement MarkdownHandler in `format-handlers/markdown-handler.js` (optional)
- [x] 38. Add format handler registry to ImportExportManager
- [x] 39. Implement auto-detection logic (determine format from file extension/content)
- [ ] 40. Write tests for each format handler (export, import, validate)

### Import/Export Features (10 tasks)

- [x] 41. Implement export method in ImportExportManager (select handler, transform, write)
- [x] 42. Implement import method in ImportExportManager (validate, parse, transform)
- [x] 43. Add schema validation using JSON Schema (validate imported data structure)
- [ ] 44. Implement transformation pipeline for format conversion (CSV→JSON, etc.)
- [x] 45. Add file size validation (default max 100MB, configurable)
- [x] 46. Implement error handling and user-friendly error messages
- [x] 47. Add IPC handlers for import/export operations in data.js
- [ ] 48. Create export presets (e.g., "Export All Settings", "Export Documents")
- [ ] 49. Add progress reporting for large file operations
- [ ] 50. Write integration tests for import/export round-trips

## Phase 3: Offline Mode & Sync Queue (Sequential)

### Connectivity Management (8 tasks)

- [ ] 51. Create `src/main/data/connectivity-manager.js` with ConnectivityManager class
- [ ] 52. Implement navigator.onLine monitoring with event listeners
- [ ] 53. Add custom connectivity check (HTTP HEAD to reliable endpoint)
- [ ] 54. Implement periodic connectivity polling (every 30s when status unclear)
- [ ] 55. Create IPC event emitter for connectivity changes (ONLINE, OFFLINE)
- [ ] 56. Create useOfflineStatus hook in `src/renderer/hooks/useOfflineStatus.js`
- [ ] 57. Create OfflineIndicator component in `src/renderer/components/OfflineIndicator.jsx`
- [ ] 58. Write tests for connectivity detection and state transitions

### Sync Queue Implementation (14 tasks)

- [ ] 59. Create `src/main/data/sync-queue.js` with SyncQueue class
- [ ] 60. Define operation schema (id, type, entity, data, status, retries, timestamp)
- [ ] 61. Implement enqueue method (add operation, persist to electron-store)
- [ ] 62. Implement process method (FIFO queue processing when online)
- [ ] 63. Add retry logic with exponential backoff (max 5 attempts)
- [ ] 64. Implement operation status tracking (pending, syncing, synced, failed)
- [ ] 65. Create backend adapter interface (REST, GraphQL, WebSocket)
- [ ] 66. Implement mock adapter for testing without backend
- [ ] 67. Add conflict detection and resolution hooks
- [ ] 68. Implement queue purge (remove synced operations > 7 days old)
- [ ] 69. Add queue size limit (max 10,000 operations) with overflow handling
- [ ] 70. Create IPC handlers for manual sync trigger and queue inspection
- [ ] 71. Integrate sync queue with connectivity manager (auto-sync when online)
- [ ] 72. Write tests for queue operations, retry logic, and conflict resolution

## Phase 4: UI Integration (Parallel)

### Backup UI (8 tasks)

- [ ] 73. Create BackupPage component in `src/renderer/components/pages/BackupPage.jsx`
- [ ] 74. Add backup list view (show history, size, date, type)
- [ ] 75. Add "Create Backup" button with progress indicator
- [ ] 76. Add "Restore Backup" button with file picker and confirmation dialog
- [ ] 77. Add "Delete Backup" button with confirmation
- [ ] 78. Display backup retention settings (max backups, auto-delete old)
- [ ] 79. Add automatic backup schedule configuration (daily, weekly, never)
- [ ] 80. Integrate BackupPage into app navigation

### Import/Export UI (7 tasks)

- [ ] 81. Add "Import Data" option to settings menu
- [ ] 82. Create import dialog with format selection and file picker
- [ ] 83. Add "Export Data" option to settings menu
- [ ] 84. Create export dialog with format selection and save location picker
- [ ] 85. Add progress indicator for long import/export operations
- [ ] 86. Display import/export results (success, errors, records processed)
- [ ] 87. Add validation error display with user-friendly messages

### Drag-Drop UI (6 tasks)

- [ ] 88. Integrate DropZone component into HomePage or relevant pages
- [ ] 89. Add visual feedback for drag-over state (highlight, border change)
- [ ] 90. Display dropped file information (name, size, type)
- [ ] 91. Add "Export as File" context menu option with drag-to-desktop hint
- [ ] 92. Implement drag preview icon customization
- [ ] 93. Add drag-drop examples to Demo page

### File Watching UI (5 tasks)

- [ ] 94. Create file conflict dialog component (Reload, Keep, Diff options)
- [ ] 95. Add non-blocking notification when file changes externally
- [ ] 96. Implement auto-reload option in settings (bypass dialog)
- [ ] 97. Add file watch status indicator (show which files are being watched)
- [ ] 98. Handle file deletion notification with "Save As" option

### Offline/Sync UI (6 tasks)

- [ ] 99. Integrate OfflineIndicator into StatusBar (if add-ux-shell-features present)
- [ ] 100. Add sync status indicator (syncing, synced, errors)
- [ ] 101. Create sync queue viewer in developer tools (show pending operations)
- [ ] 102. Add manual sync trigger button in settings
- [ ] 103. Display sync errors with retry option
- [ ] 104. Add conflict resolution dialog (server wins, local wins, manual merge)

## Phase 5: Integration & Polish (Sequential)

### Security & Validation (8 tasks)

- [ ] 105. Audit all file path handling for security (no path traversal)
- [ ] 106. Add file extension allowlist configuration in settings
- [ ] 107. Implement rate limiting for file operations (prevent abuse)
- [ ] 108. Add file size limits with configurable overrides
- [ ] 109. Sanitize all imported data (prevent XSS in Markdown/CSV)
- [ ] 110. Add integrity checks for all backup operations (checksums)
- [ ] 111. Validate all IPC parameters in handlers
- [ ] 112. Conduct security review of all data management code

### Performance Optimization (6 tasks)

- [ ] 113. Implement streaming for large file operations (don't load into memory)
- [ ] 114. Add worker thread support for CPU-intensive tasks (ZIP, CSV parsing)
- [ ] 115. Optimize file watcher debouncing (tune delay for responsiveness)
- [ ] 116. Add queue processing throttling (limit concurrent operations)
- [ ] 117. Implement memory cleanup for watchers and listeners
- [ ] 118. Profile and optimize backup/restore for large datasets

### Cross-Platform Testing (7 tasks)

- [ ] 119. Test drag-drop on macOS (native file handling)
- [ ] 120. Test drag-drop on Windows (paths, permissions)
- [ ] 121. Test drag-drop on Linux (desktop environments: GNOME, KDE)
- [ ] 122. Test file watching on all platforms (fs.watch() behavior varies)
- [ ] 123. Test backup/restore with different path separators
- [ ] 124. Test connectivity detection on all platforms
- [ ] 125. Test sync queue with slow/unreliable network conditions

### Documentation & Examples (8 tasks)

- [ ] 126. Document drag-drop API in README (useDragDrop hook, DropZone component)
- [ ] 127. Document backup/restore workflow in user guide
- [ ] 128. Document import/export formats and schema requirements
- [ ] 129. Document file watching behavior and conflict resolution
- [ ] 130. Document offline mode and sync queue architecture
- [ ] 131. Add code examples for each data management feature
- [ ] 132. Create video demo showcasing all features
- [ ] 133. Update DEVELOPMENT.md with data management patterns

## Phase 6: Validation & Refinement (Sequential)

### Final Testing & Validation (10 tasks)

- [ ] 134. Run `openspec validate add-data-management --strict` and fix all issues
- [ ] 135. Verify all 6 specs pass validation
- [ ] 136. Run full test suite and ensure 100% pass rate
- [ ] 137. Test all features with screen reader (accessibility check)
- [ ] 138. Test backup/restore with corrupted files (error handling)
- [ ] 139. Test import with malicious files (security validation)
- [ ] 140. Test sync queue under extreme conditions (10,000 operations)
- [ ] 141. Benchmark backup/restore performance (target < 5s for 50MB)
- [ ] 142. Conduct user testing session (gather feedback on UX)
- [ ] 143. Final code review and cleanup

## Dependencies & Sequencing

**Critical Path:**
Phase 1 (Foundation) → Phase 2 (Import/Export) → Phase 3 (Offline/Sync) → Phase 4 (UI) → Phase 5 (Integration) → Phase 6 (Validation)

**Parallelizable Work:**
- Phase 1: Drag-drop, Backup, File Watching can be developed in parallel
- Phase 2: Format handlers can be developed independently
- Phase 4: All UI tasks can be split across team members
- Phase 5: Security audit, performance optimization, and cross-platform testing can overlap

**Blockers:**
- Sync Queue depends on Connectivity Manager
- UI integration depends on core services being complete
- SQLite backup features depend on add-secure-storage being implemented
- Testing depends on all implementation complete

**External Dependencies:**
- add-secure-storage: Optional, for SQLite backup support
- add-ux-shell-features: Optional, for StatusBar integration

**Total Tasks:** 143

**Estimated Effort:**
- Phase 1: ~12 hours (parallelizable to ~6 hours with 3 devs)
- Phase 2: ~10 hours
- Phase 3: ~11 hours
- Phase 4: ~13 hours (parallelizable to ~4 hours with multiple devs)
- Phase 5: ~11 hours (parallelizable to ~6 hours)
- Phase 6: ~6 hours
- **Total: ~63 hours (~35 hours with parallelization)**
