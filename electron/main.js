const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

// Configure logger
log.transports.file.level = 'info'
autoUpdater.logger = log
log.info('App starting...')

// Get the app's user data directory (specific to your app)
const userDataPath = app.getPath('userData')
log.info('User Data Directory:', userDataPath)

// Paths to JSON files
const productCategoriesPath = path.join(userDataPath, 'productCategories.json')
const stockPath = path.join(userDataPath, 'stock.json')
const userProfilePath = path.join(userDataPath, 'userProfile.json')

// IPC handler for reading product categories
ipcMain.handle('read-product-categories', async () => {
  try {
    const data = await fs.promises.readFile(productCategoriesPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading product categories:', error)
    throw error
  }
})

// IPC handler for writing product categories
ipcMain.handle('write-product-categories', async (event, data) => {
  try {
    const jsonData = JSON.stringify(data, null, 4)
    await fs.promises.writeFile(productCategoriesPath, jsonData, 'utf8')
    return true
  } catch (error) {
    console.error('Error writing product categories:', error)
    throw error
  }
})

// IPC handler for reading stock
ipcMain.handle('read-stock', async () => {
  try {
    const data = await fs.promises.readFile(stockPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading stock:', error)
    throw error
  }
})

// IPC handler for writing stock
ipcMain.handle('write-stock', async (event, data) => {
  try {
    const jsonData = JSON.stringify(data, null, 4)
    await fs.promises.writeFile(stockPath, jsonData, 'utf8')
    return true
  } catch (error) {
    console.error('Error writing stock:', error)
    throw error
  }
})

// IPC handler for deleting product categories
ipcMain.handle('delete-product-categories', async () => {
  try {
    // Check if file exists before attempting to delete
    if (fs.existsSync(productCategoriesPath)) {
      // Use synchronous delete instead of promises
      fs.unlinkSync(productCategoriesPath)
      console.log('Product categories file deleted successfully')
    } else {
      console.log('Product categories file does not exist, nothing to delete')
    }
    return true
  } catch (error) {
    console.error('Error deleting product categories:', error)
    throw error
  }
})

// IPC handler for deleting stock
ipcMain.handle('delete-stock', async () => {
  try {
    // Check if file exists before attempting to delete
    if (fs.existsSync(stockPath)) {
      // Use synchronous delete instead of promises
      fs.unlinkSync(stockPath)
      console.log('Stock file deleted successfully')
    } else {
      console.log('Stock file does not exist, nothing to delete')
    }
    return true
  } catch (error) {
    console.error('Error deleting stock:', error)
    throw error
  }
})

// IPC handler for reading user profile
ipcMain.handle('read-user-profile', async () => {
  try {
    const data = await fs.promises.readFile(userProfilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading user profile:', error)
    throw error
  }
})

// IPC handler for writing user profile
ipcMain.handle('write-user-profile', async (event, data) => {
  try {
    const jsonData = JSON.stringify(data, null, 4)
    await fs.promises.writeFile(userProfilePath, jsonData, 'utf8')
    return true
  } catch (error) {
    console.error('Error writing user profile:', error)
    throw error
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icons/preppal-logo.png'), // Use PNG for cross-platform compatibility
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Load the index.html from a url
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../../dist/index.html')}`
  )

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools()
  }
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info)
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `A new version (${info.version}) is available and will be downloaded in the background.`,
    buttons: ['OK']
  })
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info)
})

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`
  logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`
  logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`
  log.info(logMessage)
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info)
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version has been downloaded. Restart the application to apply the updates.',
    buttons: ['Restart', 'Later']
  }).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

app.whenReady().then(() => {
  createWindow()
  
  // Check for updates after app is ready (but not in dev mode)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
