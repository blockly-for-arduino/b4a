import { Component, OnInit } from '@angular/core';
import { BlocklyService } from '../../blockly/service/blockly.service'
import { ElectronService } from '../../core/services/electron.service';
@Component({
  selector: 'app-setting-manager',
  templateUrl: './setting-manager.component.html',
  styleUrls: ['./setting-manager.component.scss']
})
export class SettingManagerComponent implements OnInit {

  get theme() {
    let theme = localStorage.getItem('theme')
    if (theme == null)
      theme = 'geras'
    return theme
  }

  config = {
    language: 'chinese',
    theme: this.theme
  }

  constructor(
    private blocklyService: BlocklyService,
    private electronService: ElectronService
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    let version = this.electronService.package.version;
    // @ts-ignore
    document.getElementById('version').innerText = version;
  }

  themeChange() {
    this.blocklyService.changeTheme(this.config.theme)
  }

  languageChange() {

  }

}
