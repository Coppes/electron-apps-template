/**
 * Worker thread for ZIP compression
 * Offloads CPU-intensive ZIP operations from main thread
 */
import { parentPort, workerData } from 'worker_threads';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
/**
 * Create backup ZIP file
 */
async function createBackupZip() {
    const { outputPath, files, metadata } = workerData;
    try {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });
        // Track progress
        let processedFiles = 0;
        const totalFiles = files.length + 1; // +1 for manifest
        archive.on('progress', (progress) => {
            if (parentPort) {
                parentPort.postMessage({
                    type: 'progress',
                    processed: processedFiles,
                    total: totalFiles,
                    bytesProcessed: progress.fs.processedBytes,
                    bytesTotal: progress.fs.totalBytes
                });
            }
        });
        output.on('close', async () => {
            // Calculate checksum
            const fileBuffer = fs.readFileSync(outputPath);
            const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
            if (parentPort) {
                parentPort.postMessage({
                    type: 'complete',
                    path: outputPath,
                    size: archive.pointer(),
                    checksum
                });
            }
        });
        archive.on('error', (error) => {
            if (parentPort) {
                parentPort.postMessage({
                    type: 'error',
                    error: error.message
                });
            }
        });
        archive.pipe(output);
        // Add files
        for (const file of files) {
            if (fs.existsSync(file.path)) {
                archive.file(file.path, { name: file.name });
                processedFiles++;
                if (parentPort) {
                    parentPort.postMessage({
                        type: 'file-added',
                        file: file.name
                    });
                }
            }
        }
        // Add manifest
        archive.append(JSON.stringify(metadata, null, 2), {
            name: 'manifest.json'
        });
        processedFiles++;
        await archive.finalize();
    }
    catch (error) {
        if (parentPort) {
            parentPort.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }
}
/**
 * Extract backup ZIP file
 */
async function extractBackupZip() {
    const { zipPath, outputDir } = workerData;
    try {
        const AdmZip = (await import('adm-zip')).default;
        const zip = new AdmZip(zipPath);
        const entries = zip.getEntries();
        let processedEntries = 0;
        const totalEntries = entries.length;
        for (const entry of entries) {
            if (!entry.isDirectory) {
                const outputPath = path.join(outputDir, entry.entryName);
                // Ensure directory exists
                const dir = path.dirname(outputPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // Extract file
                zip.extractEntryTo(entry, dir, false, true);
                processedEntries++;
                if (parentPort) {
                    parentPort.postMessage({
                        type: 'progress',
                        processed: processedEntries,
                        total: totalEntries,
                        file: entry.entryName
                    });
                }
            }
        }
        if (parentPort) {
            parentPort.postMessage({
                type: 'complete',
                extracted: processedEntries
            });
        }
    }
    catch (error) {
        if (parentPort) {
            parentPort.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }
}
// Execute the requested operation
if (workerData.operation === 'create') {
    createBackupZip();
}
else if (workerData.operation === 'extract') {
    extractBackupZip();
}
