import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import { dialog } from '@electron/remote';
import { LibInfo, SourceLib } from '../interfaces';
import * as download from 'download';
import * as _7z from '7zip-min';
@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  dialog: typeof dialog;
  os: typeof os;
  fs: typeof fs;
  shell: typeof shell;
  download: typeof download;
  _7z: typeof _7z;
  package;

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
      this.os = window.require('os');
      this.fs = window.require('fs');
      this.package = window.require("./package.json");
      this.basePath = this.fs.existsSync('./resources') ? './resources/app' : './src';
      this.download = window.require('download');
      this._7z = window.require('7zip-min');
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
      resolve(this.libraries_core.concat(this.libraries_user))
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
        if (file.toLocaleLowerCase().includes(libName.toLocaleLowerCase() + '.json')) libItem['block'] = realPath + '/' + file
        else if (file.toLocaleLowerCase().includes(libName.toLocaleLowerCase() + '.js')) libItem['generator'] = realPath + '/' + file
        else if (file.toLocaleLowerCase().includes('toolbox.json')) libItem['toolbox'] = realPath + '/' + file
      })
      return libItem
    }
    return null
  }

  async getBoardData() {
    let boardList = []
    if (this.isElectron) {
      let boardFileList = this.fs.readdirSync(this.basePath + '/boards')
      boardFileList.forEach(boardFile => {
        let boardConfigString = this.fs.readFileSync(this.basePath + '/boards/' + boardFile, { encoding: 'utf-8' })
        let boardConfig = JSON.parse(boardConfigString)
        boardConfig['file'] = boardFile
        boardList.push(boardConfig)
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

  saveLibJson(libName, libJson) {
    if (!this.fs.existsSync(`${this.basePath}/libraries/${libName}`))
      this.fs.mkdirSync(`${this.basePath}/libraries/${libName}`)
    this.fs.writeFileSync(`${this.basePath}/libraries/${libName}/${libName}.json`, JSON.stringify(libJson))
  }

  saveLibJs(libName, fileText) {
    if (!this.fs.existsSync(`${this.basePath}/libraries/${libName}`))
      this.fs.mkdirSync(`${this.basePath}/libraries/${libName}`)
    this.fs.writeFileSync(`${this.basePath}/libraries/${libName}/${libName}.js`, fileText)
  }

  async installB4aLib(b4aLib: SourceLib) {
    await this.download(b4aLib.url, `${this.basePath}/libraries/${b4aLib.name}`);
  }

  delLibJson(libName) {
    this.fs.rmdirSync(`${this.basePath}/libraries/${libName}`, { recursive: true })
  }

  installcore(boardJson_cloud) {
    let basePath = this.fs.existsSync('./resources/packages') ? '.\\resources\\packages\\' : '.\\packages\\';
    return new Promise<boolean>((resolve, reject) => {
      let file;
      if (boardJson_cloud.core.includes('esp8266:esp8266')) {
        file = basePath + `esp8266_package_3.0.2_arduinocn.exe`
      } if (boardJson_cloud.core.includes('esp32:esp32')) {
        file = basePath + `esp32_package_2.0.3_arduinocn.exe`
      }
      let child = this.childProcess.spawn(file);
      child.stdout.on('data', (data) => {
        console.log(data.toString());
      })
      child.stderr.on('data', (data) => {
        console.log(data);
      })
      child.on('close', (code) => {
        console.log('installBoard close:' + code);
        if (code == 0) {
          resolve(true)
        }
      })
    })
  }

  async installBoardJson(boardJson_cloud) {
    await this.download(boardJson_cloud.file, `${this.basePath}/boards`);
  }

  delBoardJson(filename) {
    if (this.fs.existsSync(`${this.basePath}/boards/${filename}`))
      this.fs.rmSync(`${this.basePath}/boards/${filename}`)
  }

  installCore(boardJsonCloud) {
    let path = this.fs.existsSync('./resources') ? './resources' : '.';
    let child = this.childProcess.fork(path + '/child/install-core.js')
    child.send({ data: boardJsonCloud })
    return child
  }

}
