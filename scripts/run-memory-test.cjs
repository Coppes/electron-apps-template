const { run } = require('memlab');
const path = require('path');

// Defined scenarios
const scenarios = [
  '../test/scenarios/open-close-window.cjs',
  '../test/scenarios/navigate-pages.cjs'
];

(async () => {
  let hasLeaks = false;

  for (const scenarioPath of scenarios) {
    try {
      console.log(`\nStarting memory test for scenario: ${scenarioPath}`);
      const scenario = require(scenarioPath);

      // Run memlab
      const result = await run({ scenario, verbose: true });

      console.log(`Memory test completed for ${scenarioPath}.`);
      if (result.leaks && result.leaks.length > 0) {
        console.error(`❌ Found ${result.leaks.length} leaks in ${scenarioPath}!`);
        hasLeaks = true;
      } else {
        console.log(`✅ No leaks found in ${scenarioPath}.`);
      }
    } catch (error) {
      console.error(`💥 Memory test failed for ${scenarioPath}:`, error);
      process.exit(1);
    }
  }

  if (hasLeaks) {
    process.exit(1);
  } else {
    console.log('\n🎉 All memory scenarios passed!');
    process.exit(0);
  }
})();
