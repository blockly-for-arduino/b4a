import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingComponent } from './setting.component';
import { NzIconModule } from 'ng-zorro-antd/icon';


@NgModule({
  declarations: [
    SettingComponent
  ],
  imports: [
    CommonModule,
    NzIconModule
  ],
  exports: [
    SettingComponent
  ]
})
export class SettingModule { }
