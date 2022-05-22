import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ArduinoCliService } from '../core/services/arduino-cli.service';
import { isErrorInfo_Build, isErrorInfo_Upload, isSystemInfo, isUsefulInfo_Build, isUsefulInfo_Upload, isUselessInfo } from './info';

export enum ShellState {
  BUILDING = 11,
  BUILD_DONE = 21,
  BUILD_FAIL = 31,
  UPLOADING = 12,
  UPLOAD_DONE = 22,
  UPLOAD_FAIL = 32,
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {

  dataList = ['']
  state = ShellState.BUILDING;

  arduinoCliOutput: Subscription;
  arduinoCliState: Subscription;

  constructor(
    private arduinoCli: ArduinoCliService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.arduinoCliState = this.arduinoCli.state.subscribe(state => {
      if (state == ShellState.BUILDING) {
        this.dataList = ['']
        this.cd.detectChanges()
      }
      this.state = state
      // if (state == ShellState.UPLOAD_DONE) {
      //   console.log(this.dataList);
      // }
    })
    this.arduinoCliOutput = this.arduinoCli.output.subscribe(str => {
      // 系统信息直接写入
      if (isSystemInfo(str)) {
        this.dataList.push(str);
        this.dataList.push('');
        return
      }

      let dataArray = str.replace(/\r/g, '').split(/\n/)

      // 替换esptool的百分比进度
      if (this.dataList.length > 2) {
        let temp = this.dataList[this.dataList.length - 2].match(/\(\d+ %\)$/)
        let newTemp = dataArray[0].match(/\(\d+ %\)$/)
        if (temp != null && newTemp != null && (temp[0] != '(100 %)')) {
          this.dataList[this.dataList.length - 2] = this.dataList[this.dataList.length - 2].replace(temp[0], newTemp[0])
          this.cd.detectChanges()
          return
        }
      }

      if (dataArray.length > 0) {
        let lastLine = this.dataList[this.dataList.length - 1] + dataArray[0];
        if (this.isUselessInfo(lastLine)) {
          this.dataList[this.dataList.length - 1] = ''
        } else
          this.dataList[this.dataList.length - 1] = lastLine
      }

      if (dataArray.length > 1)
        for (let index = 1; index < dataArray.length; index++) {
          let data = dataArray[index];
          if (data == '.') data = ''
          if (this.isUselessInfo(data)) data = ''
          this.dataList.push(data)
          this.cd.detectChanges()
        }
    })
  }

  isUselessInfo(data) {
    if (this.state == ShellState.BUILDING && (!isUsefulInfo_Build(data) && !isErrorInfo_Build(data))) {
      return true
    } else if (this.state == ShellState.UPLOADING && (!isUsefulInfo_Upload(data) && !isErrorInfo_Upload(data))) {
      return true
    }
    return false
  }

  clear() {
    this.dataList = ['']
  }

  ngOnDestroy(): void {
    this.arduinoCliOutput.unsubscribe()
    this.arduinoCliState.unsubscribe()
    this.arduinoCli.killChild()
  }

  isSystemInfo(data: string) {
    return isSystemInfo(data)
  }

  isErrorInfo_Build(data: string) {
    return isErrorInfo_Build(data)
  }

  isErrorInfo_Upload(data: string) {
    return isErrorInfo_Upload(data)
  }

  trackFunc = (index, item) => {
    return index
  }

}
