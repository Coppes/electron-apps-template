# Change: Add UX and Application Shell Features

## Why

The current application has basic window management and navigation but lacks modern desktop UX patterns that users expect from professional applications. Features like command palettes (popularized by VS Code, Sublime), tabbed interfaces (Chrome, VS Code), status bars, and proper onboarding are essential for creating intuitive, discoverable, and accessible desktop applications. Additionally, internationalization support is critical for reaching global audiences, and a splash screen provides professional polish during cold starts.

## What Changes

- **Command Palette**: Add a searchable command launcher (Ctrl/Cmd+K) that allows users to discover and execute all application actions via fuzzy search, using shadcn Command component
- **Tabbed Interface**: Implement a multi-tab system within windows to allow users to work with multiple documents/contexts simultaneously, similar to VS Code or Chrome
- **Status Bar**: Create a persistent bottom bar component that displays contextual information (save status, connection state, counts, errors) using shadcn components
- **Onboarding Flow**: Add a welcome assistant that appears on first launch, using shadcn Dialog/Carousel to guide users through key features
- **Keyboard Shortcuts Management**: Provide a settings interface for users to view and customize application-level keyboard shortcuts (saved in electron-store)
- **Internationalization (i18n)**: Integrate react-i18next for multi-language support with JSON translation files and runtime language switching
- **Splash Screen**: Implement a lightweight loading window that displays immediately while the main React application initializes

## Impact

- **Affected specs**: Creates 7 new capabilities:
  - `command-palette` - Searchable action launcher with keyboard shortcuts
  - `tabbed-interface` - Multi-tab document/context management within windows
  - `status-bar` - Persistent contextual information display
  - `onboarding` - First-launch welcome and feature discovery
  - `keyboard-shortcuts` - Application-level shortcut customization (distinct from OS-level global shortcuts)
  - `internationalization` - Multi-language support and runtime switching
  - `splash-screen` - Professional loading experience during cold starts

- **Affected code**:
  - `src/renderer/components/CommandPalette.jsx` (new) - Command palette UI using shadcn Command
  - `src/renderer/components/TabBar.jsx` (new) - Tab management component
  - `src/renderer/components/StatusBar.jsx` (new) - Status bar component
  - `src/renderer/components/Onboarding.jsx` (new) - Welcome dialog/carousel
  - `src/renderer/components/pages/KeyboardShortcutsPage.jsx` (new) - Shortcuts settings
  - `src/renderer/i18n/` (new) - i18n configuration and translation files
  - `src/renderer/App.jsx` - Integration of command palette, tabs, status bar, onboarding
  - `src/renderer/components/layout/AppShell.jsx` - Updated to support tabs and status bar
  - `src/main/splash.js` (new) - Splash screen window creation and lifecycle
  - `src/main/lifecycle.js` - Enhanced to show splash screen before main window
  - `src/main/ipc/handlers/shortcuts.js` (new) - IPC handlers for shortcut management
  - `src/main/ipc/handlers/i18n.js` (new) - IPC handlers for language switching
  - `package.json` - Add react-i18next, i18next dependencies, @radix-ui/react-command (if not present)

- **Breaking changes**: None - all additions are backward compatible
  - Existing navigation patterns remain functional
  - Tabs are optional enhancement to current single-page navigation
  - Command palette is additive overlay
  - All features can be disabled/hidden if needed

## Dependencies

- **Internal**:
  - Extends `window-management` from `add-electron-core-features` (splash screen uses window manager)
  - Uses `electron-store` from existing stack for persisting shortcuts and language preferences
  - Leverages shadcn/ui components (Command, Dialog, Carousel, Tabs, Alert, Badge)

- **External**:
  - `react-i18next` - React bindings for i18next
  - `i18next` - Internationalization framework
  - `@radix-ui/react-command` - Command palette primitives (may already be available via shadcn)
  - `@radix-ui/react-tabs` - Tabs primitives (install if not present)

- **Sequencing**:
  - Should be implemented after `add-electron-core-features` completes (115/155 tasks done)
  - Can be developed in parallel with `add-os-integration` and `add-observability-maintenance`
  - Global shortcuts from `add-os-integration` should be integrated with command palette later

## Success Criteria

- [ ] All 7 capability specs pass `openspec validate --strict`
- [ ] Command palette opens with Ctrl/Cmd+K and provides fuzzy search of all actions
- [ ] Users can open multiple tabs within a window and switch between them
- [ ] Status bar displays contextual information and updates reactively
- [ ] Onboarding dialog appears on first launch and can be dismissed permanently
- [ ] Keyboard shortcuts settings page allows viewing and remapping all shortcuts
- [ ] Application supports at least English and Portuguese (pt-BR)
- [ ] Language can be switched at runtime without restart
- [ ] Splash screen appears within 200ms and transitions smoothly to main window
- [ ] All text in UI uses i18n translation keys
- [ ] Shortcuts are persisted in electron-store and restored on restart
- [ ] Cross-platform compatibility verified (macOS, Windows, Linux)
- [ ] All components follow existing shadcn/ui patterns and theming
