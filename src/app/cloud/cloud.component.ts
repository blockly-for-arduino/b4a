import { Component, OnInit } from '@angular/core';
import { BlocklyService } from '../blockly/service/blockly.service';
import { CloudService } from './cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-cloud',
  templateUrl: './cloud.component.html',
  styleUrls: ['./cloud.component.scss']
})
export class CloudComponent implements OnInit {

  tabs = [
    {
      name: '示例程序',
      icon: 'fal fa-file-code',
    },
    {
      name: '函数库',
      icon: 'fal fa-book'
    },
    {
      name: '开发板',
      icon: 'fal fa-microchip'
    }
  ];

  selectedIndex = 0;

  exampleList = []
  librariesList = []
  boardList = []

  constructor(
    private cloudService: CloudService,
    private blocklyService: BlocklyService,
    private message: NzMessageService,
    private modal: NzModalRef
  ) { }

  ngOnInit(): void {
    this.selectedIndexChange(0)
  }

  selectedIndexChange(e) {
    switch (e) {
      case 0:
        this.cloudService.getExamples().subscribe((resp: any) => {
          this.exampleList = resp
        })
        break;
      case 1:
        this.cloudService.getLibraries().subscribe((resp: any) => {
          this.librariesList = resp
        })
        break;
      case 2:
        this.cloudService.getBoards().subscribe((resp: any) => {
          this.boardList = resp
        })
        break;
    }
  }

  loadExample(item) {
    this.cloudService.loadExample(item).subscribe(resp => {
      this.blocklyService.loadXml(resp);
      this.message.success(`示例 ${item.name} 加载成功`);
      this.modal.close();
    })

  }

  loadLibrary(item) {

  }

  loadBoard(item) {

  }

}
