const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  checkVPN: () => ipcRenderer.invoke('check-vpn'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_e, version) => callback(version)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (_e, percent) => callback(percent)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
  startUpdateDownload: () => ipcRenderer.invoke('start-update-download'),
  restartAndUpdate: () => ipcRenderer.invoke('restart-and-update'),
})
