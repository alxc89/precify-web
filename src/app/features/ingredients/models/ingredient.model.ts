export type IngredientPriceScope = 'organization' | 'store';

export interface IngredientHistoryState {
  readonly label: string;
  readonly points: readonly number[] | null;
}

export interface IngredientListItem {
  readonly actionsEnabled: boolean;
  readonly baseUnitLabel: string;
  readonly categoryId: string;
  readonly categoryLabel: string;
  readonly code: string;
  readonly hasPrice: boolean;
  readonly history: IngredientHistoryState;
  readonly id: string;
  readonly isActive: boolean;
  readonly name: string;
  readonly priceLabel: string;
  readonly priceScope: IngredientPriceScope | null;
  readonly priceValue: number | null;
  readonly statusLabel: string;
  readonly thumbnailUrl: string | null;
}

export interface IngredientInventoryStatsVm {
  readonly hasData: boolean;
  readonly helperLabel: string;
  readonly title: string;
  readonly trendLabel: string;
  readonly valueLabel: string;
}
