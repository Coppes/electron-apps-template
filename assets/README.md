# Tray Icon Assets

This directory should contain platform-specific tray icon assets.

## Required Files

### macOS
- `icon-Template.png` - 16x16px monochrome template image (automatically adapts to dark/light mode)
- `icon-Template@2x.png` - 32x32px monochrome template image for retina displays

### Windows
- `icon-16.png` - 16x16px colored icon
- `icon-32.png` - 32x32px colored icon
- `icon-64.png` - 64x64px colored icon (optional, for high DPI)

### Linux
- `icon-32.png` - 32x32px colored icon (same as Windows)
- `icon-64.png` - 64x64px colored icon (optional)

## Icon Guidelines

### macOS Template Images
- Use monochrome (black and transparent) images
- Include "Template" in the filename for automatic dark/light mode support
- Icon should be simple and recognizable at small sizes
- Use alpha channel for transparency

### Windows/Linux Icons
- Use colored icons with transparent background
- Ensure icons are visible on both light and dark backgrounds
- Test at different DPI settings

## Notification Icons

The application icon is used for notifications by default. If custom notification icons are needed:
- `notification-icon.png` - Platform-specific notification icon

## Creating Icons

You can use tools like:
- **ImageMagick**: `convert icon.png -resize 16x16 icon-16.png`
- **Sketch/Figma/Adobe XD**: Design and export at multiple sizes
- **Online converters**: Various web tools for icon conversion

## Placeholder

Until proper icons are created, the system will use fallback icons or may not display the tray icon correctly. The application will log warnings if icon files are missing.
