import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudComponent } from './cloud.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal'
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  declarations: [
    CloudComponent
  ],
  imports: [
    CommonModule,
    NzTabsModule,
    NzButtonModule,
    NzMessageModule,
    NzModalModule,
    NzInputModule,
    NzIconModule
  ],
  exports: [
    CloudComponent
  ]
})
export class CloudModule { }
