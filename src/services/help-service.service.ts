import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelpServiceService {
  private apiUrl = 'http://localhost:8080/api/help'; 

  constructor(private http: HttpClient) {}

  getAllHelpRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  updateHelpStatus(id: number, status: string, empId: string): Observable<any> {
    const payload = { status, empId };
    return this.http.put(`${this.apiUrl}/update-status/${id}`, payload);
  }
}

