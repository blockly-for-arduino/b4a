import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BlocklyService } from '../../blockly/service/blockly.service';
import { CloudService } from '../cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import Sortable from 'sortablejs';
import { ArduinoCliService } from '../../core/services/arduino-cli.service';
import { ElectronService } from '../../core/services/electron.service';
import { lastValueFrom } from 'rxjs';
import compareVersions from 'compare-versions';

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

  libList_cloud: any[] = []
  libList_cloud_tags: any[] = []
  libList_install: any[] = []

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
    this.cloudService.getLibraries().subscribe((resp: any) => {
      this.libList_cloud = resp.data;
      this.initLibVersionSelected()
    })
    this.cloudService.getLibrariesTags().subscribe((resp: any) => {
      this.libList_cloud_tags = resp.data
    })
  }

  async installLib(libJson_cloud) {
    try {
      libJson_cloud['loading'] = true
      // 推到libList_install中，用于左侧显示lib正在安装
      this.libList_install.push(libJson_cloud)
      let libName = libJson_cloud.name
      let libJson = await lastValueFrom(this.cloudService.getLibJson(libName))
      // 安装B4a lib
      this.electronService.saveLibJson(libName, libJson)
      // 安装arduino lib
      await this.arduinoCli.installArduinoLib(libName)
      this.libList_install.splice(this.libList_install.indexOf(libName), 1)
      libJson_cloud['state'] = true
      this.blocklyService.init()
      libJson_cloud['loading'] = false
      this.message.success('B4A库 ' + libJson_cloud.category + ' 安装成功')
    } catch (error) {
      this.message.error('B4A库 ' + libJson_cloud.category + '  安装出错：' + error)
    }
  }

  uninstallLib(libJson_cloud) {
    try {
      libJson_cloud['loading'] = true
      let libName = libJson_cloud.name
      // 移除B4a lib
      this.electronService.delLibJson(libName)
      libJson_cloud['state'] = false
      this.blocklyService.init()
      libJson_cloud['loading'] = false
      this.message.success('B4A库 ' + libJson_cloud.category + ' 移除成功')
    } catch (error) {
      this.message.error('B4A库 ' + libJson_cloud.category + ' 移除出错：' + error)
    }

  }

  updateLib(libJson_cloud) {

  }

  openUrl(url) {
    this.electronService.openUrl(url)
  }

  initLibVersionSelected() {
    this.libList_cloud.map(lib => {
      lib['verisonSelected'] = lib.version[0]
      lib['state'] = this.libList.includes(lib.name)
      lib['loading'] = false
      if (lib['state'])
        lib['newer'] = compareVersions(lib.version[0], this.libDict[lib.name].json.version) == 1
    })
  }

}
