import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BlocklyService } from '../../blockly/service/blockly.service';
import { CloudService } from '../cloud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import Sortable from 'sortablejs';
import { ArduinoCliService } from '../../core/services/arduino-cli.service';

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

  constructor(
    private blocklyService: BlocklyService,
    private cloudService: CloudService,
    private message: NzMessageService,
    private arduinoCli: ArduinoCliService
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

  async installLib(libName = 'LiquidCrystal_I2C') {
    this.arduinoCli.installLib(libName)
  }

}
