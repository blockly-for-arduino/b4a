import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal'
import Blockly from 'blockly';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BlocklyService } from '../service/blockly.service';
import { VAR_TYPE } from '../arduino/var.types';

@Component({
  selector: 'app-new-var-modal',
  templateUrl: './new-var-modal.component.html',
  styleUrls: ['./new-var-modal.component.scss']
})
export class NewVarModalComponent implements OnInit {

  varType = 'b4aVariable'
  varName = ''

  isObject = false

  VAR_TYPE = VAR_TYPE

  constructor(
    private modal: NzModalRef,
    private message: NzMessageService,
    private blocklyService: BlocklyService
  ) { }

  ngOnInit(): void {    
    this.isObject = !this.VAR_TYPE.map(el => el.value).includes(this.varType)
  }

  addVar() {
    if (this.varName == '') {
      this.message.warning('变量名不能为空')
      return
    }
    let existing = Blockly.Variables.nameUsedWithAnyType(this.varName, this.blocklyService.workspace);
    if (existing) {
      this.message.warning('变量名已存在');
    } else {
      this.blocklyService.workspace.createVariable(this.varName, this.varType);
      this.modal.triggerOk()
      // this.modal.close({ varType: this.varType, varName: this.varName })
    }
  }

}
