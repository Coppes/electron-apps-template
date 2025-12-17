module.exports = {
  name: () => 'NavigatePages',
  // Mocks handled in index.html for browser testing
  url: () => 'http://localhost:5173',
  action: async (page) => {
    console.log('Action: Finding Data Management button...');
    try {
      await page.waitForSelector('button[data-testid="nav-data-management"]', { timeout: 5000 });
      const btn = await page.$('button[data-testid="nav-data-management"]');
      console.log('Action: Button found. Clicking...');
      if (btn) await btn.click();
    } catch (e) {
      console.error('Action failed:', e.message);
      throw e;
    }
    await new Promise(r => setTimeout(r, 1000));
  },
  back: async (page) => {
    console.log('Back: Finding Home button...');
    try {
      await page.waitForSelector('button[data-testid="nav-home"]', { timeout: 5000 });
      const home = await page.$('button[data-testid="nav-home"]');
      console.log('Back: Home found. Clicking...');
      if (home) await home.click();
    } catch (e) {
      console.error('Back failed:', e.message);
      throw e;
    }
    await new Promise(r => setTimeout(r, 500));
  },
  repeat: () => 5,
};
