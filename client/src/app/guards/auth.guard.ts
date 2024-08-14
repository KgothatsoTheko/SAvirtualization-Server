import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private api: ApiService, private router:Router){}
  canActivate(): Observable<boolean> {
    return this.api.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/login']);
        return new Observable<boolean>(observer => observer.next(false));
      })
    );
  }
  
}
