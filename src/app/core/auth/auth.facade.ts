import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { AuthService as ApiAuthService, LoginRequest } from '../api/generated';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly apiAuth = inject(ApiAuthService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  login(credentials: LoginRequest) {
    return this.apiAuth.apiV1AuthLoginPost(credentials).pipe(
      tap((response) => {
        if (response.accessToken) {
          this.session.setToken(response.accessToken);
        }
      }),
      switchMap((response) => {
        if (!response.accessToken) {
          return of(response);
        }

        return this.session.bootstrap(true).pipe(
          map((sessionContext) => {
            if (!sessionContext) {
              throw new Error('Nao foi possivel carregar a sessao autenticada.');
            }

            return response;
          }),
        );
      }),
      tap(() => {
        if (this.session.mustChangePassword()) {
          this.router.navigate(['/alterar-senha']);
          return;
        }

        this.router.navigate(['/app/ingredientes']);
      }),
    );
  }

  logout() {
    this.session.clearSession();
    this.router.navigate(['/login']);
  }
}
