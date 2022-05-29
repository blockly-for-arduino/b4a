import { Injectable } from '@angular/core';
import { SerialPort } from 'serialport';
import * as stream from 'stream';
import * as iconv from 'iconv-lite'
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SerialService {
  serialport: typeof SerialPort;
  stream: typeof stream;

  serialList = []

  serial: SerialPort;

  output = new Subject<string>()

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    if (this.isElectron) {
      this.serialport = window.require('serialport').SerialPort;
      this.stream = window.require('stream');
      // this.iconv = window.require('iconv-lite')
    }
  }

  async getSerialPortList() {
    if (this.isElectron) {
      this.serialList = (await this.serialport.list()).map(item => item.path)
    }
  }

  init(path) {
    console.log('打开串口 ' + path);

    this.serial = new this.serialport({
      path: path,
      baudRate: 9600,
    })
    iconv['enableStreamingAPI'](this.stream)
    let converterStream = iconv.decodeStream('utf8')
    this.serial.pipe(converterStream);
    converterStream.on('data', (str) => {
      this.output.next(str);
    });
  }

  close() {
    this.serial.close();
    this.serial.destroy();
  }

  send(data) {
    this.serial.write(data)
  }

  changeSpeed(speed) {

  }

}
