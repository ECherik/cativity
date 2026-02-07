import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: screen.getPrimaryDisplay().bounds.width, // Fullscreen 
    height: screen.getPrimaryDisplay().bounds.height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  win.setIgnoreMouseEvents(false);

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  // For debugging
  // win.webContents.openDevTools();

  ipcMain.on("set-click-through", (_, enabled: boolean) => {
    win.setIgnoreMouseEvents(enabled, { forward: true });
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});