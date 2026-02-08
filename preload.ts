import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  setClickThrough: (enabled: boolean) =>
    ipcRenderer.send("set-click-through", enabled),

  getMousePos: () =>
    ipcRenderer.invoke("get-mouse-pos"),

  onActivityChanged: (cb: (data: any) => void) =>
    ipcRenderer.on('activity-changed', (_event, data) => {
      console.log('[IPC] Received activity-changed:', data);
      cb(data);
    }),

  openNewWindow: () =>
    ipcRenderer.send("open-new-window")
});