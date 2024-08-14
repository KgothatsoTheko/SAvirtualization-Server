import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { ApiService } from './api.service'; // Adjust the path as necessary
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  ctr = 0

  constructor(private router: Router, private apiService: ApiService, private _snackbar: MatSnackBar) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    req = req.clone({
      withCredentials: true,
    });

    return next.handle(req).pipe(catchError(x=> this.handleError(x)));

  }


private handleError(err:HttpErrorResponse): Observable<any> {
  if(err && err.status === 401 && this.ctr != 1) {
    this.ctr++
    let api = this.apiService
    api.refreshToken().subscribe({
      next:(x:any) => {
        this._snackbar.open("Tokens refreshed", 'Ok')
        return of("Token has been refreshed")
      },
      error: (err:any) => {
        sessionStorage.clear()
        this.router.navigateByUrl('/');
        return of(err.message)
      }
    })
    return of("Attemping to Refresh Token")
  }
  else {
    this.ctr = 0
    return throwError(()=> new Error("No Authenication Error"))
  }
}
}
