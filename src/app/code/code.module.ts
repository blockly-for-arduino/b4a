import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeComponent } from './code.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CodeComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    CodeComponent
  ]
})
export class CodeModule { }
