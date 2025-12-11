# Spec: Universal Undo/Redo & Settings

## ADDED Requirements

### Requirement: Centralized History Management
The application MUST provide a global history stack that tracks user actions and allows them to be undone and redone.

#### Scenario: Sequential Undo
User makes 3 edits. Pressing Undo 3 times reverts them in order.

#### Scenario: Redo Clearing
User Undoes a change, then performs a new action. The Redo stack is cleared.

### Requirement: Configurable History Limit
The history stack MUST respect a maximum size defined in user settings.

#### Scenario: Max Size Enforcement
`history.maxStackSize` is set to 2. User performs 3 actions. The first action is discarded and cannot be undone.

### Requirement: Structured Settings Schema
Settings MUST be stored in a structured JSON format with namespaces.

#### Scenario: Migration Logic
Migration logic automatically moves root-level keys (e.g., `theme`) to their new namespaces (e.g., `appearance.theme`) on startup.

### Requirement: Settings Export
The application MUST provide a way for users to export their settings to a `settings.json` file.

#### Scenario: Manual Export
User clicks "Export Settings" in the Settings page. A save dialog opens, allowing the user to save `settings.json` to their disk.
