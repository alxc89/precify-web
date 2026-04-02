import { Routes } from '@angular/router';

export const INGREDIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/ingredients-catalog-page/ingredients-catalog-page.component').then(
        (m) => m.IngredientsCatalogPageComponent,
      ),
  },
];
