const { chromium } = require('playwright');
const path = require('path');
const { findLeaks } = require('@memlab/api');
const { HeapSnapshotCapturer } = require('./heap-snapshot-capturer.cjs');

async function runMemoryScenario(scenarioPath) {
  const scenario = require(path.resolve(scenarioPath));
  const scenarioName = scenario.name();

  console.log(`\nStarting memory scenario: ${scenarioName}`);

  // Launch browser via Playwright
  // Note: We need to connect to Electron if we were testing the packaged app,
  // but for "renderer memory leak" testing, we can often just run the renderer in a headful Chromium 
  // IF mocks are sufficient. 
  // HOWEVER, the whole point of this refactor was that MemLab's browser failed to run the app.
  // We will assume 'npm run dev' is running and we connect to it via Chromium.
  // Ideally, valid MemLab tests *should* run in standard Chrome if mocks are good. 
  // If the app relies on 'window.electron' which is mocked in index.html, it SHOULD work in standard Chrome.
  // The previous failure might have been MemLab's specific Puppeteer version or nuances.
  // Let's try standard Playwright launch first.

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Debug logs
  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[PAGE ERROR] ${err.message}`));

  const capturer = new HeapSnapshotCapturer(page);

  try {
    const url = scenario.url();
    console.log(`Navigating to ${url}...`);
    await page.goto(url);

    // Initialize CDP
    await capturer.start();

    // Warmup
    if (scenario.warmup) {
      console.log('Warming up...');
      await scenario.warmup(page);
    } else {
      // Default warmup: wait for load
      await page.waitForSelector('#root');
    }

    // Snapshot 1: Baseline
    console.log('Capturing Baseline snapshot...');
    const s1 = await capturer.takeSnapshot(`${scenarioName}-baseline.heapsnapshot`);

    // Action
    console.log('Executing Action...');
    await scenario.action(page);

    // Snapshot 2: Target
    console.log('Capturing Target snapshot...');
    const s2 = await capturer.takeSnapshot(`${scenarioName}-target.heapsnapshot`);

    // Revert/Back
    if (scenario.back) {
      console.log('Executing Back navigation...');
      await scenario.back(page);
    }

    // Snapshot 3: Final
    console.log('Capturing Final snapshot...');
    const s3 = await capturer.takeSnapshot(`${scenarioName}-final.heapsnapshot`);

    // Analyze
    console.log('Analyzing snapshots for leaks...');
    // Analyze using CLI to support external snapshots
    console.log('Analyzing snapshots for leaks...');
    const { execSync } = require('child_process');
    try {
      // Use npx memlab find-leaks
      const cmd = `npx memlab find-leaks --baseline "${s1}" --target "${s2}" --final "${s3}" --work-dir "${path.dirname(s1)}"`;
      const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }); // Pipe to capture output to parse or just print

      console.log(output);

      if (output.includes('MemLab found 0 leak')) {
        console.log(`\n✅ No leaks detected in ${scenarioName}`);
        return true;
      } else {
        // If output doesn't explicit say 0 leaks, assuming it found some or printed details.
        // MemLab usually prints detailed leak info.
        // We can check exit code, but execSync throws on non-zero.
        // Wait, memlab find-leaks usually exits 0 even if leaks found? 
        // Let's rely on stdout for now.
        // Actually, let's catch standard leaks line.
        // If it contains "Allocated:" and "Retained:" it found something?
        // Simplest: check if output contains "MemLab found 0 leak" -> Pass.
        // Else -> Fail (warn).

        const match = output.match(/MemLab found (\d+) leak/);
        if (match && match[1] === '0') {
          console.log(`\n✅ No leaks detected in ${scenarioName}`);
          return true;
        } else {
          console.error(`\n❌ Memory Leaks Detected in ${scenarioName} (Check detailed output above)`);
          return false;
        }
      }
    } catch (err) {
      console.error('Analysis failed:', err.message);
      console.error(err.stdout);
      return false;
    }

  } catch (error) {
    console.error(`\n❌ Error running scenario ${scenarioName}:`, error);
    return false;
  } finally {
    await browser.close();
  }
}

module.exports = { runMemoryScenario };
