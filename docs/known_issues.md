# Known Issues & Backlog

## Data Management

### File Watching Compatibility
- **Issue**: File watching events for files *inside* a watched folder may not trigger consistently on all operating systems (specifically macOS).
- **Details**: The current implementation uses node's `fs.watch` which has platform-dependent behavior regarding recursive watching and filename availability.
- **Workaround**: Currently, direct file watching is more reliable than folder watching.
- **Status**: Under Investigation.

### Backup Persistence & Date Format
- **Issue**: Backup Schedule settings may not persist correctly across application restarts.
- **Issue**: "Invalid Date" may appear for backups in certain locales or if the timestamp format in `electron-store` is inconsistent.
- **Details**: Potential synchronization issues between Renderer and Main process when using `electron-store`.
- **Status**: Pending Fix.
