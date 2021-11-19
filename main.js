'use strict'

const electron = require('electron')
const app = electron.app
const autoUpdater = electron.autoUpdater
const updateApp = require('update-electron-app');
const globalShortcut = electron.globalShortcut
const os = require('os')
const path = require('path')
const config = require(path.join(__dirname, 'package.json'))
const BrowserWindow = electron.BrowserWindow
var kill  = require('tree-kill');

app.setName(config.productName)
var mainWindow = null
app.on('ready', function () {
  mainWindow = new BrowserWindow({
    backgroundColor: 'lightgray',
    title: config.productName,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      defaultEncoding: 'UTF-8'
    }
  })

  updateApp({
    updateInterval: '5 minutes',
    notifyUser: true
  });

  var jarPath = app.getAppPath() + '\\student-portal-api.jar';
  var child = require('child_process').spawn(
    'java', ['-jar', jarPath, '']
  );

  setTimeout(function() {
    mainWindow.loadURL(`file://${__dirname}/app/html/student.html`)
  }, 10000);

  // Enable keyboard shortcuts for Developer Tools on various platforms.
  let platform = os.platform()
  if (platform === 'darwin') {
    globalShortcut.register('Command+Option+I', () => {
      mainWindow.webContents.openDevTools()
    })
  } else if (platform === 'linux' || platform === 'win32') {
    globalShortcut.register('Control+Shift+I', () => {
      mainWindow.webContents.openDevTools()
    })
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.setMenu(null)
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.onbeforeunload = (e) => {
    // Prevent Command-R from unloading the window contents.
    e.returnValue = false
  }

  mainWindow.on('closed', function () {
    kill(child.pid);
    mainWindow = null
  })
})

app.on('window-all-closed', () => { app.quit() })

autoUpdater.setFeedURL('https://dist.unlock.sh/v1/electron/my-app')
autoUpdater.checkForUpdates()