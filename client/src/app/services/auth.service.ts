import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly BACKEND_URL = environment.serviceUrls.backendUrl;
  private readonly TOKEN_KEY = 'token';

  constructor(
    private httpClient: HttpClient,
    private matSnackBar: MatSnackBar,
  ) {}

  public login(username: string, password: string): Observable<User> {
    return this.httpClient
      .post<User>(`${this.BACKEND_URL}/api/auth/login`, {
        username,
        password,
      })
      .pipe(
        map(user => {
          if (user?.accessToken) {
            localStorage.setItem(this.TOKEN_KEY, user.accessToken);
          }
          return user;
        }),
      );
  }

  public signUp(username: string, password: string): Observable<User> {
    return this.httpClient
      .post<User>(`${this.BACKEND_URL}/api/auth/sign-up`, {
        username,
        password,
      })
      .pipe(
        map(user => {
          if (user?.accessToken) {
            localStorage.setItem(this.TOKEN_KEY, user.accessToken);
          }
          return user;
        }),
      );
  }

  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.matSnackBar.open('Logout successful', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
    });
  }

  public isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    return !this.isAccessTokenExpired();
  }

  public getUserDetails() {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    return { username: jwtDecode(token)['username'] };
  }

  public getAccessToken(): string {
    return localStorage.getItem(this.TOKEN_KEY) || '';
  }

  private isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return true;
    }

    const decodedToken = jwtDecode(token);
    const isTokenExpired = Date.now() > decodedToken['exp']! * 1000;
    if (isTokenExpired) {
      this.logout();
    }

    return isTokenExpired;
  }
}
