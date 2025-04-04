import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:8080/api/payment';

  constructor(private http: HttpClient) {}

  calculatePayment(invoiceId: string, discountType: string): Observable<number> {
    if (!invoiceId || !discountType) {
      return throwError(() => new Error('Invalid input!'));
    }

    return this.http.get<number>(`${this.baseUrl}/calculate?invoiceId=${invoiceId}&discountType=${discountType}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching payment amount:', error);
          return throwError(() => error);
        })
      );
  }

  
  getTodayAmount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/today-amount`);
  }
}
