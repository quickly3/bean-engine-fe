import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export type UserInfo = Record<string, unknown>;

export interface LoginResponse {
  accessToken?: string;
  token?: string;
  user?: UserInfo;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiURL: string;
  private readonly tokenKey = 'accessToken';

  constructor(private http: HttpClient) {
    this.apiURL = environment.apiURL;
  }

  login = (params: { username: string; password: string }) => {
    return this.http.post<LoginResponse>(this.apiURL + '/auth/login', params);
  };

  getProfile = () => {
    return this.http.get<UserInfo>(this.apiURL + '/auth/profile', {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`,
      }),
    });
  };

  getToken = () => {
    return localStorage.getItem(this.tokenKey) || '';
  };

  isLoggedIn = () => {
    return !!this.getToken();
  };

  setToken = (token: string) => {
    localStorage.setItem(this.tokenKey, token);
  };

  clearToken = () => {
    localStorage.removeItem(this.tokenKey);
  };
}
