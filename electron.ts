import {app, BrowserWindow, ipcMain, screen} from "electron";
import * as path from "path";
import activeWindow from "active-win";

class ActivityMonitoring {
  private counter: number = 0;
  private version: string = "v0";
  private lastActiveApp: string = "";
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start polling the active window every 1 second
    this.startMonitoring();
  }

  private startMonitoring() {
    this.pollInterval = setInterval(async () => {
      try {
        const window = await activeWindow();
        if (window) {
          const currentApp = window.title || "Unknown";

          // If active app changed, log it
          if (currentApp !== this.lastActiveApp) {
            this.lastActiveApp = currentApp;
            this.counter += 1;
            this.version = `v${this.counter}`;
            console.log(
              `[ActivityMonitoring] Active window changed! App: "${currentApp}" | Counter: ${this.counter}, Version: ${this.version}`,
            );
            this.broadcast();
          }
        }
      } catch (error) {
        // Silently handle errors (active-win may fail on some systems)
      }
    }, 1000); // Poll every 1 second
  }

  public stopMonitoring() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  public getVersion() {
    return this.version;
  }

  public getCount() {
    return this.counter;
  }

  public getLastActiveApp() {
    return this.lastActiveApp;
  }

  private categorizeActivity(appTitle: string): string {
    if (!appTitle) return "unknown";

    const title = appTitle.toLowerCase();

    // VS Code / Coding tools
    if (
      title.includes("visual studio code") ||
      title.includes("vs code") ||
      title.includes("vscode")
    ) {
      return "vscode";
    }
    if (title.includes("intellij")) return "intellij";
    if (title.includes("pycharm")) return "pycharm";
    if (title.includes("webstorm")) return "webstorm";

    // Git platforms
    if (title.includes("github")) return "github";
    if (title.includes("gitlab")) return "gitlab";

    // MongoDB Cloud
    if (title.includes("mongodb") || title.includes("cloud: mongodb cloud")) {
      return "mongodb";
    }

    // Claude
    if (title.includes("claude")) return "claude";

    // Discord
    if (title.includes("discord")) return "discord";

    // YouTube
    if (title.includes("youtube")) return "youtube";

    // Netflix / Prime / Disney
    if (title.includes("netflix")) return "netflix";
    if (title.includes("prime video")) return "prime";
    if (title.includes("disney+")) return "disney";

    // Spotify
    if (title.includes("spotify")) return "spotify";

    // Notion / Docs / Gmail
    if (title.includes("notion")) return "notion";
    if (title.includes("google docs")) return "gdocs";
    if (title.includes("gmail")) return "gmail";

    // Slack / Teams
    if (title.includes("slack")) return "slack";
    if (title.includes("teams")) return "teams";

    // Fallback: extract first part of title
    let fallback = appTitle
      .replace(/<[^>]+>/g, "") // remove wrappers
      .split(/[-|·]/)[0] // take first part
      .replace(/^\(\d+\)\s*/, "") // remove "(4)" notifications
      .trim();

    // Limit to 10 chars
    if (fallback.length > 10) {
      fallback = fallback.split(" - ")[0];
    }

    return fallback || "unknown";
  }

  private broadcast() {
    // Send an IPC message to all renderer windows notifying them of the change
    const category = this.categorizeActivity(this.lastActiveApp);
    const windowCount = BrowserWindow.getAllWindows().length;
    console.log(
      `[ActivityMonitoring] Broadcasting to ${windowCount} window(s): ${this.version} (count: ${this.counter}) - App: "${this.lastActiveApp}" | Category: "${category}"`,
    );
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win && win.webContents) {
        win.webContents.send("activity-changed", {
          version: this.version,
          count: this.counter,
          app: this.lastActiveApp,
          category: category,
        });
      }
    });
  }
}

const activityMonitor = new ActivityMonitoring();

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
      sandbox: true,
      contextIsolation: true,
    } as any,
  });

  win.setIgnoreMouseEvents(false);

  win
    .loadFile(path.join(__dirname, "../renderer/index.html"))
    .catch(console.error);

  // Send current activity state to the window after it finishes loading
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("activity-changed", {
      version: activityMonitor.getVersion(),
      count: activityMonitor.getCount(),
    });
  });

  // For debugging
  // win.webContents.openDevTools();

  ipcMain.on("set-click-through", (_, enabled: boolean) => {
    (win as any).setIgnoreMouseEvents(enabled, {forward: true});
  });
}

ipcMain.on("open-new-window", () => {
  createWindow();
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
