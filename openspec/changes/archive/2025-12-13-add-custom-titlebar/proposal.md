# Proposal: Add Custom Window Title Bar

## Goal

Enable a fully customizable, frameless window title bar that integrates seamlessly with the application's design language, replacing the native OS title bar while preserving native window controls and behaviors.

## Requirement

- **Customizable UI**: The title bar must be a React component (`TitleBar`) capable of rendering any content (search, tabs, user profile).
- **Platform Native Feel**:
    - **macOS**: Hide the standard title bar but keep the "traffic light" window controls visible and functional. The web content should extend behind them.
    - **Windows/Linux**: Remove the native frame entirely (`frame: false`) and provide custom, theme-aware Minimize, Maximize/Restore, and Close buttons that match Windows 11/10 aesthetics.
- **Draggability**: The title bar area must be draggable (`-webkit-app-region: drag`) to move the window, except for interactive elements (buttons, inputs) which must be non-draggable (`-webkit-app-region: no-drag`).
- **Standard Window Actions**: Double-clicking the title bar should maximize/restore the window (standard behavior).
- **Responsiveness**: The title bar should adapt to window focus states (e.g., dimming controls when blurred).

## Implementation Details

### Configuration Changes

**`src/common/constants.js`**
- Modify `DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.MAIN]` to include:
  - `titleBarStyle: 'hidden'` (macOS)
  - `trafficLightPosition`: `{ x: 10, y: 10 }` (macOS, adjustable)
  - `frame: false` (Windows/Linux)
  - `titleBarOverlay`: `true` (Windows - optional, for native-like controls if preferred, otherwise fully custom)

### Main Process

**`src/main/ipc/handlers/window.js`**
- Ensure `window:minimize`, `window:maximize`, `window:close` handlers return the new window state to allow the UI to update immediately (e.g., toggling the Maximize/Restore icon).

### Renderer Process

**`src/renderer/components/layout/TitleBar.jsx`**
- **New Component**: Handles the layout of the top bar.
- **Props**: `platform` (detected via `window.electronAPI.system.getPlatform()`).
- **Behavior**:
    - Uses `flexbox` for layout.
    - Applies `h-10 w-full select-none` utility classes.
    - **macOS**: Renders a "spacer" div on the left to avoid overlapping traffic lights.
    - **Windows/Linux**: Renders a `WindowControls` component on the right.

**`src/renderer/components/layout/WindowControls.jsx`**
- **New Component**: Renders Minimize, Maximize/Restore, Close buttons.
- **Icons**: Uses Phosphor icons (e.g., `Minus`, `Square`, `X`).
- **Interactions**: Calls `window.electronAPI.window.minimize()`, etc.
- **Hover Effects**: Standard operating system hover states (Red background for Close).

**`src/renderer/components/layout/AppShell.jsx`**
- Insert `<TitleBar />` at the very top of the flex container.
- Ensure the rest of the app content sits below it.

## Risks

- **Draggability Issues**: Interactive elements inside a draggable region can be tricky. We must ensure `no-drag` is applied correctly to buttons and inputs.
- **Native Menus**: On Windows/Linux, right-clicking the custom title bar won't show the system context menu by default. This is acceptable for most Electron apps but verified as a trade-off.
- **Fullscreen**: Custom title bar should likely hide in native fullscreen mode.

## Verification

#### Scenario: macOS Appearance
- **Given** the app is running on macOS
- **Then** the native title bar should be hidden
- **And** the traffic lights should be visible at the top-left
- **And** the app content (TitleBar component) should extend to the top edge

#### Scenario: Windows Controls
- **Given** the app is running on Windows
- **Then** the native window frame should be hidden
- **And** custom Minimize, Maximize, Close buttons should appear at the top-right
- **When** clicking "Close"
- **Then** the window should close

#### Scenario: Draggability
- **When** dragging the empty space of the TitleBar
- **Then** the window should move
- **When** dragging a button or input inside the TitleBar
- **Then** the window should NOT move, and the element should receive the interaction
