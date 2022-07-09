import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ConfigService } from './config.service'
import { BehaviorSubject, Subject } from 'rxjs';

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';
import * as childProcess from 'child_process';
import { BoardJsonCloud } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class GitService {
  os: typeof os;
  path: typeof path;
  git: typeof git;
  http: typeof http
  fs: typeof fs;
  childProcess: typeof childProcess;

  tempPath = '.\\temp\\'

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  output = new Subject<any>()
  state = new BehaviorSubject('')

  constructor(
    private electronService: ElectronService,
    private configService: ConfigService
  ) {
    if (this.isElectron) {
      this.os = window.require('os');
      this.path = window.require('path')
      this.git = window.require('isomorphic-git')
      this.http = window.require('isomorphic-git/http/node')
      this.fs = window.require('fs')
      this.childProcess = window.require('child_process');
    }
  }

  async clone(boardJsonCloud: BoardJsonCloud) {
    return new Promise<any>(async (resolve, reject) => {
      console.log(`git clone ${boardJsonCloud.core}...`);
      let path = this.tempPath + boardJsonCloud.core
      path = path.replace(':', '-')
      // this.fs.mkdirSync(path)
      await this.git.clone({
        fs: this.fs,
        http: this.http,
        dir: path,
        url: boardJsonCloud.core_setup[0].url,
        ref: boardJsonCloud.core.split('@')[1],
        singleBranch: true,
        onProgress: event => {
          if (event.total) {
            console.log(event.loaded / event.total)
          } else {
            console.log(event.loaded)
          }
        },
        // onMessage: console.log
      })
      console.log('git clone done');
      this.fs.rmdirSync(path + '\\.git', { recursive: true })
      let _7zFile = path + '\\' + this.fs.readdirSync(path)[0]
      resolve(_7zFile)
    })
  }

  stop(){
    
  }

  test(){
    this.childProcess.fork('.\\js\\git.js')
  }

}


