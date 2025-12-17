# Tasks: Memory Leak Prevention

- [ ] PRE: Install `memlab` and configure `npm run test:memory` script <!-- id: 0 -->
- [ ] PRE: Configure ESLint to strictly enforce `react-hooks/exhaustive-deps` <!-- id: 1 -->
- [ ] IMPL: Create `useIpcListener` hook with auto-cleanup <!-- id: 2 -->
- [ ] IMPL: Create `useGlobalShortcut` hook with auto-cleanup <!-- id: 3 -->
- [ ] TEST: Add unit tests for `useIpcListener` and `useGlobalShortcut` <!-- id: 4 -->
- [ ] TEST: Create MemLab scenario: `scenarios/open-close-window.js` <!-- id: 5 -->
- [ ] TEST: Create MemLab scenario: `scenarios/navigate-pages.js` <!-- id: 6 -->
- [ ] CI: Add GitHub Actions workflow for memory testing <!-- id: 7 -->
- [ ] DOC: Create `docs/memory-management.md` guide <!-- id: 8 -->
