import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { dialog } from '@electron/remote';
import { LibInfo } from '../interfaces';

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
  libraries_user: LibInfo[] = []
  libraries_core: LibInfo[] = []

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
      this.basePath = this.fs.existsSync('./resources') ? './resources/app' : './src';
    }
  }

  loadLibraries() {
    return new Promise<any>((resolve, reject) => {
      if (this.isElectron) {
        let coreLibrariesPath, userLibrariesPath
        coreLibrariesPath = this.basePath + '/core/'
        userLibrariesPath = this.basePath + '/libraries/'
        this.libraries_core = this.getLibFileList(coreLibrariesPath)
        this.libraries_user = this.getLibFileList(userLibrariesPath)
      }
      resolve({
        core: this.libraries_core,
        user: this.libraries_user
      })
    })
  }

  getLibFileList(LibrariesPath): any[] {
    let libraries = []
    let libraries_temp = this.fs.readdirSync(LibrariesPath)
    libraries_temp.forEach(libName => {
      let libItem = this.getLibPathInfo(LibrariesPath + libName)
      if (libItem != null) {
        libraries.push(libItem)
      }
    })
    return libraries
  }

  getLibPathInfo(path: string): LibInfo {
    // console.log(path);
    let realPath = path.replace(this.basePath, '.')
    if (this.fs.statSync(path).isFile()) {
      let libName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
      let libItem: LibInfo = { name: libName }
      if (path.toLocaleLowerCase().includes(libName + '.json')) libItem['block'] = realPath
      else if (path.toLocaleLowerCase().includes(libName + '.js')) libItem['generator'] = realPath
      return libItem
    } else {
      let libFiles = this.fs.readdirSync(path)
      let libName = path.substring(path.lastIndexOf('/') + 1, path.length);
      if (libName == 'core') return null
      let libItem: LibInfo = { name: libName }
      libFiles.forEach(file => {
        if (file.toLocaleLowerCase().includes(libName + '.json')) libItem['block'] = realPath + '/' + file
        else if (file.toLocaleLowerCase().includes(libName + '.js')) libItem['generator'] = realPath + '/' + file
        else if (file.toLocaleLowerCase().includes('toolbox.json')) libItem['toolbox'] = realPath + '/' + file
      })
      return libItem
    }
    return null
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
