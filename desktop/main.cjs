const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 360,
    minHeight: 600,
    title: 'FocusFlow',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  const packagedIndex = path.join(process.resourcesPath, 'dist', 'index.html');
  const devIndex = path.resolve(__dirname, '../dist/index.html');
  win.loadURL(pathToFileURL(app.isPackaged ? packagedIndex : devIndex).href);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
