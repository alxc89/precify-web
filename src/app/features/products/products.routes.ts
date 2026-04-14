import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-catalog-page/products-catalog-page.component').then(
        (m) => m.ProductsCatalogPageComponent,
      ),
  },
];
