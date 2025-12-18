# template-engine Specification

## Purpose
TBD - created by archiving change bootstrap-template-engine. Update Purpose after archive.
## Requirements
### Requirement: Main/Renderer Separation & TypeScript

The template MUST separate the Electron main process (Node.js) and renderer process (React), and use TypeScript in both for type safety and consistency.

#### Scenario

- The template provides src/main.ts and src/renderer/ with TypeScript configuration.
- Both processes compile and run with type checking enabled.

### Requirement: Vite.js Renderer & HMR

The renderer process MUST use Vite.js for fast builds and Hot Module Replacement (HMR).

#### Scenario

- Editing React components in src/renderer/ triggers instant updates in the running app without full reload.

### Requirement: Main Auto-Reload

The main process MUST auto-restart Electron when main process files change, using nodemon or similar tooling.

#### Scenario

- Editing src/main.ts triggers Electron to restart automatically during development.

### Requirement: Secure IPC via contextBridge/preload

IPC MUST be exposed only via contextBridge in preload.ts, with no direct access to Node.js APIs from the renderer.

#### Scenario

- window.api.getVersion() is available in the renderer and returns the Electron/app version from the main process.

### Requirement: electron-builder Packaging

The template MUST include scripts and configuration for electron-builder to package the app for Windows (.exe), macOS (.dmg, .app), and Linux (.deb, .AppImage), with app icons and build scripts.

#### Scenario

- Running the build script produces platform-specific installers with correct icons.

### Requirement: Security Defaults

The template MUST configure BrowserWindow with contextIsolation: true and nodeIntegration: false, and set a default Content Security Policy (CSP) in index.html.

#### Scenario

- The app runs with context isolation and no Node.js integration in the renderer.
- index.html includes a CSP meta tag.

### Requirement: electron-store Persistence

The template MUST integrate electron-store for saving and loading user settings (e.g., theme, window size) in a JSON file.

#### Scenario

- Changing a setting in the app persists it across restarts using electron-store.

### Requirement: Frameless Window & Custom Titlebar

The template MUST provide an option for a frameless window (frame: false) and a custom React titlebar component for a modern look.

#### Scenario

- Enabling the frameless option displays a custom titlebar implemented in React.

