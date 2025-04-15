import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = 'http://localhost:8080/api/employees'; // Correct endpoint

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  addEmployee(employee: any, loggedInEmpId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add?loggedInEmpId=${loggedInEmpId}`, employee);
  }

  updateEmployee(employee: any, loggedInEmpId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${employee.id}?loggedInEmpId=${loggedInEmpId}`, employee);
  }
  
  deleteEmployee(id: number, loggedInEmpId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}?loggedInEmpId=${loggedInEmpId}`);
  }
  
}
