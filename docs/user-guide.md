# User Guide

## OS Integration Features

### System Tray
The application runs in the background even when the main window is closed. You can access it via the system tray icon (near your clock).
- **Left Click**: Open the main application window.
- **Right Click**: Open a context menu with options to:
    - **Open Window**: Restore the app.
    - **Settings**: Quickly access preferences.
    - **Quit**: Completely exit the application.

### Global Shortcuts
Enhance your productivity with system-wide keyboard shortcuts that work even when the app is in the background.

| Action | Mac Shortcut | Windows/Linux Shortcut |
|--------|--------------|------------------------|
| **Quick Open** | `Cmd+Shift+K` | `Ctrl+Shift+K` |
| **Command Palette** | `Cmd+Shift+P` | `Ctrl+Shift+P` |

*Note: You can disable or customize these in the Settings > Keyboard Shortcuts menu.*

### Deep Linking
You can open specific pages in the app using special URLs from your browser or other apps:
- `electronapp://settings` - Opens the Settings page.
- `electronapp://settings/account` - Opens Account settings directly.
- `electronapp://new` - Starts a new document/action.

### Notifications
The app uses your operating system's native notification center for important alerts.
- **Actions**: Some notifications have buttons (e.g., "View", "Dismiss") that you can click to take immediate action.
- **Do Not Disturb**: The app respects your system's Focus/Do Not Disturb settings.

## Troubleshooting

### Tray icon not appearing?
- Check if you have enabled the "System Tray" option in Settings > General.
- On Linux, ensure your desktop environment supports AppIndicator (e.g., `libappindicator` may be required on GNOME).

### Shortcuts not working?
- Another application might be using the same shortcut. The app will notify you if a conflict occurs.
- Verify permissions in System Preferences (macOS) if prompted for Input Monitoring (usually not required for basic shortcuts).
