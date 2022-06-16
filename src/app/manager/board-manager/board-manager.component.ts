import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import Sortable from 'sortablejs';
import { CloudService } from '../cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';

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

  constructor(
    private configService: ConfigService,
    private cloudService: CloudService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.getCloudData()
    this.message.warning('开发板加载功能正在开发中...')
  }

  getCloudData() {
    this.cloudService.getBoards().subscribe((resp: any) => {
      this.boardList_cloud = resp.data
      this.viewModeChange()
    })
  }

  initListSortable() {
    let sortable = new Sortable(this.boardListBox.nativeElement, {
      sort: true,
      delay: 0,
      animation: 150,
      dataIdAttr: "id",
      onEnd: () => {
        localStorage.setItem('libList', JSON.stringify(sortable.toArray()))
      }
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

}
