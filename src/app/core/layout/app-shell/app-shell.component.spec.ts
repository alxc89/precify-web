import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../api/generated';
import { AppShellComponent } from './app-shell.component';
import { TopbarSearchService } from '../topbar/topbar-search.service';

describe('AppShellComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            apiV1AuthSessionGet: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders sidebar, topbar and the configured topbar search input', () => {
    const topbarSearch = TestBed.inject(TopbarSearchService);
    topbarSearch.configure({
      ariaLabel: 'Buscar insumos ou categorias',
      placeholder: 'Buscar insumos ou categorias...',
      visible: true,
    });
    topbarSearch.setQuery('salmao');

    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-sidebar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-topbar')).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();

    const searchInput = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement | null;

    expect(searchInput).not.toBeNull();
    expect(searchInput?.value).toBe('salmao');
    expect(searchInput?.placeholder).toBe('Buscar insumos ou categorias...');
  });
});
