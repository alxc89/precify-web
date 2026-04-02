import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { SessionService } from '../session/session.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('redirects authenticated users to /app/ingredientes', () => {
    const router = TestBed.inject(Router);
    const session = TestBed.inject(SessionService);
    const navigateSpy = vi.spyOn(router, 'navigate');

    session.setSession('token', {
      email: 'chef@precify.test',
      id: 'user-1',
      name: 'Chef Gastao',
    });

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/app/ingredientes']);
  });
});
