import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../core/services/config.service';
import Blockly from 'blockly';
import * as zhHans from 'blockly/msg/zh-hans';
import { ElectronService } from '../../core/services/electron.service';
import { BehaviorSubject } from 'rxjs';
import { ToolBox } from '../arduino/toolbox';
import { LibInfo } from '../../core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class BlocklyService {
  libPath = './libraries';

  libList = []
  libDict = {}
  blockList = []
  toolbox = {}


  loaded = new BehaviorSubject(false)

  workspace: Blockly.WorkspaceSvg;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private electronService: ElectronService,
  ) {

  }

  async init() {
    // 加载库
    this.blockList = []
    this.toolbox = ToolBox

    this.processLibs(await this.electronService.loadLibraries())
    await this.loadLibs()

    Blockly.defineBlocksWithJsonArray(this.blockList);
    this.loaded.next(true)
  }

  processLibs(libraries: any[]) {
    let libList = JSON.parse(localStorage.getItem('libList'))
    if (libList == null) {
      this.libList = libraries.map(lib => lib.name)
      localStorage.setItem('libList', JSON.stringify(this.libList))
    } else {
      this.libList = libList
    }
    console.log('libList:', this.libList);
    libraries.forEach(lib => {
      this.libDict[lib.name] = lib
    })
  }

  async loadLibs() {
    for (let index = 0; index < this.libList.length; index++) {
      let libInfo = this.libDict[this.libList[index]];
      await this.loadLib(libInfo);
    }
  }

  loadLib(libInfo: LibInfo) {
    return new Promise(async (resolve, reject) => {
      // 避免重复加载
      if (libInfo.block) await this.loadLibJson(libInfo.block)
      if (libInfo.generator) await this.loadLibScript(libInfo.generator)
      if (libInfo.toolbox) await this.loadToolboxJson(libInfo.toolbox)
      resolve(true)
    })
  }

  async loadLibJson(path) {
    return new Promise(async (resolve, reject) => {
      this.loadUrl(path).subscribe(config => {
        let sourceJson: any = config
        let blockJsons = this.processJsonVariable(sourceJson)
        // b4a 代码创建器
        this.b4a2js(blockJsons)
        this.blockList = this.blockList.concat(blockJsons)
        resolve(true)
      })
    })
  }

  loadUrl(url) {
    return this.http.get(url, {
      responseType: 'json',
      headers: { 'Cache-Control': 'public,max-age=600' }
    })
  }

  b4a2js(blockJsons) {
    blockJsons.forEach(blockJson => {
      if (blockJson.b4a) {
        // console.log('b4a代码创建器 >>> ' + blockJson.type);
        let Arduino: any = window['Arduino']
        let getValue: any = window['getValue']
        Arduino[blockJson.type] = (block) => {
          // 添加宏
          if (blockJson.b4a.macro) {
            Arduino.addMacro(blockJson.b4a.macro, blockJson.b4a.macro)
          }
          // 添加库
          if (blockJson.b4a.library) {
            Arduino.addLibrary(blockJson.b4a.library, blockJson.b4a.library)
          }
          // b4a变量表，用于最后替换变量
          let b4aVars = {}

          if (blockJson.args0) {
            blockJson.args0.forEach(arg => {
              b4aVars['${' + arg.name + '}'] = getValue(block, arg.name)
            });
          }
          if (blockJson.args1) {
            blockJson.args1.forEach(arg => {
              b4aVars['${' + arg.name + '}'] = getValue(block, arg.name)
            });
          }

          if (blockJson.b4a.object) {
            let primary
            if (blockJson.b4a.primary) primary = processB4ACode(blockJson.b4a.primary, b4aVars);
            let className: string = blockJson.b4a.object.split(' ')[0]
            b4aVars['${OBJECT_NAME}'] = className.toLowerCase() + '_' + primary;
            let object_code = processB4ACode(blockJson.b4a.object, b4aVars)
            Arduino.addObject(b4aVars['${OBJECT_NAME}'], object_code)
          }
          if (blockJson.b4a.function) {
            let functionBody = processB4ACode(blockJson.b4a.function, b4aVars)
            console.log(functionBody);

            Arduino.addFunction(blockJson.b4a.function, functionBody)
          }
          if (blockJson.b4a.setup) {
            let setup_code = processB4ACode(blockJson.b4a.setup, b4aVars)
            Arduino.addSetup(b4aVars['${OBJECT_NAME}'], setup_code)
          }
          let code = processB4ACode(blockJson.b4a.code, b4aVars)
          return blockJson.output ? code : code + '\n'
        }
      }
      // 添加到toolbox
      if (blockJson.toolbox) {
        if (!blockJson.toolbox.show) return
        let categoryIsExist = false;
        this.toolbox['contents'].forEach(category => {
          if (category.name == blockJson.toolbox.category) {
            categoryIsExist = true
            let block = {
              kind: 'block',
              type: blockJson.type
            }
            if (blockJson.toolbox.inputs) {
              block['inputs'] = blockJson.toolbox.inputs
            }
            category.contents.push(block)
            return
          }
        });
        if (!categoryIsExist) {
          let category = {
            "kind": "category",
            "name": blockJson.toolbox.category,
            "colour": blockJson.colour,
            "contents": []
          }
          let block = {
            kind: 'block',
            type: blockJson.type
          }
          if (blockJson.toolbox.inputs) {
            block['inputs'] = blockJson.toolbox.inputs
          }
          category.contents.push(block)
          if (blockJson.toolbox.icon) {
            category["cssConfig"] = {
              "icon": blockJson.toolbox.icon
            }
          }
          this.toolbox['contents'].push(category)
        }
      }
    });
  }

  async loadToolboxJson(path) {
    return new Promise(async (resolve, reject) => {
      this.loadUrl(path).subscribe(
        (config: any) => {
          // console.log(config);
          this.toolbox['contents'].push(config)
          resolve(true)
        },
        error => {
          resolve(false)
        })
    })
  }

  loadLibScript(path) {
    return new Promise((resolve, reject) => {
      // if (this.libList[libName]) {
      //   resolve(true);
      //   return
      // }
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = path;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = (error: any) => resolve(false);
      document.getElementsByTagName('head')[0].appendChild(script);
    })
  }

  // 替换json配置中的board相关变量
  processJsonVariable(sourceJson) {
    let jsonString = JSON.stringify(sourceJson)
    let result = jsonString.match(/"\$\{board\.(\S*?)\}"/g)
    if (result != null) {
      // console.log(result);
      result.forEach(item => {
        let itemName = item.replace('"${', '').replace('}"', '')
        // console.log(itemName);
        let data = JSON.parse(JSON.stringify(this.configService.config))
        // console.log(data);
        itemName.split('.').forEach(el => {
          data = data[el]
        })
        jsonString = jsonString.replace(item, JSON.stringify(data))
      });
    }
    return JSON.parse(jsonString)
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

  updateToolbox(toolbox) {
    this.workspace.updateToolbox(toolbox);
  }

  changeTheme(theme) {

  }

  changeLanguage(language) {
    Blockly.setLocale(zhHans);
    Blockly.Msg["VARIABLES_DEFAULT_NAME"] = "var1"; // 这句为啥没生效
  }

}

function processB4ACode(code: string, vars: object): string {
  for (const varName in vars) {
    let reg = new RegExp('\\' + varName, 'g')
    code = code.replace(reg, vars[varName])
  }
  return code
}




