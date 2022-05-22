import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import Blockly from 'blockly';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ConfigService } from '../core/services/config.service';
import { initArduinoGenerator } from './arduino/arduino';
import { PromptComponent } from './prompt/prompt.component';
import { BlocklyService } from './service/blockly.service';

@Component({
  selector: 'clz-blockly',
  templateUrl: './blockly.component.html',
  styleUrls: ['./blockly.component.scss']
})
export class BlocklyComponent implements OnInit {

  code: string;

  workspace: Blockly.WorkspaceSvg;
  generator: Blockly.Generator;

  @Output() public codeChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private blocklyService: BlocklyService,
    private configService: ConfigService,
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
    // 初始化代码生成器
    this.generator = initArduinoGenerator()
    // 
    this.replacePrompt()
  }

  ngAfterViewInit(): void {
    this.configService.loaded.subscribe(async (state) => {
      if (state) {
        this.init()
      }
    })
  }

  async init() {
    const blocklyDiv = document.getElementById('blocklyDiv');

    // 加载block和toolbox
    await this.blocklyService.init()

    this.workspace = Blockly.inject(blocklyDiv, {
      readOnly: false,
      media: 'media/',
      trashcan: true,
      theme: 'zelos',
      renderer: 'zelos',
      move: {
        scrollbars: true,
        drag: true,
        wheel: false
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.5,
        scaleSpeed: 1.05,
        pinch: true
      },
      toolbox: this.blocklyService.toolbox,
    });
    this.blocklyService.workspace = this.workspace
    this.workspace.addChangeListener(event => this.onWorkspaceChange(event))
    this.loadTempData()
  }

  onWorkspaceChange(event) {
    if (event instanceof Blockly.Events.BlockMove ||
      event instanceof Blockly.Events.BlockDelete ||
      event instanceof Blockly.Events.BlockChange
    ) {
      this.code = this.generator.workspaceToCode(this.workspace);
      this.codeChange.emit(this.code);
      this.save();
    }
  }

  loadTempData() {
    let temp = localStorage.getItem('temp');
    if (temp == null) {
      temp = `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="arduino_setup" id="w%;fYz[)G_;{].azfgeM" x="30" y="30"></block>
        <block type="arduino_loop" id="RBk!NG-d?N5UZD3=Fkjd" x="330" y="30"></block>
      </xml>`
    }
    this.loadXml(temp);
  }

  save() {
    let xmlText = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(this.workspace));
    localStorage.setItem('temp', xmlText)
  }

  getXml() {
    return Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(this.workspace));
  }

  loadXml(xmlText) {
    try {
      let xmlDom = Blockly.Xml.textToDom(xmlText);
      this.workspace.clear();
      Blockly.Xml.domToWorkspace(xmlDom, this.workspace);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  reinit() {
    // this.save();
    // this.workspace.clear();
    this.init();
  }

  // electron用不了Prompt，这里替换成ng组件
  replacePrompt() {
    Blockly.dialog.setPrompt((message, defaultValue, callback) => {
      this.modal.create({
        nzTitle: message,
        nzWidth: '300px',
        nzContent: PromptComponent,
        nzComponentParams: {
          value: defaultValue
        },
        nzOnOk: e => {
          callback(e.value)
        }
      })
    });
  }

}

