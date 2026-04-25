import { Routes } from '@angular/router';

export const COSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/costs-page/costs-page.component').then((m) => m.CostsPageComponent),
  },
];
