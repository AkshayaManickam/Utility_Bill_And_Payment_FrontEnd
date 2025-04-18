import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  // Get all employees
  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, {
      withCredentials: true
    });
  }

  // Add a new employee
  addEmployee(employee: any, employeeEmail: string): Observable<any> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.post(`${this.apiUrl}/add`, employee, {
      headers,
      withCredentials: true
    });
  }

  // Update an existing employee
  updateEmployee(employee: any, employeeEmail: string): Observable<any> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.put(`${this.apiUrl}/${employee.id}`, employee, {
      headers,
      withCredentials: true
    });
  }

  // Delete an employee by ID
  deleteEmployee(id: number, employeeEmail: string): Observable<void> {
    const headers = new HttpHeaders().set('X-EMPLOYEE-EMAIL', employeeEmail);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers,
      withCredentials: true
    });
  }

  // Get employee details by ID
  getEmployeeById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  // Get employee count
  getEmployeeCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`, {
      withCredentials: true
    });
  }

  // Bulk upload employees (if applicable)
  uploadEmployees(file: FormData, employeeId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-upload?employeeId=${employeeId}`, file, {
      withCredentials: true
    });
  }
}
