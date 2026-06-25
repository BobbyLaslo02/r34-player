const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  checkVPN: () => ipcRenderer.invoke('check-vpn'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_e, version) => callback(version)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (_e, percent) => callback(percent)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (_e, msg) => callback(msg)),
  startUpdateDownload: () => ipcRenderer.invoke('start-update-download'),
  restartAndUpdate: () => ipcRenderer.invoke('restart-and-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdatesNow: () => ipcRenderer.invoke('check-for-updates'),
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),
  openPopout: (url) => ipcRenderer.invoke('open-popout', url),
})
