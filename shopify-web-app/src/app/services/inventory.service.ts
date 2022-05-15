import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  getWholeInventoryData() {
    return this.http.get(environment.apiBaseUrl + '/getWholeInventory', this.httpOptions);
  }

  deleteItem(item_id: any) {
    return this.http.delete(environment.apiBaseUrl + '/deleteItem/' + item_id, this.httpOptions);
  }

  restorableDeleteItem(item: any) {
    return this.http.post(environment.apiBaseUrl + '/restorableDeleteItem', item, this.httpOptions);
  }

  restoreItem(item: any) {
    return this.http.post(environment.apiBaseUrl + '/restoreItem', item, this.httpOptions);
  }

  updateItem(item: any) {
    return this.http.put(environment.apiBaseUrl + '/updateItem', item, this.httpOptions);
  }

  addItem(item: any) {
    return this.http.post(environment.apiBaseUrl + '/addItem', item, this.httpOptions);
  }

}
