# Tasks: Add UX and Application Shell Features

## Phase 1: Foundation & Infrastructure (Parallel)

### Internationalization Setup (8 tasks)
- [x] 1. Install react-i18next and i18next dependencies
- [x] 2. Create i18n directory structure (`src/renderer/i18n/locales/{en,pt-BR}`)
- [x] 3. Initialize i18next in `src/renderer/i18n/index.js` with namespaces and fallback
- [x] 4. Create translation files: common.json, settings.json, errors.json, onboarding.json for EN
- [x] 5. Create translation files: common.json, settings.json, errors.json, onboarding.json for PT-BR
- [x] 6. Integrate i18n provider in `src/renderer/index.js`
- [x] 7. Create IPC handler for language switching in `src/main/ipc/handlers/i18n.js`
- [x] 8. Write unit tests for i18n initialization, language switching, and fallback behavior

### Status Bar Component (6 tasks)
- [x] 9. Create StatusBarContext with item registration API (`src/renderer/contexts/StatusBarContext.jsx`)
- [x] 10. Create StatusBar component with left/center/right slots (`src/renderer/components/StatusBar.jsx`)
- [x] 11. Create useStatusBar hook for registering items (`src/renderer/hooks/useStatusBar.js`)
- [x] 12. Integrate StatusBar in AppShell (fixed bottom position)
- [x] 13. Add default status items (version, connection status)
- [x] 14. Write tests for StatusBar item registration, positioning, and priority

### Splash Screen (7 tasks)
- [x] 15. Create static splash.html with inline CSS and app logo (`src/renderer/static/splash.html`)
- [x] 16. Implement splash window creation in `src/main/splash.js`
- [x] 17. Update lifecycle.js to show splash before main window
- [x] 18. Implement fade transition from splash to main window
- [x] 19. Add timeout mechanism (10s max) to prevent splash hangs
- [x] 20. Handle splash window errors gracefully
- [x] 21. Write integration tests for splash screen timing and transitions

## Phase 2: Command Palette & Shortcuts (Sequential)

### Keyboard Shortcuts Management (10 tasks)
- [x] 22. Create ShortcutRegistry with default shortcuts mapping (`src/renderer/contexts/ShortcutContext.jsx`)
- [x] 23. Implement shortcut persistence in electron-store (load/save overrides)
- [x] 24. Create useKeyboardShortcut hook with conflict detection (`src/renderer/hooks/useKeyboardShortcut.js`)
- [x] 25. Create IPC handler for shortcut management (Integrated via generic store handled in `Window Manager`)
- [x] 26. Create KeyboardShortcutsPage component with shortcut list and editor (`src/renderer/components/pages/KeyboardShortcutsPage.jsx`)
- [x] 27. Implement shortcut conflict detection and warning UI
- [x] 28. Add blacklist for system shortcuts (Cmd+Q, Cmd+W, etc.) (Validation in UI recorder)
- [x] 29. Integrate KeyboardShortcutsPage into settings navigation
- [x] 30. Add reset to defaults functionality
- [x] 31. Write tests for shortcut registration, conflicts, persistence, and resolution

### Command Palette (12 tasks)
- [x] 32. Install @radix-ui/react-command (cmdk) if not already available via shadcn
- [x] 33. Create CommandContext with action registry API (`src/renderer/contexts/CommandContext.jsx`)
- [x] 34. Create useRegisterCommand hook for components to register actions (`src/renderer/hooks/useRegisterCommand.js`)
- [x] 35. Create CommandPalette component using shadcn Command (`src/renderer/components/CommandPalette.jsx`)
- [x] 36. Implement fuzzy search for command filtering
- [x] 37. Add command categories and grouping in palette UI
- [x] 38. Register default commands (navigation, settings, help, window operations)
- [x] 39. Integrate Ctrl/Cmd+K shortcut to open command palette
- [x] 40. Add command execution tracking in status bar
- [x] 41. Add keyboard navigation (arrows, enter, escape)
- [x] 42. Integrate command palette with existing navigation system
- [x] 43. Write tests for command registration, search, execution, and keyboard navigation

## Phase 3: Tabbed Interface (Sequential)

### Tab System Core (10 tasks)
- [x] 44. Create TabContext with tab manager service (`src/renderer/contexts/TabContext.jsx`)
- [x] 45. Define tab data structure (id, type, title, icon, closeable, state)
- [x] 46. Implement tab persistence in electron-store (save/restore tab collection)
- [x] 47. Create TabBar component with tab rendering and controls (`src/renderer/components/TabBar.jsx`)
- [x] 48. Create TabContent component with strategy pattern for tab types (`src/renderer/components/TabContent.jsx`)
- [x] 49. Create useTab hook for tab operations (open, close, switch, update) (`src/renderer/hooks/useTab.js`)
- [x] 50. Install @radix-ui/react-tabs if not already available
- [x] 51. Implement tab switching with keyboard shortcuts (Ctrl+Tab, Ctrl+Shift+Tab)
- [x] 52. Add tab close button with unsaved changes warning
- [x] 53. Write tests for tab lifecycle (create, switch, close, persist, restore)

### Tab Integration (8 tasks)
- [x] 54. Update AppShell to render TabBar above content area
- [x] 55. Migrate existing pages (Home, Demo, Settings, About) to tab types
- [x] 56. Implement "Open in New Tab" action in command palette
- [x] 57. Add tab count and active tab info to status bar
- [x] 58. Update navigation logic to work with tabs (open tab vs switch to existing)
- [x] 59. Add "Close All Tabs" and "Close Other Tabs" commands
- [x] 60. Implement tab context menu (right-click for actions)
- [x] 61. Write integration tests for tab navigation and multi-tab scenarios

## Phase 4: Onboarding & Polish (Sequential)

### Onboarding Flow (9 tasks)
- [x] 62. Create Onboarding component using shadcn Dialog + Carousel (`src/renderer/components/Onboarding.jsx`)
- [x] 63. Add onboardingCompleted flag to electron-store
- [x] 64. Implement first-launch detection in App.jsx
- [x] 65. Create onboarding steps: Welcome, Features, Shortcuts, Settings
- [x] 66. Add illustrations/icons for each onboarding step
- [x] 67. Implement "Don't show again" checkbox functionality
- [x] 68. Add "Help > Show Onboarding" menu item for re-triggering
- [x] 69. Translate onboarding content to all supported languages
- [x] 70. Write tests for first-launch detection, step navigation, and dismissal

### i18n Content Migration (10 tasks)
- [x] 71. Refactor App.jsx to use i18n keys instead of hardcoded text
- [x] 72. Refactor AppShell to use i18n keys
- [x] 73. Refactor all page components to use i18n keys (HomePage, DemoPage, SettingsPage, AboutPage)
- [x] 74. Refactor UI components to use i18n keys (Button labels, tooltips, placeholders)
- [x] 75. Add language selector to SettingsPage (replace existing language dropdown)
- [x] 76. Implement runtime language switching without restart
- [x] 77. Add missing translation keys to JSON files
- [x] 78. Test all UI flows in both EN and PT-BR
- [x] 79. Add ARIA labels for accessibility with i18n
- [x] 80. Update README with i18n contribution guidelines

## Phase 5: Integration & Testing (Parallel)

### Cross-Feature Integration (8 tasks)
- [x] 81. Integrate command palette with keyboard shortcuts system (show shortcuts in palette)
- [x] 82. Integrate tabs with command palette (tab switching commands)
- [x] 83. Integrate status bar with all features (show active tab, shortcuts hint, language)
- [x] 84. Ensure onboarding content is translated and shows correct shortcuts per platform
- [x] 85. Update application menu to include new features (View > Command Palette, etc.)
- [x] 86. Add keyboard shortcut hints to tooltips throughout the app
- [x] 87. Test cross-platform compatibility (macOS, Windows, Linux)
- [x] 88. Update config.js with new feature flags (enable/disable tabs, splash, etc.)

### Performance Optimization (6 tasks)
- [x] 89. Optimize command palette fuzzy search for 1000+ commands (virtual scrolling)
- [x] 90. Implement tab content lazy loading (unmount inactive tabs)
- [x] 91. Throttle status bar item updates (max 1/sec)
- [x] 92. Lazy load i18n translation namespaces
- [x] 93. Measure and optimize splash screen timing (target < 200ms)
- [x] 94. Profile memory usage of all new features (target < 50MB overhead)

### Documentation & Examples (8 tasks)
- [x] 95. Document command palette API in README (how to register commands)
- [x] 96. Document tab system API in README (how to create custom tab types)
- [x] 97. Document status bar API in README (how to add status items)
- [x] 98. Document keyboard shortcuts customization in user guide
- [x] 99. Document i18n contribution workflow (how to add new languages)
- [x] 100. Add code examples for each new hook (useRegisterCommand, useTab, etc.)
- [x] 101. Update DEVELOPMENT.md with new architecture patterns
- [ ] 102. Create video demo showcasing all new features

## Phase 6: Validation & Refinement (Sequential)

### Final Testing & Validation (10 tasks)
- [x] 103. Run `openspec validate add-ux-shell-features --strict` and fix all issues
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
