import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { BlocklyService } from '../blockly/service/blockly.service';
import { CloudService } from './cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import Sortable from 'sortablejs';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {

  @Output() backEvent = new EventEmitter()

  @ViewChild('libListBox', { static: false, read: ElementRef }) libListBox: ElementRef

  libManagerLoaded = false
  selectedTab = 0;

  get libList() {
    return this.blocklyService.libList
  }

  get libDict() {
    return this.blocklyService.libDict
  }

  constructor(
    private blocklyService: BlocklyService,
    private cloudService: CloudService,
    private message: NzMessageService,
  ) { }

  ngOnInit(): void {
    this.blocklyService.loaded.subscribe(state => {
      this.libManagerLoaded = state
      if (state) {
        setTimeout(() => {
          this.initListSortable()
        }, 1000);
      }
    })
  }

  back() {
    this.backEvent.emit()
  }

  initListSortable() {
    let sortable = new Sortable(this.libListBox.nativeElement, {
      sort: true,
      delay: 0,
      animation: 150,
      dataIdAttr: "id",
      onEnd: () => {
        localStorage.setItem('libList', JSON.stringify(sortable.toArray()))
      }
    })
  }

  libShowChange(e, libName) {
    this.blocklyService.libDict_show[libName] = {
      name: libName,
      show: e
    }
    localStorage.setItem('libDict_show', JSON.stringify(this.blocklyService.libDict_show))
  }

  loadExample(item) {
    this.cloudService.loadExample(item).subscribe(resp => {
      this.blocklyService.loadXml(resp);
      this.message.success(`示例 ${item.name} 加载成功`);
    }, err => {
      this.message.error(`示例 ${item.name} 加载失败`);
    })

  }

  loadLibrary(item) {

  }

  loadBoard(item) {

  }

}
