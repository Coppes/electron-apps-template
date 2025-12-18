# ui-kit Specification

## Purpose
TBD - created by archiving change bootstrap-template-engine. Update Purpose after archive.
## Requirements
### Requirement: shadcn/ui Component Kit

The template MUST include and configure the following shadcn/ui components: Button, Resizable, ThemeToggle, Menu, Sheet, Dialog, Toaster, Input, Select, Switch, Slider, Table, Tooltip.

#### Scenario

- The initial app includes examples of each component in the UI, ready for use and customization.

The template MUST include and configure the following shadcn/ui components: Button, Resizable, ThemeToggle, Menu, Sheet, Dialog, Toaster, Input, Select, Switch, Slider, Table, Tooltip.

#### Scenario:
- The initial app includes examples of each component in the UI, ready for use and customization.

### Requirement: App Shell Layout

The main layout MUST use the Resizable component to create a sidebar and main content area, following desktop app conventions.

#### Scenario

- The app shell displays a sidebar (Resizable) and a main content panel.

The main layout MUST use the Resizable component to create a sidebar and main content area, following desktop app conventions.

#### Scenario:
- The app shell displays a sidebar (Resizable) and a main content panel.

### Requirement: Settings Page

The template MUST provide a settings page that demonstrates electron-store persistence and uses shadcn/ui form components.

#### Scenario

- The settings page allows changing preferences (e.g., theme) and persists them using electron-store.

The template MUST provide a settings page that demonstrates electron-store persistence and uses shadcn/ui form components.

#### Scenario:
- The settings page allows changing preferences (e.g., theme) and persists them using electron-store.

### Requirement: About Page

The template MUST provide an about page that displays the app and Electron version using IPC (window.api.getVersion()).

#### Scenario

- The about page shows the current app version and Electron version fetched via IPC.

The template MUST provide an about page that displays the app and Electron version using IPC (window.api.getVersion()).

#### Scenario:
- The about page shows the current app version and Electron version fetched via IPC.

### Requirement: Native File Opener Example

The template MUST include a native file opener example: a Button (shadcn/ui) in React calls window.api.openFile(), which opens a native file dialog and returns file contents to React, displayed in a Textarea.

#### Scenario

- Clicking "Abrir Arquivo" opens the OS file dialog, reads the file, and displays its contents in a Textarea component.

The template MUST include a native file opener example: a Button (shadcn/ui) in React calls window.api.openFile(), which opens a native file dialog and returns file contents to React, displayed in a Textarea.

#### Scenario:
- Clicking "Abrir Arquivo" opens the OS file dialog, reads the file, and displays its contents in a Textarea component.

