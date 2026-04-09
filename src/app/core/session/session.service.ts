import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AuthService,
  SessionContextResponse,
  SessionOrganizationMembershipResponse,
  SessionStoreMembershipResponse,
  SessionUserResponse,
} from '../api/generated';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly authApi = inject(AuthService);

  private readonly TOKEN_KEY = 'precify_auth_token';
  private readonly SESSION_KEY = 'precify_session_context';
  private readonly CURRENT_STORE_KEY = 'precify_current_store_id';
  private readonly LEGACY_USER_KEY = 'precify_user';

  private readonly _token = signal<string | null>(null);
  private readonly _sessionContext = signal<SessionContextResponse | null>(null);
  private readonly _currentStoreId = signal<string | null>(null);
  private readonly _isBootstrapping = signal(false);
  private readonly _isHydrated = signal(false);

  private bootstrapRequest$: Observable<SessionContextResponse | null> | null = null;
  private hasBootstrapped = false;

  readonly token = this._token.asReadonly();
  readonly sessionContext = this._sessionContext.asReadonly();
  readonly isBootstrapping = this._isBootstrapping.asReadonly();
  readonly isHydrated = this._isHydrated.asReadonly();

  readonly user = computed<SessionUserResponse | null>(() => this._sessionContext()?.user ?? null);
  readonly mustChangePassword = computed(() => this._sessionContext()?.mustChangePassword ?? false);
  readonly isPlatformAdmin = computed(() => this._sessionContext()?.isPlatformAdmin ?? false);
  readonly organizationMemberships = computed<readonly SessionOrganizationMembershipResponse[]>(
    () => this._sessionContext()?.organizationMemberships ?? [],
  );
  readonly storeMemberships = computed<readonly SessionStoreMembershipResponse[]>(
    () => this._sessionContext()?.storeMemberships ?? [],
  );
  readonly currentStore = computed<SessionStoreMembershipResponse | null>(() => {
    const memberships = this.storeMemberships().filter(
      (membership): membership is SessionStoreMembershipResponse & { storeId: string } =>
        !!membership.storeId,
    );

    if (memberships.length === 0) {
      return null;
    }

    const selectedStoreId = this._currentStoreId();
    return memberships.find((membership) => membership.storeId === selectedStoreId) ?? memberships[0];
  });
  readonly currentOrganization = computed<SessionOrganizationMembershipResponse | null>(() => {
    const memberships = this.organizationMemberships().filter(
      (membership): membership is SessionOrganizationMembershipResponse & { organizationId: string } =>
        !!membership.organizationId,
    );
    const currentStore = this.currentStore();

    if (currentStore?.organizationId) {
      return (
        memberships.find((membership) => membership.organizationId === currentStore.organizationId) ?? {
          code: currentStore.organizationCode ?? null,
          name: currentStore.organizationName ?? null,
          organizationId: currentStore.organizationId,
        }
      );
    }

    return memberships[0] ?? null;
  });
  readonly currentOrganizationId = computed(() => this.currentOrganization()?.organizationId ?? null);
  readonly currentStoreId = computed(() => this.currentStore()?.storeId ?? null);
  readonly hasStoreContext = computed(() => !!this.currentStore()?.storeId);
  readonly isAuthenticated = computed(() => !!this._token() && !!this.user()?.id);

  constructor() {
    this.restoreFromStorage();
  }

  setToken(token: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.removeItem(this.LEGACY_USER_KEY);
    this._token.set(token);
    this.bootstrapRequest$ = null;
    this._isBootstrapping.set(false);
    this.clearStoredContext();
    this._isHydrated.set(false);
    this.hasBootstrapped = false;
  }

  bootstrap(force = false) {
    const token = this._token();

    if (!token) {
      this._isHydrated.set(true);
      this.hasBootstrapped = true;
      return of(null);
    }

    if (!force && this.bootstrapRequest$) {
      return this.bootstrapRequest$;
    }

    if (!force && this.hasBootstrapped) {
      return of(this._sessionContext());
    }

    const fallbackContext = this._sessionContext();
    this._isBootstrapping.set(true);

    const request$ = this.authApi.apiV1AuthSessionGet().pipe(
      tap((context) => {
        this.persistContext(context);
        this._isHydrated.set(true);
        this.hasBootstrapped = true;
      }),
      catchError((error: { status?: number }) => {
        if (error.status === 401) {
          this.clearSession();
          return of(null);
        }

        if (fallbackContext) {
          this._isHydrated.set(true);
          this.hasBootstrapped = true;
          return of(fallbackContext);
        }

        this._isHydrated.set(true);
        this.hasBootstrapped = true;
        return throwError(() => error);
      }),
      finalize(() => {
        this.bootstrapRequest$ = null;
        this._isBootstrapping.set(false);
      }),
      shareReplay(1),
    );

    this.bootstrapRequest$ = request$;
    return request$;
  }

  clearSession() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.CURRENT_STORE_KEY);
    sessionStorage.removeItem(this.LEGACY_USER_KEY);
    this._token.set(null);
    this._sessionContext.set(null);
    this._currentStoreId.set(null);
    this.bootstrapRequest$ = null;
    this._isBootstrapping.set(false);
    this._isHydrated.set(true);
    this.hasBootstrapped = true;
  }

  restoreFromStorage() {
    sessionStorage.removeItem(this.LEGACY_USER_KEY);

    const token = this.loadToken();
    const sessionContext = this.loadSessionContext();
    const currentStoreId = this.loadCurrentStoreId();

    this._token.set(token);
    this._sessionContext.set(sessionContext);
    this._currentStoreId.set(currentStoreId);
    this.syncCurrentStoreSelection(sessionContext);
    this._isHydrated.set(!token || !!sessionContext);
    this.hasBootstrapped = !token;

    if (!token && (sessionContext || currentStoreId)) {
      this.clearStoredContext();
    }
  }

  setCurrentStore(storeId: string) {
    const membership = this.storeMemberships().find((item) => item.storeId === storeId);

    if (!membership?.storeId) {
      return;
    }

    this.persistCurrentStoreId(membership.storeId);
  }

  private persistContext(context: SessionContextResponse) {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(context));
    this._sessionContext.set(context);
    this.syncCurrentStoreSelection(context);
  }

  private syncCurrentStoreSelection(context: SessionContextResponse | null) {
    const memberships = context?.storeMemberships?.filter(
      (membership): membership is SessionStoreMembershipResponse & { storeId: string } =>
        !!membership.storeId,
    ) ?? [];
    const selectedStoreId = this._currentStoreId();

    if (selectedStoreId && memberships.some((membership) => membership.storeId === selectedStoreId)) {
      return;
    }

    this.persistCurrentStoreId(memberships[0]?.storeId ?? null);
  }

  private clearStoredContext() {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.CURRENT_STORE_KEY);
    this._sessionContext.set(null);
    this._currentStoreId.set(null);
  }

  private persistCurrentStoreId(storeId: string | null) {
    if (storeId) {
      sessionStorage.setItem(this.CURRENT_STORE_KEY, storeId);
    } else {
      sessionStorage.removeItem(this.CURRENT_STORE_KEY);
    }

    this._currentStoreId.set(storeId);
  }

  private loadToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  private loadSessionContext() {
    const rawContext = sessionStorage.getItem(this.SESSION_KEY);

    if (!rawContext) {
      return null;
    }

    try {
      return JSON.parse(rawContext) as SessionContextResponse;
    } catch {
      sessionStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }

  private loadCurrentStoreId() {
    return sessionStorage.getItem(this.CURRENT_STORE_KEY);
  }
}
