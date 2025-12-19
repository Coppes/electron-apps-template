---
trigger: always_on
glob: "**/*"
description: Electron specific rules
---

# Electron Rules

## Architecture
- **Process Separation**: Respect Main vs Renderer boundaries.
- **Preload**: Expose APIs via `contextBridge` in `src/preload.js`.

## State Management
- **Persistence**: Use `electron-store` for settings/data.
- **IPC**: Use `src/main/ipc/handlers/` for new IPC handlers.
- **Validation**: Register Zod schemas in `src/main/ipc/schema.js`.

## Performance
- **Startup**: Optimize for < 2s startup time.
- **Windows**: Reuse windows or use `show: false` then `show()`.
- **Lazy Loading**: Use dynamic imports (`import()`) for heavy modules in Main.

## Best Practices
- **Security**: Never disable security features (see security.md).
- **Native**: Use native dialogues via IPC (`dialog.showOpenDialog`).
- **Resources**: Clean up listeners in `useEffect` and Main process handlers.
