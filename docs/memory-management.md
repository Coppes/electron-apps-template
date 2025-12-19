# Memory Management Guide

This project takes memory leaks seriously. Electron applications are prone to leaks due to the long-lived nature of the main process and the complex interaction between Node.js and Chromium.

## Prevention Guidelines

### 1. Event Listeners
**Always** remove event listeners when components unmount or when they are no longer needed.
- **Use Helper Hooks:**
  - `useIpcListener(channel, callback)`: Safely listens to IPC events and cleans up on unmount.
  - `useGlobalShortcut(accelerator, callback)`: Registers/unregisters global shortcuts automatically.

### 2. Timers
Clear intervals and timeouts in cleanup functions.
```javascript
useEffect(() => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer); // Crucial!
}, []);
```

### 3. Exhaustive Dependencies
We enforce `react-hooks/exhaustive-deps` as an **error**. Do not ignore this rule. Missing dependencies often lead to stale closures, which can hold onto old object references preventing GC.

### 4. DOM Nodes
Avoid detaching DOM nodes and keeping references to them in JS variables. If you create a ref to an element, ensure React manages its lifecycle.

## Automated Memory Testing (Hybrid)
We use a **Hybrid approach** utilizing **Playwright** to drive the application and **MemLab** to analyze heap snapshots.

### Running Tests Locally
```bash
npm run test:memory
```
This command:
1. Starts the `dev` server (if not running).
2. Launches a headless Chromium instance (via Playwright).
3. Executes scenarios defined in `test/memory/scenarios/`.
4. Captures heap snapshots via Chrome/Electron Debugging Protocol (CDP).
5. Analyzes snapshots for memory leaks using MemLab CLI.

### Writing Scenarios
Create a new file in `test/memory/scenarios/` with a `.cjs` extension (e.g., `my-feature.cjs`).
**Note**: Files *must* be `.cjs` (CommonJS) to generate valid snapshots compatible with MemLab's analysis tools.

```javascript
module.exports = {
  name: () => 'MyFeatureLeakCheck',
  // Use a cache-busting param to ensure fresh index.html (mock injection)
  url: () => `http://localhost:5173?t=${Date.now()}`,
  
  action: async (page) => {
    // Use standard Playwright API
    await page.click('#open-feature');
    await page.waitForSelector('.feature-modal', { state: 'visible' });
  },
  
  back: async (page) => {
    // Reverse action (close/cleanup)
    const closeBtn = page.locator('#close-feature');
    await closeBtn.click();
    await page.waitForSelector('.feature-modal', { state: 'hidden' });
  },
  
  repeat: () => 3,
};
```
MemLab will run `action` -> `back` repeatedly and check if memory grows.
