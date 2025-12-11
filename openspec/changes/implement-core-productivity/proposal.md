# Proposal: Implement Core Productivity Features

## Outcome
Establish a "Pro" productivity foundation by implementing Universal Undo/Redo, a Plugin System, and an Onboarding Tour.

## Problem
Currently, the application lacks:
1.  **State Recovery**: Users cannot undo actions, leading to data loss anxiety.
2.  **Extensibility**: Adding features requires core code changes; no third-party ecosystem possible.
3.  **Discoverability**: New users have no guidance on how to use the app.

## Solution
1.  **Universal Undo/Redo**: Centralized History Manager with user-configurable limits.
2.  **Plugin System**: Lightweight architecture for third-party scripts/UI injection.
3.  **Onboarding Tour**: Interactive "Walkthrough" mode for new users.

## Risks
- **Memory Usage**: Unlimited history could bloat memory (mitigated by `maxStackSize`).
- **Security**: Plugins could execute malicious code (mitigated by sandboxing/permissions).
