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

  saveInvoice(invoice: any, loggedInEmployeeId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/save?loggedInEmpId=${loggedInEmployeeId}`, invoice);
  }
  
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.baseUrl);
  }

  getBillCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  updateInvoice(invoice: Invoice, loggedInEmpId: string): Observable<Invoice> {
    return this.http.put<Invoice>(
      `${this.baseUrl}/${invoice.id}?loggedInEmpId=${loggedInEmpId}`,
      invoice
    );
  }
  
  getInvoiceDetails(invoiceId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${invoiceId}`);
  }
}
