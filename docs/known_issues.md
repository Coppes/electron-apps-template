# Known Issues & Backlog

## Status Bar

### Language Indicator Sync
- **Issue**: The status bar language indicator may display "EN" (English) even when the application language is correctly set to "PT-BR" (Portuguese).
- **Status**: Attempted fix with event listeners on `i18n`, but issue persists in some scenarios.
- **Priority**: Medium / Deferred.

### Tab Count Sync
- **Issue**: The "Tabs" count in the status bar may incorrectly display "1" or fail to update when multiple tabs are opened/closed.
- **Status**: Logic verified in tests but runtime behavior is inconsistent.
- **Priority**: Low / Deferred.

## Testing

### Secure Storage E2E
- **Issue**: `secure-storage-e2e.test.js` is currently skipped.
- **Reason**: Requires `safeStorage` mock infrastructure that mimics Main Process encryption in a way accessible to the disabled-node-integration renderer.
- **Priority**: Low (Unit tests cover functionality).
