# Implementation Tasks

- [ ] **Settings Refactor**
    - [ ] Create `SettingsContext` with new schema support
    - [ ] Implement migration logic in `store.js`
    - [ ] Update `SettingsPage` to use new context and add "Undo Limit" input
    - [ ] Implement "Export Settings" button and handler in `SettingsPage`

- [ ] **Universal Undo/Redo**
    - [ ] Create `HistoryContext` implementing the stack logic
    - [ ] Connect `HistoryContext` to `SettingsContext` for limit enforcement
    - [ ] Add Undo/Redo shortcuts (Cmd+Z, Cmd+Shift+Z)

- [ ] **Plugin System**
    - [ ] Implement `PluginManager` in Main process (file scanning)
    - [ ] Create `PluginContext` in Renderer to expose `registerCommand`
    - [ ] Expose `appPlugin` API via `preload.js`
    - [ ] Create "Hello World" Test Plugin (for verification)

- [ ] **Onboarding Tour**
    - [ ] Create `TourOverlay` component
    - [ ] Create `TourContext` to manage state
    - [ ] Define initial "Welcome" tour steps in a config file
