import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import Sortable from 'sortablejs';

@Component({
  selector: 'app-board-manager',
  templateUrl: './board-manager.component.html',
  styleUrls: ['./board-manager.component.scss']
})
export class BoardManagerComponent implements OnInit {
  @ViewChild('boardListBox', { static: false, read: ElementRef }) boardListBox: ElementRef
  boardManagerLoaded = false

  boardList_cloud=[]

  get boardList() {
    return this.configService.boardList
  }

  constructor(
    private configService: ConfigService
  ) { }

  ngOnInit(): void {

  }

  initListSortable() {
    let sortable = new Sortable(this.boardListBox.nativeElement, {
      sort: true,
      delay: 0,
      animation: 150,
      dataIdAttr: "id",
      onEnd: () => {
        localStorage.setItem('libList', JSON.stringify(sortable.toArray()))
      }
    })
  }

}
