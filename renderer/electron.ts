import { app, BrowserWindow } from "electron";
import * as path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // optional
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("renderer/index.html");

  // click-through overlay (toggle interactive later)
  win.setIgnoreMouseEvents(true, { forward: true });
}

app.whenReady().then(createWindow);
