import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocklyComponent } from './blockly.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PromptComponent } from './prompt/prompt.component';

@NgModule({
  declarations: [
    BlocklyComponent,
    PromptComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NzModalModule,
    NzInputModule,
    NzButtonModule,
    FormsModule
  ],
  exports: [
    BlocklyComponent
  ]
})
export class BlocklyModule { }
