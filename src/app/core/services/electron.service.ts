import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { dialog } from '@electron/remote';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  dialog: typeof dialog;
  fs: typeof fs;
  shell: typeof shell;

  boards = []
  libraries = []

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  basePath = './resources/app/';

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.dialog = window.require('@electron/remote').dialog;
      this.shell = window.require('electron').shell

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      // this.remote = window.require('@electron/remote')
      this.basePath = this.fs.existsSync('./resources/app') ? './resources/app' : './src';
    }
  }

  loadLibraries() {
    return new Promise<String[]>((resolve, reject) => {
      if (this.isElectron)
        this.libraries = this.fs.readdirSync(this.basePath + '/libraries').filter(el => el != 'core')
      console.log('load libraries: ', this.libraries);
      resolve(this.libraries)
    })
  }

  async getBoardList() {
    let boardList = []
    if (this.isElectron) {
      let boardFileList = this.fs.readdirSync(this.basePath + '/boards')
      boardFileList.forEach(boardFile => {
        let boardConfigString = this.fs.readFileSync(this.basePath + '/boards/' + boardFile, { encoding: 'utf-8' })
        boardList.push(JSON.parse(boardConfigString))
      })
    }
    return boardList
  }

  creatTempPrject(fileString) {
    if (!this.fs.existsSync('.\\temp'))
      this.fs.mkdirSync('.\\temp')
    this.fs.writeFileSync('.\\temp\\temp.ino', fileString)
  }

  saveFile(fileContent: string) {
    this.dialog.showSaveDialog({
      title: '保存',
      filters: [
        { name: 'B4A File Type', extensions: ['b4a'] },
      ]
    }).then(value => {
      if (value.filePath != '')
        this.fs.writeFileSync(value.filePath, fileContent)
    })
  }

  openFile() {
    return new Promise<string>((resolve, reject) => {
      this.dialog.showOpenDialog({
        title: '打开',
        filters: [
          { name: 'B4A File Type', extensions: ['b4a'] },
        ]
      }).then(value => {
        if (value.filePaths.length > 0)
          resolve(this.fs.readFileSync(value.filePaths[0], { encoding: 'utf-8' }))
      })
    })
  }

  openUrl(url) {
    this.shell.openExternal(url)
  }

}
