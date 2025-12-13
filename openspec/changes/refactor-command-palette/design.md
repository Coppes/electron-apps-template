# Design: Command Palette Refactor

## Architecture
The Command Palette will remain a global component in `AppShell` (or root), managed by `CommandContext`.
- **State**: `isOpen`, `searchQuery`.
- **Filtering**: We will utilize `cmdk`'s internal filtering which is efficient and flexible. If we need custom fuzzy search logic, we can override `filter` prop on `Command`.
- **Event Handling**: Global keydown listener for `Super+K` / `Cmd+K`. focus trap is handled by `cmdk`.

## UI/UX
- **Theme**: Glassmorphism (blur backdrop), dark mode compatible.
- **Animations**: `framer-motion` or CSS transitions for fade-in/scale-in.
- **Feedback**: Active item highlighted with `accent` color.
- **Scroll**: Custom scrollbar implementation (or browser-native hidden/styled).

## Interactions
- **Keyboard**:
    - `ArrowUp`/`ArrowDown`: Navigate.
    - `Enter`: Execute command.
    - `Escape`: Close palette.
    - `Backscape`: Clear query.
- **Mouse**: Hover to highlight, Click to execute.
