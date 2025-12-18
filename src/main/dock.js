import { app, Menu } from 'electron';

/**
 * Update the dock/taskbar badge
 * @param {string} text 
 */
export function setDockBadge(text) {
  if (process.platform === 'darwin') {
    app.dock.setBadge(text);
  } else if (process.platform === 'win32') {
    // Windows taskbar verification typically requires an Overlay Icon or flashing
    // Using a simpler approach: if text is empty, clear it.
    // Setting overlays requires an actual native image, which we'd need to generate.
    // For MVP, we'll leave Windows empty or implement a basic flash.
    /* 
    const win = BrowserWindow.getAllWindows()[0];
    if(win) {
      if(text) win.flashFrame(true);
      else win.flashFrame(false);
    } 
    */
  }
}

/**
 * Update the dock menu (macOS only) or JumpList (Windows)
 * @param {Array} template 
 */
export function setDockMenu(template) {
  if (process.platform === 'darwin') {
    const menu = Menu.buildFromTemplate(template);
    app.dock.setMenu(menu);
  } else if (process.platform === 'win32') {
    // Windows JumpList
    app.setUserTasks(template.map(item => ({
      program: process.execPath,
      arguments: item.args || '',
      iconPath: process.execPath,
      iconIndex: 0,
      title: item.label,
      description: item.toolTip || item.label
    })));
  }
}
