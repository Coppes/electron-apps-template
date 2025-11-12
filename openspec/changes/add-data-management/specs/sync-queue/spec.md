# Spec: Sync Queue

## ADDED Requirements

### Requirement: Offline-First Operation Queue

The system SHALL maintain a persistent queue of operations that can be executed offline and synced when connectivity is restored.

#### Scenario: Enqueue operation while offline

**Given** the application is offline  
**When** a user performs a data-modifying operation  
**Then** the operation SHALL be added to the sync queue  
**And** SHALL be persisted to electron-store immediately  
**And** SHALL have status "pending"  
**And** the UI SHALL update optimistically

#### Scenario: Queue operation structure

**Given** an operation is enqueued  
**When** the operation is stored  
**Then** it SHALL contain: id (UUID), type (create/update/delete), entity, entityId, data, timestamp, retries, status  
**And** all fields SHALL be persisted  
**And** the operation SHALL be serializable to JSON

### Requirement: Automatic Sync When Online

The sync queue SHALL automatically process pending operations when connectivity is restored.

#### Scenario: Trigger sync on online event

**Given** the application is offline with queued operations  
**When** connectivity is restored  
**Then** the sync queue SHALL start processing automatically  
**And** operations SHALL be processed in FIFO order  
**And** a sync progress indicator SHALL appear

#### Scenario: Process queued operations

**Given** the sync queue has pending operations  
**And** the application is online  
**When** sync processing starts  
**Then** each operation SHALL be sent to the backend sequentially  
**And** successful operations SHALL be marked "synced"  
**And** failed operations SHALL be retried with backoff

#### Scenario: Sync completion

**Given** the sync queue is processing  
**When** all pending operations are synced or failed  
**Then** a 'sync-complete' event SHALL be emitted  
**And** synced operations SHALL be archived  
**And** the user SHALL be notified of the result

### Requirement: Retry Logic with Exponential Backoff

Failed sync operations SHALL be retried automatically with exponential backoff.

#### Scenario: Retry failed operation

**Given** an operation fails to sync (network error)  
**When** the failure is detected  
**Then** the retry counter SHALL be incremented  
**And** the operation SHALL be retried after a delay  
**And** the delay SHALL be: 2^retries seconds (1s, 2s, 4s, 8s, 16s)

#### Scenario: Maximum retry limit

**Given** an operation has failed 5 times  
**When** the 5th retry fails  
**Then** the operation SHALL be marked as "failed"  
**And** SHALL NOT be retried automatically  
**And** the user SHALL be notified of the permanent failure  
**And** the operation SHALL remain in the queue for manual review

### Requirement: Conflict Detection and Resolution

The sync queue SHALL detect conflicts when operations are rejected by the backend.

#### Scenario: Detect sync conflict

**Given** an update operation is being synced  
**When** the backend returns HTTP 409 (Conflict)  
**Then** the operation SHALL be marked as "conflict"  
**And** a conflict resolution dialog SHALL appear  
**And** the operation SHALL not be marked as synced or failed

#### Scenario: Server wins conflict resolution

**Given** a conflict is detected  
**When** the user selects "Use Server Version"  
**Then** the local operation SHALL be discarded  
**And** the server version SHALL be fetched and applied  
**And** the operation SHALL be marked as "resolved"

#### Scenario: Local wins conflict resolution

**Given** a conflict is detected  
**When** the user selects "Use My Version"  
**Then** the local operation SHALL be re-sent with force flag  
**And** the backend SHALL overwrite the server version  
**And** the operation SHALL be marked as "synced"

#### Scenario: Manual merge

**Given** a conflict is detected  
**When** the user selects "Merge Changes"  
**Then** a diff view SHALL show both versions  
**And** the user SHALL be able to select which fields to keep  
**And** the merged version SHALL be sent to the backend

### Requirement: Queue State Persistence

The sync queue state SHALL be persisted to electron-store and survive application restarts.

#### Scenario: Persist queue on operation

**Given** an operation is enqueued or updated  
**When** the queue state changes  
**Then** the entire queue SHALL be saved to electron-store  
**And** SHALL be saved immediately (no debouncing)  
**And** SHALL be recoverable after crash

#### Scenario: Restore queue on startup

**Given** the application starts  
**When** the sync queue initializes  
**Then** the queue state SHALL be loaded from electron-store  
**And** pending operations SHALL be restored  
**And** SHALL resume processing if online

### Requirement: Queue Size Management

The sync queue SHALL enforce size limits and automatically purge old synced operations.

#### Scenario: Enforce maximum queue size

**Given** the sync queue has 10,000 operations  
**When** a new operation is enqueued  
**Then** the oldest synced operation SHALL be removed  
**And** the new operation SHALL be added  
**And** a warning SHALL be logged

#### Scenario: Purge old synced operations

**Given** the sync queue contains synced operations older than 7 days  
**When** a purge operation runs  
**Then** operations older than 7 days SHALL be deleted  
**And** only pending, syncing, and failed operations SHALL be retained  
**And** the purge SHALL run automatically daily

### Requirement: Backend Adapter Pattern

The sync queue SHALL use an adapter pattern to support different backend implementations.

#### Scenario: Use REST adapter

**Given** the application is configured with a REST backend  
**When** operations are synced  
**Then** the REST adapter SHALL send HTTP requests  
**And** SHALL use appropriate HTTP methods (POST, PUT, DELETE)  
**And** SHALL handle REST-specific responses

#### Scenario: Use mock adapter for testing

**Given** no backend is configured  
**When** operations are synced  
**Then** the mock adapter SHALL simulate sync  
**And** SHALL randomly succeed or fail for testing  
**And** SHALL not make actual network requests

#### Scenario: Custom adapter

**Given** a developer implements a custom adapter  
**When** the adapter is registered  
**Then** the sync queue SHALL use the custom adapter  
**And** SHALL call adapter.sync(operation) for each operation  
**And** SHALL handle adapter-specific responses

### Requirement: Manual Sync Trigger

Users SHALL be able to manually trigger sync operations.

#### Scenario: Trigger manual sync

**Given** the application is online  
**And** pending operations exist in the queue  
**When** the user clicks "Sync Now" in settings  
**Then** the sync queue SHALL start processing immediately  
**And** SHALL process all pending operations  
**And** SHALL show sync progress

#### Scenario: Prevent sync when offline

**Given** the application is offline  
**When** the user attempts to trigger manual sync  
**Then** the sync SHALL be blocked  
**And** a message SHALL appear: "Cannot sync while offline"  
**And** no sync operations SHALL be attempted

### Requirement: Sync Progress Indication

The system SHALL provide detailed progress information during sync operations.

#### Scenario: Show sync progress

**Given** the sync queue is processing operations  
**When** sync is in progress  
**Then** a progress indicator SHALL show:  
- Number of operations synced  
- Number of operations remaining  
- Current operation being synced  
- Estimated time remaining

#### Scenario: Show sync errors

**Given** sync operations are failing  
**When** errors occur  
**Then** error details SHALL be displayed  
**And** SHALL show which operations failed  
**And** SHALL provide a "Retry" button

### Requirement: Queue Inspection and Management

Users SHALL be able to inspect the sync queue and manage operations.

#### Scenario: View queued operations

**Given** the user opens the sync queue viewer  
**When** the viewer renders  
**Then** all queued operations SHALL be listed  
**And** SHALL show: operation type, entity, timestamp, status, retries  
**And** SHALL be sortable by timestamp or status

#### Scenario: Cancel queued operation

**Given** an operation is pending in the queue  
**When** the user selects "Cancel" for that operation  
**Then** the operation SHALL be removed from the queue  
**And** SHALL not be synced  
**And** a confirmation SHALL be required

#### Scenario: Retry failed operation manually

**Given** an operation has failed permanently  
**When** the user clicks "Retry" for that operation  
**Then** the retry counter SHALL be reset  
**And** the operation SHALL be moved back to "pending" status  
**And** SHALL be re-attempted on the next sync

### Requirement: Optimistic Updates

The UI SHALL update optimistically when operations are enqueued, providing immediate feedback.

#### Scenario: Optimistic create

**Given** the user creates a new record while offline  
**When** the create operation is enqueued  
**Then** the UI SHALL immediately show the new record  
**And** the record SHALL be marked as "pending sync"  
**And** SHALL update to "synced" once sync completes

#### Scenario: Rollback on permanent failure

**Given** an optimistically updated record fails to sync permanently  
**When** the maximum retries are exhausted  
**Then** the UI SHALL rollback the optimistic update  
**And** the record SHALL be removed or reverted  
**And** the user SHALL be notified of the rollback

### Requirement: Sync Queue Performance

The sync queue SHALL process operations efficiently without blocking the UI.

#### Scenario: Async operation processing

**Given** the sync queue is processing operations  
**When** sync is in progress  
**Then** the UI SHALL remain responsive  
**And** sync SHALL run in the background  
**And** users SHALL be able to continue using the app

#### Scenario: Throttle concurrent syncs

**Given** the sync queue has 1,000 pending operations  
**When** sync processing starts  
**Then** a maximum of 5 operations SHALL sync concurrently  
**And** SHALL prevent overwhelming the backend  
**And** SHALL maintain rate limits
