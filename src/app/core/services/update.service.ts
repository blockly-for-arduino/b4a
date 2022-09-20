import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, shell } from 'electron';
// import * as childProcess from 'child_process';
// import * as fs from 'fs';
// import * as os from 'os';
import * as electronUpdater from "electron-updater"
// import * as electronLog from 'electron-log';


@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  ipcRenderer: typeof ipcRenderer;
  electronUpdater: typeof electronUpdater;
  // electronLog: typeof electronLog


  newVersion;

  isDownloading = false;

  progress: {
    bytesPerSecond: number,
    delta: number,
    percent: number,
    total: number,
    transferred: number,
  };

  percent: number;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.ipcRenderer.on('update-available', (event, arg) => {
        console.log(arg);
        this.newVersion = arg.version;
      })
      this.ipcRenderer.on('update-error', (event, arg) => {
        console.log(arg);
      })
      this.ipcRenderer.on('update-download-progress', (event, arg) => {
        console.log(arg);
        this.progress = arg;
        this.percent = arg.percent;
      })
      this.ipcRenderer.on('update-downloaded', (event, arg) => {
        console.log(arg);
        this.install();
      })
    }
  }

  init() {
    this.ipcRenderer.send('update', 'check');
  }

  download() {
    this.ipcRenderer.send('update', 'download');
    this.isDownloading = true
  }

  install() {
    this.ipcRenderer.send('update', 'install');
  }

}
