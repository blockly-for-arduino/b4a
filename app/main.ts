import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as remote from '@electron/remote/main';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as electronLog from 'electron-log';
import { autoUpdater } from "electron-updater"

let win: BrowserWindow = null;

const args = process.argv.slice(1);

const serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });

  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  remote.initialize();
  remote.enable(win.webContents);
  ipcMain.on('newWindow', (event, arg) => {
    console.log('win id:', arg);
    BrowserWindow.getAllWindows().forEach((win_child) => {
      if (win_child.id == arg) {
        remote.enable(win_child.webContents);
      }
    });
  })

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    setTimeout(() => {
      createWindow();
      initUpdater();
    }, 400)
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

function initUpdater() {
  autoUpdater.logger = electronLog;
  autoUpdater.logger['transports'].file.level = "info";
  autoUpdater.autoDownload = false;
  autoUpdater.on('checking-for-update', () => {
    console.log('checking-for-update');
    win.webContents.send('update', 'checking for update');
  })
  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update-available', info);
  })
  // autoUpdater.on('update-not-available', (info) => {
  //   win.webContents.send('update', 'Update not available', info);
  // })
  autoUpdater.on('error', (err) => {
    win.webContents.send('update-error', 'Error in auto-updater' + err);
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    win.webContents.send('update-download-progress', progressObj);
  })
  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('update-downloaded', info);
  });

  ipcMain.on('update', (event, arg) => {
    electronLog.info(JSON.stringify(arg))
    switch (arg) {
      case 'check':
        autoUpdater.checkForUpdatesAndNotify()
        break;
      case 'download':
        autoUpdater.downloadUpdate();
        break;
      case 'install':
        autoUpdater.quitAndInstall();
        break;
      default:
        break;
    }
  })
}

