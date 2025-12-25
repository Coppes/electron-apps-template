import { logger } from '../logger.ts';
import { app } from 'electron';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
/**
 * Security Audit Logging
 * Logs all security-relevant events for audit and monitoring
 */
/**
 * Security audit log file path
 * @type {string}
 */
const AUDIT_LOG_PATH = join(app.getPath('logs'), 'security-audit.log');
/**
 * Write audit entry to dedicated security log file
 * @param {Object} entry - Audit entry
 */
function writeAuditLog(entry) {
    const logLine = JSON.stringify({
        timestamp: new Date().toISOString(),
        ...entry,
    }) + '\n';
    try {
        appendFileSync(AUDIT_LOG_PATH, logLine, { encoding: 'utf8' });
    }
    catch (error) {
        logger.error('Failed to write to security audit log', { error: error.message });
    }
}
/**
 * Log CSP violation
 * @param {Object} details - Violation details
 * @param {number} details.windowId - Window ID
 * @param {string} details.violatedDirective - Violated CSP directive
 * @param {string} details.blockedUri - Blocked URI
 * @param {string} details.sourceFile - Source file
 * @param {number} details.lineNumber - Line number
 */
export function logCSPViolation(details) {
    const entry = {
        type: 'csp_violation',
        severity: 'warning',
        windowId: details.windowId,
        violatedDirective: details.violatedDirective || 'unknown',
        blockedUri: details.blockedUri || 'unknown',
        sourceFile: details.sourceFile || 'unknown',
        lineNumber: details.lineNumber || 0,
    };
    logger.warn('CSP Violation', entry);
    writeAuditLog(entry);
}
/**
 * Log navigation block
 * @param {Object} details - Navigation details
 * @param {number} details.windowId - Window ID
 * @param {string} details.url - Blocked URL
 * @param {string} details.reason - Reason for blocking
 */
export function logNavigationBlock(details) {
    const entry = {
        type: 'navigation_blocked',
        severity: 'warning',
        windowId: details.windowId,
        url: details.url,
        reason: details.reason,
    };
    logger.warn('Navigation blocked', entry);
    writeAuditLog(entry);
}
/**
 * Log permission request
 * @param {Object} details - Permission details
 * @param {number} details.windowId - Window ID
 * @param {string} details.permission - Permission type
 * @param {string} details.origin - Requesting origin
 * @param {boolean} details.granted - Whether permission was granted
 */
export function logPermissionRequest(details) {
    const entry = {
        type: 'permission_request',
        severity: details.granted ? 'info' : 'warning',
        windowId: details.windowId,
        permission: details.permission,
        origin: details.origin,
        granted: details.granted,
    };
    logger.info('Permission request', entry);
    writeAuditLog(entry);
}
/**
 * Log external link opened
 * @param {Object} details - Link details
 * @param {string} details.url - Opened URL
 * @param {number} [details.windowId] - Window ID (if available)
 */
export function logExternalLink(details) {
    const entry = {
        type: 'external_link_opened',
        severity: 'info',
        url: details.url,
        windowId: details.windowId || null,
    };
    logger.info('External link opened', entry);
    writeAuditLog(entry);
}
/**
 * Log security event
 * @param {Object} details - Event details
 * @param {string} details.type - Event type
 * @param {string} details.severity - Severity level (info, warning, error)
 * @param {string} details.message - Event message
 * @param {Object} [details.metadata] - Additional metadata
 */
export function logSecurityEvent(details) {
    const entry = {
        type: details.type,
        severity: details.severity,
        message: details.message,
        metadata: details.metadata || {},
    };
    const logMethod = logger[details.severity] || logger.info;
    logMethod('Security event', entry);
    writeAuditLog(entry);
}
/**
 * Initialize security audit logging
 * Creates the audit log file if it doesn't exist
 */
export function initSecurityAuditLog() {
    try {
        // Create initial log entry
        writeFileSync(AUDIT_LOG_PATH, '', { flag: 'a' });
        const initEntry = {
            type: 'audit_log_initialized',
            severity: 'info',
            appVersion: app.getVersion(),
            platform: process.platform,
            arch: process.arch,
        };
        writeAuditLog(initEntry);
        logger.info('Security audit log initialized', { path: AUDIT_LOG_PATH });
    }
    catch (error) {
        logger.error('Failed to initialize security audit log', { error: error.message });
    }
}
/**
 * Get audit log file path
 * @returns {string}
 */
export function getAuditLogPath() {
    return AUDIT_LOG_PATH;
}
