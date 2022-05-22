import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorComponent } from './monitor.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  declarations: [
    MonitorComponent
  ],
  imports: [
    CommonModule,
    NzInputModule,
    NzIconModule
  ],
  exports:[
    MonitorComponent
  ]
})
export class MonitorModule { }
