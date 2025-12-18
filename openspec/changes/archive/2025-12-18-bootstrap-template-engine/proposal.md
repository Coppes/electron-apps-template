# Proposal: Bootstrap Electron + React Template Engine

## Change ID
bootstrap-template-engine

## Summary
This proposal introduces a robust, secure, and developer-friendly Electron + React template engine. It covers process separation, TypeScript usage, optimized DX (Vite.js, HMR, auto-reload), secure IPC, production packaging, security defaults, persistence, custom window options, and a comprehensive shadcn/ui component kit with essential screens and a native file opener example.

## Motivation
Developers need a modern, scalable, and secure starting point for desktop apps. This template provides immediate value by integrating best practices, tooling, and UI components, reducing setup time and risk.

## Scope
- Main/Renderer separation, TypeScript
- Vite.js for renderer, HMR
- Main auto-reload (nodemon)
- Secure IPC via contextBridge/preload
- Example IPC (getVersion)
- electron-builder for packaging
- App icons/build scripts
- Security defaults (contextIsolation, nodeIntegration, CSP)
- electron-store for persistence
- Frameless window/custom titlebar (optional)
- shadcn/ui kit: Button, Resizable, ThemeToggle, Menu, Sheet, Dialog, Toaster, Input, Select, Switch, Slider, Table, Tooltip
- Essential screens: App Shell, Settings, About
- Native file opener example

## References
- See openspec/project.md for project context and conventions.
- See .github/prompts/openspec-proposal.prompt.md for guardrails and steps.
