# Technical Design: Core Electron Features

## Overview
This design establishes modular, secure, and maintainable patterns for core Electron functionality. Each capability is designed to work independently while providing integration points for cohesive application behavior.

## Architecture Decisions

### 1. Window Management Architecture

**Decision**: Implement a centralized WindowManager class with event-driven state management.

**Rationale**:
- Centralizes window lifecycle logic, preventing scattered window handling code
- Enables consistent state persistence across all windows
- Provides single source of truth for window instances
- Facilitates multi-window coordination and messaging

**Implementation Pattern**:
```javascript
// src/main/window-manager.js
class WindowManager {
  constructor() {
    this.windows = new Map(); // windowId -> BrowserWindow
    this.states = new Map();  // windowId -> state object
  }
  
  createWindow(type, options) { /* ... */ }
  getWindow(id) { /* ... */ }
  saveState(id) { /* ... */ }
  restoreState(id) { /* ... */ }
}
```

**Trade-offs**:
- ✅ Centralized control simplifies debugging and feature additions
- ✅ State persistence becomes declarative
- ⚠️ Adds abstraction layer (mitigated by clear API surface)

### 2. IPC Bridge Pattern

**Decision**: Use a schema-based IPC bridge with request/response validation.

**Rationale**:
- Provides type safety without TypeScript (using JSDoc)
- Validates inputs before processing, preventing runtime errors
- Enables automatic API documentation generation
- Catches integration errors early in development

**Implementation Pattern**:
```javascript
// src/main/ipc/schema.js
export const handlers = {
  'window:create': {
    input: { type: 'string', required: true },
    output: { id: 'string', success: 'boolean' },
    handler: async (args) => { /* ... */ }
  }
};

// src/main/ipc/bridge.js
export function registerHandlers(schema) {
  Object.entries(schema).forEach(([channel, config]) => {
    ipcMain.handle(channel, async (event, ...args) => {
      validateInput(args, config.input);
      const result = await config.handler(...args);
      validateOutput(result, config.output);
      return result;
    });
  });
}
```

**Trade-offs**:
- ✅ Self-documenting IPC channels
- ✅ Runtime validation catches errors before they propagate
- ✅ Easier to refactor and maintain
- ⚠️ Slight performance overhead from validation (negligible for desktop apps)

### 3. Application Lifecycle Management

**Decision**: Implement lifecycle hooks with dependency-ordered initialization and graceful shutdown.

**Rationale**:
- Services may depend on each other (e.g., logger must start before window manager)
- Graceful shutdown prevents data loss and corruption
- Enables proper cleanup of resources (file handles, network connections)
- Facilitates testing by allowing mock lifecycle hooks

**Implementation Pattern**:
```javascript
// src/main/lifecycle.js
class LifecycleManager {
  async startup() {
    await this.initLogger();
    await this.initStore();
    await this.initWindowManager();
    await this.registerIPC();
    await this.createMainWindow();
  }
  
  async shutdown() {
    await this.saveAllStates();
    await this.closeAllWindows();
    await this.flushLogs();
  }
}
```

**Trade-offs**:
- ✅ Predictable initialization order
- ✅ Clean shutdown prevents issues
- ✅ Easier to add new services
- ⚠️ Requires discipline to maintain hook order (documented in code)

### 4. Security Layering

**Decision**: Multi-layer security with CSP, context isolation, navigation guards, and audit logging.

**Rationale**:
- Defense in depth: multiple layers prevent single point of failure
- CSP blocks malicious script injection
- Context isolation prevents renderer compromise from affecting main process
- Navigation guards prevent phishing and unauthorized resource access
- Audit logging provides security visibility

**Implementation Pattern**:
```javascript
// src/main/security/csp.js
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"], // Tailwind requires inline
  'img-src': ["'self'", 'data:'],
  'connect-src': ["'self'"]
};

// src/main/security/navigation-guard.js
export function setupNavigationGuard(contents) {
  contents.on('will-navigate', (event, url) => {
    if (!isAllowedOrigin(url)) {
      event.preventDefault();
      logger.warn('Blocked navigation', { url });
    }
  });
}
```

**Trade-offs**:
- ✅ Comprehensive protection against common attack vectors
- ✅ Audit trail for security events
- ⚠️ May require whitelist maintenance for legitimate external resources
- ⚠️ Tailwind requires 'unsafe-inline' for styles (acceptable trade-off)

### 5. Developer Experience Tooling

**Decision**: Environment-aware configuration with enhanced development tools and structured logging.

**Rationale**:
- Development needs differ from production (DevTools, source maps, verbose logging)
- Structured logging with levels enables filtering and analysis
- Hot reload improves iteration speed
- Separating concerns keeps main.js clean

**Implementation Pattern**:
```javascript
// src/main/dev-tools.js
export function setupDevTools(window) {
  if (isDevelopment()) {
    window.webContents.openDevTools();
    installReactDevTools();
    enableHotReload();
  }
}

// src/main/logger.js
export const logger = {
  debug: (msg, meta) => log('debug', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta)
};
```

**Trade-offs**:
- ✅ Clean separation of dev vs prod behavior
- ✅ Structured logs easier to query and analyze
- ✅ Faster development iteration
- ⚠️ Must ensure dev-only code doesn't leak to production (mitigated by conditional imports)

## Module Structure

```
src/
├── main.js                      # Orchestrates lifecycle and wires modules
├── preload.js                   # Exposes IPC bridge to renderer
├── common/
│   ├── constants.js             # Shared constants (IPC channels, defaults)
│   └── types.js                 # JSDoc type definitions
├── main/
│   ├── lifecycle.js             # Startup/shutdown coordination
│   ├── window-manager.js        # Window creation and state management
│   ├── ipc/
│   │   ├── bridge.js            # IPC registration and validation
│   │   ├── schema.js            # Channel definitions
│   │   └── handlers/            # Individual IPC handlers
│   │       ├── window.js
│   │       ├── store.js
│   │       └── dialog.js
│   ├── security/
│   │   ├── csp.js               # Content Security Policy
│   │   ├── navigation-guard.js  # URL filtering
│   │   └── context-isolation.js # Preload patterns
│   ├── updater.js               # Auto-update logic
│   ├── logger.js                # Logging utility
│   └── dev-tools.js             # Development utilities
└── renderer/                    # (existing React app)
```

## Integration Points

### Window Manager ↔ IPC Bridge
- Window manager exposes methods via IPC handlers
- IPC bridge validates requests before calling window manager
- Events flow from window manager back through IPC to renderer

### Security ↔ All Modules
- CSP enforced on all windows created by window manager
- Navigation guards attached to all web contents
- IPC bridge validates all cross-process calls

### Lifecycle ↔ All Modules
- Lifecycle manager initializes all modules in order
- Shutdown hooks ensure clean teardown
- Error in one module doesn't prevent others from starting

## Migration Strategy

1. **Phase 1**: Add new modules alongside existing code (no breaking changes)
2. **Phase 2**: Refactor main.js to use new modules progressively
3. **Phase 3**: Update preload.js to use IPC bridge schema
4. **Phase 4**: Document patterns and add examples

This ensures existing functionality continues working while new features are added incrementally.

## Testing Strategy

- **Unit tests**: Individual modules (window-manager, ipc bridge, validators)
- **Integration tests**: Lifecycle initialization, IPC communication end-to-end
- **Security tests**: CSP enforcement, navigation blocking, context isolation
- **Manual tests**: Auto-updater, multi-window scenarios, state persistence

## Open Questions

1. **Auto-updater backend**: Which update server will be used? (GitHub Releases, custom server)
2. **Multi-window templates**: Should we provide predefined window types (settings, about, etc.)?
3. **IPC versioning**: How to handle IPC schema changes across app versions?

These can be addressed during implementation or deferred to future iterations.
