# Security Hardening

This directory contains the security modules that implement defense-in-depth for the Electron application.

## Modules

### Content Security Policy (`csp.js`)

Enforces strict Content Security Policy to prevent injection attacks and unauthorized resource loading.

**Features:**
- Production CSP with strict defaults
- Development CSP allowing localhost for hot reload
- Automatic CSP violation logging
- Environment-aware policy selection

**Usage:**
```javascript
import { applyCSP } from './security/csp.js';

// Apply CSP to window
applyCSP(webContents);
```

**Configuration:**
- Production: Strict policy blocking all external resources
- Development: Relaxed policy allowing localhost and eval for debugging
- Tailwind: `'unsafe-inline'` allowed for styles (required for utility classes)

### Navigation Guards (`navigation-guard.js`)

Prevents unauthorized navigation to external URLs and opens external links safely.

**Features:**
- Will-navigate event interception
- URL allowlist validation
- External link opening in default browser
- Window.open handler for new window security
- Security audit logging for all blocks

**Usage:**
```javascript
import { setupSecurityGuards } from './security/navigation-guard.js';

// Setup all guards for window
setupSecurityGuards(webContents);
```

**Configuration:**
```javascript
// In config.js
security: {
  allowedOrigins: ['http://localhost:5173'] // Development only
}
```

### Context Isolation (`context-isolation.js`)

Documents and enforces context isolation best practices.

**Features:**
- Secure webPreferences configuration constants
- WebPreferences validation function
- Best practices documentation
- Security checklist

**Recommended Settings:**
- `contextIsolation: true` - Always required
- `nodeIntegration: false` - Always required
- `sandbox: true` - Enable when compatible
- `webSecurity: true` - Never disable

### Permission Management (`permissions.js`)

Handles permission requests with user consent dialogs and security policies.

**Features:**
- Permission allowlist enforcement
- User consent dialogs for allowed permissions
- Auto-denial of dangerous permissions (USB, serial, Bluetooth, etc.)
- Device permission handlers
- Permission check handlers
- Complete audit logging

**Usage:**
```javascript
import { setupAllPermissionHandlers } from './security/permissions.js';

// Setup permission handlers for session
setupAllPermissionHandlers(session);
```

**Configuration:**
```javascript
// In config.js
security: {
  allowedPermissions: new Set([
    'notifications',  // Example: allow notifications
    'media',         // Example: allow camera/microphone
  ])
}
```

**Always Denied:**
- `midi`, `midiSysex` - MIDI device access
- `pointerLock` - Mouse pointer locking
- `fullscreen` - Fullscreen requests
- `serial` - Serial port access
- `usb` - USB device access
- `bluetooth` - Bluetooth device access

### Security Audit Logging (`audit-log.js`)

Logs all security-relevant events to dedicated audit log file.

**Features:**
- Dedicated security audit log file
- Structured JSON logging
- Event type categorization
- Severity levels (info, warning, error)
- Timestamp inclusion

**Event Types:**
- `csp_violation` - CSP policy violations
- `navigation_blocked` - Blocked navigation attempts
- `permission_request` - Permission requests and decisions
- `external_link_opened` - External links opened in browser
- Custom security events

**Usage:**
```javascript
import { 
  logCSPViolation, 
  logNavigationBlock, 
  logPermissionRequest,
  initSecurityAuditLog 
} from './security/audit-log.js';

// Initialize on app start
initSecurityAuditLog();

// Log events
logNavigationBlock({
  windowId: 1,
  url: 'https://malicious.com',
  reason: 'Not in allowed origins'
});
```

**Audit Log Location:**
- macOS: `~/Library/Logs/electron-apps-template/security-audit.log`
- Windows: `%APPDATA%\electron-apps-template\logs\security-audit.log`
- Linux: `~/.config/electron-apps-template/logs/security-audit.log`

## Security Checklist

### Window Creation
- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Remote module disabled
- ✅ Sandbox enabled (where compatible)
- ✅ Preload script uses contextBridge
- ✅ CSP policy applied
- ✅ Navigation guards enabled
- ✅ Permission handlers configured

### IPC Communication
- ✅ Input validation on all channels
- ✅ Output validation before responses
- ✅ Channel name constants (no magic strings)
- ✅ Type definitions with JSDoc
- ✅ Error handling with safe error messages
- ✅ Rate limiting for log channels

### External Resources
- ✅ CSP restricts resource loading
- ✅ Navigation guard blocks unauthorized URLs
- ✅ External links open in default browser
- ✅ No inline scripts without nonce
- ✅ Allowlist for development origins

### Permissions
- ✅ Permission allowlist configuration
- ✅ User consent for allowed permissions
- ✅ Auto-denial of dangerous permissions
- ✅ Device access blocked by default
- ✅ Audit logging for all requests

## Testing

Security tests are located in `/test/security.*.test.js`:

- `security.csp.test.js` - CSP policy tests
- `security.navigation.test.js` - Navigation guard tests
- `security.permissions.test.js` - Permission management tests
- `security.audit.test.js` - Audit logging tests

Run tests:
```bash
npm test
```

## Configuration

Security settings in `src/main/config.js`:

```javascript
security: {
  cspEnabled: isProduction(),
  strictNavigation: isProduction(),
  allowedOrigins: isDevelopment() 
    ? ['http://localhost:5173', 'http://localhost:5174'] 
    : [],
  allowedPermissions: new Set([
    // Add your app's required permissions
  ])
}
```

## Best Practices

1. **Never disable security features** - If you think you need to disable a security feature, there's usually a better way
2. **Use allowlists, not blocklists** - Explicitly allow what's needed rather than blocking what's known to be bad
3. **Log all security events** - Audit logs are essential for incident response
4. **Review logs regularly** - Watch for patterns of blocked attempts
5. **Keep CSP strict** - Only add exceptions when absolutely necessary
6. **Test security** - Attempt bypasses during development
7. **Update regularly** - Keep Electron and dependencies current for security patches

## References

- [Electron Security Guide](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Electron Security](https://owasp.org/www-community/vulnerabilities/Electron_Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
