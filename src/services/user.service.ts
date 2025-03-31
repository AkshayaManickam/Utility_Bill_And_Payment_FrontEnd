import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users'; // Correct endpoint

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  addCustomer(customer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, customer);
  }

  uploadCustomers(file: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-upload`, file);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCustomerByServiceNo(serviceConnectionNo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/service/${serviceConnectionNo}`);
  }
  
  getUserCount(): Observable<number> {
    return this.http.get<number>(this.apiUrl);
  }

  getTotalConsumption(serviceConnectionNumber: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/consumption/${serviceConnectionNumber}`);
  }
}
