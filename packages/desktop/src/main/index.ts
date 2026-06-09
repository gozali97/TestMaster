const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { setupIPC } = require('./ipc');
const { createMenu } = require('./menu');

// ---------------------------------------------------------------------------
// Bundled Playwright browsers
// In development the browsers live in packages/desktop/ms-playwright.
// In a packaged app they are shipped via electron-builder extraResources into
// <resources>/ms-playwright. Pointing PLAYWRIGHT_BROWSERS_PATH at that folder
// lets end users run automation WITHOUT installing Playwright themselves.
// ---------------------------------------------------------------------------
const setupPlaywrightBrowsersPath = () => {
  const candidates = [
    // Packaged app: resources/ms-playwright
    process.resourcesPath ? path.join(process.resourcesPath, 'ms-playwright') : null,
    // Dev: packages/desktop/ms-playwright (two levels up from dist/main)
    path.join(__dirname, '..', '..', 'ms-playwright'),
    path.join(process.cwd(), 'ms-playwright'),
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) {
        process.env.PLAYWRIGHT_BROWSERS_PATH = dir;
        console.log(`[Playwright] Using bundled browsers at: ${dir}`);
        return;
      }
    } catch {
      /* ignore */
    }
  }
  console.warn('[Playwright] No bundled browsers found; falling back to default cache.');
};

setupPlaywrightBrowsersPath();

let mainWindow: any = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5175');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menu = createMenu();
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
  createWindow();
  setupIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

export { mainWindow };
