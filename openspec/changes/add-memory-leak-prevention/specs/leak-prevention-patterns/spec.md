# Spec: Leak Prevention Patterns & Tooling

## Goal
Establish coding patterns and static analysis rules to prevent memory leaks during development.

## Requirements

### 1. Linting Rules
- **Requirement:** Configure ESLint to warn about common leak sources.
- **Requirement:** Enforce `react-hooks/exhaustive-deps` (strictly).

### 2. Helper Hooks
- **Requirement:** Create `useIpcListener` hook.
    - *Scenario:* When component unmounts, the IPC listener is automatically removed.
- **Requirement:** Create `useGlobalShortcut` hook.
    - *Scenario:* When component unmounts, the global shortcut is unregistered.

### 3. Developer Documentation
- **Requirement:** Create `docs/memory-management.md`.
    - *Content:* Explains "How to write leak-free code", "How to run memory tests", and "Common pitfalls" (e.g., closures in event listeners).

## Verification
- **Test:** Use the new hooks in a sample component.
- **Verify:** Manually verify that listeners are removed (using `win.listeners(eventName)` or via MemLab check) when the component is unmounted.
