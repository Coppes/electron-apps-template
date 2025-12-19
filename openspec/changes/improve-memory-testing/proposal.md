# Improve Memory Testing

## Summary
Replace the failing standalone MemLab execution model with a robust "Hybrid" approach. Use **Playwright** to drive the Electron application and capture heap snapshots (via CDP), and use **MemLab's API** to analyze those snapshots for leaks.

## Problem
The current MemLab integration fails because it launches a separate Chromium instance that cannot correctly execute the application's JavaScript (due to Vite/ESM serving and Electron API mocking gaps). This effectively blocks all automated memory testing.

## Solution
Leverage the existing, proven Playwright E2E infrastructure to:
1.  Launch the Electron app.
2.  Perform user interactions (scenarios).
3.  Capture heap snapshots using the Chrome DevTools Protocol (CDP).
4.  Feed these snapshots into MemLab's analysis engine to detect leaks programmatically.

## Impact
- **Reliability**: Uses the actual Electron functionality (via Playwright) instead of a mocked browser environment.
- **Maintainability**: Reuses E2E patterns and setup.
- **Accuracy**: Analyzes real application memory usage.
