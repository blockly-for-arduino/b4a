import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BoardJsonCloud } from '../core/interfaces';
import { ElectronService } from '../core/services';
import { InstallShellComponent } from '../manager/board-manager/install-shell/install-shell.component';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit {

  boardList = [
    {
      "name": "Arduino UNO",
      "description": "Arduino UNO及兼容开发板",
      "verison": "0.0.1",
      "author": "奈何col",
      "vender": "Arduino",
      "core": "arduino:avr@1.8.5",
      "img": "arduino_uno.png",
      "file": "https://b4a.clz.me/boards/uno.json",
      "help": "https://www.arduino.cn/",
      "core_setup": [
        {
          "mode": "git_7z",
          "url": "https://e.coding.net/coloz/arduino-packages/avr.git"
        }
      ]
    },
    {
      "name": "Arduino MEGA",
      "description": "Arduino MEGA及兼容开发板",
      "verison": "0.0.1",
      "author": "奈何col",
      "vender": "Arduino",
      "core": "arduino:avr@1.8.5",
      "img": "arduino_mega.png",
      "file": "https://b4a.clz.me/boards/mega.json",
      "help": "https://www.arduino.cn/",
      "core_setup": [
        {
          "mode": "git_7z",
          "url": "https://e.coding.net/coloz/arduino-packages/avr.git"
        }
      ]
    },
    {
      "name": "WiFiduino",
      "description": "OpenJumper WiFiduino",
      "verison": "0.0.1",
      "author": "OpenJumper",
      "vender": "OpenJumper",
      "core": "esp8266:esp8266@3.0.2",
      "img": "wifiduino.png",
      "file": "https://b4a.clz.me/boards/wifiduino.json",
      "help": "https://www.arduino.cn/",
      "core_setup": [
        {
          "mode": "git_7z",
          "url": "https://e.coding.net/coloz/arduino-packages/esp8266.git"
        }
      ]
    }
  ]

  constructor(
    private modal: NzModalService,
    private electronService:ElectronService
  ) { }

  ngOnInit(): void {
  }

  async installBoard(index) {
    let boardJson_cloud: BoardJsonCloud = this.boardList[index]
    this.modal.create({
      nzContent: InstallShellComponent,
      nzClosable: false,
      nzFooter: null,
      nzMaskClosable: false,
      nzComponentParams: {
        boardJson_cloud: boardJson_cloud
      }
    })
  }

  openUrl(url){
    this.electronService.openUrl(url);
  }

}
