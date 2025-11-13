/**
 * JSON Format Handler
 * Handles JSON import/export with validation
 */

/**
 * JSON Handler
 */
export const jsonHandler = {
  /**
   * Export data to JSON string
   */
  async export(data, options = {}) {
    const { pretty = true } = options;
    return JSON.stringify(data, null, pretty ? 2 : 0);
  },

  /**
   * Import data from JSON string
   */
  async import(content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  },

  /**
   * Validate data
   */
  validate(data) {
    try {
      // Check if data is serializable
      JSON.stringify(data);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Data is not JSON serializable: ${error.message}`
      };
    }
  },

  /**
   * Check if handler can handle this content
   */
  canHandle(content) {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }
};

export default jsonHandler;
