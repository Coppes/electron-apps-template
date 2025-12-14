# Context-Aware Right-Click Menu

## Goal
Implement a comprehensive, context-aware right-click menu (context menu) system throughout the application. The menu content should dynamically adapt based on the UI area where the user clicks (e.g., Sidebar, Language Icon, Tabs, Default Webview area).

## Architecture
The implementation will leverage the existing `@radix-ui/react-context-menu` primitives, potentially wrapping them in a higher-order component or a custom hook `useContextMenu` to easily register triggers and define menu items for different application sections without code duplication.

## Dependencies
- `@radix-ui/react-context-menu` (Already installed)
- `@phosphor-icons/react` for icons

## User Review Required
- **UX/UI**: Confirm the specific menu items for each area (defined in spec).
