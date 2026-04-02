import { Injectable, computed, signal } from '@angular/core';

export interface TopbarSearchConfig {
  readonly visible: boolean;
  readonly placeholder: string;
  readonly ariaLabel: string;
  readonly query: string;
}

const DEFAULT_TOPBAR_SEARCH_CONFIG: TopbarSearchConfig = {
  visible: false,
  placeholder: 'Buscar...',
  ariaLabel: 'Buscar',
  query: '',
};

@Injectable({
  providedIn: 'root',
})
export class TopbarSearchService {
  private readonly state = signal<TopbarSearchConfig>(DEFAULT_TOPBAR_SEARCH_CONFIG);

  readonly config = this.state.asReadonly();
  readonly query = computed(() => this.state().query);

  configure(config: Partial<Omit<TopbarSearchConfig, 'query'>> = {}) {
    this.state.update((current) => ({
      ...current,
      ...config,
      visible: config.visible ?? true,
    }));
  }

  setQuery(query: string) {
    this.state.update((current) => ({
      ...current,
      query,
    }));
  }

  reset() {
    this.state.set(DEFAULT_TOPBAR_SEARCH_CONFIG);
  }
}
