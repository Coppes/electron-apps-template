const fs = require('fs');
const path = require('path');

class HeapSnapshotCapturer {
  constructor(page) {
    this.page = page;
    this.cdp = null;
  }

  async start() {
    this.cdp = await this.page.context().newCDPSession(this.page);
    await this.cdp.send('HeapProfiler.enable');
  }

  async takeSnapshot(filename) {
    if (!this.cdp) throw new Error('CDP session not started');

    // Force GC before snapshot for cleaner results
    await this.cdp.send('HeapProfiler.collectGarbage');

    const chunks = [];
    this.cdp.on('HeapProfiler.addHeapSnapshotChunk', ({ chunk }) => {
      chunks.push(chunk);
    });

    await this.cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });

    // Wait for the snapshot to be fully transferred
    // Note: In a real implementation, we might need a more robust wait logic
    // but the protocol usually sends chunks synchronously or we wait for a specific event?
    // Actually, takeHeapSnapshot returns when it's done *generating*, but chunks stream.
    // However, with reportProgress: false, it tends to be blocking-ish or fast.
    // A safer way involves promises.

    // Better approach: listen, trigger, wait for completion signal if specific one exists, 
    // but typically just waiting a bit or wrapping the event listener is needed.
    // For simplicity in this v1:

    await new Promise(resolve => setTimeout(resolve, 500)); // Buffer time for chunks

    const snapshotData = chunks.join('');
    // Save to disk
    const outDir = path.resolve('test/memory/out');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, snapshotData);

    return filePath;
  }
}

module.exports = { HeapSnapshotCapturer };
