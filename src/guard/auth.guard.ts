import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const sessionId = localStorage.getItem('sessionId');
    console.log('AuthGuard: Session ID:', sessionId);
  
    if (!sessionId) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
