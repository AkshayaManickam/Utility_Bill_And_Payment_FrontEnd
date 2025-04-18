import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const sessionId = localStorage.getItem('sessionId');
    
    let modifiedReq = req.clone({
      withCredentials: true  // 👈 Ensures cookies like JSESSIONID are sent
    });

    if (sessionId) {
      modifiedReq = modifiedReq.clone({
        setHeaders: {
          'X-Session-Id': sessionId
        }
      });
    }

    return next.handle(modifiedReq);
  }
}
