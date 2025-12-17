/**
 * MemLab scenario: Open and Close Window
 * Tests if memory is leaked when opening and closing a secondary window.
 */
module.exports = {
  name: () => 'OpenCloseWindow',
  // Mocks handled in index.html for browser testing
  url: () => 'http://localhost:5173', // dev server URL
  action: async (page) => {
    console.log('Action: Finding Settings button...');
    try {
      const settingsBtn = await page.waitForSelector('button[data-tour="settings-link"]', { timeout: 5000 });
      console.log('Action: Settings button found. Clicking...');
      if (settingsBtn) {
        await settingsBtn.click();
        console.log('Action: Waiting for tab...');
        await page.waitForSelector('.border-b-primary', { timeout: 5000 });
        console.log('Action: Tab activated.');
      }
    } catch (e) {
      console.error('Action failed:', e.message);
      throw e;
    }
    await new Promise(r => setTimeout(r, 1000));
  },
  back: async (page) => {
    console.log('Back: Finding active tab...');
    try {
      const activeTab = await page.$('.border-b-primary');
      if (activeTab) {
        console.log('Back: Active tab found. Finding close button...');
        const closeBtn = await activeTab.$('button');
        if (closeBtn) {
          console.log('Back: Close button found. Clicking...');
          await closeBtn.click();
        } else {
          console.log('Back: Close button NOT found.');
        }
      } else {
        console.log('Back: Active tab NOT found.');
      }
    } catch (e) {
      console.error('Back failed:', e.message);
      throw e;
    }
    await new Promise(r => setTimeout(r, 1000));
  },
  repeat: () => 3,
};
