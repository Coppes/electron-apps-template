---
trigger: glob
description: Usability and Accessibility rules
globs: design, style, styling, aesthetics, design system, accessibility, components, ui, internationalization, language.
---

# Usability and Accessibility

## Design Aesthetics
- **Premium Feel**: Use vibrant colors, and smooth colors.
- **Animations**: Use **Framer Motion** for micro-animations and transitions.
- **Responsive**: Ensure UI feels alive (hover effects, feedback).
- **Typography**: Use modern fonts (Inter, etc.) via `@fontsource`.

## Accessibility (A11y)
- **Semantic HTML**: Use proper tags (`<nav>`, `<main>`, `<button>`).
- **Unique IDs**: Ensure all interactive elements have unique IDs.
- **Colors**: Ensure sufficient contrast ratios.
- **Keyboard**: Full keyboard navigation support (focus states).
- **Linting**: Respect `eslint-plugin-jsx-a11y` rules.

## Internationalization
- **i18next**: Use `useTranslation` hook.
- **No Hardcoding**: Never hardcode text strings; use translation keys.