import {Location } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private location: Location) { }

  get(key: string, sessionType: string) {
    const data = sessionType == 'session' ? sessionStorage.getItem(key) : localStorage.getItem(key)
    return data ? JSON.parse(data) : data
  }

  set(key:string, value:any, sessionType:string) {
    const data = sessionType == 'session' ? sessionStorage.setItem(key, value) : localStorage.setItem(key, value)
    return data
  }

  goBack() {
    this.location.back()
  }
}
