# Tasks: Add Memory Leak Prevention

## Automated Memory Testing
- [ ] Install `memlab` and `puppeteer` as dev dependencies <!-- id: 10 -->
- [ ] Configure MemLab for Electron (create `memlab.config.js` if needed) <!-- id: 11 -->
- [ ] Create `test/memory/scenarios/open-close-window.js` <!-- id: 12 -->
- [ ] Create `test/memory/scenarios/navigate-pages.js` <!-- id: 13 -->
- [ ] Add `test:memory` script to `package.json` <!-- id: 14 -->
- [ ] Create GitHub Action workflow `.github/workflows/memory-test.yml` <!-- id: 15 -->

## Leak Prevention Patterns
- [ ] Create helper hook `src/hooks/useIpcListener.js` <!-- id: 20 -->
- [ ] Create helper hook `src/hooks/useGlobalShortcut.js` <!-- id: 21 -->
- [ ] Verify/Update ESLint config for `react-hooks/exhaustive-deps` <!-- id: 22 -->
- [ ] Create developer guide `docs/memory-management.md` <!-- id: 23 -->

## Verification
- [ ] Run `npm run test:memory` and verify no leaks are reported in baseline <!-- id: 30 -->
- [ ] Refactor one component to use `useIpcListener` as proof of concept <!-- id: 31 -->
