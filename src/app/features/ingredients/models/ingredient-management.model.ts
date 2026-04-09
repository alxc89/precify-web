import { IngredientPriceScope } from './ingredient.model';

export type IngredientManagementModalMode = 'create' | 'edit';
export type IngredientPriceModalMode = 'create' | 'edit';

export interface IngredientManagementFormValue {
  readonly baseUnit: string;
  readonly ingredientCategoryId: string;
  readonly name: string;
}

export interface IngredientManagementHistoryPriceVm {
  readonly baseUnitCost: number | null;
  readonly baseUnitCostLabel: string;
  readonly convertedBaseQuantity: number | null;
  readonly entryId: string;
  readonly isActive: boolean;
  readonly isCurrent: boolean;
  readonly note: string | null;
  readonly purchasePrice: number | null;
  readonly purchaseQuantity: number | null;
  readonly purchaseSummaryLabel: string;
  readonly purchaseUnit: string | null;
  readonly source: IngredientPriceScope;
  readonly sourceLabel: string;
  readonly statusLabel: string;
  readonly supplier: string | null;
  readonly validFrom: string | null;
  readonly validFromLabel: string;
  readonly validTo: string | null;
  readonly validToLabel: string;
}

export interface IngredientManagementDetailVm {
  readonly baseUnit: string;
  readonly categoryId: string;
  readonly categoryLabel: string;
  readonly currentPriceLabel: string;
  readonly currentPriceScope: IngredientPriceScope | null;
  readonly historyPrices: readonly IngredientManagementHistoryPriceVm[];
  readonly id: string;
  readonly isActive: boolean;
  readonly name: string;
}

export interface IngredientPriceFormValue {
  readonly baseUnitCost: number | null;
  readonly convertedBaseQuantity: number | null;
  readonly note: string | null;
  readonly purchasePrice: number | null;
  readonly purchaseQuantity: number | null;
  readonly purchaseUnit: string;
  readonly source: IngredientPriceScope;
  readonly supplier: string | null;
  readonly validFrom: string;
  readonly validTo: string | null;
}
