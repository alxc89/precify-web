import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService, SessionContextResponse } from '../api/generated';
import { SessionService } from './session.service';

const SESSION_CONTEXT: SessionContextResponse = {
  isPlatformAdmin: false,
  mustChangePassword: false,
  organizationMemberships: [
    {
      code: 'PRECIFY',
      name: 'Precify Foods',
      organizationId: 'org-1',
    },
  ],
  storeMemberships: [
    {
      name: 'Loja Centro',
      organizationId: 'org-1',
      organizationName: 'Precify Foods',
      storeId: 'store-1',
    },
    {
      name: 'Loja Jardins',
      organizationId: 'org-1',
      organizationName: 'Precify Foods',
      storeId: 'store-2',
    },
  ],
  user: {
    email: 'admin@precify.com',
    id: 'user-1',
    name: 'Alex Costa',
  },
};

describe('SessionService', () => {
  const authApi = {
    apiV1AuthSessionGet: vi.fn(),
  };

  beforeEach(() => {
    sessionStorage.clear();
    authApi.apiV1AuthSessionGet.mockReset();

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authApi }],
    });
  });

  it('bootstraps the authenticated session and derives the current store context', async () => {
    sessionStorage.setItem('precify_auth_token', 'token');
    authApi.apiV1AuthSessionGet.mockReturnValue(of(SESSION_CONTEXT));

    const service = TestBed.inject(SessionService);
    await firstValueFrom(service.bootstrap());

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.name).toBe('Alex Costa');
    expect(service.currentStore()?.storeId).toBe('store-1');
    expect(service.currentOrganization()?.organizationId).toBe('org-1');
    expect(sessionStorage.getItem('precify_session_context')).toContain('Alex Costa');
  });

  it('restores the stored snapshot and keeps the selected store', () => {
    sessionStorage.setItem('precify_auth_token', 'token');
    sessionStorage.setItem('precify_session_context', JSON.stringify(SESSION_CONTEXT));
    sessionStorage.setItem('precify_current_store_id', 'store-2');

    const service = TestBed.inject(SessionService);

    expect(service.user()?.email).toBe('admin@precify.com');
    expect(service.currentStore()?.storeId).toBe('store-2');
    expect(service.currentOrganization()?.organizationId).toBe('org-1');
  });

  it('clears the session when bootstrap returns 401', async () => {
    sessionStorage.setItem('precify_auth_token', 'token');
    authApi.apiV1AuthSessionGet.mockReturnValue(throwError(() => ({ status: 401 })));

    const service = TestBed.inject(SessionService);
    const result = await firstValueFrom(service.bootstrap());

    expect(result).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
