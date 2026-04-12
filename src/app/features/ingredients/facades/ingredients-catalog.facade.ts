import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IngredientCategoryResponse, IngredientResponse } from '../../../core/api/generated';
import {
  IngredientCategoryFilterOption,
  IngredientFilterState,
  IngredientsCatalogPageVm,
} from '../models/ingredient-filter.model';
import { IngredientInventoryStatsVm, IngredientListItem } from '../models/ingredient.model';
import { IngredientsDataService } from '../services/ingredients.service';

const DEFAULT_FILTER_STATE: IngredientFilterState = {
  page: 1,
  pageSize: 8,
  searchTerm: '',
  selectedCategoryId: 'all',
  statusFilter: 'active',
};

@Injectable()
export class IngredientsCatalogFacade {
  private readonly dataService = inject(IngredientsDataService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly categories = signal<readonly IngredientCategoryResponse[]>([]);
  private readonly ingredients = signal<readonly IngredientResponse[]>([]);
  private readonly filterState = signal<IngredientFilterState>(DEFAULT_FILTER_STATE);
  private readonly errorMessage = signal<string | null>(null);
  private readonly loadingState = signal(true);

  readonly page = computed(() => this.filterState().page);
  readonly searchTerm = computed(() => this.filterState().searchTerm);
  readonly selectedCategoryId = computed(() => this.filterState().selectedCategoryId);
  readonly statusFilter = computed(() => this.filterState().statusFilter);

  private readonly categoryOptions = computed<readonly IngredientCategoryFilterOption[]>(() => [
    {
      id: 'all',
      label: 'Todos',
    },
    ...this.categories()
      .filter((category) => category.id && category.name)
      .map((category) => ({
        id: category.id as string,
        label: category.name as string,
      }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR')),
  ]);

  private readonly filteredRows = computed<readonly IngredientListItem[]>(() => {
    const searchTerm = this.filterState().searchTerm.trim().toLocaleLowerCase('pt-BR');
    const selectedCategoryId = this.filterState().selectedCategoryId;
    const statusFilter = this.filterState().statusFilter;

    return this.ingredients()
      .map((ingredient) => this.mapIngredient(ingredient))
      .filter((ingredient) => {
        if (selectedCategoryId !== 'all' && ingredient.categoryId !== selectedCategoryId) {
          return false;
        }

        if (statusFilter === 'active' && !ingredient.isActive) {
          return false;
        }

        if (statusFilter === 'inactive' && ingredient.isActive) {
          return false;
        }

        if (!searchTerm) {
          return true;
        }

        return [
          ingredient.name,
          ingredient.categoryLabel,
          ingredient.baseUnitLabel,
          ingredient.code,
        ]
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(searchTerm);
      })
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  });

  private readonly pagination = computed(() => {
    const { page, pageSize } = this.filterState();
    const totalItems = this.filteredRows().length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

    return {
      currentPage,
      endItem,
      pageNumbers: Array.from({ length: totalPages }, (_, index) => index + 1),
      pageSize,
      startItem,
      totalItems,
      totalPages,
    };
  });

  private readonly paginatedRows = computed(() => {
    const { currentPage, pageSize } = this.pagination();
    const start = (currentPage - 1) * pageSize;
    return this.filteredRows().slice(start, start + pageSize);
  });

  private readonly inventoryStats = computed<IngredientInventoryStatsVm>(() => {
    const pricedRows = this.filteredRows().filter((row) => row.priceValue !== null);

    if (pricedRows.length === 0) {
      return {
        hasData: false,
        helperLabel: 'Defina um contexto de loja para resolver preços reais.',
        title: 'Custo Médio do Inventário',
        trendLabel: 'Aguardando precificação',
        valueLabel: 'Sem dados',
      };
    }

    const averagePrice =
      pricedRows.reduce((total, row) => total + (row.priceValue ?? 0), 0) / pricedRows.length;

    return {
      hasData: true,
      helperLabel: `${pricedRows.length} insumos com custo vigente`,
      title: 'Custo Médio do Inventário',
      trendLabel: 'Baseado no contexto atual',
      valueLabel: this.formatCurrency(averagePrice),
    };
  });

  readonly vm = computed<IngredientsCatalogPageVm>(() => ({
    categories: this.categoryOptions(),
    emptyMessage:
      this.filteredRows().length === 0
        ? 'Nenhum ingrediente corresponde aos filtros aplicados.'
        : 'Nenhum ingrediente encontrado.',
    error: this.errorMessage(),
    inventoryStats: this.inventoryStats(),
    loading: this.loadingState(),
    pagination: this.pagination(),
    rows: this.paginatedRows(),
    selectedCategoryId: this.filterState().selectedCategoryId,
    statusFilter: this.filterState().statusFilter,
  }));

  constructor() {
    this.loadCatalog();
  }

  refresh() {
    this.loadCatalog();
  }

  setCategory(categoryId: string) {
    this.filterState.update((current) => ({
      ...current,
      page: 1,
      selectedCategoryId: categoryId,
    }));
  }

  setPage(page: number) {
    const totalPages = this.pagination().totalPages;
    this.filterState.update((current) => ({
      ...current,
      page: Math.min(Math.max(page, 1), totalPages),
    }));
  }

  setSearchTerm(searchTerm: string) {
    this.filterState.update((current) => ({
      ...current,
      page: 1,
      searchTerm,
    }));
  }

  setStatusFilter(statusFilter: IngredientFilterState['statusFilter']) {
    this.filterState.update((current) => ({
      ...current,
      page: 1,
      statusFilter,
    }));
  }

  clearFilters() {
    this.filterState.set({
      ...DEFAULT_FILTER_STATE,
      searchTerm: this.filterState().searchTerm,
    });
  }

  private loadCatalog() {
    this.loadingState.set(true);
    this.errorMessage.set(null);

    this.dataService
      .getCatalogSnapshot()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ categories, ingredients }) => {
          this.categories.set(categories);
          this.ingredients.set(ingredients);
          this.loadingState.set(false);
        },
        error: () => {
          this.categories.set([]);
          this.ingredients.set([]);
          this.errorMessage.set('Não foi possível carregar o catálogo de ingredientes.');
          this.loadingState.set(false);
        },
      });
  }

  private mapIngredient(ingredient: IngredientResponse): IngredientListItem {
    const id = ingredient.id ?? `ingredient-${ingredient.name ?? 'unknown'}`;
    const categoryId = ingredient.category?.id ?? 'uncategorized';
    const categoryLabel = ingredient.category?.name?.trim() || 'Sem categoria';
    const name = ingredient.name?.trim() || 'Ingrediente sem nome';
    const baseUnitLabel = ingredient.baseUnit?.trim() || 'Sem unidade base';
    const priceLabel =
      ingredient.currentPrice !== undefined && ingredient.currentPrice !== null
        ? this.formatCurrency(ingredient.currentPrice)
        : 'Sem preço definido';
    const priceScope = ingredient.currentPriceScope || null;
    const priceValue =
      ingredient.currentPrice !== undefined && ingredient.currentPrice !== null
        ? ingredient.currentPrice
        : null;
    const historyPoints =
      ingredient.historyPrices
        ?.map((entry) => entry.purchasePrice)
        .filter((value): value is number => value !== null && value !== undefined) ?? null;
    const historyLabel =
      historyPoints && historyPoints.length > 0 ? 'Histórico de preços' : 'Sem histórico';

    return {
      actionsEnabled: true,
      baseUnitLabel,
      categoryId,
      categoryLabel,
      code: (ingredient.id ?? 'SEM-ID').slice(-6).toUpperCase(),
      hasPrice: priceValue !== null,
      history: {
        label: historyLabel,
        points: historyPoints && historyPoints.length > 0 ? historyPoints : null,
      },
      id,
      isActive: ingredient.isActive ?? false,
      name,
      priceLabel,
      priceScope,
      priceValue,
      statusLabel: ingredient.isActive ? 'Ativo' : 'Inativo',
      thumbnailUrl: null,
    };
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      currency: 'BRL',
      style: 'currency',
    }).format(value);
  }
}
