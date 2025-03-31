import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../model/Invoice';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl = 'http://localhost:8080/api/invoices';

  constructor(private http: HttpClient) {}

  saveInvoice(invoice: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, invoice);
  }
  
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.baseUrl);
  }
}
