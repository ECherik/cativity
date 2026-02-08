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
    const title = appTitle.toLowerCase();

    // Coding
    if (
      title.includes("visual studio code") ||
      title.includes("vs code") ||
      title.includes("intellij") ||
      title.includes("pycharm") ||
      title.includes("sublime") ||
      title.includes("vim") ||
      title.includes("neovim") ||
      title.includes("webstorm") ||
      title.includes("github") ||
      title.includes("gitlab")
    ) {
      return "💻 Coding";
    }

    // Music
    if (
      title.includes("spotify") ||
      title.includes("youtube music") ||
      title.includes("apple music") ||
      title.includes("winamp") ||
      title.includes("music") ||
      title.includes("soundcloud")
    ) {
      return "🎵 Music";
    }

    // Movies/Entertainment
    if (
      title.includes("netflix") ||
      title.includes("youtube") ||
      title.includes("prime video") ||
      title.includes("disney+") ||
      title.includes("twitch") ||
      title.includes("movie") ||
      title.includes("watch") ||
      title.includes("hulu")
    ) {
      return "🎬 Watching Movies";
    }

    // Working/Productivity
    if (
      title.includes("word") ||
      title.includes("excel") ||
      title.includes("powerpoint") ||
      title.includes("outlook") ||
      title.includes("teams") ||
      title.includes("slack") ||
      title.includes("discord") ||
      title.includes("gmail") ||
      title.includes("google docs") ||
      title.includes("notion") ||
      title.includes("asana") ||
      title.includes("jira") ||
      title.includes("gmail")
    ) {
      return "💼 Working";
    }

    // Default
    return "🌐 Browsing";
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
  win.webContents.openDevTools();

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
