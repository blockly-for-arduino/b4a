import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent implements OnInit {

  // editorOptions = { theme: 'vs-dark', language: 'cpp', lineNumbers: 'on', };
  
  editor;
  @Input() code: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
