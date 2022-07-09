// 参考 https://github.com/onikienko/7zip-min/blob/master/index.js

import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ConfigService } from './config.service'
import * as childProcess from 'child_process';
import { BehaviorSubject, Subject } from 'rxjs';
import * as os from 'os';
import * as fs from 'fs';
import * as _7zip from '7zip-bin';

@Injectable({
    providedIn: 'root'
})
export class SevenZService {

    childProcess: typeof childProcess;
    os: typeof os;
    fs: typeof fs;
    path7za: typeof _7zip.path7za;

    get isElectron(): boolean {
        return !!(window && window.process && window.process.type);
    }

    child_7z: childProcess.ChildProcess;

    constructor(
        private electronService: ElectronService,
        private configService: ConfigService
    ) {
        if (this.isElectron) {
            this.childProcess = window.require('child_process');
            this.os = window.require('os');
            this.fs = window.require('fs');
            this.path7za = window.require('7zip-bin').path7za;
        }
    }

    run(bin, args, cb) {
        cb = onceify(cb);
        const runError = new Error(); // get full stack trace
        const proc = this.childProcess.spawn(bin, args, { windowsHide: true });
        let output = '';
        proc.on('error', function (err) {
            cb(err);
        });
        proc.on('exit', function (code) {
            let result: any = null;
            if (args[0] === 'l') {
                result = parseListOutput(output);
            }
            if (code) {
                runError.message = `7-zip exited with code ${code}\n${output}`;
            }
            cb(code ? runError : null, result);
        });
        proc.stdout.on('data', (chunk) => {
            output += chunk.toString();
        });
        proc.stderr.on('data', (chunk) => {
            output += chunk.toString();
        });
    }

    unpack(pathToPack, destPathOrCb, cb) {
        if (typeof destPathOrCb === 'function' && cb === undefined) {
            cb = destPathOrCb;
            this.run(this.path7za, ['x', pathToPack, '-y'], cb);
        } else {
            this.run(this.path7za, ['x', pathToPack, '-y', '-o' + destPathOrCb], cb);
        }
    }

    killChild() {
        if (typeof this.child_7z != 'undefined') {
            this.child_7z.stdout!.destroy()
            this.child_7z.stderr!.destroy()
            if (this.os.platform() === 'win32')
                this.childProcess.exec('taskkill /pid ' + this.child_7z.pid + ' /f /t')
            else
                this.child_7z.kill()
        }
    }

    test(){
        // this.childProcess.fork
    }

}

function onceify(fn) {
    let called = false;
    return function () {
        if (called) return;
        called = true;
        fn.apply(this, Array.prototype.slice.call(arguments)); // slice arguments
    };
}

function parseListOutput(str) {
    if (!str.length) return [];
    str = str.replace(/(\r\n|\n|\r)/gm, '\n');
    const items = str.split(/^\s*$/m);
    const res: any[] = [];
    const LIST_MAP = {
        'Path': 'name',
        'Size': 'size',
        'Packed Size': 'compressed',
        'Attributes': 'attr',
        'Modified': 'dateTime',
        'CRC': 'crc',
        'Method': 'method',
        'Block': 'block',
        'Encrypted': 'encrypted',
    };

    if (!items.length) return [];

    for (let item of items) {
        if (!item.length) continue;
        const obj = {};
        const lines = item.split('\n');
        if (!lines.length) continue;
        for (let line of lines) {
            const data = line.split(' = ');
            if (data.length !== 2) continue;
            const name = data[0].trim();
            const val = data[1].trim();
            if (LIST_MAP[name]) {
                if (LIST_MAP[name] === 'dateTime') {
                    const dtArr = val.split(' ');
                    if (dtArr.length !== 2) continue;
                    obj['date'] = dtArr[0];
                    obj['time'] = dtArr[1];
                } else {
                    obj[LIST_MAP[name]] = val;
                }
            }
        }
        if (Object.keys(obj).length) res.push(obj);
    }
    return res;
}


