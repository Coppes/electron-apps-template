# logging Specification

## Purpose
TBD - created by archiving change add-observability-maintenance. Update Purpose after archive.
## Requirements
### Requirement: Renderer Logging API

The preload script MUST expose a logging API to renderer processes that forwards log messages to the main process logger.

#### Scenario: Log Info from Renderer

**Given** a renderer process wants to log an informational message

**When** the renderer calls `window.electronAPI.log.info(message, meta)`

**Then** the main process MUST receive the log via IPC

**And** write to `logs/main.log` with format: `[YYYY-MM-DD HH:mm:ss.ms] [info] [Renderer:windowId] message`

**And** include the provided metadata in the log entry

**Verification**: Call log.info from renderer, verify entry in main.log

#### Scenario: Log Error from Renderer

**Given** a renderer process encounters an error

**When** the renderer calls `window.electronAPI.log.error(message, error)`

**Then** the main process MUST receive the log via IPC

**And** write to `logs/main.log` with level `error`

**And** include error message and stack trace if error object provided

**And** tag the log entry with `[Renderer:windowId]`

**Verification**: Log error with stack trace, verify full error details in log file

#### Scenario: Log Warning from Renderer

**Given** a renderer process needs to log a warning

**When** the renderer calls `window.electronAPI.log.warn(message, meta)`

**Then** the main process MUST write to log file with level `warn`

**And** include renderer window ID in the log entry

**Verification**: Call log.warn, verify warn level in log file

#### Scenario: Log Debug from Renderer (Development Only)

**Given** the application is running in development mode

**When** the renderer calls `window.electronAPI.log.debug(message, meta)`

**Then** the main process MUST write to log file with level `debug`

**Given** the application is running in production mode

**When** the renderer calls `window.electronAPI.log.debug(message, meta)`

**Then** the log SHOULD be filtered based on configured log level

**Verification**: Test debug logs in dev vs prod mode

### Requirement: IPC Log Handlers

The main process MUST register IPC handlers for all log levels from renderer processes.

#### Scenario: Register Log Handlers

**Given** the application is starting up

**When** IPC handlers are initialized

**Then** handlers MUST be registered for:
- `IPC_CHANNELS.LOG_DEBUG`
- `IPC_CHANNELS.LOG_INFO`
- `IPC_CHANNELS.LOG_WARN`
- `IPC_CHANNELS.LOG_ERROR`

**Verification**: Check IPC handler registration in main process

#### Scenario: Log Message Validation

**Given** a renderer sends a log message via IPC

**When** the main process receives the log request

**Then** the handler MUST validate:
- `message` is a string
- `message.length` is less than 10KB (DOS prevention)
- `meta` is an object (if provided)

**And** reject invalid messages with error response

**Verification**: Send oversized or invalid log messages, verify rejection

#### Scenario: Identify Log Source

**Given** a log message is received from a renderer via IPC

**When** the log handler processes the message

**Then** the handler MUST determine the source window ID using `BrowserWindow.fromWebContents(event.sender)`

**And** include the window ID in the log entry metadata

**And** tag the log message with `[Renderer:windowId]` prefix

**Verification**: Log from multiple windows, verify each has correct window ID

### Requirement: Unified Log File

All logs from main and renderer processes MUST be written to a single log file with consistent formatting.

#### Scenario: Single Log File Location

**Given** the application is running

**When** logs are written from any process

**Then** all logs MUST be written to `{userData}/logs/main.log`

**And** the log file MUST be created automatically if it doesn't exist

**Verification**: Check log file path resolves to userData/logs/main.log

#### Scenario: Consistent Log Format

**Given** logs are written from main or renderer processes

**When** a log entry is created

**Then** the format MUST be:
```
[YYYY-MM-DD HH:mm:ss.ms] [level] [source] message {metadata}
```

**Where**:
- `level` is one of: debug, info, warn, error
- `source` is `Main` or `Renderer:windowId`
- `metadata` is JSON-formatted additional context

**Verification**: Parse log file, verify all entries match format

#### Scenario: Log File Rotation

**Given** the log file exceeds 10MB in size

**When** new log entries are written

**Then** the logger MUST rotate the log file automatically

**And** create a new `main.log` file

**And** rename the old file to `main.log.old`

**Verification**: Fill log file beyond 10MB, verify rotation occurs

### Requirement: Log Message Security

The logging system MUST prevent abuse and protect sensitive information.

#### Scenario: Rate Limiting

**Given** a renderer is sending log messages

**When** the renderer sends more than 100 log messages per second

**Then** the main process MUST throttle or reject additional messages

**And** log a warning about excessive logging from that window

**Verification**: Send 200 logs rapidly, verify throttling kicks in

#### Scenario: Size Limits

**Given** a renderer attempts to log a message

**When** the message exceeds 10KB in length

**Then** the main process MUST reject the log request

**And** return an error: "Log message too large"

**Verification**: Send 20KB message, verify rejection

#### Scenario: Metadata Sanitization

**Given** log metadata contains objects

**When** the metadata is serialized for logging

**Then** circular references MUST be handled without crashing

**And** functions MUST be converted to "[Function]"

**And** undefined values MUST be converted to null

**Verification**: Log circular object, verify safe serialization

### Requirement: Process Type Tagging

All log entries MUST be tagged with their source process for debugging.

#### Scenario: Main Process Logs

**Given** the main process writes a log

**When** the log entry is created

**Then** it MUST be tagged with `[Main]` prefix

**Verification**: Log from main, verify [Main] tag

#### Scenario: Renderer Process Logs

**Given** a renderer writes a log via the API

**When** the log entry is created in main

**Then** it MUST be tagged with `[Renderer:windowId]` prefix

**And** the windowId MUST be the actual BrowserWindow ID

**Verification**: Log from renderer, verify [Renderer:N] tag with correct ID

### Requirement: Development vs Production Logging

The logging system MUST adjust behavior based on environment configuration.

#### Scenario: Development Console Logging

**Given** `config.env` is `development`

**When** a log is written

**Then** the log MUST be written to console (stdout/stderr)

**And** written to log file

**Verification**: Run in dev mode, verify console output

#### Scenario: Production File-Only Logging

**Given** `config.env` is `production`

**When** a log is written

**Then** the log MUST be written to log file only

**And** NOT appear in console (unless error level)

**Verification**: Run in production mode, verify no console spam

#### Scenario: Configurable Log Levels

**Given** `config.logging.level` is set to a specific level

**When** logs at various levels are written

**Then** only logs at or above the configured level MUST be recorded

**Example**: If level is `warn`, then `debug` and `info` are suppressed

**Verification**: Set level to warn, verify info logs don't appear

### Requirement: Error Context Enrichment

Error logs MUST include additional diagnostic context for troubleshooting.

#### Scenario: Error with Stack Trace

**Given** a renderer logs an error with an Error object

**When** `window.electronAPI.log.error(message, error)` is called

**Then** the log entry MUST include:
- Error message
- Full stack trace
- Renderer window ID
- Timestamp

**Verification**: Log Error object, verify stack trace in file

#### Scenario: Error with Custom Metadata

**Given** a renderer logs an error with custom metadata

**When** `window.electronAPI.log.error(message, { userId, action })` is called

**Then** the log entry MUST include the custom metadata fields

**And** the metadata MUST be searchable in the log file

**Verification**: Log with custom fields, verify fields appear in log

