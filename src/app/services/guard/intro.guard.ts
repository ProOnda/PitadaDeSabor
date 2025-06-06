import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate():
   | boolean
   | UrlTree
   | Observable<boolean | UrlTree>
   | Promise<boolean | UrlTree> {

   const introSeen = localStorage.getItem('introSeen');

   if (introSeen === 'true') {
    this.router.navigate(['/login']);
    return false;
   }

   return true;
  }
}