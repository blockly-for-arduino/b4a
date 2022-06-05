import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {

  @Output() backEvent = new EventEmitter()
  constructor() { }

  ngOnInit(): void {
  }

  back() {
    this.backEvent.emit()
  }

}
