import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { SessionService } from '../session/session.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const isAuthenticated = signal(false);
  const mustChangePassword = signal(false);
  const bootstrap = vi.fn(() => of(null));

  beforeEach(() => {
    sessionStorage.clear();
    isAuthenticated.set(false);
    mustChangePassword.set(false);
    bootstrap.mockReset();
    bootstrap.mockReturnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: {
            bootstrap,
            isAuthenticated,
            mustChangePassword,
          },
        },
      ],
    });
  });

  it('redirects anonymous users to /login', async () => {
    const result = (await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, { url: '/app/ingredientes' } as RouterStateSnapshot),
      ) as Observable<unknown>,
    )) as UrlTree;

    expect(result.toString()).toBe('/login');
  });

  it('redirects authenticated users with mandatory password change to /alterar-senha', async () => {
    bootstrap.mockReturnValue(of({} as never));
    isAuthenticated.set(true);
    mustChangePassword.set(true);

    const result = (await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, { url: '/app/ingredientes' } as RouterStateSnapshot),
      ) as Observable<unknown>,
    )) as UrlTree;

    expect(result.toString()).toBe('/alterar-senha');
  });

  it('allows authenticated users with a resolved session', async () => {
    bootstrap.mockReturnValue(of({} as never));
    isAuthenticated.set(true);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, { url: '/app/ingredientes' } as RouterStateSnapshot),
      ) as Observable<unknown>,
    );

    expect(result).toBe(true);
  });
});
