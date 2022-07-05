import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { ArduinoCliService } from '../../../core/services/arduino-cli.service';
import { ConfigService } from '../../../core/services/config.service';
import { isErrorInfo_Build, isErrorInfo_Upload, isSystemInfo, isUsefulInfo_Build, isUsefulInfo_Upload } from '../../../shell/info';
import { ShellState } from '../../../shell/shell.component';

@Component({
  selector: 'app-install-shell',
  templateUrl: './install-shell.component.html',
  styleUrls: ['./install-shell.component.scss']
})
export class InstallShellComponent implements OnInit {

  @Input() boardJson_cloud;
  dataList = ['']

  state = ShellState.INSTALL_CORE_ING;

  arduinoCliOutput: Subscription;
  arduinoCliState: Subscription;

  lastLine: string = 'null';

  isDone = false

  constructor(
    private configService: ConfigService,
    private electronService: ElectronService,
    private arduinoCli: ArduinoCliService,
    private message: NzMessageService,
    private modalRef: NzModalRef,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.arduinoCliState = this.arduinoCli.state.subscribe(state => {
      if (state == ShellState.INSTALL_CORE_ING) {
        this.dataList = ['']
        this.lastLine = ''
        this.cd.detectChanges()
      }
      this.state = state
    })
    this.arduinoCliOutput = this.arduinoCli.output.subscribe(str => {
      console.log(str);
      if (str.includes('0.00%')) return
      // 系统信息直接写入
      if (isSystemInfo(str)) {
        console.log('system info: ' + str);
        this.dataList.push(str)
        this.dataList.push('')
        this.cd.detectChanges()
        return
      }
      // 替换百分比进度
      let temp = str.match(/([\d.d]+%)|已下载|已安装/)
      if (temp != null) {
        let packageName = str.split(' ')[0]
        if (packageName.includes('已下载')) {
          packageName = str.split('已下载')[0]
        } else if (packageName.includes('已安装')) {
          packageName = str.split('已安装')[0]
        }
        let currentline = packageName + ' ' + temp[0]
        if (this.lastLine.includes(packageName)) {
          this.dataList[this.dataList.length - 1] = currentline
        } else {
          this.dataList.push(currentline)
        }
        this.lastLine = currentline
      }

      this.cd.detectChanges()

    })
  }

  ngAfterViewInit(): void {
    this.install()
  }

  ngOnDestroy(): void {
    this.arduinoCliOutput.unsubscribe()
    this.arduinoCliState.unsubscribe()
    this.arduinoCli.killChild()
  }

  async install() {
    try {
      this.boardJson_cloud['loading'] = true
      this.arduinoCli.state.next(ShellState.INSTALL_CORE_ING)
      // 下载开发板json配置
      this.electronService.installBoardJson(this.boardJson_cloud)
      
      this.arduinoCli.output.next('检查已安装核心...')
      let arduinoCoreList = await this.arduinoCli.checkArduinoCoreList()
      if (!arduinoCoreList.includes(this.boardJson_cloud.core)) {
        this.arduinoCli.output.next(`安装核心 ${this.boardJson_cloud.core}...`)
        if (this.boardJson_cloud.core_setup[0].mode == "arduino_cli") {
          await this.arduinoCli.installCore(this.boardJson_cloud);
        } else if (this.boardJson_cloud.core_setup[0].mode == "download_exec") {
          await this.electronService.installcore(this.boardJson_cloud);
        }
      } else {
        this.arduinoCli.output.next(`核心 ${this.boardJson_cloud.core} 已安装`)
      }
      this.boardJson_cloud['loading'] = false
      this.arduinoCli.output.next('安装完成')
      this.message.success('开发板 ' + this.boardJson_cloud.name + ' 安装成功')
      this.configService.init()
      this.isDone = true
    } catch (error) {
      console.error(error);
      this.boardJson_cloud['loading'] = false
      this.message.error('开发板 ' + this.boardJson_cloud.name + ' 安装失败')
    }
  }

  stop() {
    this.arduinoCli.killChild()
    this.modalRef.close()
  }

  trackFunc = (index, item) => {
    return index
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


}
