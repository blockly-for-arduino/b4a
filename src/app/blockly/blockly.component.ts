import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import Blockly from 'blockly';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ConfigService } from '../core/services/config.service';
import { initArduinoGenerator } from './arduino/arduino';
import { PromptComponent } from './prompt/prompt.component';
import { NewVarModalComponent } from './new-var-modal/new-var-modal.component';
import { BlocklyService } from './service/blockly.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VAR_TYPE } from './arduino/var.types';
import { CustomCategory } from './customCategory';

@Component({
  selector: 'clz-blockly',
  templateUrl: './blockly.component.html',
  styleUrls: ['./blockly.component.scss']
})
export class BlocklyComponent implements OnInit {

  code: string;

  workspace;
  generator: Blockly.Generator;

  @Output() public codeChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private blocklyService: BlocklyService,
    private configService: ConfigService,
    private modal: NzModalService,
    private message: NzMessageService
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
    this.blocklyService.changeLanguage('zhHans')
    // 加载block和toolbox
    await this.blocklyService.init()

    Blockly.registry.register(
      Blockly.registry.Type.TOOLBOX_ITEM,
      Blockly.ToolboxCategory.registrationName,
      CustomCategory, true);

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
    this.rewtireFunc()
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

  loadDefaultData() {
    let temp = `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <block type="arduino_setup" id="w%;fYz[)G_;{].azfgeM" x="30" y="30"></block>
      <block type="arduino_loop" id="RBk!NG-d?N5UZD3=Fkjd" x="330" y="30"></block>
    </xml>`
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

  VARTYPE = VAR_TYPE
  rewtireFunc() {
    Blockly.Variables.createVariableButtonHandler = (workspace, opt_callback, opt_type) => {
      this.modal.create({
        nzTitle: '添加变量',
        nzWidth: '350px',
        nzContent: NewVarModalComponent
      })
    };
    Blockly.Variables.flyoutCategoryBlocks = function (workspace) {
      let variableModelList = []
      VAR_TYPE.forEach(item => {
        variableModelList = variableModelList.concat(workspace.getVariablesOfType(item.value))
      })

      let xmlList: any[] = [];
      if (variableModelList.length > 0) {
        // New variables are added to the end of the variableModelList.
        const mostRecentVariable = variableModelList[variableModelList.length - 1];
        // if (Blocks['variables_set']) {
        const block = Blockly.utils.xml.createElement('block');
        block.setAttribute('type', 'variables_set');
        block.setAttribute('gap', 8);
        block.appendChild(Blockly.Variables.generateVariableFieldDom(mostRecentVariable));
        xmlList.push(block);
        // }
        // if (Blocks['variables_get']) {
        variableModelList.sort(Blockly.VariableModel.compareByName);
        for (let i = 0, variable; (variable = variableModelList[i]); i++) {
          const block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', 'variables_get');
          block.setAttribute('gap', 8);
          block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
          xmlList.push(block);
        }
        // }
      }
      return xmlList;
    };
  }

}

