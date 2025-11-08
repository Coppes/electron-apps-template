# Project Context

## Purpose
Modern, secure, and scalable Electron + React boilerplate for desktop apps. Focuses on best practices for security, modularity, and maintainability. Includes Tailwind CSS, shadcn/ui, ESLint, Vitest, Testing Library, and Electron Forge. Enables rapid prototyping and production-ready apps with context isolation and safe IPC.

## Tech Stack
- Electron v39.1.1 (main, preload, renderer)
- React v18.3.1 (JSX, hooks, components)
- Tailwind CSS v4.1.17 (dark/light themes, CSS variables)
- shadcn/ui (Radix UI primitives)
- Electron Forge v5.2.4 (CLI v7.8.3, plugin-webpack)
- ESLint v8.57.1 (React/JS)
- Vitest v4.0.8 + Testing Library v16.3.0

## Project Conventions

### Code Style
JavaScript (ES2022+), React JSX. 2 spaces for indentation. Functional components preferred. PascalCase for components, camelCase for variables/functions. Prettier formatting. ESLint enforced (airbnb + react/recommended).

### Architecture Patterns
Modular structure: src/main.js (Electron main), src/preload.js (contextBridge), src/renderer/ (React UI). Context isolation enabled, nodeIntegration: false. IPC via contextBridge. UI components in src/renderer/components. CSS in src/renderer/styles. Tests colocated in __tests__ folders.

### Testing Strategy
Unit and integration tests with Vitest and Testing Library. Coverage required for core modules and UI components. Test files use *.test.jsx naming. CI integration recommended.

### Git Workflow
Feature branches from main. Conventional Commits (feat, fix, chore, docs, test, refactor). PRs require review and passing tests. Rebase preferred over merge. Main branch protected.

## Domain Context
Desktop applications with secure local execution. No backend required by default. IPC used for communication between main and renderer. UI/UX follows modern desktop standards.

## Important Constraints
Must use contextIsolation and nodeIntegration: false for security. Only audited dependencies. No remote code execution. All external APIs must be documented. Accessibility and dark mode required.

## External Dependencies
No external APIs by default. If added, document in this section. All dependencies managed via npm and documented in package.json.
