import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { ProductResponse } from '../../../core/api/generated';
import { ProductCardVm, ProductFilterOption, ProductsCatalogPageVm } from '../models/product.model';
import { ProductsDataService } from '../services/products.service';

const ALL_CATEGORY = 'all';
const ALL_STATUS = 'all';
const PAGE_SIZE = 8;
const STATUS_OPTIONS: readonly ProductFilterOption[] = [
  { label: 'Todos', value: ALL_STATUS },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
];

@Injectable()
export class ProductsCatalogFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productsData = inject(ProductsDataService);

  private readonly products = signal<readonly ProductCardVm[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly page = signal(1);
  private readonly searchTerm = signal('');
  private readonly selectedCategory = signal(ALL_CATEGORY);
  private readonly selectedStatus = signal(ALL_STATUS);

  readonly categoryOptions = computed<readonly ProductFilterOption[]>(() => {
    const categories = Array.from(
      new Map(
        this.products().map((product) => [product.categoryId, product.categoryLabel]),
      ).entries(),
    ).map(([value, label]) => ({ label, value }));

    return [{ label: 'Todas as Categorias', value: ALL_CATEGORY }, ...categories];
  });

  readonly totalProducts = computed(() => this.products().length);
  readonly activeProducts = computed(
    () => this.products().filter((product) => product.isActive).length,
  );
  readonly inactiveProducts = computed(() => this.totalProducts() - this.activeProducts());

  readonly filteredProducts = computed(() => {
    const search = this.searchTerm().trim().toLocaleLowerCase('pt-BR');
    const category = this.selectedCategory();
    const status = this.selectedStatus();

    return this.products().filter((product) => {
      if (category !== ALL_CATEGORY && product.categoryId !== category) {
        return false;
      }

      if (status === 'active' && !product.isActive) {
        return false;
      }

      if (status === 'inactive' && product.isActive) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        product.name,
        product.code,
        product.description,
        product.categoryLabel,
        product.statusLabel,
      ]
        .filter((value): value is string => !!value)
        .join(' ')
        .toLocaleLowerCase('pt-BR');

      return haystack.includes(search);
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProducts().length / PAGE_SIZE)),
  );
  readonly paginatedProducts = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filteredProducts().slice(start, start + PAGE_SIZE);
  });

  readonly vm = computed<ProductsCatalogPageVm>(() => ({
    activeProducts: this.activeProducts(),
    categories: this.categoryOptions(),
    currentPage: this.page(),
    error: this.errorState(),
    filteredProducts: this.filteredProducts().length,
    inactiveProducts: this.inactiveProducts(),
    items: this.paginatedProducts(),
    loading: this.loadingState(),
    selectedCategory: this.selectedCategory(),
    selectedStatus: this.selectedStatus(),
    statusOptions: STATUS_OPTIONS,
    totalPages: this.totalPages(),
    totalProducts: this.totalProducts(),
    visibleProducts: this.paginatedProducts().length,
  }));

  constructor() {
    effect(() => {
      const currentPage = this.page();
      const totalPages = this.totalPages();

      if (currentPage > totalPages) {
        this.page.set(totalPages);
      }
    });

    this.load();
  }

  refresh() {
    this.load();
  }

  setCategoryFilter(category: string) {
    this.selectedCategory.set(category);
    this.page.set(1);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.page.set(page);
  }

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
    this.page.set(1);
  }

  setStatusFilter(status: string) {
    this.selectedStatus.set(status);
    this.page.set(1);
  }

  private load() {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.productsData
      .getCatalogProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.products.set(products.map((product, index) => this.mapProduct(product, index)));
          this.loadingState.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.products.set([]);
          this.errorState.set(
            error.error?.detail ||
              error.message ||
              'Não foi possível carregar o catálogo de produtos.',
          );
          this.loadingState.set(false);
        },
      });
  }

  private mapProduct(product: ProductResponse, index: number): ProductCardVm {
    const code = product.code?.trim() || `PRD-${String(index + 1).padStart(3, '0')}`;
    const name = product.name?.trim() || 'Produto sem nome';
    const updatedAtLabel = this.formatDate(product.updatedAt ?? product.createdAt);
    const isActive = product.isActive ?? false;

    return {
      actionsEnabled: true,
      categoryId: 'uncategorized',
      categoryLabel: 'Sem categoria',
      code,
      description: product.description?.trim() || null,
      id: product.id?.trim() || `${code}-${index}`,
      isActive,
      name,
      photoUrl: product.photoUrl?.trim() || null,
      priceHeading: 'Preço de venda',
      priceValueLabel: 'Não configurado',
      secondaryLabel: 'Atualizado',
      secondaryValueLabel: updatedAtLabel,
      statusLabel: isActive ? 'Ativo' : 'Inativo',
      statusTone: isActive ? 'active' : 'inactive',
    };
  }

  private formatDate(value?: string) {
    if (!value) {
      return 'Sem data';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Sem data';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}
