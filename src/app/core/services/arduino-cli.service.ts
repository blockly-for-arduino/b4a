import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ConfigService } from './config.service'
import * as childProcess from 'child_process';
import { BehaviorSubject, Subject } from 'rxjs';
import { ShellState } from '../../shell/shell.component';
import { isErrorInfo_Upload } from '../../shell/info';
import * as os from 'os';
import * as fs from 'fs';
import * as download from 'download';

@Injectable({
  providedIn: 'root'
})
export class ArduinoCliService {

  childProcess: typeof childProcess;
  os: typeof os;
  fs: typeof fs;
  download: typeof download;
  cliPath = '.\\arduino\\arduino-cli.exe'

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  output = new Subject<any>()
  state = new BehaviorSubject(ShellState.BUILDING)

  child_build: childProcess.ChildProcess;
  child_upload: childProcess.ChildProcess;

  constructor(
    private electronService: ElectronService,
    private configService: ConfigService
  ) {
    if (this.isElectron) {
      this.childProcess = window.require('child_process');
      this.os = window.require('os');
      this.fs = window.require('fs');
      this.download = window.require('download');
      this.cliPath = this.fs.existsSync('./resources/app') ? '.\\resources\\arduino\\arduino-cli.exe' : '.\\arduino\\arduino-cli.exe';
    }
  }

  async build(code) {
    this.electronService.creatTempPrject(code);
    return await this.runBuild(this.configService.config.board.compilerParam + ' .//temp')
  }

  async upload(code) {
    if (await this.build(code))
      await this.runUpload(this.configService.config.board.uploadParam.replace('${serial}', this.configService.config.serial) + ' .//temp')
  }

  checkCore() {

  }

  installCore() {

  }

  runBuild(params: string) {
    this.killChild()
    console.log('run build: ' + this.cliPath + ' ' + params);
    return new Promise<boolean>((resolve, reject) => {
      let state = ShellState.BUILDING;
      this.state.next(state);
      setTimeout(() => {
        this.output.next(`创建编译任务  目标设备：${this.configService.config.board.name}\n`);
      }, 200);
      // this.child_build = this.childProcess.exec(this.cliPath + ' ' + params)
      this.child_build = this.childProcess.spawn(this.cliPath, params.split(' '))
      this.child_build.stdout.on('data', (dataBuffer: Buffer) => {
        let data = dataBuffer.toString();
        this.output.next(data);
      })
      this.child_build.stderr.on('data', (dataBuffer: Buffer) => {
        let data = dataBuffer.toString();
        console.log(data);
        if (state == ShellState.BUILDING && data.includes('error:'))
          state = ShellState.BUILD_FAIL
        this.output.next(data)
      })
      this.child_build.on('close', (code) => {
        console.log('child_build close code: ', code);
        if (state == ShellState.BUILDING && code == 0) {
          state = ShellState.BUILD_DONE
          this.state.next(state)
          this.output.next(`编译完成\n`);
          resolve(true)
          return
        }
        if (state == ShellState.BUILD_FAIL || code == null) {
          this.state.next(state)
          resolve(false)
        }
      })
    })
  }

  runUpload(params) {
    this.killChild()
    console.log('run upload: ' + this.cliPath + ' ' + params);
    return new Promise<boolean>((resolve, reject) => {
      let state = ShellState.UPLOADING
      this.state.next(state);
      this.output.next(`创建上传任务  目标端口：${this.configService.config.serial}\n`);
      this.child_upload = this.childProcess.spawn(this.cliPath, params.split(' '))
      this.child_upload.stdout.on('data', (dataBuffer: Buffer) => {
        let data = dataBuffer.toString();
        // console.log(data);
        if (isErrorInfo_Upload(data)) {
          state = ShellState.UPLOAD_FAIL
        }
        this.output.next(data)
      })
      this.child_upload.stderr.on('data', (dataBuffer: Buffer) => {
        let data = dataBuffer.toString();
        console.log(data);

        if (isErrorInfo_Upload(data)) {
          state = ShellState.UPLOAD_FAIL
          this.output.next(data)
        } else {
          this.output.next(data)
        }
      })
      this.child_upload.on('close', (code) => {
        console.log('child_upload close code: ', code);
        if (state == ShellState.UPLOADING && code == 0) {
          state = ShellState.UPLOAD_DONE
          this.state.next(state)
          this.output.next(`上传完成\n`);
          resolve(true)
          return
        }
        if (state == ShellState.UPLOAD_FAIL || code == null) {
          this.state.next(state)
          resolve(false)
        }
      })
    })
  }

  killChild() {
    if (typeof this.child_build != 'undefined') {
      this.child_build.stdout.destroy()
      if (this.os.platform() === 'win32')
        this.childProcess.exec('taskkill /pid ' + this.child_build.pid + ' /f /t')
      else
        this.child_build.kill()
    }
    if (typeof this.child_upload != 'undefined') {
      this.child_upload.stdout.destroy()
      this.child_upload.stderr.destroy()
      if (this.os.platform() === 'win32')
        this.childProcess.exec('taskkill /pid ' + this.child_upload.pid + ' /f /t')
      else
        this.child_upload.kill()
    }
  }

  arduinoLibList;
  checkArduinoLibList() {
    this.arduinoLibList = []
    return new Promise<string[]>((resolve, reject) => {
      let child_arduinoLibList = this.childProcess.exec(this.cliPath + ' lib list')
      child_arduinoLibList.stdout.on('data', (data: string) => {
        if (data.includes('LIBRARY_LOCATION_USER')) {
          let list = data.split('\n')
          list.forEach((line, index) => {
            if (index != 0) {
              let libName = line.split(' ')[0]
              if (libName != '')
                this.arduinoLibList.push(line.split(' ')[0])
            }
          })
        }
      })
      child_arduinoLibList.on('close', code => {
        console.log(this.arduinoLibList);
        resolve(this.arduinoLibList)
      })
    })
  }
  async downloadArduinoLib(sourceLib) {
    return new Promise<boolean>(async (resolve, reject) => {
      let filePath = './/temp/' + sourceLib.name + '.zip'
      await this.download(sourceLib.url, './/temp/');
      let child_install = this.childProcess.exec(this.cliPath + ' lib install --zip-path ' + filePath)
      child_install.on('close', code => {
        resolve(true)
      })
    })
  }

  async uninstallArduinoLib(arduinoLibName) {
    return new Promise<boolean>(async (resolve, reject) => {
      let arduinoLibList = await this.checkArduinoLibList()
      if (arduinoLibList.includes(arduinoLibName)) {
        let child_uninstall = this.childProcess.exec(this.cliPath + ' lib uninstall ' + arduinoLibName)
        child_uninstall.on('close', code => {
          resolve(true)
        })
      } else {
        resolve(true)
      }
    })
  }

  async installArduinoLib(sourceLib) {
    // 检查库是否已经安装
    await this.uninstallArduinoLib(sourceLib.name)
    // 允许arduino cli安装zip文件
    this.childProcess.exec(this.cliPath + ' set library.enable_unsafe_install true')
    if (await this.downloadArduinoLib(sourceLib)) {
      console.log(`arduino lib ${sourceLib.name} is loaded`);
    }
  }

}


