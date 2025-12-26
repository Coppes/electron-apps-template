# Project Context

## Purpose

Modern, secure, and scalable Electron + React boilerplate for desktop apps. Focuses on best practices for security, modularity, and maintainability. Includes comprehensive features: window management, IPC bridge, security hardening (CSP, navigation guards, permissions, audit logging), error handling, crash reporting, auto-updates, persistent storage, and testing infrastructure. Enables rapid prototyping and production-ready apps with context isolation and safe IPC communication.

## Tech Stack

### Core Framework

- **Electron** v39.1.2 - Main, preload, and renderer processes
- **React** v18.3.1 - JSX, hooks, functional components
- **TypeScript** v5.9.3 - Static typing
- **Node.js** - ES2022+ modules (type: "module")

### Build & Development

- **electron-vite** v4.0.1 - Fast Vite-based build tool
- **Vite** v7.2.2 - Development server with HMR
- **Babel** v7.28.5 - ES6+ transpilation (env + react presets)
- **Storybook** v10.1.8 - UI component documentation and testing

### UI & Styling

- **Tailwind CSS** v4.1.17 - Utility-first CSS with dark/light theme support
- **shadcn/ui** - Radix UI primitives (@radix-ui/react-*)
- **@phosphor-icons/react** v2.1.10 - Icon library
- **framer-motion** v12.23.26 - Animations and gestures
- **class-variance-authority** v0.7.1 - Component variants
- **clsx** v2.1.1 + **tailwind-merge** v3.3.1 - Class name utilities

### Internationalization

- **i18next** v25.7.2 - I18n framework
- **react-i18next** v16.4.0 - React bindings for i18n
- **i18next-resources-to-backend** - Lazy loading of translations

### Testing

- **Vitest** v4.0.8 - Fast unit test runner
- **@testing-library/react** v16.3.0 - Component testing
- **@testing-library/jest-dom** v6.9.1 - DOM matchers
- **@testing-library/user-event** v14.6.1 - User interaction simulation
- **@vitest/coverage-v8** v4.0.8 - Code coverage
- **jsdom** v27.1.0 - DOM environment for tests

### Code Quality

- **ESLint** v8.57.1 - JavaScript/React/TypeScript linting
  - eslint-config-react-app v7.0.1
  - eslint-plugin-react v7.37.5
  - eslint-plugin-react-hooks v7.0.1
  - eslint-plugin-jsx-a11y v6.10.2
  - eslint-plugin-import v2.32.0 (with TS resolver)
  - @typescript-eslint/parser & plugins

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

- **Language**: TypeScript (strict mode)
- **Modules**: ESM (import/export), type: "module" in package.json
- **Indentation**: 2 spaces
- **Components**: Functional components with hooks (preferred), PascalCase naming
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE (e.g., IPC_CHANNELS)
- **Formatting**: Enforced by ESLint (airbnb + react/recommended)
- **File Extensions**: .ts for logic, .tsx for React components

### Architecture Patterns

#### Main Process (src/main/)

- **main.ts**: Entry point, initializes app
- **window-manager.ts**: Singleton window manager, creates/manages BrowserWindow instances
- **lifecycle.ts**: Singleton lifecycle manager, app startup/shutdown
- **config.ts**: Centralized configuration (window defaults, CSP, etc.)
- **logger.ts**: Structured logging with electron-log
- **menu.ts**: Application menu with platform-specific variants
- **tray.ts**: System tray icon and context menu management
- **shortcuts.ts**: Global keyboard shortcuts (accelerators) registry
- **notifications.ts**: Native OS notifications handler
- **recent-docs.ts**: OS Recent Documents integration
- **progress.ts**: Taskbar/Dock progress indicator
- **splash.ts**: Splash screen management
- **dev-tools.ts**: Development tools (React DevTools, HMR, performance monitoring)
- **error-handler.ts**: Global error handling, crash reporting
- **updater.ts**: Auto-update with electron-updater
- **crash-reporter.ts**: Crash reporting configuration
- **workers/**: Worker threads for CPU-intensive tasks

#### Security (src/main/security/)

- **context-isolation.ts**: Context isolation enforcement
- **csp.ts**: Content Security Policy header builder
- **navigation-guard.ts**: URL navigation validation and blocking
- **permissions.ts**: Permission request handler
- **audit-log.ts**: Security event logging (CSP violations, blocked navigation, permissions)

#### IPC Communication (src/main/ipc/)

- **bridge.ts**: IPC handler registration and routing
- **schema.ts**: Zod-based payload validation schemas
- **handlers/**: Modular IPC handlers
  - `window.ts`: Window operations (create, close, minimize, maximize, getState)
  - `store.ts`: Persistent storage (get, set, delete, has, clear)
  - `dialog.ts`: Native dialogs (open, save, message, error)
  - `app.ts`: App info (version, path, quit, relaunch, platform, updates)
  - `log.ts`: Remote logging from renderer
  - `system.ts`: System information
  - `workers.ts`: Worker thread management
  - `tray.ts`: Tray management

#### Preload (src/preload.ts)

- **contextBridge**: Exposes secure API to renderer
- **APIs**: windowAPI, storeAPI, dialogAPI, appAPI, systemAPI, logAPI, eventsAPI, updateAPI, trayAPI, shortcutsAPI

#### Renderer (src/renderer/)

- **index.html**
- **main.tsx**: React entry point, mounts App
- **App.tsx**: Root component with routing/layout
- **components/**:
  - `layout/`: AppShell (sidebar layout)
  - `pages/`: HomePage, DemoPage, SettingsPage, AboutPage, DataManagementPage, OSIntegrationPage
  - `ui/`: Reusable UI components (Button, Input, Card, ContextMenu, Slider, Table, Tooltip, etc.)
  - `CommandPalette.tsx`: 'Cmd+K' command interface
  - `StatusBar.tsx`: Bottom status bar
  - `TabBar.tsx`: Multi-tab interface
  - `TourOverlay.tsx`: Onboarding tour
  - `Demo.tsx`: Demonstrates window and dialog APIs
  - `ErrorBoundary.tsx`: React error boundary with logging
  - `UpdateNotification.tsx`: Auto-update UI
  - `SafeHTML.tsx`: XSS-safe HTML renderer
- **Security**: Content Security Policy enforced, no inline scripts, sanitized HTML

#### Testing (test/)

- **setup/**: Test configuration
  - `electron-mocks.js`: Complete Electron API mocks
  - `vitest.setup.main.ts`: Main process test setup
  - `vitest.setup.renderer.ts`: Renderer test setup
  - `test-helpers.ts`: Reusable test utilities
- **fixtures/**: Test data (window, IPC, app states)
- **unit/main/**: Main process tests (window-manager, logger, security)
- **unit/renderer/**: Renderer tests (components)
- **integration/**: Cross-process tests
- **e2e/**: End-to-end tests

### Testing Strategy

- **Runners**: Vitest for both main and renderer processes
- **Configurations**:
  - `vitest.config.main.ts`: Node environment for main process
  - `vitest.config.renderer.ts`: jsdom environment for React
  - `vitest.config.ts`: Default (jsdom)
- **Coverage**: >80% target for core modules
- **Test Files**: `*.test.ts` or `*.test.tsx`, colocated or in test/unit/
- **Current Status**: 153 tests passing (82 main + 71 renderer)
- **Mocking**: Complete Electron API mocks in `electron-mocks.js`
- **CI**: GitHub Actions workflow configured (.github/workflows/test.yml)

### Security Conventions

- **Context Isolation**: ALWAYS enabled (contextIsolation: true)
- **Node Integration**: ALWAYS disabled in renderer (nodeIntegration: false)
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
├── main.ts                    # Electron main entry
├── preload.ts                 # Context bridge
├── common/
│   ├── constants.ts           # IPC channels, constants
│   └── types.ts               # Type definitions
├── css/
│   └── globals.css            # Tailwind + CSS variables
├── main/
│   ├── window-manager.ts      # Window management
│   ├── lifecycle.ts           # App lifecycle
│   ├── config.ts              # Configuration
│   ├── logger.ts              # Logging
│   ├── menu.ts                # Application menu
│   ├── tray.ts                # System tray
│   ├── shortcuts.ts           # Global shortcuts
│   ├── notifications.ts       # Native notifications
│   ├── recent-docs.ts         # Recent documents
│   ├── progress.ts            # Dock/Taskbar progress
│   ├── splash.ts              # Splash screen
│   ├── error-handler.ts       # Error handling
│   ├── updater.ts             # Auto-updates
│   ├── crash-reporter.ts      # Crash reporting
│   ├── dev-tools.ts           # Dev utilities
│   ├── ipc/
│   │   ├── bridge.ts          # IPC registration
│   │   ├── schema.ts          # Validation schemas
│   │   └── handlers/          # IPC handlers
│   ├── security/
│   │   ├── csp.ts             # CSP policy
│   │   ├── navigation-guard.ts
│   │   ├── permissions.ts
│   │   └── audit-log.ts
│   └── workers/               # Background workers
├── renderer/
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── ui/                # UI Components (Button, Input, Alert, ContextMenu, etc.)
│   │   ├── CommandPalette.tsx # Command Palette
│   │   ├── StatusBar.tsx      # Status Bar
│   │   ├── TabBar.tsx         # Tabs
│   │   ├── TourOverlay.tsx    # Onboarding
│   │   ├── Demo.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── UpdateNotification.tsx
│   │   └── SafeHTML.tsx
│   └── utils/
│       └── cn.ts              # className utilities
└── stories/                   # Storybook stories

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
