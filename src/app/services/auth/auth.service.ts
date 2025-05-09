// src/app/services/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  message: string;
  nome?: string;
  token?: string; // Adicione esta linha
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private userNameSubject = new BehaviorSubject<string | null>(localStorage.getItem('userName'));
  userName$ = this.userNameSubject.asObservable();
  private authTokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  authToken$ = this.authTokenSubject.asObservable();

  constructor(private http: HttpClient) { }

  cadastrar(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cadastro`, userData);
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
        tap((response) => {
            if (response.nome) {
                localStorage.setItem('userName', response.nome);
                this.userNameSubject.next(response.nome);
            }
            if (response.token) {
                localStorage.setItem('token', response.token);
                this.authTokenSubject.next(response.token);
            }
        })
    );
  }

  getUserName(): string | null {
    return this.userNameSubject.value;
  }

  getAuthToken(): string | null {
    return this.authTokenSubject.value;
  }

  logout(): void {
    localStorage.removeItem('userName');
    this.userNameSubject.next(null);
    localStorage.removeItem('token');
    this.authTokenSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.authTokenSubject.value;
  }

  getToken(): string | null {
    return this.authTokenSubject.value;
  }

  addTokenToHeaders(headers: any): any {
    const token = this.getToken();
    if (token) {
      headers = { ...headers, 'Authorization': `Bearer ${token}` };
    }
    return headers;
  }
}