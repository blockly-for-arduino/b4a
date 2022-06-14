import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerComponent } from './manager.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { LibManagerComponent } from './lib-manager/lib-manager.component';
import { BoardManagerComponent } from './board-manager/board-manager.component';
import { SettingManagerComponent } from './setting-manager/setting-manager.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';

@NgModule({
  declarations: [
    ManagerComponent,
    LibManagerComponent,
    BoardManagerComponent,
    SettingManagerComponent
  ],
  imports: [
    CommonModule,
    NzIconModule,
    NzCheckboxModule,
    NzButtonModule,
    FormsModule,
    NzSelectModule,
    NzDividerModule,
    NzRadioModule,
    NzInputModule,
    NzTagModule
  ],
  exports: [
    ManagerComponent
  ]
})
export class ManagerModule { }
