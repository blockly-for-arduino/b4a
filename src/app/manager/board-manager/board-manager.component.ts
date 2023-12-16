import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import { CloudService } from '../cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ArduinoCliService } from '../../core/services/arduino-cli.service';
import { ElectronService } from '../../core/services';
import { InstallShellComponent } from './install-shell/install-shell.component';

@Component({
  selector: 'app-board-manager',
  templateUrl: './board-manager.component.html',
  styleUrls: ['./board-manager.component.scss']
})
export class BoardManagerComponent implements OnInit {
  @ViewChild('boardListBox', { static: false, read: ElementRef }) boardListBox: ElementRef
  boardManagerLoaded = false

  boardList_cloud: any[] = []

  viewMode = '1'; //1:按厂家查看；2:按核心查看；3:搜索模式
  venderList: any[] = []
  coreList: any = []

  get boardList() {
    return this.configService.boardList
  }

  get boardDict() {
    return this.configService.boardDict
  }

  constructor(
    private configService: ConfigService,
    private cloudService: CloudService,
    private arduinoCli: ArduinoCliService,
    private electronService: ElectronService,
    private message: NzMessageService,
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
    this.getCloudData()
  }

  getCloudData() {
    this.cloudService.getBoards().subscribe((resp: any) => {
      this.boardList_cloud = resp.data
      this.viewModeChange()
    })
  }

  viewModeChange() {
    if (this.viewMode == '1')
      this.change2VenderMode()
    else
      this.change2CoreMode()
  }

  change2VenderMode() {
    let venderDict = {}
    this.venderList = []
    this.boardList_cloud.map(board => {
      if (venderDict[board.vender]) {
        venderDict[board.vender].boards.push(board)
      } else {
        let verderInfo = {
          name: board.vender,
          img: "",
          boards: [board]
        }
        this.venderList.push(verderInfo)
        venderDict[board.vender] = verderInfo
      }
    })
    console.log(this.venderList);
  }

  change2CoreMode() {
    let coreDict = {}
    this.coreList = []
    this.boardList_cloud.map(board => {
      let core = board.core.split('@')[0].split(':')[1]
      if (coreDict[core]) {
        coreDict[core].boards.push(board)
      } else {
        let coreInfo = {
          name: core,
          img: "",
          boards: [board]
        }
        this.coreList.push(coreInfo)
        coreDict[core] = coreInfo
      }
    })
    console.log(this.coreList);
  }

  async installBoard(boardJson_cloud) {
    this.modal.create({
      nzContent: InstallShellComponent,
      nzClosable: false,
      nzFooter: null,
      nzMaskClosable: false,
      // nzComponentParams: {
      //   boardJson_cloud: boardJson_cloud
      // }
    })
    console.log(boardJson_cloud);
  }

  async uninstallBoard(boardJson_cloud) {
    try {
      let filename = this.boardDict[boardJson_cloud.name].file
      this.electronService.delBoardJson(filename)
      this.configService.init()
      this.message.success('开发板 ' + boardJson_cloud.name + ' 移除成功')
    } catch (error) {
      console.error(error);
      this.message.error('开发板 ' + boardJson_cloud.name + ' 移除失败')
    }
  }

  isInstalled(boardName) {
    return this.boardList.includes(boardName)
  }

  openBoardFolder() {
    this.electronService.openBoardFolder()
  }

  openCoreFolder() {
    this.electronService.openCoreFolder()
  }


}
