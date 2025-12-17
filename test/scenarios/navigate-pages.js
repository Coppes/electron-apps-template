```javascript
module.exports = {
  name: () => 'NavigatePages',
  // Mocks handled in index.html for browser testing
  url: () => 'http://localhost:5173',
  action: async (page) => {
    // Click Data Management sidebar button
    const [btn] = await page.$x("//button[contains(., 'Data Management')]");
    if (btn) await btn.click();
    await new Promise(r => setTimeout(r, 1000));
  },
  back: async (page) => {
    // Click Home sidebar button
    const [home] = await page.$x("//button[contains(., 'Home')]");
    if (home) await home.click();
    await new Promise(r => setTimeout(r, 500));
  },
  repeat: () => 5,
};
