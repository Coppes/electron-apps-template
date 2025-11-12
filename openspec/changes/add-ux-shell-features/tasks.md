# Tasks: Add UX and Application Shell Features

## Phase 1: Foundation & Infrastructure (Parallel)

### Internationalization Setup (8 tasks)
- [ ] 1. Install react-i18next and i18next dependencies
- [ ] 2. Create i18n directory structure (`src/renderer/i18n/locales/{en,pt-BR}`)
- [ ] 3. Initialize i18next in `src/renderer/i18n/index.js` with namespaces and fallback
- [ ] 4. Create translation files: common.json, settings.json, errors.json, onboarding.json for EN
- [ ] 5. Create translation files: common.json, settings.json, errors.json, onboarding.json for PT-BR
- [ ] 6. Integrate i18n provider in `src/renderer/index.js`
- [ ] 7. Create IPC handler for language switching in `src/main/ipc/handlers/i18n.js`
- [ ] 8. Write unit tests for i18n initialization, language switching, and fallback behavior

### Status Bar Component (6 tasks)
- [ ] 9. Create StatusBarContext with item registration API (`src/renderer/contexts/StatusBarContext.jsx`)
- [ ] 10. Create StatusBar component with left/center/right slots (`src/renderer/components/StatusBar.jsx`)
- [ ] 11. Create useStatusBar hook for registering items (`src/renderer/hooks/useStatusBar.js`)
- [ ] 12. Integrate StatusBar in AppShell (fixed bottom position)
- [ ] 13. Add default status items (version, connection status)
- [ ] 14. Write tests for StatusBar item registration, positioning, and priority

### Splash Screen (7 tasks)
- [ ] 15. Create static splash.html with inline CSS and app logo (`src/renderer/static/splash.html`)
- [ ] 16. Implement splash window creation in `src/main/splash.js`
- [ ] 17. Update lifecycle.js to show splash before main window
- [ ] 18. Implement fade transition from splash to main window
- [ ] 19. Add timeout mechanism (10s max) to prevent splash hangs
- [ ] 20. Handle splash window errors gracefully
- [ ] 21. Write integration tests for splash screen timing and transitions

## Phase 2: Command Palette & Shortcuts (Sequential)

### Keyboard Shortcuts Management (10 tasks)
- [ ] 22. Create ShortcutRegistry with default shortcuts mapping (`src/renderer/contexts/ShortcutContext.jsx`)
- [ ] 23. Implement shortcut persistence in electron-store (load/save overrides)
- [ ] 24. Create useKeyboardShortcut hook with conflict detection (`src/renderer/hooks/useKeyboardShortcut.js`)
- [ ] 25. Create IPC handler for shortcut management in `src/main/ipc/handlers/shortcuts.js`
- [ ] 26. Create KeyboardShortcutsPage component with shortcut list and editor (`src/renderer/components/pages/KeyboardShortcutsPage.jsx`)
- [ ] 27. Implement shortcut conflict detection and warning UI
- [ ] 28. Add blacklist for system shortcuts (Cmd+Q, Cmd+W, etc.)
- [ ] 29. Integrate KeyboardShortcutsPage into settings navigation
- [ ] 30. Add reset to defaults functionality
- [ ] 31. Write tests for shortcut registration, conflicts, persistence, and resolution

### Command Palette (12 tasks)
- [ ] 32. Install @radix-ui/react-command (cmdk) if not already available via shadcn
- [ ] 33. Create CommandContext with action registry API (`src/renderer/contexts/CommandContext.jsx`)
- [ ] 34. Create useRegisterCommand hook for components to register actions (`src/renderer/hooks/useRegisterCommand.js`)
- [ ] 35. Create CommandPalette component using shadcn Command (`src/renderer/components/CommandPalette.jsx`)
- [ ] 36. Implement fuzzy search for command filtering
- [ ] 37. Add command categories and grouping in palette UI
- [ ] 38. Register default commands (navigation, settings, help, window operations)
- [ ] 39. Integrate Ctrl/Cmd+K shortcut to open command palette
- [ ] 40. Add command execution tracking in status bar
- [ ] 41. Add keyboard navigation (arrows, enter, escape)
- [ ] 42. Integrate command palette with existing navigation system
- [ ] 43. Write tests for command registration, search, execution, and keyboard navigation

## Phase 3: Tabbed Interface (Sequential)

### Tab System Core (10 tasks)
- [ ] 44. Create TabContext with tab manager service (`src/renderer/contexts/TabContext.jsx`)
- [ ] 45. Define tab data structure (id, type, title, icon, closeable, state)
- [ ] 46. Implement tab persistence in electron-store (save/restore tab collection)
- [ ] 47. Create TabBar component with tab rendering and controls (`src/renderer/components/TabBar.jsx`)
- [ ] 48. Create TabContent component with strategy pattern for tab types (`src/renderer/components/TabContent.jsx`)
- [ ] 49. Create useTab hook for tab operations (open, close, switch, update) (`src/renderer/hooks/useTab.js`)
- [ ] 50. Install @radix-ui/react-tabs if not already available
- [ ] 51. Implement tab switching with keyboard shortcuts (Ctrl+Tab, Ctrl+Shift+Tab)
- [ ] 52. Add tab close button with unsaved changes warning
- [ ] 53. Write tests for tab lifecycle (create, switch, close, persist, restore)

### Tab Integration (8 tasks)
- [ ] 54. Update AppShell to render TabBar above content area
- [ ] 55. Migrate existing pages (Home, Demo, Settings, About) to tab types
- [ ] 56. Implement "Open in New Tab" action in command palette
- [ ] 57. Add tab count and active tab info to status bar
- [ ] 58. Update navigation logic to work with tabs (open tab vs switch to existing)
- [ ] 59. Add "Close All Tabs" and "Close Other Tabs" commands
- [ ] 60. Implement tab context menu (right-click for actions)
- [ ] 61. Write integration tests for tab navigation and multi-tab scenarios

## Phase 4: Onboarding & Polish (Sequential)

### Onboarding Flow (9 tasks)
- [ ] 62. Create Onboarding component using shadcn Dialog + Carousel (`src/renderer/components/Onboarding.jsx`)
- [ ] 63. Add onboardingCompleted flag to electron-store
- [ ] 64. Implement first-launch detection in App.jsx
- [ ] 65. Create onboarding steps: Welcome, Features, Shortcuts, Settings
- [ ] 66. Add illustrations/icons for each onboarding step
- [ ] 67. Implement "Don't show again" checkbox functionality
- [ ] 68. Add "Help > Show Onboarding" menu item for re-triggering
- [ ] 69. Translate onboarding content to all supported languages
- [ ] 70. Write tests for first-launch detection, step navigation, and dismissal

### i18n Content Migration (10 tasks)
- [ ] 71. Refactor App.jsx to use i18n keys instead of hardcoded text
- [ ] 72. Refactor AppShell to use i18n keys
- [ ] 73. Refactor all page components to use i18n keys (HomePage, DemoPage, SettingsPage, AboutPage)
- [ ] 74. Refactor UI components to use i18n keys (Button labels, tooltips, placeholders)
- [ ] 75. Add language selector to SettingsPage (replace existing language dropdown)
- [ ] 76. Implement runtime language switching without restart
- [ ] 77. Add missing translation keys to JSON files
- [ ] 78. Test all UI flows in both EN and PT-BR
- [ ] 79. Add ARIA labels for accessibility with i18n
- [ ] 80. Update README with i18n contribution guidelines

## Phase 5: Integration & Testing (Parallel)

### Cross-Feature Integration (8 tasks)
- [ ] 81. Integrate command palette with keyboard shortcuts system (show shortcuts in palette)
- [ ] 82. Integrate tabs with command palette (tab switching commands)
- [ ] 83. Integrate status bar with all features (show active tab, shortcuts hint, language)
- [ ] 84. Ensure onboarding content is translated and shows correct shortcuts per platform
- [ ] 85. Update application menu to include new features (View > Command Palette, etc.)
- [ ] 86. Add keyboard shortcut hints to tooltips throughout the app
- [ ] 87. Test cross-platform compatibility (macOS, Windows, Linux)
- [ ] 88. Update config.js with new feature flags (enable/disable tabs, splash, etc.)

### Performance Optimization (6 tasks)
- [ ] 89. Optimize command palette fuzzy search for 1000+ commands (virtual scrolling)
- [ ] 90. Implement tab content lazy loading (unmount inactive tabs)
- [ ] 91. Throttle status bar item updates (max 1/sec)
- [ ] 92. Lazy load i18n translation namespaces
- [ ] 93. Measure and optimize splash screen timing (target < 200ms)
- [ ] 94. Profile memory usage of all new features (target < 50MB overhead)

### Documentation & Examples (8 tasks)
- [ ] 95. Document command palette API in README (how to register commands)
- [ ] 96. Document tab system API in README (how to create custom tab types)
- [ ] 97. Document status bar API in README (how to add status items)
- [ ] 98. Document keyboard shortcuts customization in user guide
- [ ] 99. Document i18n contribution workflow (how to add new languages)
- [ ] 100. Add code examples for each new hook (useRegisterCommand, useTab, etc.)
- [ ] 101. Update DEVELOPMENT.md with new architecture patterns
- [ ] 102. Create video demo showcasing all new features

## Phase 6: Validation & Refinement (Sequential)

### Final Testing & Validation (10 tasks)
- [ ] 103. Run `openspec validate add-ux-shell-features --strict` and fix all issues
- [ ] 104. Verify all 7 specs pass validation
- [ ] 105. Run full test suite and ensure 100% pass rate
- [ ] 106. Test all features with screen reader (accessibility check)
- [ ] 107. Test all features in dark and light themes
- [ ] 108. Conduct user testing session (gather feedback on UX)
- [ ] 109. Address critical bugs and UX issues from testing
- [ ] 110. Verify internationalization works for all languages
- [ ] 111. Benchmark performance metrics against success criteria
- [ ] 112. Final code review and cleanup

## Dependencies & Sequencing

**Critical Path:**
Phase 1 (Foundation) → Phase 2 (Commands) → Phase 3 (Tabs) → Phase 4 (Onboarding) → Phase 5 (Integration) → Phase 6 (Validation)

**Parallelizable Work:**
- Phase 1: All three tracks (i18n, status bar, splash) can be done in parallel
- Phase 5: Integration and performance tasks can be split across team members
- Documentation can start in Phase 4 and continue through Phase 5

**Blockers:**
- Command Palette depends on Keyboard Shortcuts (uses shortcut registry)
- Tabs depend on Command Palette (for tab commands)
- Onboarding depends on i18n (for translated content)
- Integration phase depends on all previous phases
- Validation depends on all implementation complete

**Total Tasks:** 112

**Estimated Effort:**
- Phase 1: ~8 hours (parallelizable to ~3 hours with 3 devs)
- Phase 2: ~12 hours
- Phase 3: ~10 hours
- Phase 4: ~8 hours
- Phase 5: ~10 hours (parallelizable to ~5 hours)
- Phase 6: ~6 hours
- **Total: ~54 hours (~30 hours with parallelization)**
