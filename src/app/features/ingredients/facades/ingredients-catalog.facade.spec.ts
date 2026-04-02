import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IngredientCategoryResponse, IngredientResponse } from '../../../core/api/generated';
import { IngredientsDataService } from '../services/ingredients.service';
import { IngredientsCatalogFacade } from './ingredients-catalog.facade';

function buildIngredient(index: number, active = true, categoryId = 'proteins'): IngredientResponse {
  return {
    baseUnit: 'kg',
    category: {
      id: categoryId,
      name: categoryId === 'proteins' ? 'Proteinas' : 'Hortifruti',
    },
    id: `ingredient-${index}`,
    isActive: active,
    name: `Ingrediente ${index}`,
  };
}

describe('IngredientsCatalogFacade', () => {
  beforeEach(() => {
    const categories: readonly IngredientCategoryResponse[] = [
      { id: 'proteins', isActive: true, name: 'Proteinas' },
      { id: 'vegetables', isActive: true, name: 'Hortifruti' },
    ];
    const ingredients: readonly IngredientResponse[] = [
      ...Array.from({ length: 8 }, (_, index) => buildIngredient(index + 1, true, 'proteins')),
      buildIngredient(9, false, 'vegetables'),
      buildIngredient(10, true, 'vegetables'),
    ];

    TestBed.configureTestingModule({
      providers: [
        IngredientsCatalogFacade,
        {
          provide: IngredientsDataService,
          useValue: {
            getCatalogSnapshot: () =>
              of({
                categories,
                ingredients,
              }),
          },
        },
      ],
    });
  });

  it('loads catalog data and paginates client-side', () => {
    const facade = TestBed.inject(IngredientsCatalogFacade);

    expect(facade.vm().loading).toBe(false);
    expect(facade.vm().pagination.totalItems).toBe(9);
    expect(facade.vm().rows.length).toBe(8);
  });

  it('filters by search, category and status while resetting pagination', () => {
    const facade = TestBed.inject(IngredientsCatalogFacade);

    facade.setPage(2);
    expect(facade.vm().pagination.currentPage).toBe(2);

    facade.setCategory('vegetables');
    expect(facade.vm().pagination.currentPage).toBe(1);
    expect(facade.vm().pagination.totalItems).toBe(1);

    facade.setStatusFilter('inactive');
    expect(facade.vm().pagination.totalItems).toBe(1);
    expect(facade.vm().rows.every((row) => !row.isActive)).toBe(true);

    facade.setSearchTerm('Ingrediente 10');
    expect(facade.vm().pagination.currentPage).toBe(1);
    expect(facade.vm().pagination.totalItems).toBe(0);

    facade.setStatusFilter('active');
    expect(facade.vm().pagination.totalItems).toBe(1);
    expect(facade.vm().rows[0]?.name).toBe('Ingrediente 10');
  });
});
