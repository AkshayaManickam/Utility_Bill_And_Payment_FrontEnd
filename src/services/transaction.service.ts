import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  transactionId: number;
  invoice: {
    id: number;
    serviceConnectionNumber: string;
  };
  totalAmount: number;
  discountType: string;
  amountPaid: number;
  paymentMethod: string;
  transactionStatus: string;
  transactionDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'http://localhost:8080/transactions';

  constructor(private http: HttpClient) {}

  saveTransaction(transaction: any, loggedInEmpId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save?loggedInEmpId=${loggedInEmpId}`, transaction);
  }
  
  getAllTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

}
