const { contextBridge, ipcRenderer } = require("electron");

// Expose a 'print' function to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  print: () => ipcRenderer.invoke("print-page"),
  printPos: () => ipcRenderer.invoke("print-page-pos"),
});
