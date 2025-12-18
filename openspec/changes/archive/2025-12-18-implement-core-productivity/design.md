# Design: Core Productivity Features

## 1. Universal Undo/Redo & Settings Consolidation

### Architecture
- **History Manager**:
    - Centralized stack for `{ execute(), undo() }` commands.
    - **User Limit**: Respecs a `history.maxStackSize` setting to prevent memory bloat.

- **Settings Refactor**:
    - Maintain `electron-store` as the persistence layer.
    - Expose a `SettingsContext` to provide typed access and UI control.
    - Add "Export Settings" functionality to generate a `settings.json` file.

### Data Schema (Settings)
```json
{
  "appearance": { "theme": "system", "density": "normal" },
  "history": { "maxStackSize": 50 },
  "language": "en"
}
```

## 2. Plugin / Extension System

### Architecture
- **Loader**: Scans `plugins/` directory in User Data.
- **Sandboxing**: Basic isolation (try/catch blocks and limited API exposure).
- **API Surface**: Expose a global `window.appPlugin` object for plugins to register themselves.

## 3. Interactive Onboarding / Tour System

### Architecture
- **Tour Context**: Manages state of the tour (active step, seen status).
- **Overlay**: Visual component to highlight UI elements using `getBoundingClientRect`.
