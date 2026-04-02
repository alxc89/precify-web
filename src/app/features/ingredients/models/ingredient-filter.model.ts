import { IngredientInventoryStatsVm, IngredientListItem } from './ingredient.model';

export type IngredientStatusFilter = 'all' | 'active' | 'inactive';

export interface IngredientCategoryFilterOption {
  readonly id: string;
  readonly label: string;
}

export interface IngredientFilterState {
  readonly page: number;
  readonly pageSize: number;
  readonly searchTerm: string;
  readonly selectedCategoryId: string;
  readonly statusFilter: IngredientStatusFilter;
}

export interface IngredientsCatalogPaginationVm {
  readonly currentPage: number;
  readonly endItem: number;
  readonly pageNumbers: readonly number[];
  readonly pageSize: number;
  readonly startItem: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface IngredientsCatalogPageVm {
  readonly categories: readonly IngredientCategoryFilterOption[];
  readonly emptyMessage: string;
  readonly error: string | null;
  readonly inventoryStats: IngredientInventoryStatsVm;
  readonly loading: boolean;
  readonly pagination: IngredientsCatalogPaginationVm;
  readonly rows: readonly IngredientListItem[];
  readonly statusFilter: IngredientStatusFilter;
  readonly selectedCategoryId: string;
}
