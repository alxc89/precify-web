export interface ProductFilterOption {
  readonly label: string;
  readonly value: string;
}

export interface ProductCardVm {
  readonly actionsEnabled: boolean;
  readonly categoryId: string;
  readonly categoryLabel: string;
  readonly code: string;
  readonly description: string | null;
  readonly id: string;
  readonly isActive: boolean;
  readonly name: string;
  readonly photoUrl: string | null;
  readonly priceHeading: string;
  readonly priceValueLabel: string;
  readonly secondaryLabel: string;
  readonly secondaryValueLabel: string;
  readonly statusLabel: string;
  readonly statusTone: 'active' | 'inactive';
}

export interface ProductsCatalogPageVm {
  readonly activeProducts: number;
  readonly categories: readonly ProductFilterOption[];
  readonly currentPage: number;
  readonly error: string | null;
  readonly filteredProducts: number;
  readonly inactiveProducts: number;
  readonly items: readonly ProductCardVm[];
  readonly loading: boolean;
  readonly selectedCategory: string;
  readonly selectedStatus: string;
  readonly statusOptions: readonly ProductFilterOption[];
  readonly totalPages: number;
  readonly totalProducts: number;
  readonly visibleProducts: number;
}
