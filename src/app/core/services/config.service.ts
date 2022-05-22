import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardConfig } from '../interfaces';
import { ElectronService } from './electron.service';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  loaded = new BehaviorSubject(false)

  config = {
    board: null,
    serial: ''
  }

  boardList = []

  constructor(
    private electronService: ElectronService,
    private serialService: SerialService
  ) {
  }

  async init() {
    this.boardList = await this.electronService.getBoardList()
    // 加载暂存的开发板信息
    let boardName = localStorage.getItem('config.boardName')
    if (boardName != null) {
      this.selectBoard(boardName)
    } else {
      this.selectBoard('Arduino UNO')
    }
    // 加载暂存的串口信息
    let serial = localStorage.getItem('config.serial')
    if (serial != null) {
      this.config.serial = serial
    }
    this.loaded.next(true)
  }

  selectBoard(boardName: string) {
    let boardConfig: BoardConfig = null;
    for (let index = 0; index < this.boardList.length; index++) {
      boardConfig = this.boardList[index];
      if (boardConfig.name == boardName) break;
    }
    this.config.board = boardConfig;
    localStorage.setItem('config.boardName', boardName)
  }

  selectSerial(serial: string) {
    this.config.serial = serial
    localStorage.setItem('config.serial', serial)
  }

}


