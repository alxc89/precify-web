import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SessionService } from '../session/session.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const session = inject(SessionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        session.clearSession();
        router.navigate(['/login']);
      }
      
      // Se houver um ProblemDetails, a mensagem virá no campo .detail do body
      const errorMessage = error.error?.detail || error.message || 'Erro desconhecido';
      console.error('[API Error]:', errorMessage);
      
      return throwError(() => error);
    })
  );
};
