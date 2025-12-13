# Refactor Storybook Configuration

## Goal
Fix the Storybook configuration to correctly resolve project path aliases (`@/`) and apply Tailwind CSS styles to components. Currently, components in Storybook appear unstyled or fail to load due to missing dependency resolution, as Storybook's independent Vite instance does not inherit configuration from `electron.vite.config.js`.

## Problem
The project uses `electron-vite` for the application build, `vitest` for testing, and Storybook for UI development.
Changes to the configuration (like aliases or CSS plugins) in `electron.vite.config.js` are not automatically reflected in Storybook.
While all tools currently share the same Vite version (v7.x), their configuration contexts are isolated. Storybook does not consume `electron.vite.config.js`, causing:
1.  Import path errors (e.g., usage of `@/` alias).
2.  Missing styles (Tailwind CSS is not processed).

## Solution
We will harmonize the Storybook configuration with the application's renderer configuration without introducing complex dependency chains.
1.  Update `.storybook/main.js` to explicitly configure the Vite builder.
2.  Replicate the `renderer` aliases (`@` -> `src/renderer`).
3.  Inject the Tailwind CSS PostCSS plugin configuration into Storybook's Vite instance.
4.  Ensure `vitest` config (which may also need this) is aligned if it isn't already (though `vitest.config.renderer.js` seems to exist).

This approach treats `electron.vite.config.js` as the source of truth for the app, and `.storybook/main.js` as an adapter that mimics the renderer environment for UI components.

## Risks
- Duplication of configuration: If `electron.vite.config.js` changes (e.g. new aliases), `.storybook/main.js` must be updated manually.
- **Mitigation**: Add comments in both files referencing the other.

## Architecture
No changes to the application architecture. This is a tooling configuration change only.
