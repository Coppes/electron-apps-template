# Tasks: Memory Leak Prevention

- [x] PRE: Install `memlab` and configure `npm run test:memory` script <!-- id: 0 -->
- [x] PRE: Configure ESLint to strictly enforce `react-hooks/exhaustive-deps` <!-- id: 1 -->
- [x] IMPL: Create `useIpcListener` hook with auto-cleanup <!-- id: 2 -->
- [x] IMPL: Create `useGlobalShortcut` hook with auto-cleanup <!-- id: 3 -->
- [x] TEST: Add unit tests for `useIpcListener` and `useGlobalShortcut` <!-- id: 4 -->
- [x] TEST: Create MemLab scenario: `scenarios/open-close-window.js` <!-- id: 5 -->
- [x] TEST: Create MemLab scenario: `scenarios/navigate-pages.js` <!-- id: 6 -->
- [x] CI: Add GitHub Actions workflow for memory testing <!-- id: 7 -->
- [x] DOC: Create `docs/memory-management.md` guide <!-- id: 8 -->
