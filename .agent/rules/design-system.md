---
trigger: glob
description: Design System rules
globs: *.css, design system, design, frontend, components, icon, style, styling. 
---

# Design System Rules

## Tech Stack
- **CSS Engine**: **Tailwind CSS v4** (`@tailwindcss/postcss`).
- **Icons**: **Phosphor Icons** (`@phosphor-icons/react`).
- **Components**: **shadcn/ui** (Radix UI primitives).
- **Utils**: `clsx` + `tailwind-merge` (via `cn` helper).

## Implementation
- **Components**: Create in `src/renderer/components/ui/`.
- **Structure**: Functional Components + Hooks.
- **Styling**: Utility-first; avoid custom CSS files unless necessary in `src/css/globals.css`.
- **Theme**: Support **Dark/Light** modes via CSS variables/Tailwind classes.

## Rules
- **No Inline Styles**: Avoid `style={{...}}` unless dynamic.
- **Consistency**: Use design tokens (colors, spacing) from `tailwind.config.js` (implied v4 theme).
- **Feedback**: Interactive elements must have hover/focus/active states.

## Storybook
- **Stories**: All UI components MUST have a corresponding `.stories.jsx` file.
- **Location**: Stories reside alongside the component (e.g., `Button.stories.jsx`).
- **Format**: Use Component Story Format (CSF) 3.
- **Args**: Define controls for all component props.
- **Documentation**: Use JSDoc/Auto-docs tags for automated documentation generation.