# Renderer Security Guidelines

## Overview

This document outlines security best practices for React components in the renderer process of this Electron application.

## Implemented Security Features

### 1. Error Boundaries (`ErrorBoundary.jsx`)

**Purpose**: Catch and handle React errors gracefully without crashing the entire application.

**Security Features**:
- ✅ Prevents error information leakage in production
- ✅ Reports errors to main process via secure IPC
- ✅ Shows user-friendly error messages
- ✅ Allows recovery without full app restart

**Usage**:
```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponents />
    </ErrorBoundary>
  );
}
```

**Implemented in**: `src/renderer/App.jsx`

### 2. Safe HTML Rendering (`SafeHTML.jsx`)

**Purpose**: Safely render user-generated or external HTML content with XSS protection.

**Security Features**:
- ✅ Sanitizes HTML before rendering
- ✅ Removes dangerous tags (script, iframe, etc.)
- ✅ Removes dangerous attributes (onclick, onerror, etc.)
- ✅ Blocks javascript:, data:, vbscript: URLs
- ✅ Adds rel="noopener noreferrer" to external links
- ✅ Configurable allowed tags and attributes

**Usage**:
```jsx
import SafeHTML from './components/SafeHTML';

// Basic usage
<SafeHTML html={userContent} />

// With custom allowed tags
<SafeHTML 
  html={userContent} 
  allowedTags={['p', 'strong', 'em', 'a']}
/>
```

**Production Recommendation**: Use DOMPurify library for more robust sanitization:
```bash
npm install dompurify
```

### 3. Context Bridge API (`window.electronAPI`)

**Purpose**: Secure communication between renderer and main process.

**Security Features**:
- ✅ Context isolation enabled
- ✅ No direct Node.js/Electron API access
- ✅ Type-safe IPC channels
- ✅ Input validation on all channels
- ✅ Whitelisted methods only

**Available APIs**:
```javascript
window.electronAPI.window.minimize()
window.electronAPI.window.maximize()
window.electronAPI.dialog.message()
window.electronAPI.store.get()
window.electronAPI.log.error()
window.electronAPI.events.onUpdateAvailable()
```

## Security Best Practices

### ✅ DO:

1. **Always use `window.electronAPI` for IPC**
   ```jsx
   // ✅ Correct
   await window.electronAPI.dialog.message({ title: 'Hello' });
   
   // ❌ Wrong - not available due to context isolation
   const { ipcRenderer } = window.require('electron');
   ```

2. **Sanitize user input before rendering**
   ```jsx
   // ✅ Correct
   <SafeHTML html={userInput} />
   
   // ❌ Wrong - XSS vulnerability
   <div dangerouslySetInnerHTML={{ __html: userInput }} />
   ```

3. **Use Error Boundaries for error handling**
   ```jsx
   // ✅ Correct
   <ErrorBoundary>
     <RiskyComponent />
   </ErrorBoundary>
   ```

4. **Validate external data**
   ```jsx
   // ✅ Correct
   const url = externalUrl.startsWith('https://') ? externalUrl : '#';
   <a href={url} rel="noopener noreferrer" target="_blank">Link</a>
   ```

5. **Handle errors in async operations**
   ```jsx
   // ✅ Correct
   try {
     const result = await window.electronAPI.someMethod();
   } catch (error) {
     window.electronAPI.log.error('Operation failed', { error });
   }
   ```

### ❌ DON'T:

1. **Never use `dangerouslySetInnerHTML` with unsanitized content**
   ```jsx
   // ❌ XSS vulnerability
   <div dangerouslySetInnerHTML={{ __html: userInput }} />
   ```

2. **Never use `eval()` or `Function()` constructor**
   ```jsx
   // ❌ Code injection vulnerability
   eval(userCode);
   new Function(userCode)();
   ```

3. **Never embed user data in inline styles without validation**
   ```jsx
   // ❌ CSS injection vulnerability
   <div style={{ backgroundImage: `url(${userUrl})` }} />
   
   // ✅ Correct
   const validatedUrl = validateImageUrl(userUrl);
   <div style={{ backgroundImage: `url(${validatedUrl})` }} />
   ```

4. **Never bypass security checks**
   ```jsx
   // ❌ Wrong
   window.__ELECTRON_INTERNAL__ = require('electron');
   ```

5. **Never log sensitive data**
   ```jsx
   // ❌ Security risk
   window.electronAPI.log.info('User password', { password: pwd });
   
   // ✅ Correct
   window.electronAPI.log.info('User authenticated', { userId });
   ```

## Content Security Policy (CSP)

The application enforces strict CSP to prevent XSS attacks:

**Production Policy**:
```
default-src 'self'
script-src 'self'
style-src 'self' 'unsafe-inline'  # Required for Tailwind
img-src 'self' data: https:
connect-src 'self'
object-src 'none'
```

**Development Policy** (relaxed for hot reload):
```
default-src 'self' http://localhost:* ws://localhost:*
script-src 'self' 'unsafe-eval' http://localhost:*
```

**Implications**:
- ❌ Inline scripts without nonce are blocked
- ❌ External scripts are blocked
- ❌ External resources must be from allowed origins
- ✅ Inline styles are allowed (for Tailwind)
- ✅ Local resources are allowed

## Common Security Scenarios

### Scenario 1: Displaying User-Generated Content

```jsx
// ❌ Unsafe
<div>{userContent}</div>  // If userContent contains HTML

// ✅ Safe - Plain text
<div>{sanitizeText(userContent)}</div>

// ✅ Safe - HTML content
<SafeHTML html={userContent} />
```

### Scenario 2: Opening External Links

```jsx
// ❌ Potentially unsafe
<a href={externalUrl}>Link</a>

// ✅ Safe
<a 
  href={externalUrl} 
  rel="noopener noreferrer" 
  target="_blank"
  onClick={(e) => {
    e.preventDefault();
    // Opens in system browser, not Electron
    window.electronAPI.openExternal?.(externalUrl);
  }}
>
  Link
</a>
```

### Scenario 3: Handling Form Inputs

```jsx
function MyForm() {
  const [input, setInput] = useState('');
  
  const handleSubmit = async () => {
    // ✅ Validate and sanitize
    const sanitized = sanitizeInput(input);
    
    try {
      await window.electronAPI.submitData({ data: sanitized });
    } catch (error) {
      window.electronAPI.log.error('Submit failed', { error: error.message });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        maxLength={1000}  // Limit input length
      />
    </form>
  );
}
```

### Scenario 4: Rendering Release Notes (UpdateNotification)

Current implementation in `UpdateNotification.jsx`:
```jsx
// Currently using plain text rendering
<div className="mt-2 whitespace-pre-wrap">{updateInfo.releaseNotes}</div>
```

If release notes contain HTML (from server), use SafeHTML:
```jsx
// ✅ Safe for HTML content
<SafeHTML 
  html={updateInfo.releaseNotes}
  allowedTags={['p', 'ul', 'li', 'strong', 'em', 'code', 'h3']}
  className="mt-2"
/>
```

## Security Checklist for Components

When creating or reviewing components:

- [ ] No usage of `dangerouslySetInnerHTML` without sanitization
- [ ] No usage of `eval()` or `Function()` constructor
- [ ] No inline event handlers in HTML strings
- [ ] External links use `rel="noopener noreferrer"`
- [ ] User input is validated and sanitized
- [ ] Errors are caught and logged securely
- [ ] Sensitive data is not logged
- [ ] IPC calls use `window.electronAPI` only
- [ ] Error boundaries wrap risky components
- [ ] CSP directives are respected

## Testing Security

### Manual Testing

1. **Test Error Boundary**:
   - Trigger an error in a component
   - Verify error UI appears
   - Check error is logged to main process

2. **Test XSS Protection**:
   - Try to inject `<script>alert('XSS')</script>`
   - Verify script does not execute
   - Check CSP blocks it in console

3. **Test IPC Security**:
   - Try to access `require()` in console
   - Verify it's undefined
   - Only `window.electronAPI` should work

### Automated Testing

Tests are located in `src/renderer/components/*.test.jsx`:
- Component rendering tests
- User interaction tests
- Error handling tests

## Resources

- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT open a public issue
2. Report via secure channel (see SECURITY.md)
3. Include detailed reproduction steps
4. Provide suggested fixes if possible
