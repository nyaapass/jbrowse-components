// eslint-disable-next-line import/no-extraneous-dependencies
import { app, ipcMain, shell, BrowserWindow, Menu } from 'electron'

const debug = require('electron-debug')
const isDev = require('electron-is-dev')
const fs = require('fs')
const fetch = require('node-fetch')
const path = require('path')
const url = require('url')
const { promisify } = require('util')
const merge = require('deepmerge')

const fsFStat = promisify(fs.fstat)
const fsOpen = promisify(fs.open)
const fsRead = promisify(fs.read)
const fsReaddir = promisify(fs.readdir)
const fsReadFile = promisify(fs.readFile)
const fsRename = promisify(fs.rename)
const fsStat = promisify(fs.stat)
const fsUnlink = promisify(fs.unlink)
const fsWriteFile = promisify(fs.writeFile)

debug({ showDevTools: false })

const devServerUrl = url.parse(
  process.env.DEV_SERVER_URL || 'http://localhost:3000',
)

const configLocation = path.join(app.getPath('userData'), 'config.json')
const sessionDirectory = path.join(app.getPath('userData'), 'sessions')
try {
  fs.statSync(sessionDirectory)
} catch (error) {
  if (error.code === 'ENOENT' || error.code === 'ENOTDIR')
    fs.mkdirSync(sessionDirectory, { recursive: true })
  else throw error
}

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      preload: isDev
        ? path.join(app.getAppPath(), 'public', 'preload.js')
        : path.join(app.getAppPath(), 'build', 'preload.js'),
    },
  })
  mainWindow.loadURL(
    isDev
      ? url.format(devServerUrl)
      : `file://${path.join(app.getAppPath(), 'build', 'index.html')}`,
  )
  mainWindow.webContents.on('new-window', (event, outboundUrl) => {
    event.preventDefault()
    shell.openExternal(outboundUrl)
  })

  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
    {
      role: 'help',
      submenu: [
        {
          label: 'Homepage',
          click() {
            shell.openExternal('https://jbrowse.org')
          },
        },
      ],
    },
  ]
  const mainMenu = Menu.buildFromTemplate(template)

  isMac ? Menu.setApplicationMenu(mainMenu) : Menu.setApplicationMenu(null)
  // if (isDev) {
  // Open the DevTools.
  // BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
  // mainWindow.webContents.openDevTools()
  // }
  mainWindow.on('closed', () => {
    BrowserWindow.getAllWindows().forEach(win => win.close())
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('createWindowWorker', event => {
  const workerWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      webSecurity: false,
      preload: isDev
        ? path.join(app.getAppPath(), 'public', 'preload.js')
        : path.join(app.getAppPath(), 'build', 'preload.js'),
    },
  })
  workerWindow.loadURL(
    isDev
      ? url.format({ ...devServerUrl, pathname: 'worker.html' })
      : `file://${path.join(app.getAppPath(), 'build', 'worker.html')}`,
  )
  // workerWindow.webContents.openDevTools()
  event.returnValue = workerWindow.id
})

ipcMain.handle('getMainWindowId', async () => (mainWindow || {}).id)

// merge function to get stuff from a development config into a production one
// limited functionality, difficult to use existing merge-deep/mixin-deep type
// things for this
interface Dataset {
  assembly: {
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}
interface Config {
  savedSessions: unknown[]
  datasets: Dataset[]
}
function mergeConfigs(A: Config, B: Config) {
  const X: { [key: string]: Dataset } = {}
  const Y: { [key: string]: Dataset } = {}
  A.datasets.forEach(a => {
    X[a.assembly.name] = a
  })
  B.datasets.forEach(b => {
    Y[b.assembly.name] = b
  })
  A.savedSessions = (A.savedSessions || []).concat(B.savedSessions)
  return Object.values(merge(X, Y))
}

ipcMain.handle('loadConfig', async () => {
  try {
    return JSON.parse(await fsReadFile(configLocation, { encoding: 'utf8' }))
  } catch (error) {
    if (error.code === 'ENOENT') {
      // make a config file since one does not exist yet
      const configTemplateLocation = isDev
        ? path.join(app.getAppPath(), 'public', 'test_data', 'config.json')
        : path.join(app.getAppPath(), 'build', 'test_data', 'config.json')
      const config = JSON.parse(
        await fsReadFile(configTemplateLocation, { encoding: 'utf8' }),
      )
      if (isDev) {
        config.datasets = mergeConfigs(
          config,
          JSON.parse(
            await fsReadFile('./test_data/config_in_dev.json', {
              encoding: 'utf8',
            }),
          ),
        )
      }
      await fsWriteFile(configLocation, JSON.stringify(config, null, 2))
      return config
    }
    throw error
  }
})

ipcMain.on('saveConfig', async (event, configSnapshot) => {
  fsWriteFile(configLocation, JSON.stringify(configSnapshot, null, 2))
})

ipcMain.handle('listSessions', async () => {
  try {
    const sessionFiles = await fsReaddir(sessionDirectory)
    const sessionFilesData = []
    for (const sessionFile of sessionFiles) {
      if (path.extname(sessionFile) === '.thumbnail')
        sessionFilesData.push(
          fsReadFile(path.join(sessionDirectory, sessionFile), {
            encoding: 'utf8',
          }),
        )
      else
        sessionFilesData.push(fsStat(path.join(sessionDirectory, sessionFile)))
    }
    const data = await Promise.all(sessionFilesData)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessions: { [key: string]: any } = {}
    sessionFiles.forEach((sessionFile: string, idx: number) => {
      if (path.extname(sessionFile) === '.thumbnail') {
        const sessionName = decodeURIComponent(
          path.basename(sessionFile, '.thumbnail'),
        )
        if (!sessions[sessionName]) sessions[sessionName] = {}
        sessions[sessionName].screenshot = data[idx]
      } else if (path.extname(sessionFile) === '.json') {
        const sessionName = decodeURIComponent(
          path.basename(sessionFile, '.json'),
        )
        if (!sessions[sessionName]) sessions[sessionName] = {}
        sessions[sessionName].stats = data[idx]
      }
    })
    return sessions
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return []
    }
    throw error
  }
})

ipcMain.handle('loadSession', async (event, sessionName) => {
  return fsReadFile(
    path.join(sessionDirectory, `${encodeURIComponent(sessionName)}.json`),
    { encoding: 'utf8' },
  )
})

ipcMain.on('saveSession', async (event, sessionSnapshot, sessionScreenshot) => {
  fsWriteFile(
    path.join(
      sessionDirectory,
      `${encodeURIComponent(sessionSnapshot.name)}.thumbnail`,
    ),
    sessionScreenshot,
  )
  fsWriteFile(
    path.join(
      sessionDirectory,
      `${encodeURIComponent(sessionSnapshot.name)}.json`,
    ),
    JSON.stringify(sessionSnapshot, null, 2),
  )
})

ipcMain.handle('renameSession', async (event, oldName, newName) => {
  try {
    await fsRename(
      path.join(sessionDirectory, `${encodeURIComponent(oldName)}.thumbnail`),
      path.join(sessionDirectory, `${encodeURIComponent(newName)}.thumbnail`),
    )
  } catch {
    // ignore
  }
  const sessionJson = await fsReadFile(
    path.join(sessionDirectory, `${encodeURIComponent(oldName)}.json`),
    { encoding: 'utf8' },
  )
  const sessionSnapshot = JSON.parse(sessionJson)
  sessionSnapshot.name = newName
  await fsUnlink(
    path.join(sessionDirectory, `${encodeURIComponent(oldName)}.json`),
  )
  await fsWriteFile(
    path.join(sessionDirectory, `${encodeURIComponent(newName)}.json`),
    JSON.stringify(sessionSnapshot, null, 2),
  )
})

ipcMain.handle('reset', async () => {
  const sessionFiles = await fsReaddir(sessionDirectory)
  const unlinkCommands = [fsUnlink(configLocation)]
  for (const sessionFile of sessionFiles) {
    unlinkCommands.push(fsUnlink(path.join(sessionDirectory, sessionFile)))
  }
  await Promise.all(unlinkCommands)
})

ipcMain.handle('deleteSession', async (event, sessionName) => {
  try {
    await fsUnlink(
      path.join(
        sessionDirectory,
        `${encodeURIComponent(sessionName)}.thumbnail`,
      ),
    )
  } catch {
    // ignore
  }
  return fsUnlink(
    path.join(sessionDirectory, `${encodeURIComponent(sessionName)}.json`),
  )
})

ipcMain.handle('fetch', async (event, ...args) => {
  const response = await fetch(...args)
  return {
    headers: Array.from(response.headers),
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    buffer: await response.buffer(),
  }
})

ipcMain.handle('read', async (event, ...args) => {
  return fsRead(...args)
})

ipcMain.handle('readFile', async (event, ...args) => {
  args[0] = path.resolve(app.getAppPath(), isDev ? 'public' : 'build', args[0])
  return fsReadFile(...args)
})

ipcMain.handle('stat', async (event, ...args) => {
  return fsFStat(...args)
})

ipcMain.handle('open', async (event, ...args) => {
  args[0] = path.resolve(app.getAppPath(), isDev ? 'public' : 'build', args[0])
  return fsOpen(...args)
})