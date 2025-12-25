# Architecture Specification: TypeScript Migration

## Status
- **State**: Implemented
- **Last Updated**: 2025-12-25

## Requirements

### ADDED Requirements

#### 1. Language Standard
- The project **MUST** use **TypeScript** (`.ts`, `.tsx`) for all source code.
- JavaScript (`.js`, `.jsx`) is **PROHIBITED** in source (`src/`), except for configuration files where necessary.

#### 2. Strictness
- `noImplicitAny` **MUST** be enabled (`true`).
- `strictNullChecks` **MUST** be enabled (`true`).
- `strict` mode **SHOULD** be enabled in `tsconfig.json`.

#### 3. IPC Type Safety
- All IPC channels **MUST** be typed.
- IPC payloads **MUST** reference shared interfaces in `src/common/types.ts` (or equivalent).
- `preload.ts` **MUST** expose a typed `window.electronAPI`.

#### 4. Build System
- The build system **MUST** verify TypeScript types during build (`tsc --noEmit`).
- `electron-vite` **MUST** be configured to handle TypeScript transpilation.

### MODIFIED Requirements

#### 1. Code Logic
- Logic from `src/main`, `src/preload`, and `src/renderer` is preserved but translated to TypeScript.

### REMOVED Requirements
- (None explicit, but JS-only patterns are removed).
