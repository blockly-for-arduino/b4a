import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { BlocklyComponent } from './blockly/blockly.component';
import { ConfigService } from './core/services/config.service';
import { BlocklyService } from './blockly/service/blockly.service';
import { ArduinoCliService } from './core/services/arduino-cli.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SerialService } from './core/services/serial.service';
import { UpdateService } from './core/services/update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(BlocklyComponent) blocklyComponent;

  code: string = '';

  get boardList() {
    return this.configService.boardList
  }

  get serialList() {
    return this.serialService.serialList
  }

  serialSelected = '';
  boardSelected = '';

  libManagerWidth;


  get newVersion() {
    return this.updateService.newVersion
  }

  get progress() {
    return this.updateService.progress.percent
  }

  get percent() {
    return this.updateService.percent
  }

  get isDownloading() {
    return this.updateService.isDownloading
  }

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private configService: ConfigService,
    private blocklyService: BlocklyService,
    private arduinoCli: ArduinoCliService,
    private modal: NzModalService,
    private serialService: SerialService,
    private updateService: UpdateService,
    private cd: ChangeDetectorRef
  ) {
    this.translate.setDefaultLang('en');
    if (electronService.isElectron) {
      console.log('Run in electron');
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit(): void {
    this.checkGuide();
    this.configService.init();
    this.blocklyService.loaded.subscribe(state => {
      if (state) {
        // setTimeout(() => {
        //   let el: any = document.querySelector('.blocklyToolboxDiv')
        //   this.libManagerWidth = el.offsetWidth;
        // }, 100);
      }
    })
    this.configService.loaded.subscribe(state => {
      if (state) {
        this.checkGuide();
        if (this.configService.boardList.length == 0) this.showGuide = true
        this.serialSelected = this.configService.config.serial;
        if (this.configService.config.board != null)
          this.boardSelected = this.configService.config.board.name;
      }
    })
    setTimeout(() => {
      this.updateService.init()
      setTimeout(() => {
        this.cd.detectChanges()
      }, 3000);
    }, 3000);
  }

  showGuide = false;
  checkGuide() {
    if (localStorage.getItem('guide') == null) {
      this.showGuide = true
      return
    }
    if (this.configService.boardList.length == 0) {
      this.showGuide = true
      return
    }
    this.showGuide = false
  }


  ngAfterViewInit(): void {
    this.getSerialPortList();
  }

  codeChange(code) {
    this.code = code
  }

  newFile() {
    this.modal.confirm({
      nzTitle: '新建工程',
      nzContent: '当前工程未保存，您确定要放弃该工程，并新建？',
      nzOnOk: () =>
        this.blocklyComponent.loadDefaultData()
    })
  }

  saveFile() {
    this.electronService.saveFile(this.blocklyComponent.getJson())
  }

  openFile() {
    this.electronService.openFile().then(fileContent => {
      let json = JSON.parse(fileContent)
      this.blocklyComponent.loadJson(json);
    })
  }

  boardChange(e) {
    this.configService.selectBoard(e);
    setTimeout(() => {
      this.blocklyComponent.reinit();
    }, 1000);
  }

  serialChange(e) {
    this.configService.selectSerial(e)
  }

  async getSerialPortList() {
    await this.serialService.getSerialPortList()
  }

  showSider = false;
  mode = ''
  action = ''
  openSider(mode, action = '') {
    if (this.mode == mode && this.action == action) {
      this.closeSider()
    } else if (this.showSider) {
      this.closeSider()
      setTimeout(() => {
        this.mode = mode
        this.action = action
        this.showSider = true
        if (mode == 'shell')
          action == 'build' ? this.arduinoCli.build(this.code) : this.arduinoCli.upload(this.code)
      }, 310);
    } else {
      this.mode = mode
      this.action = action
      this.showSider = true
      if (mode == 'shell')
        action == 'build' ? this.arduinoCli.build(this.code) : this.arduinoCli.upload(this.code)
    }
  }

  willClose = false
  closeSider() {
    this.willClose = true;
    setTimeout(() => {
      this.willClose = false
      this.showSider = false
      this.showManager = false
      this.mode = ''
      this.action = ''
    }, 300);
  }

  openCloud() {
    // this.modal.create({
    //   nzTitle: '云资源',
    //   nzContent: CloudComponent,
    //   nzWidth: '60vw',
    //   nzFooter: null
    // })
  }

  gotoGithub() {
    this.electronService.openUrl("https://github.com/coloz/b4a");
  }

  gotoWebsite() {
    this.electronService.openUrl("https://b4a.clz.me");
  }

  showManager = false
  selectedTab = 0
  openManager(e) {
    this.selectedTab = e
    this.showManager = true
  }


  downloadUpdate() {
    this.updateService.download()
  }

  installUpdate() {
    this.updateService.install()
  }
}
