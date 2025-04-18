import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

   private readonly SESSION_ID_KEY = 'sessionId';
  // Generate OTP (sends email to backend)
  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email }, { withCredentials: true });
  }
  
  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp }, { withCredentials: true });
  }
  
  isLoggedIn(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/session-status`, { withCredentials: true });
  }
  
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
  
  
  getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_ID_KEY);
  }

}
