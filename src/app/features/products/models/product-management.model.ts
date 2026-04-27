export type ProductManagementModalMode = 'create' | 'edit';

export interface ProductIngredientOption {
  readonly baseUnit: string | null;
  readonly categoryLabel: string;
  readonly id: string;
  readonly isActive: boolean;
  readonly label: string;
}

export interface ProductTechnicalSheetItemVm {
  readonly baseUnit: string | null;
  readonly categoryLabel: string;
  readonly ingredientId: string;
  readonly ingredientName: string;
  readonly isIngredientActive: boolean;
  readonly quantity: number | null;
  readonly quantityLabel: string;
}

export interface ProductManagementDetailVm {
  readonly code: string;
  readonly description: string | null;
  readonly id: string;
  readonly isActive: boolean;
  readonly name: string;
  readonly photoUrl: string | null;
  readonly technicalSheet: readonly ProductTechnicalSheetItemVm[];
  readonly technicalSheetCountLabel: string;
  readonly totalCostLabel: string;
  readonly updatedAtLabel: string;
}

export interface ProductIngredientFormValue {
  readonly ingredientId: string;
  readonly quantity: number;
}

export interface ProductManagementFormValue {
  readonly code: string;
  readonly description: string | null;
  readonly ingredients: readonly ProductIngredientFormValue[];
  readonly name: string;
  readonly photoUrl: string | null;
}
