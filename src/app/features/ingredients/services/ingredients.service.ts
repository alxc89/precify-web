import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  IngredientCategoriesService,
  IngredientCategoryResponse,
  IngredientResponse,
  IngredientsService,
} from '../../../core/api/generated';

export interface IngredientsCatalogSnapshot {
  readonly categories: readonly IngredientCategoryResponse[];
  readonly ingredients: readonly IngredientResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class IngredientsDataService {
  private readonly categoriesApi = inject(IngredientCategoriesService);
  private readonly ingredientsApi = inject(IngredientsService);

  getCatalogSnapshot() {
    return forkJoin({
      categories: this.categoriesApi.apiV1CategoriasIngredienteGet(true),
      ingredients: this.ingredientsApi.apiV1IngredientesGet(true),
    });
  }
}
