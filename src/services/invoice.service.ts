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

  getBillCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  updateInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/${invoice.id}`, invoice);
  }

  getInvoiceDetails(invoiceId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${invoiceId}`);
  }
}
