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

  // 重写blockly核心函数
  rewtireFunc() {
    this.workspace.registerButtonCallback('CREATE_VARIABLE_STRING', (button) => {
      console.log('CREATE_VARIABLE_STRING');
    });
    this.workspace.registerButtonCallback('CREATE_VARIABLE_LIST', (button) => {
      console.log('CREATE_VARIABLE_LIST');
    });

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

    Blockly.FieldVariable.dropdownCreate = function () {
      if (!this.variable_) {
        throw Error(
          'Tried to call dropdownCreate on a variable field with no' +
          ' variable selected.');
      }
      const name = this.getText();
      let variableModelList = [];
      if (this.sourceBlock_ && this.sourceBlock_.workspace) {
        const variableTypes = this.getVariableTypes_();
        // Get a copy of the list, so that adding rename and new variable options
        // doesn't modify the workspace's list.
        for (let i = 0; i < variableTypes.length; i++) {
          const variableType = variableTypes[i];
          const variables =
            this.sourceBlock_.workspace.getVariablesOfType(variableType);
          variableModelList = variableModelList.concat(variables);
        }
      }
      variableModelList.sort(Blockly.VariableModel.compareByName);

      const options = [];
      for (let i = 0; i < variableModelList.length; i++) {
        // Set the UUID as the internal representation of the variable.
        options[i] = [variableModelList[i].name, variableModelList[i].getId()];
      }
      options.push([Blockly.Msg['RENAME_VARIABLE'], 'RENAME_VARIABLE_ID']);
      options.push(['新建变量', 'NEW_VARIABLE']);
      if (Blockly.Msg['DELETE_VARIABLE']) {
        options.push([Blockly.Msg['DELETE_VARIABLE'].replace('%1', name), 'DELETE_VARIABLE_ID']);
      }

      return options;
    }

    Blockly.FieldVariable.onItemSelected_ = function (menu, menuItem) {
      const id = menuItem.getValue();
      // Handle special cases.
      if (this.sourceBlock_ && this.sourceBlock_.workspace) {
        // 新建变量
        if (id === 'NEW_VARIABLE') {

        } else if (id === 'RENAME_VARIABLE_ID') {
          // Rename variable.
          Blockly.Variables.renameVariable(
            this.sourceBlock_.workspace,
              /** @type {!VariableModel} */(this.variable_));
          return;
        } else if (id === 'DELETE_VARIABLE_ID') {
          // Delete variable.
          this.sourceBlock_.workspace.deleteVariableById(this.variable_.getId());
          return;
        }
      }
      // Handle unspecial case.
      this.setValue(id);
    }
  }

}

