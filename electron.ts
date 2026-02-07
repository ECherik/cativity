import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
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
  // win.setIgnoreMouseEvents(true, { forward: true });

  // ipcMain.on("set-click-through", (_, enabled: boolean) => {
  //   win.setIgnoreMouseEvents(enabled, { forward: true });
  // });

  // Global mouse position
  ipcMain.handle("get-mouse-pos", () => {
    return screen.getCursorScreenPoint();
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});