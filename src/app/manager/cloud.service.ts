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

  getLibrariesTags(){
    return this.http.get('https://b4a.clz.me/libraries-tags.json')
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

  getLibJson(libName) {
    return this.http.get(`http://b4a.clz.me/libraries/${libName}.json`)
  }
}
