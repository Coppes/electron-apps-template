# Implementation Tasks

- [x] **Settings Refactor**
    - [x] Create `SettingsContext` with new schema support
    - [x] Implement migration logic in `store.js`
    - [x] Update `SettingsPage` to use new context and add "Undo Limit" input
    - [x] Implement "Export Settings" button and handler in `SettingsPage`

- [x] **Universal Undo/Redo**
    - [x] Create `HistoryContext` implementing the stack logic
    - [x] Connect `HistoryContext` to `SettingsContext` for limit enforcement
    - [x] Add Undo/Redo shortcuts (Cmd+Z, Cmd+Shift+Z)

- [x] **Plugin System**
    - [x] Implement `PluginManager` in Main process (file scanning)
    - [x] Create `PluginContext` in Renderer to expose `registerCommand`
    - [x] Expose `appPlugin` API via `preload.js`
    - [x] Create "Hello World" Test Plugin (for verification)

- [x] **Onboarding Tour**
    - [x] Create `TourOverlay` component
    - [x] Create `TourContext` to manage state
    - [x] Define initial "Welcome" tour steps in a config file
