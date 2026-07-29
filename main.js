const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Only one copy of the app running at a time -- if someone double-clicks the
// shortcut again while it's already open, just focus the existing window.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  let mainWindow = null;

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1300,
      height: 900,
      minWidth: 900,
      minHeight: 600,
      title: "Artisan's Ledger",
      icon: path.join(__dirname, 'build', 'icon.png'),
      backgroundColor: '#1a140f',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // No File/Edit/View menu bar -- keeps it feeling like a real app rather
    // than a browser window.
    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

    mainWindow.on('closed', () => { mainWindow = null; });
  }

  Menu.setApplicationMenu(null);

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
