/**
 * Log CSP violation
 * @param {Object} details - Violation details
 * @param {number} details.windowId - Window ID
 * @param {string} details.violatedDirective - Violated CSP directive
 * @param {string} details.blockedUri - Blocked URI
 * @param {string} details.sourceFile - Source file
 * @param {number} details.lineNumber - Line number
 */
export declare function logCSPViolation(details: any): void;
/**
 * Log navigation block
 * @param {Object} details - Navigation details
 * @param {number} details.windowId - Window ID
 * @param {string} details.url - Blocked URL
 * @param {string} details.reason - Reason for blocking
 */
export declare function logNavigationBlock(details: any): void;
/**
 * Log permission request
 * @param {Object} details - Permission details
 * @param {number} details.windowId - Window ID
 * @param {string} details.permission - Permission type
 * @param {string} details.origin - Requesting origin
 * @param {boolean} details.granted - Whether permission was granted
 */
export declare function logPermissionRequest(details: any): void;
/**
 * Log external link opened
 * @param {Object} details - Link details
 * @param {string} details.url - Opened URL
 * @param {number} [details.windowId] - Window ID (if available)
 */
export declare function logExternalLink(details: any): void;
/**
 * Log security event
 * @param {Object} details - Event details
 * @param {string} details.type - Event type
 * @param {string} details.severity - Severity level (info, warning, error)
 * @param {string} details.message - Event message
 * @param {Object} [details.metadata] - Additional metadata
 */
export declare function logSecurityEvent(details: any): void;
/**
 * Initialize security audit logging
 * Creates the audit log file if it doesn't exist
 */
export declare function initSecurityAuditLog(): void;
/**
 * Get audit log file path
 * @returns {string}
 */
export declare function getAuditLogPath(): string;
