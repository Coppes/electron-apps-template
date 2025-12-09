# Testing Guide

This document provides comprehensive information about testing in the Electron Apps Template.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Mocks and Fixtures](#mocks-and-fixtures)
- [Coverage](#coverage)
- [Debugging Tests](#debugging-tests)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses **Vitest** as the test framework with comprehensive test coverage for:

- **Main Process Tests**: Node.js environment for Electron main process modules
- **Renderer Process Tests**: jsdom environment for React components
- **Integration Tests**: Testing cross-process communication
- **E2E Tests**: End-to-end testing with Playwright (planned)

## Test Structure

```
test/
├── setup/
│   ├── vitest.setup.main.js          # Main process setup
│   ├── vitest.setup.renderer.js      # Renderer process setup
│   ├── electron-mocks.js             # Electron API mocks
│   └── test-helpers.js               # Reusable test utilities
├── fixtures/
│   ├── window-fixtures.js            # Window state fixtures
│   ├── ipc-fixtures.js               # IPC payload fixtures
│   └── app-fixtures.js               # App state fixtures
├── unit/
│   ├── main/                         # Main process unit tests
│   │   ├── window-manager.test.js
│   │   ├── logger.test.js
│   │   └── ipc/
│   ├── renderer/                     # Renderer process unit tests
│   │   ├── App.test.jsx
│   │   └── components/
│   └── security/                     # Security tests
│       ├── security.csp.test.js
│       ├── security.navigation.test.js
│       └── security.permissions.test.js
├── integration/                      # Integration tests (planned)
└── e2e/                              # E2E tests (planned)
```

## Running Tests

### Run All Tests

```bash
npm test                    # Run all tests in watch mode
npm run test:unit           # Run unit tests only
npm run test:coverage       # Run tests with coverage report
```

### Run Specific Test Suites

```bash
npm run test:main           # Main process tests only
npm run test:renderer       # Renderer process tests only
```

### Run in Watch Mode

```bash
npm run test:watch          # Watch mode for development
```

### Run with UI

```bash
npm run test:ui             # Open Vitest UI for interactive testing
```

### Run Specific Test Files

```bash
npx vitest run test/unit/main/window-manager.test.js
npx vitest run test/unit/renderer/App.test.jsx
```

## Writing Tests

### Main Process Tests

Main process tests run in a Node.js environment with mocked Electron APIs.

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WindowManager } from '../../../src/main/window-manager.js';
import { WINDOW_TYPES } from '../../../src/common/constants.js';

describe('WindowManager', () => {
  let windowManager;

  beforeEach(() => {
    vi.clearAllMocks();
    windowManager = new WindowManager();
  });

  it('should create window with default type', () => {
    const window = windowManager.createWindow();
    expect(window).toBeDefined();
  });
});
```

### Renderer Process Tests

Renderer tests run in a jsdom environment with React Testing Library.

```javascript
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../../src/renderer/App';

describe('App Component', () => {
  it('should render without errors', () => {
    render(<App />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```javascript
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  render(<Demo />);
  
  const button = screen.getByRole('button', { name: /click me/i });
  await user.click(button);
  
  expect(screen.getByText(/clicked/i)).toBeInTheDocument();
});
```

## Mocks and Fixtures

### Using Electron Mocks

All Electron APIs are automatically mocked in tests via `test/setup/electron-mocks.js`.

```javascript
import { BrowserWindow, mockApp } from '../../setup/electron-mocks.js';

// BrowserWindow is fully mocked
const window = new BrowserWindow();
expect(window.loadURL).toBeDefined();
expect(window.close).toBeDefined();

// Mock app methods
mockApp.getVersion.mockReturnValue('2.0.0');
```

### Using window.electronAPI Mock

Renderer tests automatically have `window.electronAPI` mocked:

```javascript
// This is available in all renderer tests
expect(window.electronAPI.setTitle).toBeDefined();
expect(window.electronAPI.store.get).toBeDefined();
expect(window.electronAPI.events.onUpdateAvailable).toBeDefined();
```

### Using Test Fixtures

```javascript
import { mainWindowConfig } from '../../fixtures/window-fixtures.js';
import { appIpcPayloads } from '../../fixtures/ipc-fixtures.js';

// Use predefined fixtures
const window = createWindow(mainWindowConfig);

// Test with valid and invalid payloads
const validPayload = appIpcPayloads.setTitle.valid;
const invalidPayload = appIpcPayloads.setTitle.invalid;
```

### Using Test Helpers

```javascript
import { createMockWindow, delay } from '../../setup/test-helpers.js';

// Create mock window with custom properties
const window = createMockWindow({
  isMaximized: vi.fn(() => true),
  getBounds: vi.fn(() => ({ x: 0, y: 0, width: 1920, height: 1080 })),
});

// Wait for async operations
await delay(100);
```

## Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:

- **coverage/index.html**: HTML report (open in browser)
- **coverage/lcov.info**: LCOV format for CI/CD

### Coverage Thresholds

Tests must meet the following coverage thresholds:

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### View Coverage in Browser

```bash
npm run test:coverage
open coverage/index.html
```

## Debugging Tests

### Debug in VS Code

Add a breakpoint in your test file and run:

```bash
# Add this to .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test", "--", "--run"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug Specific Test

```bash
npx vitest run --inspect-brk test/unit/main/window-manager.test.js
```

### Enable Verbose Logging

```bash
npx vitest --reporter=verbose
```

### View Test UI

```bash
npm run test:ui
```

The Vitest UI provides:
- Real-time test results
- Interactive test filtering
- Code coverage visualization
- Test execution graphs

## CI/CD

Tests run automatically on:

- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` or `develop` branches

### GitHub Actions Workflow

The `.github/workflows/test.yml` workflow:

1. Runs unit tests on Ubuntu, Windows, and macOS
2. Tests with Node.js 18.x and 20.x
3. Generates coverage report
4. Uploads coverage to Codecov
5. Runs linting

### Viewing CI Results

- GitHub Actions: Check the "Actions" tab in your repository
- Coverage: Available on Codecov after setup

## Troubleshooting

### Tests Failing with "Cannot find module"

**Solution**: Ensure imports use correct relative paths:

```javascript
// ✅ Correct
import App from '../../../src/renderer/App';

// ❌ Wrong
import App from './App';
```

### Mock Not Working

**Solution**: Clear mocks before each test:

```javascript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### "window.electronAPI is undefined"

**Solution**: Renderer tests should use `vitest.config.renderer.js`:

```bash
npm run test:renderer
```

### Tests Hanging or Timeout

**Solution**: Ensure async operations complete and cleanup is performed:

```javascript
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});
```

### Coverage Not Generated

**Solution**: Run with coverage flag:

```bash
npm run test:coverage -- --run
```

### ES Module Import Errors

**Solution**: Use dynamic imports for modules with circular dependencies:

```javascript
beforeEach(async () => {
  const module = await import('../../../src/main/module.js');
  // Use module
});
```

## Best Practices

1. **Isolate Tests**: Each test should be independent and not rely on others
2. **Use Descriptive Names**: Test names should clearly state what they test
3. **Mock External Dependencies**: Don't hit real APIs or file system
4. **Test Error Cases**: Don't just test happy paths
5. **Keep Tests Fast**: Avoid unnecessary delays or complex setups
6. **Use Fixtures**: Reuse test data via fixtures
7. **Clean Up**: Always clean up resources in `afterEach`
8. **Check Coverage**: Aim for >80% coverage on critical modules

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Events](https://testing-library.com/docs/user-event/intro)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/tutorial/automated-testing)

## Support

If you encounter issues not covered in this guide:

1. Check the [Vitest Documentation](https://vitest.dev/)
2. Review existing test files for examples
3. Open an issue in the repository
