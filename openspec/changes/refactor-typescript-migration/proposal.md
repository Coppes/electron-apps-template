# Change: Refactor to TypeScript

## Why
The project is currently written in JavaScript, which lacks strong type safety, leading to potential runtime errors and harder maintenance as the codebase scales. A migration to TypeScript is recommended to improve developer experience (IntelliSense), code reliability (build-time type checking), and alignment with standard enterprise architectural patterns.

## What Changes
- **Configuration**:
    - Update `electron-vite.config.js` to support TypeScript.
    - Add `tsconfig.json` and related config files.
- **Dependencies**:
    - Add `typescript`, `ts-node`, and `@types/*` dev dependencies.
- **Codebase**:
    - Rename `src/common/*.js` to `.ts`.
    - Rename `src/main/*.js` to `.ts`.
    - Rename `src/preload.js` to `.ts`.
    - Rename `src/renderer/*.js(x)` to `.ts(x)`.
    - Be permissive initially (`noImplicitAny: false`) to allow migration without rewriting all code logic immediately.

## Impact
- **Affected specs**: `architecture` (New capability)
- **Affected code**: All files in `src/`.
- **Breaking Changes**: None functionally, but build process will now require TypeScript transpilation (handled seamlessly by electron-vite).
