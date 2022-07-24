import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import { dialog } from '@electron/remote';
import { LibInfo, SourceLib } from '../interfaces';
import * as download from 'download';
import { Subject } from 'rxjs';

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

  package;

  libraries_user: LibInfo[] = []
  libraries_core: LibInfo[] = []

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  basePath = './resources/app/';
  cliPath = './child/install-board.exe'

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

  child_installBoard;
  installBoardState = new Subject<string>()
  stateList = [
    'DOWNLOAD_BOARD_JSON', 'DOWNLOAD_BOARD_FAIL',
    'CHECK_BOARD_CORE', 'DOWNLOAD_BOARD_CORE',
    'INSTALL_BOARD_ING', 'INSTALL_BOARD_DONE', 'INSTALL_BOARD_FAIL']
  installBoard(boardJson_cloud) {
    console.log(boardJson_cloud);
    this.child_installBoard = this.childProcess.spawn(this.cliPath, [
      '-boardUrl', boardJson_cloud.file,
      '-boardPath', `${this.basePath}/boards`,
      '-boardName', boardJson_cloud.name,
      '-coreUrl', boardJson_cloud.core_setup[0].url,
      '-coreName', boardJson_cloud.core.split('@')[0],
      '-coreVersion', boardJson_cloud.core.split('@')[1],
      '-corePath', this.os.homedir() + '/AppData/Local/Arduino15/packages'
    ])
    this.child_installBoard.stdout.on('data', (dataBuffer) => {
      let data = dataBuffer.toString().split('\n')[0]
      console.log(JSON.stringify(data));
      if (this.stateList.includes(data)) {
        this.installBoardState.next(data)
      }
    })
    this.child_installBoard.stderr.on('data', (dataBuffer) => {
      let data = dataBuffer.toString();
      console.log(data);
    })
    this.child_installBoard.on('data', (dataBuffer) => {
      let data = dataBuffer.toString();
      console.log(data);
    })
  }

  stopInstallBoard() {
    this.child_installBoard.kill();
  }

  delBoardJson(filename) {
    if (this.fs.existsSync(`${this.basePath}/boards/${filename}`))
      this.fs.rmSync(`${this.basePath}/boards/${filename}`)
  }

  openBoardFolder() {
    console.log(process.cwd() + `${this.basePath}/boards`.replace('.', ''));
    this.shell.showItemInFolder(process.cwd() + `${this.basePath}/boards`.replace('.', ''))
  }

  openCoreFolder() {
    console.log(this.os.homedir() + '/AppData/Local/Arduino15/packages');
    this.shell.showItemInFolder(this.os.homedir() + '\\AppData\\Local\\Arduino15\\packages')
  }

}
