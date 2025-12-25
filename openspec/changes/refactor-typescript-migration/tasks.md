## 1. Environment Setup
- [x] 1.1 Install TypeScript dependencies (`typescript`, `@types/react`, `@types/node`, `@types/electron` via electron-vite presets).
- [x] 1.2 Create `tsconfig.json`, `tsconfig.node.json`, and `tsconfig.web.json`.
- [ ] 1.3 Update `package.json` scripts if necessary (usually `electron-vite` handles this auto-magically).

## 2. Shared Code Migration
- [x] 2.1 Rename `src/common/*.js` to `.ts`.
- [x] 2.2 Fix import extensions in `src/common`.

## 3. Main Process Migration
- [x] 3.1 Rename `src/main/**/*.js` to `.ts`.
- [x] 3.2 Update `electron.vite.config.js` entry points if needed.
- [x] 3.3 Fix basic type errors in Main process to ensure build passes.

## 4. Preload Migration
- [x] 4.1 Rename `src/preload.js` to `.ts`.
- [x] 4.2 Define `ContextBridge` types explicitly.
- [x] 4.3 Update `src/renderer/index.html` to reference `.ts` entry point if needed? (No, electron-vite handles `src/renderer/index.html`).

## 5. Renderer Process Migration
- [x] 5.1 Rename `src/renderer/**/*.js` to `.ts` and `*.jsx` to `.tsx`.
- [x] 5.2 Fix JSX-to-TSX issues (React types).
- [x] 5.3 Allow `implicitAny` to pass build initially.

## 6. Verification
- [x] 6.1 Verify `npm run dev` works.
- [x] 6.2 Verify `npm run build` works.
- [x] 6.3 Verify `npm run test:unit` works (update vitest config if needed).

## 7. Strictness Analysis
- [x] 7.1 Evaluate file-by-file strictness readiness.
- [x] 7.2 Create strictness roadmap document.
