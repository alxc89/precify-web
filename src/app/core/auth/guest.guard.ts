import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../session/session.service';

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isAuthenticated()) {
    return true;
  }

  router.navigate(['/app/ingredientes']);
  return false;
};
