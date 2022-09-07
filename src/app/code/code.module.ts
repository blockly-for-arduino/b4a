import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeComponent } from './code.component';
import { FormsModule } from '@angular/forms';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';

@NgModule({
  declarations: [
    CodeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzCodeEditorModule
  ],
  exports: [
    CodeComponent
  ]
})
export class CodeModule { }
