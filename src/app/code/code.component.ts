import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent implements OnInit {

  editorOptions = { theme: 'vs-dark', language: 'cpp', lineNumbers: 'on', };
  editor;
  @Input() code: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.editor = monaco.editor.create(document.getElementById('container'), {
      value: this.code,
      language: 'cpp',
      theme: 'vs-dark',
      lineNumbers: 'on'
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] && this.editor) {
      this.editor.setValue(this.code)
    }
  }

}
