/**
 * Main Memory Test Runner
 * Discovers and executes all scenarios in test/memory/scenarios/
 */
const fs = require('fs');
const path = require('path');
const { runMemoryScenario } = require('./setup/run-memory-scenario.cjs');
const waitOn = require('wait-on');

async function main() {
  console.log('Waiting for dev server at http://localhost:5173 ...');

  try {
    await waitOn({
      resources: ['http://localhost:5173'],
      timeout: 30000,
    });
  } catch (err) {
    console.error('Dev server not available. Usage: npm run dev in another terminal.');
    process.exit(1);
  }

  const scenariosDir = path.resolve(__dirname, 'scenarios');
  const files = fs.readdirSync(scenariosDir).filter(f => f.endsWith('.cjs'));

  console.log(`Found ${files.length} scenarios.`);

  let failures = 0;

  for (const file of files) {
    const scenarioPath = path.join(scenariosDir, file);
    const success = await runMemoryScenario(scenarioPath);
    if (!success) failures++;
  }

  if (failures > 0) {
    console.error(`\n${failures} scenarios failed.`);
    process.exit(1);
  } else {
    console.log('\nAll memory scenarios passed.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Runner error:', err);
  process.exit(1);
});
