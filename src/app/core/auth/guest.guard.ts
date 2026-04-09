import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { SessionService } from '../session/session.service';

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.bootstrap().pipe(
    map(() => {
      if (!session.isAuthenticated()) {
        return true;
      }

      if (session.mustChangePassword()) {
        return router.createUrlTree(['/alterar-senha']);
      }

      return router.createUrlTree(['/app/ingredientes']);
    }),
    catchError(() => of(true)),
  );
};
