# Polish App Experience and Stability

## Goal
Improve application stability by fixing critical bugs in data management, connectivity, and settings, while enhancing the user experience with better theme control, visual polish, and a new Split View functionality.

## Problem
The application currently suffers from several functional regressions and missing UI features:
- **Connectivity**: The sync queue viewer crashes due to a missing API method.
- **Data Management**: Import and Restore operations fail due to incorrect argument passing.
- **Theme**: The application defaults to light mode and lacks a proper system/light/dark toggle.
- **Localization**: Onboarding and history features are missing translations.
- **UX**: Tab management is limited (no drag-and-drop, restricted split view controls), and visual elements like scrollbars verify refinement.

## Solution
1.  **Fix Critical Bugs**: Correct API signatures for `import` and `restore` functions, expose missing `getSyncQueueStatus`, and validate theme persistence.
2.  **Add Split View Functionality**: Implement a robust Split View system, allowing users to view multiple tabs side-by-side with drag-and-drop and keyboard support.
3.  **Enhance Theme System**: Implement a tri-state theme toggle (System/Light/Dark) and enforce theme application on startup.
4.  **Improve Tab Management**: Add drag-and-drop reordering and middle-click actions.
5.  **Polish UI/UX**: Add a custom scrollbar, fix backup date alignment, and ensure all text is translatable.
6.  **Clean Code**: Audit codebase for duplicate or legacy code.

## Risks
- **Tab State**: Complex drag-and-drop interactions in tabs might conflict with existing split-view state management.
- **Migration**: Theme settings format change might require migration for existing users (though likely just a value update).
