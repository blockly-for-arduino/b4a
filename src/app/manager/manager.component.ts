import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BlocklyService } from '../blockly/service/blockly.service';
import { CloudService } from './cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {
  @Input() selectedTab = 0;

  @Output() backEvent = new EventEmitter()

  @ViewChild('libListBox', { static: false, read: ElementRef }) libListBox: ElementRef

  libManagerLoaded = false

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

      }
    })
  }

  async ngOnDestroy() {
    await this.blocklyService.updateToolbox()
  }

  back() {
    this.backEvent.emit()
  }

  loadExample(item) {
    this.cloudService.loadExample(item).subscribe(resp => {
      this.blocklyService.loadXml(resp);
      this.message.success(`示例 ${item.name} 加载成功`);
    }, err => {
      this.message.error(`示例 ${item.name} 加载失败`);
    })

  }

}
