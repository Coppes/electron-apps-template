const { run } = require('memlab'); // Or @memlab/api if structured that way
const scenario = require('../test/scenarios/open-close-window.js');

(async () => {
  try {
    console.log('Starting memory test via custom runner...');
    const result = await run({ scenario, verbose: true });
    console.log('Memory test completed.');
    if (result.leaks && result.leaks.length > 0) {
      console.error(`Found ${result.leaks.length} leaks!`);
      process.exit(1);
    } else {
      console.log('No leaks found.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Memory test failed:', error);
    process.exit(1);
  }
})();
