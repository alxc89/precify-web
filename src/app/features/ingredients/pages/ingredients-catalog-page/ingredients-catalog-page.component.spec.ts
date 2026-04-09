import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SessionService } from '../../../../core/session/session.service';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { IngredientsDataService } from '../../services/ingredients.service';
import { IngredientsCatalogPageComponent } from './ingredients-catalog-page.component';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(value);

describe('IngredientsCatalogPageComponent', () => {
  const getCatalogSnapshot = vi.fn(() =>
    of({
      categories: [],
      ingredients: [],
    }),
  );

  beforeEach(async () => {
    getCatalogSnapshot.mockClear();

    await TestBed.configureTestingModule({
      imports: [IngredientsCatalogPageComponent],
      providers: [
        {
          provide: IngredientsDataService,
          useValue: {
            createIngredient: vi.fn(),
            createIngredientPriceEntry: vi.fn(),
            deactivateIngredient: vi.fn(),
            deactivateIngredientPriceEntry: vi.fn(),
            getCatalogSnapshot,
            getManagedIngredient: vi.fn(),
            updateIngredient: vi.fn(),
            updateIngredientPriceEntry: vi.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            hasStoreContext: signal(true).asReadonly(),
          },
        },
        TopbarSearchService,
      ],
    }).compileComponents();
  });

  it('prioritizes the latest active store price as the current price', () => {
    const fixture = TestBed.createComponent(IngredientsCatalogPageComponent);
    fixture.detectChanges();

    const mapped = (fixture.componentInstance as unknown as {
      mapManagedIngredient: (value: unknown, isActive: boolean) => {
        currentPriceLabel: string;
        currentPriceScope: string | null;
      };
    }).mapManagedIngredient(
      {
        baseUnit: 'kg',
        category: {
          id: 'cat-1',
          name: 'Biscoitos',
        },
        historyPrices: [
          {
            baseUnitCost: 28.23,
            entryId: 'org-1',
            isActive: true,
            source: 'organization',
            validFrom: '2026-03-27T10:00:00Z',
          },
          {
            baseUnitCost: 30,
            entryId: 'store-1',
            isActive: true,
            source: 'store',
            validFrom: '2026-03-28T10:00:00Z',
          },
          {
            baseUnitCost: 31,
            entryId: 'store-2',
            isActive: true,
            source: 'store',
            validFrom: '2026-03-29T10:00:00Z',
          },
        ],
        id: 'ingredient-1',
        name: 'Biscoito Negresco',
      },
      true,
    );

    expect(mapped.currentPriceScope).toBe('store');
    expect(mapped.currentPriceLabel).toBe(formatCurrency(31));
  });

  it('falls back to the latest active organization price when no active store price exists', () => {
    const fixture = TestBed.createComponent(IngredientsCatalogPageComponent);
    fixture.detectChanges();

    const mapped = (fixture.componentInstance as unknown as {
      mapManagedIngredient: (value: unknown, isActive: boolean) => {
        currentPriceLabel: string;
        currentPriceScope: string | null;
      };
    }).mapManagedIngredient(
      {
        baseUnit: 'kg',
        category: {
          id: 'cat-1',
          name: 'Biscoitos',
        },
        historyPrices: [
          {
            baseUnitCost: 28.23,
            entryId: 'org-1',
            isActive: true,
            source: 'organization',
            validFrom: '2026-03-27T10:00:00Z',
          },
          {
            baseUnitCost: 30,
            entryId: 'store-1',
            isActive: false,
            source: 'store',
            validFrom: '2026-03-28T10:00:00Z',
          },
        ],
        id: 'ingredient-1',
        name: 'Biscoito Negresco',
      },
      true,
    );

    expect(mapped.currentPriceScope).toBe('organization');
    expect(mapped.currentPriceLabel).toBe(formatCurrency(28.23));
  });
});
