import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APP } from '../../configs/app.config'

@Injectable({
  providedIn: 'root'
})
export class CloudService {

  constructor(
    private http: HttpClient
  ) { }


  getLibraries() {
    return this.http.get(APP.libraryUrl)
  }

  getBoards() {
    return this.http.get(APP.boardUrl)
  }

  getExamples() {
    return this.http.get(APP.exampleUrl)
  }

  loadExample(item) {
    return this.http.get(APP.website + item.url, { responseType: 'text' })
  }
}
