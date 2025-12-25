## 1. Environment Setup
- [ ] 1.1 Install TypeScript dependencies (`typescript`, `@types/react`, `@types/node`, `@types/electron` via electron-vite presets).
- [ ] 1.2 Create `tsconfig.json`, `tsconfig.node.json`, and `tsconfig.web.json`.
- [ ] 1.3 Update `package.json` scripts if necessary (usually `electron-vite` handles this auto-magically).

## 2. Shared Code Migration
- [ ] 2.1 Rename `src/common/*.js` to `.ts`.
- [ ] 2.2 Fix import extensions in `src/common`.

## 3. Main Process Migration
- [ ] 3.1 Rename `src/main/**/*.js` to `.ts`.
- [ ] 3.2 Update `electron.vite.config.js` entry points if needed.
- [ ] 3.3 Fix basic type errors in Main process to ensure build passes.

## 4. Preload Migration
- [ ] 4.1 Rename `src/preload.js` to `.ts`.
- [ ] 4.2 Define `ContextBridge` types explicitly.
- [ ] 4.3 Update `src/renderer/index.html` to reference `.ts` entry point if needed? (No, electron-vite handles `src/renderer/index.html`).

## 5. Renderer Process Migration
- [ ] 5.1 Rename `src/renderer/**/*.js` to `.ts` and `*.jsx` to `.tsx`.
- [ ] 5.2 Fix JSX-to-TSX issues (React types).
- [ ] 5.3 Allow `implicitAny` to pass build initially.

## 6. Verification
- [ ] 6.1 Verify `npm run dev` works.
- [ ] 6.2 Verify `npm run build` works.
- [ ] 6.3 Verify `npm run test:unit` works (update vitest config if needed).

## 7. Strictness Analysis
- [ ] 7.1 Evaluate file-by-file strictness readiness.
- [ ] 7.2 Create strictness roadmap document.
