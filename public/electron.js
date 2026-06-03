const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs')
const os = require('os')
const { autoUpdater } = require('electron-updater')

let mainWindow
let psScriptPath

const VPN_PS_SCRIPT = `
$map = @(
  @('*mullvad*','Mullvad'),
  @('*nord*','NordVPN'),
  @('*nordlynx*','NordVPN'),
  @('*expressvpn*','ExpressVPN'),
  @('*protonvpn*','ProtonVPN'),
  @('*proton*','ProtonVPN'),
  @('*surfshark*','Surfshark'),
  @('*cyberghost*','CyberGhost'),
  @('*pia*','PIA'),
  @('*windscribe*','Windscribe'),
  @('*vyprvpn*','VyprVPN'),
  @('*vypr*','VyprVPN'),
  @('*ipvanish*','IPVanish'),
  @('*tunnelbear*','TunnelBear'),
  @('*hotspot*','Hotspot Shield'),
  @('*openvpn*','OpenVPN'),
  @('*wireguard*','WireGuard'),
  @('*tailscale*','Tailscale'),
  @('*cloudflare*','Cloudflare WARP'),
  @('*warp*','Cloudflare WARP'),
  @('*private internet access*','PIA'),
  @('*tun*','Generic VPN (TUN)'),
  @('*tap*','Generic VPN (TAP)'),
  @('*wintun*','WireGuard/Wintun'),
  @('*virtual*','Generic VPN'),
  @('*vpn*','Generic VPN')
)
try {
  $adapters = Get-NetAdapter -ErrorAction Stop | Where-Object { $_.Status -eq 'Up' }
  $found = $null
  foreach ($entry in $map) {
    $match = $adapters | Where-Object { $_.Name -like $entry[0] }
    if ($match) { $found = $entry[1]; break }
  }
  if ($found) { "connected:$found"; exit }
  $physical = @('*ethernet*','*wi-fi*','*wifi*','*bluetooth*','*loopback*')
  $candidate = $adapters | Where-Object {
    $n = $_.Name.ToLower()
    $phys = $false
    foreach ($p in $physical) { if ($n -like $p) { $phys = $true; break } }
    -not $phys
  } | Select-Object -First 1
  if ($candidate) {
    $ip = Get-NetIPAddress -InterfaceIndex $candidate.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($ip) { "connected:VPN ($($candidate.Name))"; exit }
  }
  "disconnected"
} catch { "disconnected" }
`.trim()

function ensureScript() {
  if (psScriptPath && fs.existsSync(psScriptPath)) return true
  try {
    psScriptPath = path.join(os.tmpdir(), `r34-vpn-check-${Date.now()}.ps1`)
    fs.writeFileSync(psScriptPath, VPN_PS_SCRIPT, 'utf8')
    return true
  } catch {
    return false
  }
}

function checkVPN(callback) {
  if (process.platform === 'win32') {
    if (!ensureScript()) {
      callback({ connected: false, provider: null })
      return
    }
    exec(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${psScriptPath}"`,
      { timeout: 5000 },
      (error, stdout, stderr) => {
        const line = stdout?.trim()
        const isConnected = line && line.startsWith('connected:')
        const provider = isConnected ? line.split(':')[1] : null
        callback({ connected: isConnected, provider })
      }
    )
  } else {
    exec(
      'ip tuntap list 2>/dev/null; echo "---"; ip -o addr show 2>/dev/null | grep -v " lo " | grep -v "127.0.0.1" | grep "inet " | head -20; echo "---"; ps aux 2>/dev/null | grep -iE "mullvad|nord|expressvpn|protonvpn|surfshark|cyberghost|pia|windscribe|vypr|ipvanish|tunnelbear|hotspot|openvpn|wireguard|tailscale|cloudflare|warp" | grep -v grep',
      { timeout: 5000 },
      (error, stdout) => {
        if (!stdout) { callback({ connected: false, provider: null }); return }
        const parts = stdout.split('---')
        const tun = (parts[0] || '').trim()
        const addrs = (parts[1] || '').trim()
        const procs = (parts[2] || '').trim()
        const connected = tun.length > 0 || addrs.length > 0 || procs.length > 0
        let provider = null
        if (procs) {
          const name = procs.split('\n')[0].toLowerCase()
          if (name.includes('mullvad')) provider = 'Mullvad'
          else if (name.includes('nord')) provider = 'NordVPN'
          else if (name.includes('proton')) provider = 'ProtonVPN'
          else if (name.includes('express')) provider = 'ExpressVPN'
          else provider = 'VPN'
        } else if (tun) {
          provider = 'TUN/TAP'
        } else if (addrs) {
          provider = 'VPN Tunnel'
        }
        callback({ connected, provider })
      }
    )
  }
}

// Clean up temp script on exit
app.on('will-quit', () => {
  if (psScriptPath) {
    try { fs.unlinkSync(psScriptPath) } catch {}
  }
})

// Auto-updater
function setupAutoUpdater() {
  if (app.isPackaged) {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-available', (info) => {
      if (mainWindow) {
        mainWindow.webContents.send('update-available', info.version)
      }
    })

    autoUpdater.on('download-progress', (progress) => {
      if (mainWindow) {
        mainWindow.webContents.send('update-progress', progress.percent)
      }
    })

    autoUpdater.on('update-downloaded', () => {
      if (mainWindow) {
        mainWindow.webContents.send('update-downloaded')
      }
    })

    autoUpdater.on('error', (err) => {
      if (mainWindow) {
        mainWindow.webContents.send('update-error', err.message || String(err))
      }
    })

    autoUpdater.checkForUpdates()
  }
}

ipcMain.handle('start-update-download', async () => {
  try {
    await autoUpdater.downloadUpdate()
  } catch (err) {
    if (mainWindow) {
      mainWindow.webContents.send('update-error', err.message || String(err))
    }
  }
})

ipcMain.handle('restart-and-update', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.handle('check-vpn', () => {
  return new Promise((resolve) => {
    checkVPN(resolve)
  })
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('check-for-updates', () => {
  if (autoUpdater) {
    autoUpdater.checkForUpdates()
  }
})

ipcMain.handle('export-data', async (_event, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export R34 Player Data',
    defaultPath: 'r34-player-data.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (result.canceled || !result.filePath) return { canceled: true }
  try {
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf8')
    return { success: true, path: result.filePath }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('import-data', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import R34 Player Data',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  })
  if (result.canceled || result.filePaths.length === 0) return { canceled: true }
  try {
    const content = fs.readFileSync(result.filePaths[0], 'utf8')
    const data = JSON.parse(content)
    return { success: true, data }
  } catch (err) {
    return { error: err.message }
  }
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'R34 Player',
    backgroundColor: '#141414',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const isDev = !app.isPackaged

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
      { label: 'Toggle DevTools', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
      { type: 'separator' },
      { role: 'quit' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'togglefullscreen' },
    ],
  },
]

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  createWindow()
  // Wait for the window to finish loading before checking for updates,
  // so the renderer's IPC listeners are registered and don't miss the event.
  mainWindow.webContents.on('did-finish-load', () => {
    setupAutoUpdater()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
