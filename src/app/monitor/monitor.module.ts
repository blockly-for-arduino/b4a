import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorComponent } from './monitor.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MonitorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzIconModule,
    NzSelectModule
  ],
  exports:[
    MonitorComponent
  ]
})
export class MonitorModule { }
