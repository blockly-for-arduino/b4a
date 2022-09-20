import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { AppComponent } from './app.component';
import { BlocklyModule } from './blockly/blockly.module';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { IconDefinition } from '@ant-design/icons-angular';
import {
  CheckOutline, DownloadOutline, CodeOutline, FileAddOutline,
  SaveOutline, FolderOpenOutline, MonitorOutline, SettingOutline,
  RightOutline, RightCircleOutline, LoadingOutline, CloudOutline,
  SearchOutline, EnterOutline, AppstoreAddOutline, CloudDownloadOutline,
  LeftCircleOutline, GlobalOutline, GithubOutline, DeleteOutline,FolderOutline
} from '@ant-design/icons-angular/icons';
import { MonitorModule } from './monitor/monitor.module';
import { ShellModule } from './shell/shell.module';
import { CodeModule } from './code/code.module';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ManagerModule } from './manager/manager.module';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { GuideComponent } from './guide/guide.component';
const icons: IconDefinition[] = [CheckOutline, DownloadOutline, CodeOutline, FileAddOutline,
  SaveOutline, FolderOpenOutline, MonitorOutline, SettingOutline, RightOutline, RightCircleOutline,
  LoadingOutline, CloudOutline, SearchOutline, EnterOutline, AppstoreAddOutline, CloudDownloadOutline,
  LeftCircleOutline, GlobalOutline, GithubOutline, DeleteOutline,FolderOutline
];

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent, GuideComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CoreModule,
    // AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BlocklyModule,
    NzButtonModule,
    NzIconModule.forRoot(icons),
    NzSelectModule,
    NzDividerModule,
    MonitorModule,
    ShellModule,
    CodeModule,
    NzModalModule,
    NzToolTipModule,
    ManagerModule,
    NzMessageModule,
    NzProgressModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
