# Spec: Plugin System

## ADDED Requirements

### Requirement: Plugin Loading
The application MUST load plugin scripts from a `plugins/` directory in the user's data folder on startup.

#### Scenario: Directory Detection
A `test-plugin` folder placed in `plugins/` is detected and its main script is executed.

### Requirement: Plugin Command Registration
Plugins MUST be able to register new commands in the Command Palette.

#### Scenario: Command Execution
Plugin registers "Say Hello". User opens Command Palette, sees "Say Hello", executes it, and the defined action triggers.

### Requirement: Plugin UI Injection
Plugins MUST be able to inject UI elements into predefined slots (e.g., Status Bar).

#### Scenario: Status Bar Injection
Plugin registers a Status Bar item. A new badge appears in the bottom status bar area.
