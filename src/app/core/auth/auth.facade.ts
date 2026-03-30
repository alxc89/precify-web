import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { AuthService as ApiAuthService, LoginRequest } from '../api/generated';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private apiAuth = inject(ApiAuthService);
  private session = inject(SessionService);
  private router = inject(Router);

  login(credentials: LoginRequest) {
    return this.apiAuth.apiV1AuthLoginPost(credentials).pipe(
      tap(res => {
        if (res.accessToken && res.user) {
          this.session.setSession(res.accessToken, res.user);
        }
      }),
      map(res => {
        if (res.mustChangePassword) {
          this.router.navigate(['/alterar-senha']);
          return res;
        }
        this.router.navigate(['/app/dashboard']);
        return res;
      })
    );
  }

  logout() {
    this.session.clearSession();
    this.router.navigate(['/login']);
  }
}
