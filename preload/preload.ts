import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  setClickThrough: (enabled: boolean) =>
    ipcRenderer.send("set-click-through", enabled),

  getMousePos: () =>
    ipcRenderer.invoke("get-mouse-pos")
});