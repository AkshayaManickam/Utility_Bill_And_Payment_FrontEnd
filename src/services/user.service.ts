import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, {
      withCredentials: true
    });
  }

  addCustomer(customer: any, employeeEmail: string): Observable<any> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.post(`${this.apiUrl}/add`, customer, {
      headers,
      withCredentials: true
    });
  }

  uploadCustomers(file: FormData, employeeId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-upload?employeeId=${employeeId}`, file, {
      withCredentials: true
    });
  }

  updateUser(user: any, employeeEmail: string): Observable<any> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.put(`${this.apiUrl}/${user.id}`, user, {
      headers,
      withCredentials: true
    });
  }

  deleteUser(id: number, employeeEmail: string): Observable<void> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers,
      withCredentials: true
    });
  }

  getCustomerByServiceNo(serviceConnectionNo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/service/${serviceConnectionNo}`, {
      withCredentials: true
    });
  }

  getUserCount(): Observable<number> {
    return this.http.get<number>(this.apiUrl, {
      withCredentials: true
    });
  }

  getTotalConsumption(serviceConnectionNumber: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/consumption/${serviceConnectionNumber}`, {
      withCredentials: true
    });
  }
}
