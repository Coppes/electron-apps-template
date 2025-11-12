# Design: UX and Application Shell Features

## Overview

This design document outlines the technical approach for implementing modern UX patterns including command palette, tabs, status bar, onboarding, keyboard shortcuts management, internationalization, and splash screen. These features work together to create a professional, discoverable, and accessible desktop application experience.

## Architecture Decisions

### Command Palette

**Decision**: Use shadcn Command component with fuzzy search and action registry pattern

**Rationale**:
- shadcn Command is built on cmdk (command-k) library, optimized for keyboard navigation
- Action registry allows dynamic registration of commands from any component
- Fuzzy search improves discoverability without requiring exact matches
- Keyboard-first design aligns with power user expectations

**Implementation**:
- React Context provides global action registry
- Components register actions via `useRegisterCommand` hook
- Actions include: id, label, keywords, category, shortcut, icon, handler
- Command palette subscribes to registry and filters by search term
- Supports nested commands (multi-step selections)

**Trade-offs**:
- (+) Centralized command discovery
- (+) Easy to extend with new actions
- (-) Initial setup requires refactoring existing handlers into actions
- (-) Must maintain action registry state

### Tabbed Interface

**Decision**: Implement custom tab manager with state persistence, not browser tabs

**Rationale**:
- Full control over tab lifecycle and state
- Can persist tab state across restarts
- Integration with existing AppShell architecture
- Supports custom tab types (documents, projects, dashboards)

**Implementation**:
- TabManager service manages tab collection and active tab
- Each tab has: id, type, title, icon, closeable, state
- Tabs stored in electron-store for persistence
- AppShell renders TabBar + active tab content
- Tab content rendered via strategy pattern based on tab type

**Trade-offs**:
- (+) Consistent behavior across platforms
- (+) Persistent tab state
- (+) Custom tab rendering and lifecycle hooks
- (-) More complex than single-page navigation
- (-) Must implement tab drag-and-drop separately

### Status Bar

**Decision**: Fixed position component with slot-based architecture

**Rationale**:
- Slots allow different parts of the app to contribute status items
- Fixed position ensures always visible
- Responsive design adapts to window size

**Implementation**:
- StatusBarContext provides registration API
- Components register status items: { id, position, content, priority }
- Positions: left, center, right
- Priority determines rendering order within position
- Items can be static (text) or reactive (components)

**Trade-offs**:
- (+) Flexible and extensible
- (+) No prop drilling needed
- (+) Components can contribute without tight coupling
- (-) Must manage item lifecycle (register/unregister)
- (-) Potential performance impact if too many reactive items

### Onboarding Flow

**Decision**: Multi-step modal dialog with shadcn Carousel, shown on first launch

**Rationale**:
- Dialog ensures focus and user attention
- Carousel allows sequential, digestible content
- First-launch detection via electron-store flag
- Can be re-triggered from Help menu

**Implementation**:
- Check `onboardingCompleted` flag in electron-store
- If false, show OnboardingDialog on mount
- Dialog contains Carousel with steps: Welcome, Features, Shortcuts, Settings
- Each step has illustration + description + action buttons
- "Don't show again" checkbox sets flag

**Trade-offs**:
- (+) Simple implementation with existing components
- (+) Non-intrusive (can be skipped)
- (+) Can be extended with more steps
- (-) Users may skip without reading
- (-) Content must be maintained for updates

### Keyboard Shortcuts Management

**Decision**: Two-tier system: app-level (customizable) vs global (OS-level, not customizable)

**Rationale**:
- App-level shortcuts should be user-customizable for accessibility
- Global shortcuts are system-wide and managed separately (via add-os-integration)
- Clear separation prevents conflicts and confusion

**Implementation**:
- ShortcutRegistry maps action IDs to default shortcuts
- User overrides stored in electron-store
- Settings page shows all shortcuts with conflict detection
- Shortcuts bound via `useKeyboardShortcut` hook in components
- Hook checks registry + overrides, resolves to final binding

**Conflict Resolution**:
- Detect conflicts when user sets new shortcut
- Show warning if shortcut already used
- Allow override with confirmation
- System shortcuts (Cmd+Q, etc.) are blacklisted

**Trade-offs**:
- (+) User flexibility and accessibility
- (+) Persistent across restarts
- (+) Conflict detection prevents ambiguity
- (-) Complexity in managing two shortcut systems
- (-) Must synchronize with command palette shortcuts

### Internationalization (i18n)

**Decision**: react-i18next with JSON translation files, runtime switching

**Rationale**:
- react-i18next is the de facto standard for React i18n
- JSON files are easy to edit and version control
- Runtime switching without restart improves UX
- Namespace support allows code splitting of translations

**Implementation**:
- Initialize i18next in renderer index.js
- Translation files in `src/renderer/i18n/locales/{lang}/{namespace}.json`
- Namespaces: common, settings, errors, onboarding
- `useTranslation` hook in components: `const { t } = useTranslation('common')`
- Language selector in settings saves to electron-store
- Language change triggers i18n.changeLanguage() and re-render

**Fallback Strategy**:
- Default language: en
- Fallback chain: requested → en → key
- Missing keys logged in development

**Trade-offs**:
- (+) Industry standard solution
- (+) Easy for translators to contribute
- (+) Namespace support keeps files manageable
- (-) All UI text must be refactored to use t()
- (-) Bundle size increases with more languages

### Splash Screen

**Decision**: Native BrowserWindow with minimal HTML/CSS, no React

**Rationale**:
- Must load instantly (< 200ms)
- React bundle is too heavy for splash screen
- Native window provides platform-consistent appearance
- Can show loading progress

**Implementation**:
- Create splash window in lifecycle.js before main window
- Splash window: frameless, centered, 400x300, with app logo + spinner
- Load static HTML file (no bundler, inline CSS)
- Show splash, then load main window in background
- When main window ready, fade out splash and show main
- Splash auto-closes after timeout (10s max) to prevent hangs

**Timing**:
```
0ms:   User launches app
50ms:  Splash window created and shown
100ms: Main window created (loading React)
2000ms: Main window ready (React loaded)
2500ms: Fade out splash, fade in main
2800ms: Splash window destroyed
```

**Trade-offs**:
- (+) Instant visual feedback
- (+) Professional polish
- (+) Prevents white flash
- (-) Two windows to manage briefly
- (-) Must coordinate lifecycle timing

## Cross-Cutting Concerns

### Accessibility

- Command palette supports screen readers (ARIA labels)
- Tabs navigable with arrow keys
- Status bar items announced on change
- Onboarding dialogs support Esc to close
- Shortcuts UI shows visual representation
- All i18n text includes ARIA translations

### Theming

- All components use CSS variables from existing theme
- Respect dark/light mode preference
- Splash screen matches app theme

### Performance

- Command palette: Fuzzy search optimized with virtual scrolling for 1000+ commands
- Tabs: Lazy load tab content, unmount inactive tabs if memory constrained
- Status bar: Throttle updates to max 1/sec per item
- i18n: Lazy load translation namespaces, cache parsed translations

### Testing

- Command palette: Unit tests for action registry, integration tests for search
- Tabs: Test tab lifecycle (open, close, switch, persist, restore)
- Status bar: Test item registration, position, priority
- Onboarding: Test first-launch detection, step navigation
- Shortcuts: Test conflict detection, persistence, resolution
- i18n: Test language switching, fallback, missing keys
- Splash screen: Test timing, fade transitions, error handling

## Integration Points

### With Existing Features

- **Window Management**: Splash screen uses window-manager.js
- **IPC Bridge**: New handlers for shortcuts and i18n settings
- **Settings Page**: Extended with shortcuts and language sections
- **App Menu**: "Help > Show Onboarding" menu item
- **Error Handling**: Command palette shows errors in status bar

### With Future Features

- **Global Shortcuts** (add-os-integration): Integrate with command palette, show in shortcuts UI
- **Recent Documents** (add-os-integration): Show in command palette as quick actions
- **Logging** (add-observability-maintenance): Log command executions, tab switches, language changes

## Migration Strategy

### Phase 1: Foundation (Non-Breaking)
- Add i18n infrastructure (wrap existing text)
- Add status bar (empty, no breaking changes)
- Add splash screen (optional, behind flag)

### Phase 2: Additive Features
- Add command palette (overlay, doesn't affect navigation)
- Add onboarding (first launch only)
- Add shortcuts UI (settings page extension)

### Phase 3: Enhanced Navigation
- Add tabbed interface (opt-in, sidebar navigation still works)
- Migrate existing pages to tab system gradually

### Phase 4: Polish
- Refactor all text to i18n keys
- Add more languages
- Optimize performance based on metrics

## File Structure

```
src/
  main/
    splash.js                     # Splash screen window creation
    ipc/handlers/
      shortcuts.js                # Shortcut management IPC
      i18n.js                     # Language switching IPC
  renderer/
    i18n/
      index.js                    # i18next initialization
      locales/
        en/
          common.json
          settings.json
          errors.json
          onboarding.json
        pt-BR/
          ...
    components/
      CommandPalette.jsx          # Command palette UI
      TabBar.jsx                  # Tab bar UI
      TabContent.jsx              # Tab content renderer
      StatusBar.jsx               # Status bar UI
      Onboarding.jsx              # Onboarding dialog
      pages/
        KeyboardShortcutsPage.jsx # Shortcuts settings
    contexts/
      CommandContext.jsx          # Command registry
      TabContext.jsx              # Tab manager
      StatusBarContext.jsx        # Status bar items
      ShortcutContext.jsx         # Shortcut registry
    hooks/
      useRegisterCommand.js       # Register commands
      useKeyboardShortcut.js      # Bind shortcuts
      useTab.js                   # Tab operations
      useStatusBar.js             # Status bar items
    static/
      splash.html                 # Splash screen HTML
```

## Open Questions

1. **Tab Drag-and-Drop**: Should we support dragging tabs to reorder or tear off into new windows?
   - Deferred to future iteration
   
2. **Command Palette Scope**: Should commands be window-specific or global across all windows?
   - Start with window-specific, add global in future if needed
   
3. **Translation Workflow**: How will translation files be contributed/reviewed?
   - Use standard GitHub PR process, add translation template
   
4. **Splash Screen Customization**: Should splash screen be themeable/customizable?
   - No, keep simple and fast. Focus on speed over flexibility.

## Success Metrics

- Splash screen appears within 200ms of launch
- Command palette responds to keypress within 50ms
- Tab switching completes within 100ms
- Status bar updates don't block rendering (< 16ms)
- i18n translation files load in < 100ms
- All features work offline (no CDN dependencies)
- Memory overhead < 50MB for all new features combined
