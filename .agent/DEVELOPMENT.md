# Development Guide

## Architecture Overview

This project follows a modular architecture separating the Main (Node.js) and Renderer (React) processes with a secure IPC bridge.

### Directory Structure

- `src/main`: Node.js process. Handles OS integration, file system, windows.
- `src/renderer`: React UI. Strictly presentation and logic.
- `src/common`: Shared types and constants.
- `src/preload`: Context bridge definition.

## Core Patterns

### Service Layer (Main Process)
Functionality is encapsulated in Managers (Singleton classes).
- `LifecycleManager`: Startup/shutdown orchestration.
- `WindowManager`: Window creation and state management.
- `SplashManager`: Splash screen logic.

### IPC Handlers
Handlers are registered in `src/main/ipc/handlers/`.
**Rule**: Always validate inputs using the Zod schema in `src/main/ipc/schema.js`.

### Contexts & Hooks (Renderer)
Global state is managed via React Contexts and exposed via custom hooks.
- `useCommandContext` -> `CommandProvider`
- `useTabContext` -> `TabProvider`
- `useStatusBar` -> `StatusBarProvider`

## Application Shell

### Adding a New Tab Type
1. Define the type constant in `src/common/constants.js`.
2. Create the component in `src/renderer/components/pages/`.
3. Add the mapping in `src/renderer/components/TabContent.jsx`.

### Adding a New Language
1. Create `src/renderer/i18n/locales/[lang]`.
2. Add JSON files (common, settings, etc.).
3. The app will automatically load it (via `i18next-resources-to-backend`).

## Testing

- **Unit**: `npm run test:unit`
- **Integration**: `npm run test:integration` (simulates main/renderer interaction)

Remember to check `openspec/` for current task status and specifications.
