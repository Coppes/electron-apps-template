/**
 * Add a document to recent documents
 * @param {string} filePath - Absolute path to the document
 * @returns {boolean} Success status
 */
export declare function addRecentDocument(filePath: any): boolean;
/**
 * Clear all recent documents
 * @returns {boolean} Success status
 */
export declare function clearRecentDocuments(): boolean;
/**
 * Add extension to whitelist
 * @param {string} extension - Extension to allow (e.g., '.myext')
 */
export declare function addAllowedExtension(extension: any): void;
/**
 * Get list of allowed extensions
 * @returns {string[]}
 */
export declare function getAllowedExtensions(): string[];
