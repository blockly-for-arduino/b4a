import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BoardJsonCloud } from '../../../core/interfaces';
import { ElectronService } from '../../../core/services';
import { ArduinoCliService } from '../../../core/services/arduino-cli.service';
import { ConfigService } from '../../../core/services/config.service';
import { isErrorInfo_Build, isErrorInfo_Upload, isSystemInfo, isUsefulInfo_Build, isUsefulInfo_Upload } from '../../../shell/info';

@Component({
  selector: 'app-install-shell',
  templateUrl: './install-shell.component.html',
  styleUrls: ['./install-shell.component.scss']
})
export class InstallShellComponent implements OnInit {

  @Input() boardJson_cloud: BoardJsonCloud;

  state = 'DOWNLOAD_BOARD_JSON';

  get isEsp32(){
    return this.boardJson_cloud.core.includes('esp32')
  }

  constructor(
    private configService: ConfigService,
    private electronService: ElectronService,
    private arduinoCli: ArduinoCliService,
    private message: NzMessageService,
    private modalRef: NzModalRef,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.install()
  }

  ngOnDestroy(): void {
    this.arduinoCli.killChild()
  }

  async install() {
    this.electronService.installBoard(this.boardJson_cloud)
    this.electronService.installBoardState.subscribe(state => {
      this.state = state
      this.cd.detectChanges()
      if (this.state == 'INSTALL_BOARD_DONE')
        setTimeout(() => {
          this.close()
        }, 2000);
    })
  }

  close() {
    localStorage.setItem('guide', 'hide')
    this.electronService.stopInstallBoard()
    this.configService.init()
    this.modalRef.close()
  }

  stop() {
    this.electronService.stopInstallBoard()
    let boardFileName = this.boardJson_cloud.file.split('/').pop()
    this.electronService.delBoardJson(boardFileName)
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
