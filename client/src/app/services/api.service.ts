import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  serverUrl = "http://localhost:217"

  constructor(private http: HttpClient) { }

  login(body: any) {
    return this.http.post(`${this.serverUrl}/login`, body, {
      
      withCredentials: true, // Important for sending cookies like JWT tokens
    });
  }

  refreshToken(){
    return this.http.post(`${this.serverUrl}/token`, {}, {
      
      withCredentials: true, // Important for sending cookies like JWT tokens
    });
  }

  genericPost(endpoint:any, body:any) {
    return this.http.post(this.serverUrl + endpoint, body)
  }

  genericGet(endpoint:string) {
    return this.http.get(this.serverUrl + endpoint, {
      responseType: 'blob',
      withCredentials: true, // Important for sending cookies like JWT tokens
    })
  }

  genericBarcode(endpoint: string) {
    return this.http.get(`${this.serverUrl}${endpoint}`, {
      responseType: 'blob', // Important to get the image as a Blob
      withCredentials: true, // Important for cookies like JWT tokens
    });
  }

  generateBarcode2(text: any) {
    return this.http.post(`${this.serverUrl}/generate-barcode2`, text, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  genericDelete(endpoint:string) {
    return this.http.delete(this.serverUrl + endpoint)
  }

  genericUpdate(endpoint:any, body:any) {
    return this.http.post(this.serverUrl + endpoint, body)
  }
}
