import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
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
          "mode": "arduino_cli"
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
          "mode": "arduino_cli"
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
          "mode": "download_exec",
          "url": "https://dl.clz.me/esp8266_package_3.0.2_arduinocn.exe"
        },
        {
          "mode": "arduino_cli",
          "url": "https://www.arduino.cn/package_esp8266com_index.json"
        }
      ]
    }
  ]

  constructor(
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
  }

  async installBoard(index) {
    let boardJson_cloud = this.boardList[index]
    this.modal.create({
      nzContent: InstallShellComponent,
      nzTitle: '安装 ' + boardJson_cloud.name,
      nzClosable: false,
      nzFooter: null,
      nzMaskClosable: false,
      nzComponentParams: {
        boardJson_cloud: boardJson_cloud
      }
    })
    console.log(boardJson_cloud);
  }

}
