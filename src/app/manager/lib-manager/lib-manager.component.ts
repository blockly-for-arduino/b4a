import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BlocklyService } from '../../blockly/service/blockly.service';
import { CloudService } from '../cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import Sortable from 'sortablejs';
import { ArduinoCliService } from '../../core/services/arduino-cli.service';
import { ElectronService } from '../../core/services/electron.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-lib-manager',
  templateUrl: './lib-manager.component.html',
  styleUrls: ['./lib-manager.component.scss']
})
export class LibManagerComponent implements OnInit {

  @ViewChild('libListBox', { static: false, read: ElementRef }) libListBox: ElementRef

  libManagerLoaded = false

  get libList() {
    return this.blocklyService.libList
  }

  get libDict() {
    return this.blocklyService.libDict
  }

  libList_cloud = []

  libList_install = [
    // {
    // "category": "IIC液晶显示屏",
    // "name": "LiquidCrystal_I2C",
    // "icon": "fal fa-mobile-android-alt",
    // "introduction": "IIC接口1602/4004液晶显示屏驱动库，适配OPENJUMPER、YWROBOT的IIC液晶显示屏。",
    // "colour": "#48c2c4",
    // "version": ["0.0.1"],
    // "author": "奈何col",
    // "url": "https://arduino.cn"
    // }
  ]

  constructor(
    private blocklyService: BlocklyService,
    private cloudService: CloudService,
    private message: NzMessageService,
    private arduinoCli: ArduinoCliService,
    private electronService: ElectronService
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
    this.getCloudData();
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

  getCloudData() {
    this.libList_cloud = [{
      "category": "IIC液晶显示屏",
      "name": "LiquidCrystal_I2C",
      "icon": "fal fa-mobile-android-alt",
      "introduction": "IIC接口1602/4004液晶显示屏驱动库，适配OPENJUMPER、YWROBOT的IIC液晶显示屏。",
      "colour": "#48c2c4",
      "version": ["0.0.1"],
      "author": "奈何col",
      "url": "https://arduino.cn"
    }]
    // 让版本选中下拉框显示最新版本
    this.initLibVersionSelected()
  }

  async installLib(libJson_cloud) {
    // 推到libList_install中，用于左侧显示lib正在安装
    this.libList_install.push(libJson_cloud)
    let libName = libJson_cloud.name
    // this.cloudService.getLibJson(libName).subscribe(async (libJson: any) => {
    //   // 安装B4a lib
    //   this.electronService.saveLibJson2LibraryPath(libName, libJson)
    //   // 安装arduino lib

    // })
    let libJson = await lastValueFrom(this.cloudService.getLibJson(libName))
    console.log(libJson);
    this.electronService.saveLibJson2LibraryPath(libName, libJson)
    await this.arduinoCli.installArduinoLib(libName)
    this.libList_install.splice(this.libList_install.indexOf(libName), 1)
    this.blocklyService.init()
  }

  openUrl(url) {
    this.electronService.openUrl(url)
  }

  initLibVersionSelected() {
    this.libList_cloud.map(lib => {
      lib['verisonSelected'] = lib.version[0]
    })
  }

}
