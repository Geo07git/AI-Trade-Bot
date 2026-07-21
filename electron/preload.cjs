const { contextBridge, ipcRenderer } = require('electron');

// Expune API-uri sigure către mediul de browser al aplicației React (Window)
contextBridge.exposeInMainWorld('electronAPI', {
  // Exemplu: getSystemMemoryInfo: () => ipcRenderer.invoke('get-system-memory-info')
});

console.log('Electron preload script loaded.');
