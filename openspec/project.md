# Project Context

## Purpose

Modern, secure, and scalable Electron + React boilerplate for desktop apps. Focuses on best practices for security, modularity, and maintainability. Includes comprehensive features: window management, IPC bridge, security hardening (CSP, navigation guards, permissions, audit logging), error handling, crash reporting, auto-updates, persistent storage, and testing infrastructure. Enables rapid prototyping and production-ready apps with context isolation and safe IPC communication.

## Tech Stack

### Core Framework

- **Electron** v39.1.2 - Main, preload, and renderer processes
- **React** v18.3.1 - JSX, hooks, functional components
- **Node.js** - ES2022+ modules (type: "module")

### Build & Development

- **electron-vite** v4.0.1 - Fast Vite-based build tool
- **Vite** v7.2.2 - Development server with HMR
- **Babel** v7.28.5 - ES6+ transpilation (env + react presets)

### UI & Styling

- **Tailwind CSS** v4.1.17 - Utility-first CSS with dark/light theme support
- **shadcn/ui** - Radix UI primitives (@radix-ui/react-*)
  - Dialog, Dropdown Menu, Slot components
- **class-variance-authority** v0.7.1 - Component variants
- **clsx** v2.1.1 + **tailwind-merge** v3.3.1 - Class name utilities

### Testing

- **Vitest** v4.0.8 - Fast unit test runner
- **@testing-library/react** v16.3.0 - Component testing
- **@testing-library/jest-dom** v6.9.1 - DOM matchers
- **@testing-library/user-event** v14.6.1 - User interaction simulation
- **@vitest/coverage-v8** v4.0.8 - Code coverage
- **jsdom** v27.1.0 - DOM environment for tests

### Code Quality

- **ESLint** v8.57.1 - JavaScript/React linting
  - eslint-config-react-app v7.0.1
  - eslint-plugin-react v7.37.5
  - eslint-plugin-react-hooks v7.0.1
  - eslint-plugin-jsx-a11y v6.10.2
  - eslint-plugin-import v2.32.0

### Electron Utilities

- **electron-store** v11.0.2 - Persistent JSON storage
- **electron-log** v5.4.3 - Multi-transport logging
- **electron-updater** v6.6.2 - Auto-update functionality
- **electron-devtools-installer** v4.0.0 - React DevTools
- **electron-is-dev** v3.0.1 - Environment detection
- **electron-squirrel-startup** v1.0.1 - Windows installer handling

### Monitoring

- **@sentry/electron** v5.0.0 - Error tracking and crash reporting

## Project Conventions

### Code Style

- **Language**: JavaScript ES2022+ with JSX
- **Modules**: ESM (import/export), type: "module" in package.json
- **Indentation**: 2 spaces
- **Components**: Functional components with hooks (preferred), PascalCase naming
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE (e.g., IPC_CHANNELS)
- **Formatting**: Enforced by ESLint (airbnb + react/recommended)
- **File Extensions**: .js for logic, .jsx for React components

### Architecture Patterns

#### Main Process (src/main/)

- **main.js**: Entry point, initializes app
- **window-manager.js**: Singleton window manager, creates/manages BrowserWindow instances
- **lifecycle.js**: Singleton lifecycle manager, app startup/shutdown
- **config.js**: Centralized configuration (window defaults, CSP, etc.)
- **logger.js**: Structured logging with electron-log
- **menu.js**: Application menu with platform-specific variants
- **dev-tools.js**: Development tools (React DevTools, HMR, performance monitoring)
- **error-handler.js**: Global error handling, crash reporting
- **updater.js**: Auto-update with electron-updater
- **crash-reporter.js**: Crash reporting configuration

#### Security (src/main/security/)

- **context-isolation.js**: Context isolation enforcement
- **csp.js**: Content Security Policy header builder
- **navigation-guard.js**: URL navigation validation and blocking
- **permissions.js**: Permission request handler
- **audit-log.js**: Security event logging (CSP violations, blocked navigation, permissions)

#### IPC Communication (src/main/ipc/)

- **bridge.js**: IPC handler registration and routing
- **schema.js**: Zod-based payload validation schemas
- **handlers/**: Modular IPC handlers
  - `window.js`: Window operations (create, close, minimize, maximize, getState)
  - `store.js`: Persistent storage (get, set, delete, has, clear)
  - `dialog.js`: Native dialogs (open, save, message, error)
  - `app.js`: App info (version, path, quit, relaunch, platform, updates)
  - `log.js`: Remote logging from renderer
  - `system.js`: System information

#### Preload (src/preload.js)

- **contextBridge**: Exposes secure API to renderer
- **APIs**: windowAPI, storeAPI, dialogAPI, appAPI, systemAPI, logAPI, eventsAPI, updateAPI
- **Backward Compatibility**: Legacy methods (setTitle, openFile) for migration

#### Renderer (src/renderer/)

- **index.js**: React entry point, mounts App
- **App.jsx**: Root component with routing/layout
- **components/**:
  - `layout/`: AppShell (sidebar layout)
  - `pages/`: HomePage, DemoPage, SettingsPage, AboutPage
  - `ui/`: Reusable UI components (Button, Input, Card, etc.)
  - `Demo.jsx`: Demonstrates window and dialog APIs
  - `ErrorBoundary.jsx`: React error boundary with logging
  - `UpdateNotification.jsx`: Auto-update UI
  - `SafeHTML.jsx`: XSS-safe HTML renderer
- **Security**: Content Security Policy enforced, no inline scripts, sanitized HTML

#### Testing (test/)

- **setup/**: Test configuration
  - `electron-mocks.js`: Complete Electron API mocks
  - `vitest.setup.main.js`: Main process test setup
  - `vitest.setup.renderer.js`: Renderer test setup
  - `test-helpers.js`: Reusable test utilities
- **fixtures/**: Test data (window, IPC, app states)
- **unit/main/**: Main process tests (window-manager, logger, security)
- **unit/renderer/**: Renderer tests (components)
- **integration/**: Cross-process tests (deferred)
- **e2e/**: End-to-end tests (deferred)

### Testing Strategy

- **Runners**: Vitest for both main and renderer processes
- **Configurations**:
  - `vitest.config.main.js`: Node environment for main process
  - `vitest.config.renderer.js`: jsdom environment for React
  - `vitest.config.js`: Default (jsdom)
- **Coverage**: >80% target for core modules
- **Test Files**: `*.test.js` or `*.test.jsx`, colocated or in test/unit/
- **Current Status**: 153 tests passing (82 main + 71 renderer)
- **Mocking**: Complete Electron API mocks in `electron-mocks.js`
- **CI**: GitHub Actions workflow configured (.github/workflows/test.yml)

### Security Conventions

- **Context Isolation**: ALWAYS enabled (contextIsolation: true)
- **Node Integration**: ALWAYS disabled (nodeIntegration: false)
- **Sandbox**: Enabled for renderer
- **CSP**: Strict policy, no unsafe-inline, no unsafe-eval
- **IPC**: Only via contextBridge, schema-validated
- **Navigation**: Allowlist-based, blocks unauthorized URLs
- **Permissions**: User prompt for media, geolocation, notifications
- **Audit Logging**: All security events logged to security-audit.log
- **Dependencies**: Audited regularly, no remote code execution
- **External Links**: Open in default browser via shell.openExternal

### Git Workflow

- **Branching**: Feature branches from main
- **Commits**: Conventional Commits (feat, fix, chore, docs, test, refactor, perf, style, ci)
- **PRs**: Require review and passing tests
- **Rebase**: Preferred over merge commits
- **Protection**: Main branch protected, CI must pass

### File Organization

```
src/
├── main.js                    # Electron main entry
├── preload.js                 # Context bridge
├── common/
│   ├── constants.js          # IPC channels, constants
│   └── types.js              # Type definitions
├── css/
│   └── globals.css           # Tailwind + CSS variables
├── main/
│   ├── window-manager.js     # Window management
│   ├── lifecycle.js          # App lifecycle
│   ├── config.js             # Configuration
│   ├── logger.js             # Logging
│   ├── menu.js               # Application menu
│   ├── error-handler.js      # Error handling
│   ├── updater.js            # Auto-updates
│   ├── crash-reporter.js     # Crash reporting
│   ├── dev-tools.js          # Dev utilities
│   ├── ipc/
│   │   ├── bridge.js         # IPC registration
│   │   ├── schema.js         # Validation schemas
│   │   └── handlers/         # IPC handlers
│   └── security/
│       ├── csp.js            # CSP policy
│       ├── navigation-guard.js
│       ├── permissions.js
│       └── audit-log.js
└── renderer/
    ├── index.html
    ├── index.js
    ├── App.jsx
    ├── components/
    │   ├── layout/
    │   ├── pages/
    │   ├── ui/
    │   ├── Demo.jsx
    │   ├── ErrorBoundary.jsx
    │   ├── UpdateNotification.jsx
    │   └── SafeHTML.jsx
    └── utils/
        └── cn.js             # className utilities

test/
├── setup/                     # Test configuration
├── fixtures/                  # Test data
├── unit/
│   ├── main/                  # Main process tests
│   └── renderer/              # Renderer tests
├── integration/               # Integration tests
└── e2e/                       # E2E tests
```

## Domain Context

Desktop applications with secure local execution. No backend required by default. Operates entirely client-side with optional cloud integrations. Primary use cases:

- Productivity tools
- Database clients
- Developer tools
- Media applications
- System utilities

IPC communication between isolated processes. UI/UX follows modern desktop standards with native OS integration. Supports Windows, macOS, and Linux.

## Important Constraints

### Security Requirements (NON-NEGOTIABLE)

1. **Context Isolation**: MUST be enabled
2. **Node Integration**: MUST be disabled in renderer
3. **Sandbox**: MUST be enabled
4. **CSP**: MUST have strict policy
5. **IPC**: MUST use contextBridge only
6. **Validation**: ALL IPC payloads MUST be validated
7. **Navigation**: MUST use allowlist-based validation
8. **External URLs**: MUST open in external browser
9. **Dependencies**: MUST be audited (npm audit)
10. **No Remote Code**: MUST NOT execute remote code

### Development Constraints

- Accessibility (a11y) required for all UI
- Dark mode support required
- Error boundaries required for React components
- Logging required for all errors and security events
- Tests required for new features (>80% coverage goal)
- Documentation required for public APIs

### Performance Constraints

- Main process startup: < 2 seconds
- Window creation: < 500ms
- IPC response time: < 100ms
- Memory usage: Monitor and log in development

## External Dependencies

### Runtime Dependencies

No external APIs or services required by default. All functionality is self-contained.

### Optional Integrations

If added, document here:

- **Sentry**: Error tracking (configured but token required)
- **Auto-updater**: Update server URL (must be HTTPS)

### Dependency Management

- All dependencies in package.json
- Regular security audits: `npm audit`
- Update strategy: Minor/patch updates monthly, major updates quarterly
- Lock file: package-lock.json committed

### Dependency Security

- electron-store: Local JSON storage only, no network
- electron-log: File system only, no remote logging
- electron-updater: HTTPS only, signature verification
- Sentry: Opt-in, no PII by default
