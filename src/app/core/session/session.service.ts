import { Injectable, signal, computed } from '@angular/core';
import { AuthenticatedUserResponse } from '../api/generated';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly STORAGE_KEY = 'precify_auth_token';
  private readonly USER_KEY = 'precify_user';

  // Signals para estado reativo
  private _user = signal<AuthenticatedUserResponse | null>(this.loadUser());
  private _token = signal<string | null>(this.loadToken());

  public user = this._user.asReadonly();
  public token = this._token.asReadonly();
  public isAuthenticated = computed(() => !!this._token());

  setSession(token: string, user: AuthenticatedUserResponse) {
    sessionStorage.setItem(this.STORAGE_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  clearSession() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  private loadToken(): string | null {
    return sessionStorage.getItem(this.STORAGE_KEY);
  }

  private loadUser(): AuthenticatedUserResponse | null {
    const userJson = sessionStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
