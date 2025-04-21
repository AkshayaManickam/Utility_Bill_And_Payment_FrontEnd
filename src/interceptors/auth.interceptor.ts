import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';  

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const sessionId = localStorage.getItem('sessionId');

    let modifiedReq = req.clone({
      withCredentials: true  
    });

    if (sessionId) {
      modifiedReq = modifiedReq.clone({
        setHeaders: {
          'X-Session-Id': sessionId
        }
      });
    }

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.toastr.error('Your session has expired. Please log in again.', 'Session Expired', {
            timeOut: 5000
          });
          localStorage.removeItem('sessionId');
          localStorage.clear();
          sessionStorage.clear();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 5000);  
        }
        return throwError(error);
      })
    );
  }
}
