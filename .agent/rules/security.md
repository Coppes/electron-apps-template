---
trigger: always_on
glob: "**/*"
description: Security rules
---

# Security Rules

## Critical Enforcements
- **Context Isolation**: MUST be enabled (`contextIsolation: true`).
- **Node Integration**: MUST be disabled in renderer (`nodeIntegration: false`).
- **Sandbox**: MUST be enabled.
- **CSP**: Strict Content Security Policy required. No `unsafe-inline` or `unsafe-eval`.
- **IPC**: ALL communication MUST go through `contextBridge` and `ipcRenderer.invoke`.
    - Validate ALL payloads using Zod schemas (`src/main/ipc/schema.js`).

## Data Protection
- **Secrets**: NEVER share API keys or sensitive tokens.
- **Dependencies**: Check plugins and packages for malware/vulnerabilities.
- **Navigation**: Use `navigation-guard.js` to block unauthorized URLs.
- **External Links**: Open in default browser via `shell.openExternal`.

## Compatibility
- **Version Check**: Always check version compatibility for project dependencies.
