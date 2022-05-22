import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ConfigService } from '../core/services/config.service';
import { SerialService } from '../core/services/serial.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {

  @Input() serial: string;

  dataList = ['']

  constructor(
    private serialService: SerialService,
    private configService: ConfigService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.serialService.init(this.configService.config.serial);
    this.serialService.output.subscribe(str => {
      if (this.dataList.length > 999) this.clear()
      let dataArray = str.replace('\r', '').split(/\n/)
      this.dataList[this.dataList.length - 1] = this.dataList[this.dataList.length - 1] + dataArray[0]
      if (dataArray.length > 1) {
        for (let index = 1; index < dataArray.length; index++) {
          let data = dataArray[index];
          this.dataList.push(data)
        }
      }
      this.cd.detectChanges()
    })
  }

  ngOnDestroy(): void {
    this.serialService.close()
  }

  clear() {
    this.dataList = ['']
  }

  send() {

  }

}
