import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import { CloudService } from '../cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ArduinoCliService } from '../../core/services/arduino-cli.service';
import { ElectronService } from '../../core/services';

@Component({
  selector: 'app-board-manager',
  templateUrl: './board-manager.component.html',
  styleUrls: ['./board-manager.component.scss']
})
export class BoardManagerComponent implements OnInit {
  @ViewChild('boardListBox', { static: false, read: ElementRef }) boardListBox: ElementRef
  boardManagerLoaded = false

  boardList_cloud = []

  viewMode = '1'; //1:按厂家查看；2:按核心查看；3:搜索模式
  venderList = []
  coreList = []

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
    private message: NzMessageService
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
      if (coreDict[board.core]) {
        coreDict[board.core].boards.push(board)
      } else {
        let coreInfo = {
          name: board.core.split(':')[1],
          img: "",
          boards: [board]
        }
        this.coreList.push(coreInfo)
        coreDict[board.core] = coreInfo
      }
    })
    console.log(this.coreList);
  }

  async installBoard(boardJson_cloud) {
    console.log(boardJson_cloud);
    if (boardJson_cloud.mode == "arduino_cli") {
      this.arduinoCli.installCore(boardJson_cloud);
    } else if (boardJson_cloud.mode == "download_exec") {
      this.electronService.installcore(boardJson_cloud);
    }
  }

  async uninstallBoard(boardJson_cloud) {
    let filename = this.boardDict[boardJson_cloud.name].file
    this.electronService.delBoardJson(filename)
    this.configService.init()
  }

  isInstalled(boardName) {
    return this.boardList.includes(boardName)
  }



}
