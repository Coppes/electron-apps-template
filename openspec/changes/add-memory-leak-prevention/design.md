# Design: Memory Leak Prevention System

## Overview
This design outlines the technical approach to preventing and catching memory leaks. It focuses on two pillars: **Automated Verification** (using MemLab) and **Preventative Coding** (Linting & Utilities).

## Architecture

### 1. Automated Verification (MemLab Integration)
MemLab will be used to drive the application (via Puppeteer/Playwright or directly if achievable) to perform actions and inspect memory.

- **Workflow**:
    1.  Start App in a "profiling" mode (exposed GC if needed).
    2.  **Scenario**: Initial State (Snapshot A).
    3.  **Action**: Perform target action (e.g., Open Preferences).
    4.  **Reverse Action**: Close Preferences (Snapshot B).
    5.  **Analysis**: Compare A and B. Identify "leaked" objects (objects created by Action but not GC'd after Reverse Action).

- **CI Integration**: Run as a separate suite, likely scheduled or on-demand on PRs.

### 2. Preventative Patterns

#### Enhanced Hooks
Custom React hooks to ensure cleanup:
- `useIpcListener(channel, handler)`: Automatically removes listener on unmount.
- `useGlobalShortcut(accelerator, handler)`: Manages global shortcut lifecycle.

#### Linting Rules
- `eslint-plugin-react-hooks` (already likely present) - ensure correctness.
- Potential custom rules or `eslint-plugin-no-unsanitized` (if applicable) or rules to catch dangling listeners.

## Constraints & Trade-offs
- **GC Non-determinism**: JS GC is lazy. Tests must force GC (using `--expose-gc` flag in Node/Electron) to be reliable.
- **Execution Time**: Snapshotting is slow. Limit memory tests to "Critical User Journeys" (CUJs).
