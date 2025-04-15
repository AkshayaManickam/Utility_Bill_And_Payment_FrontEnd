import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  addCustomer(customer: any, employeeEmail: string): Observable<any> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.post(`${this.apiUrl}/add`, customer, { headers });
  }

  uploadCustomers(file: FormData, employeeId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-upload?employeeId=${employeeId}`, file);
  }

  updateUser(user: any, employeeEmail: string): Observable<any> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.put(`${this.apiUrl}/${user.id}`, user, { headers });
  }
  

  deleteUser(id: number, employeeEmail: string): Observable<void> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
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
