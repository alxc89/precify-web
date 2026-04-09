import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { SessionService } from '../session/session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.bootstrap().pipe(
    map(() => {
      if (!session.isAuthenticated()) {
        return router.createUrlTree(['/login']);
      }

      if (session.mustChangePassword() && !state.url.startsWith('/alterar-senha')) {
        return router.createUrlTree(['/alterar-senha']);
      }

      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
