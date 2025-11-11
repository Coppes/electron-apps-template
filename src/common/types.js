/**
 * JSDoc type definitions for IPC schemas and application types
 */

/**
 * @typedef {Object} IPCSchema
 * @property {Object} input - Input parameter schema
 * @property {Object} output - Output parameter schema
 * @property {Function} handler - Handler function for the IPC channel
 */

/**
 * @typedef {Object} WindowState
 * @property {number} x - Window x position
 * @property {number} y - Window y position
 * @property {number} width - Window width
 * @property {number} height - Window height
 * @property {boolean} isMaximized - Whether window is maximized
 * @property {boolean} isFullScreen - Whether window is in fullscreen
 */

/**
 * @typedef {Object} WindowOptions
 * @property {string} type - Window type (main, settings, about)
 * @property {number} [width] - Window width
 * @property {number} [height] - Window height
 * @property {number} [minWidth] - Minimum window width
 * @property {number} [minHeight] - Minimum window height
 * @property {number} [maxWidth] - Maximum window width
 * @property {number} [maxHeight] - Maximum window height
 * @property {string} [title] - Window title
 * @property {boolean} [resizable] - Whether window is resizable
 * @property {boolean} [frame] - Whether window has a frame
 * @property {boolean} [show] - Whether to show window immediately
 */

/**
 * @typedef {Object} IPCResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {*} [data] - Response data
 * @property {string} [error] - Error message if failed
 * @property {string} [code] - Error code if failed
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field that failed validation
 * @property {string} expected - Expected type or value
 * @property {*} received - Actual value received
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} FileDialogResult
 * @property {boolean} canceled - Whether dialog was canceled
 * @property {string} [filePath] - Selected file path
 * @property {string} [content] - File content if read
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} VersionInfo
 * @property {string} electron - Electron version
 * @property {string} chrome - Chrome version
 * @property {string} node - Node.js version
 * @property {string} v8 - V8 version
 * @property {string} app - Application version
 */

/**
 * @typedef {Object} UpdateInfo
 * @property {string} version - Update version
 * @property {string} releaseDate - Release date
 * @property {string} [releaseNotes] - Release notes
 * @property {number} [size] - Update size in bytes
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} level - Log level (debug, info, warn, error)
 * @property {string} message - Log message
 * @property {Object} [meta] - Additional metadata
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} ErrorReport
 * @property {string} message - Error message
 * @property {string} stack - Error stack trace
 * @property {string} version - App version
 * @property {string} platform - Operating system platform
 * @property {Object} [context] - Additional context
 */

/**
 * @typedef {Object} CSPPolicy
 * @property {string[]} 'default-src' - Default source policy
 * @property {string[]} 'script-src' - Script source policy
 * @property {string[]} 'style-src' - Style source policy
 * @property {string[]} 'img-src' - Image source policy
 * @property {string[]} 'font-src' - Font source policy
 * @property {string[]} 'connect-src' - Connection source policy
 */
