/**
 * Worker thread for CSV parsing
 * Offloads CPU-intensive CSV operations from main thread
 */

import { parentPort, workerData } from 'worker_threads';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

/**
 * Parse CSV content
 */
function parseCSV() {
  const { content, options } = workerData;

  try {
    const {
      headers = true,
      delimiter = ',',
      skipEmptyLines = true
    } = options;

    const records = parse(content, {
      columns: headers,
      delimiter,
      skip_empty_lines: skipEmptyLines,
      trim: true,
      // Enable relaxed mode for large datasets
      relax_column_count: true,
      relax_quotes: true
    });

    if (parentPort) {
      parentPort.postMessage({
        type: 'complete',
        records,
        count: records.length
      });
    }
  } catch (error: any) {
    if (parentPort) {
      parentPort.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
}

/**
 * Stringify data to CSV
 */
function stringifyCSV() {
  const { data, options } = workerData;

  try {
    const {
      headers = true,
      delimiter = ',',
      columns
    } = options;

    let csvString;

    // Handle array of objects
    if (Array.isArray(data) && data.length > 0) {
      csvString = stringify(data, {
        header: headers,
        columns: columns || Object.keys(data[0]),
        delimiter
      });
    }
    // Handle single object (convert to array)
    else if (typeof data === 'object' && !Array.isArray(data)) {
      const rows = Object.entries(data).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value
      }));

      csvString = stringify(rows, {
        header: headers,
        columns: ['key', 'value'],
        delimiter
      });
    } else {
      throw new Error('Data must be an array of objects or a single object');
    }

    if (parentPort) {
      parentPort.postMessage({
        type: 'complete',
        csv: csvString,
        size: csvString.length
      });
    }
  } catch (error: any) {
    if (parentPort) {
      parentPort.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
}

// Execute the requested operation
if (workerData.operation === 'parse') {
  parseCSV();
} else if (workerData.operation === 'stringify') {
  stringifyCSV();
}
