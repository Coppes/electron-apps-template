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

## Automated Testing (MemLab)
We use **MemLab** to automatically detect leaks.

### Running Tests Locally
```bash
npm run test:memory
```
This will launch the app and run defined scenarios (in `scenarios/`).

### Writing Scenarios
Create a new file in `scenarios/` (e.g., `my-feature.js`):
```javascript
module.exports = {
  name: 'MyFeatureLeakCheck',
  action: async (page) => {
    // Perform action that opens/creates things
    await page.click('#open-feature');
  },
  back: async (page) => {
    // Reverse action (close/cleanup)
    await page.click('#close-feature');
  },
  repeat: 3,
};
```
MemLab will run `action` -> `back` repeatedly and check if memory grows.
