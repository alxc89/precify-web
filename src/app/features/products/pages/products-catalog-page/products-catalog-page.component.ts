import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { IngredientResponse, ProductIngredientResponse, ProductResponse } from '../../../../core/api/generated';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { ProductsFiltersComponent } from '../../components/products-filters/products-filters.component';
import { ProductsGridComponent } from '../../components/products-grid/products-grid.component';
import { ProductManagementModalComponent } from '../../components/product-management-modal/product-management-modal.component';
import { ProductsPageHeaderComponent } from '../../components/products-page-header/products-page-header.component';
import { ProductsSummaryCardComponent } from '../../components/products-summary-card/products-summary-card.component';
import { ProductsCatalogFacade } from '../../facades/products-catalog.facade';
import {
  ProductIngredientOption,
  ProductManagementDetailVm,
  ProductManagementFormValue,
  ProductManagementModalMode,
  ProductTechnicalSheetItemVm,
} from '../../models/product-management.model';
import { ProductsDataService } from '../../services/products.service';
import { map, switchMap, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-products-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProductManagementModalComponent,
    ProductsFiltersComponent,
    ProductsGridComponent,
    ProductsPageHeaderComponent,
    ProductsSummaryCardComponent,
  ],
  providers: [ProductsCatalogFacade],
  templateUrl: './products-catalog-page.component.html',
})
export class ProductsCatalogPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productsData = inject(ProductsDataService);
  private readonly topbarSearch = inject(TopbarSearchService);
  private readonly facade = inject(ProductsCatalogFacade);

  protected readonly managementError = signal<string | null>(null);
  protected readonly managementLoading = signal(false);
  protected readonly managementMode = signal<ProductManagementModalMode | null>(null);
  protected readonly managementProduct = signal<ProductManagementDetailVm | null>(null);
  protected readonly managementSaving = signal(false);
  protected readonly ingredientOptions = signal<readonly ProductIngredientOption[]>([]);
  protected readonly isManagementModalOpen = computed(() => this.managementMode() !== null);
  protected readonly vm = this.facade.vm;

  private readonly selectedProductId = signal<string | null>(null);

  constructor() {
    this.topbarSearch.configure({
      ariaLabel: 'Buscar no catálogo de produtos',
      placeholder: 'Buscar no catálogo...',
      visible: true,
    });

    effect(() => {
      this.facade.setSearchTerm(this.topbarSearch.query());
    });

    this.destroyRef.onDestroy(() => {
      this.topbarSearch.reset();
    });
  }

  protected onCreateProduct() {
    this.managementMode.set('create');
    this.managementProduct.set(null);
    this.managementError.set(null);
    this.managementSaving.set(false);
    this.managementLoading.set(true);
    this.selectedProductId.set(null);

    this.productsData
      .getIngredientOptions()
      .pipe(
        map((ingredients) => this.mapIngredientOptions(ingredients)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (options) => {
          this.ingredientOptions.set(options);
          this.managementLoading.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.ingredientOptions.set([]);
          this.managementError.set(
            error.error?.detail || error.message || 'Nao foi possivel carregar os ingredientes.',
          );
          this.managementLoading.set(false);
        },
      });
  }

  protected onCategoryChange(value: string) {
    this.facade.setCategoryFilter(value);
  }

  protected onDeleteProduct(productId: string) {
    const product = this.vm().items.find((item) => item.id === productId);
    const productName = product?.name ?? 'este produto';

    if (!globalThis.confirm(`Deseja deletar o produto "${productName}"?`)) {
      return;
    }

    this.productsData
      .deleteProduct(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.selectedProductId() === productId) {
            this.closeManagementModal();
          }

          this.facade.refresh();
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.managementError.set(
            error.error?.detail || error.message || 'Nao foi possivel deletar o produto.',
          );
        },
      });
  }

  protected onEditProduct(productId: string) {
    this.managementMode.set('edit');
    this.managementProduct.set(null);
    this.managementError.set(null);
    this.managementSaving.set(false);
    this.managementLoading.set(true);
    this.selectedProductId.set(productId);

    this.productsData
      .getProductManagementSnapshot(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ ingredientOptions, product, technicalSheet }) => {
          this.ingredientOptions.set(this.mapIngredientOptions(ingredientOptions));
          this.managementProduct.set(this.mapProductDetail(product, technicalSheet));
          this.managementLoading.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.ingredientOptions.set([]);
          this.managementError.set(
            error.error?.detail || error.message || 'Nao foi possivel carregar o produto.',
          );
          this.managementLoading.set(false);
        },
      });
  }

  protected closeManagementModal() {
    this.managementMode.set(null);
    this.managementProduct.set(null);
    this.managementError.set(null);
    this.managementLoading.set(false);
    this.managementSaving.set(false);
    this.ingredientOptions.set([]);
    this.selectedProductId.set(null);
  }

  protected onSaveProduct(value: ProductManagementFormValue) {
    const mode = this.managementMode();

    if (!mode) {
      return;
    }

    this.managementSaving.set(true);
    this.managementError.set(null);

    if (mode === 'create') {
      this.managementLoading.set(true);

      this.productsData
        .createProduct({
          code: value.code,
          description: value.description,
          ingredients: value.ingredients.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
          })),
          name: value.name,
          photoUrl: value.photoUrl,
        })
        .pipe(
          tap((product) => {
            if (!product.id) {
              throw new Error('A API nao retornou o identificador do produto criado.');
            }

            this.selectedProductId.set(product.id);
            this.managementMode.set('edit');
            this.facade.refresh();
          }),
          switchMap((product) => {
            if (!product.id) {
              return throwError(() => new Error('Produto criado sem identificador.'));
            }

            return this.productsData.getProductManagementSnapshot(product.id);
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: ({ ingredientOptions, product, technicalSheet }) => {
            this.ingredientOptions.set(this.mapIngredientOptions(ingredientOptions));
            this.managementProduct.set(this.mapProductDetail(product, technicalSheet));
            this.managementLoading.set(false);
            this.managementSaving.set(false);
          },
          error: (error: { error?: { detail?: string }; message?: string }) => {
            this.managementError.set(
              error.error?.detail || error.message || 'Nao foi possivel salvar o produto.',
            );
            this.managementLoading.set(false);
            this.managementSaving.set(false);
          },
        });
      return;
    }

    const productId = this.selectedProductId();

    if (!productId) {
      this.managementError.set('Nenhum produto foi selecionado para edicao.');
      this.managementSaving.set(false);
      return;
    }

    this.productsData
      .updateProduct(productId, {
        code: value.code,
        description: value.description,
        name: value.name,
        photoUrl: value.photoUrl,
      })
      .pipe(
        switchMap((product) =>
          this.productsData.replaceProductIngredients(
            productId,
            value.ingredients.map((item) => ({
              ingredientId: item.ingredientId,
              quantity: item.quantity,
            })),
          ).pipe(
            map((result) => ({
              product,
              technicalSheet: result.items ?? [],
            })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ product, technicalSheet }) => {
          this.managementProduct.set(this.mapProductDetail(product, technicalSheet));
          this.facade.refresh();
          this.managementSaving.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.managementError.set(
            error.error?.detail || error.message || 'Nao foi possivel atualizar o produto.',
          );
          this.managementSaving.set(false);
        },
      });
  }

  protected onToggleProductStatus() {
    const product = this.managementProduct();

    if (!product) {
      return;
    }

    const confirmationMessage = product.isActive
      ? `Deseja desativar o produto "${product.name}"?`
      : `Deseja reativar o produto "${product.name}"?`;

    if (!globalThis.confirm(confirmationMessage)) {
      return;
    }

    this.managementSaving.set(true);
    this.managementError.set(null);

    const request$ = product.isActive
      ? this.productsData.deactivateProduct(product.id)
      : this.productsData.reactivateProduct(product.id);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const currentProduct = this.managementProduct();

          if (currentProduct) {
            this.managementProduct.set({
              ...currentProduct,
              isActive: !currentProduct.isActive,
            });
          }

          this.facade.refresh();
          this.managementSaving.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.managementError.set(
            error.error?.detail ||
              error.message ||
              'Nao foi possivel atualizar o status do produto.',
          );
          this.managementSaving.set(false);
        },
      });
  }

  protected onPageChange(page: number) {
    this.facade.setPage(page);
  }

  protected onStatusChange(value: string) {
    this.facade.setStatusFilter(value);
  }

  private mapIngredientOptions(ingredients: readonly IngredientResponse[]): readonly ProductIngredientOption[] {
    return ingredients
      .filter((ingredient): ingredient is IngredientResponse & { id: string } => !!ingredient.id)
      .map((ingredient) => ({
        baseUnit: ingredient.baseUnit?.trim() || null,
        categoryLabel: ingredient.category?.name?.trim() || 'Sem categoria',
        id: ingredient.id,
        isActive: ingredient.isActive ?? false,
        label: ingredient.name?.trim() || 'Ingrediente sem nome',
      }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'));
  }

  private mapProductDetail(
    product: ProductResponse,
    technicalSheet: readonly ProductIngredientResponse[],
  ): ProductManagementDetailVm {
    const technicalSheetItems = technicalSheet.map((item) => this.mapTechnicalSheetItem(item));

    return {
      code: product.code?.trim() || '',
      description: product.description?.trim() || null,
      id: product.id?.trim() || '',
      isActive: product.isActive ?? false,
      name: product.name?.trim() || 'Produto sem nome',
      photoUrl: product.photoUrl?.trim() || null,
      technicalSheet: technicalSheetItems,
      technicalSheetCountLabel:
        technicalSheetItems.length === 1
          ? '1 item na ficha tecnica'
          : `${technicalSheetItems.length} itens na ficha tecnica`,
      updatedAtLabel: this.formatDate(product.updatedAt ?? product.createdAt),
    };
  }

  private mapTechnicalSheetItem(item: ProductIngredientResponse): ProductTechnicalSheetItemVm {
    const quantity = item.quantity ?? null;
    const baseUnit = item.baseUnit?.trim() || null;

    return {
      baseUnit,
      categoryLabel: item.ingredientCategoryName?.trim() || 'Sem categoria',
      ingredientId: item.ingredientId?.trim() || '',
      ingredientName: item.ingredientName?.trim() || 'Ingrediente sem nome',
      isIngredientActive: item.isIngredientActive ?? false,
      quantity,
      quantityLabel:
        quantity === null ? 'Quantidade nao informada' : `${this.formatQuantity(quantity)} ${baseUnit ?? ''}`.trim(),
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

  private formatQuantity(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 4,
    }).format(value);
  }
}
