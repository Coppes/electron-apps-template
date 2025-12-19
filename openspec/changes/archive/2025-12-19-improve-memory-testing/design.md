# Hybrid Memory Testing Design

## Architecture

### 1. Test Runner (Vitest/Node)
The tests will be executed by a Node.js script (or Vitest suite) that coordinates the workflow.

### 2. Interaction Driver (Playwright)
Instead of MemLab's internal Puppeteer, we use **Playwright**.
- connects to the Electron app.
- navigates specifically to test scenarios.
- waits for specific "stable" states (e.g., garbage collection points).

### 3. Snapshot Capture (CDP)
We utilize Playwright's `context.newCDPSession(page)` to communicate directly with the V8 debugger.
- `HeapProfiler.takeHeapSnapshot` is called at key lifecycle events:
    1.  **Baseline**: After initial load and warmup.
    2.  **Target**: After performing the action (e.g., opening a window).
    3.  **Final**: After reverting the action (e.g., closing the window) and forcing GC.

### 4. Analysis Engine (MemLab API)
The captured `.heapsnapshot` files are passed to `memlab`'s `isLeaking` or `findLeaks` API.
- MemLab analyzes the object graph diff between Baseline and Final.
- Reports retained objects that strictly shouldn't exist (e.g., Detached DOM nodes, React Fiber roots).

## Workflow

1.  **Setup**: Launch Electron with Playwright.
2.  **Warmup**: Render Home page. Force GC. -> *Snapshot 1 (Baseline)*.
3.  **Action**: Navigate to Target Page / Open Window. -> *Snapshot 2 (Target)*.
4.  **Revert**: Navigate Back / Close Window. Force GC. -> *Snapshot 3 (Final)*.
5.  **Analyze**:
    ```javascript
    const { findLeaks } = require('@memlab/api');
    const result = await findLeaks({ baseline: s1, target: s2, final: s3 });
    ```
6.  **Assert**: Fail test if `result.leaks.length > 0`.

## Trade-offs
- **Complexity**: Slightly higher setup complexity than "out of the box" CLI tools.
- **Pros**: Complete control over app state; correct execution environment; uses existing E2E testing knowledge.
