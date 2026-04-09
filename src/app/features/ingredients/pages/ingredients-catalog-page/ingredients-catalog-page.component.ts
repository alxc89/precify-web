import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import {
  IngredientPriceSourceResponse,
  ManagedIngredientHistoryPriceResponse,
  ManagedIngredientResponse,
} from '../../../../core/api/generated';
import { SessionService } from '../../../../core/session/session.service';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { IngredientsCatalogFacade } from '../../facades/ingredients-catalog.facade';
import { IngredientManagementModalComponent } from '../../components/ingredient-management-modal/ingredient-management-modal.component';
import { IngredientPriceModalComponent } from '../../components/ingredient-price-modal/ingredient-price-modal.component';
import { IngredientsFiltersComponent } from '../../components/ingredients-filters/ingredients-filters.component';
import { IngredientsPageHeaderComponent } from '../../components/ingredients-page-header/ingredients-page-header.component';
import { IngredientsTableComponent } from '../../components/ingredients-table/ingredients-table.component';
import {
  IngredientManagementDetailVm,
  IngredientManagementFormValue,
  IngredientManagementHistoryPriceVm,
  IngredientManagementModalMode,
  IngredientPriceFormValue,
  IngredientPriceModalMode,
} from '../../models/ingredient-management.model';
import { IngredientListItem } from '../../models/ingredient.model';
import { InventoryStatsCardComponent } from '../../components/inventory-stats-card/inventory-stats-card.component';
import { IngredientsDataService } from '../../services/ingredients.service';
import { map, switchMap, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-ingredients-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IngredientManagementModalComponent,
    IngredientPriceModalComponent,
    IngredientsFiltersComponent,
    IngredientsPageHeaderComponent,
    IngredientsTableComponent,
    InventoryStatsCardComponent,
  ],
  providers: [IngredientsCatalogFacade],
  templateUrl: './ingredients-catalog-page.component.html',
  styleUrl: './ingredients-catalog-page.component.scss',
})
export class IngredientsCatalogPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ingredientsData = inject(IngredientsDataService);
  private readonly session = inject(SessionService);
  private readonly topbarSearch = inject(TopbarSearchService);

  protected readonly facade = inject(IngredientsCatalogFacade);
  protected readonly managementError = signal<string | null>(null);
  protected readonly managementIngredient = signal<IngredientManagementDetailVm | null>(null);
  protected readonly managementLoading = signal(false);
  protected readonly managementMode = signal<IngredientManagementModalMode | null>(null);
  protected readonly managementSaving = signal(false);
  protected readonly priceError = signal<string | null>(null);
  protected readonly priceModalMode = signal<IngredientPriceModalMode | null>(null);
  protected readonly priceSaving = signal(false);
  protected readonly selectedPriceEntry = signal<IngredientManagementHistoryPriceVm | null>(null);
  protected readonly editableCategories = computed(() =>
    this.vm().categories.filter((category) => category.id !== 'all'),
  );
  protected readonly hasStoreContext = this.session.hasStoreContext;
  protected readonly isManagementModalOpen = computed(() => this.managementMode() !== null);
  protected readonly isPriceModalOpen = computed(() => this.priceModalMode() !== null);
  protected readonly managementDetail = this.managementIngredient.asReadonly();
  protected readonly priceModalBaseUnit = computed(() => this.managementIngredient()?.baseUnit ?? '');
  protected readonly priceModalIngredientName = computed(
    () => this.managementIngredient()?.name ?? 'Ingrediente',
  );
  protected readonly vm = this.facade.vm;

  private readonly selectedIngredientId = signal<string | null>(null);
  private readonly selectedIngredientIsActive = signal(true);

  constructor() {
    this.topbarSearch.configure({
      ariaLabel: 'Buscar insumos ou categorias',
      placeholder: 'Buscar insumos ou categorias...',
      visible: true,
    });

    effect(() => {
      this.facade.setSearchTerm(this.topbarSearch.query());
    });

    this.destroyRef.onDestroy(() => {
      this.topbarSearch.reset();
    });
  }

  protected onCreateIngredient() {
    this.managementMode.set('create');
    this.managementIngredient.set(null);
    this.managementError.set(null);
    this.managementLoading.set(false);
    this.managementSaving.set(false);
    this.selectedIngredientId.set(null);
    this.selectedIngredientIsActive.set(true);
    this.closePriceModal();
  }

  protected onDeleteIngredient(ingredient: IngredientListItem) {
    if (!ingredient.isActive) {
      return;
    }

    if (!globalThis.confirm(`Deseja desativar o ingrediente "${ingredient.name}"?`)) {
      return;
    }

    this.ingredientsData
      .deactivateIngredient(ingredient.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.facade.refresh();
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          globalThis.alert(
            error.error?.detail || error.message || 'Nao foi possivel desativar o ingrediente.',
          );
        },
      });
  }

  protected onEditIngredient(ingredient: IngredientListItem) {
    this.managementMode.set('edit');
    this.managementIngredient.set(null);
    this.managementError.set(null);
    this.managementLoading.set(true);
    this.managementSaving.set(false);
    this.selectedIngredientId.set(ingredient.id);
    this.selectedIngredientIsActive.set(ingredient.isActive);
    this.closePriceModal();

    this.loadManagedIngredient(ingredient.id, ingredient.isActive);
  }

  protected closeManagementModal() {
    this.managementMode.set(null);
    this.managementIngredient.set(null);
    this.managementError.set(null);
    this.managementLoading.set(false);
    this.managementSaving.set(false);
    this.selectedIngredientId.set(null);
    this.selectedIngredientIsActive.set(true);
    this.closePriceModal();
  }

  protected onSaveIngredient(value: IngredientManagementFormValue) {
    const mode = this.managementMode();

    if (!mode) {
      return;
    }

    this.managementSaving.set(true);
    this.managementLoading.set(mode === 'create');
    this.managementError.set(null);

    if (mode === 'create') {
      this.ingredientsData
        .createIngredient({
          baseUnit: value.baseUnit,
          ingredientCategoryId: value.ingredientCategoryId,
          name: value.name,
        })
        .pipe(
          tap((ingredient) => {
            if (!ingredient.id) {
              throw new Error('A API nao retornou o identificador do ingrediente criado.');
            }

            this.selectedIngredientId.set(ingredient.id);
            this.selectedIngredientIsActive.set(ingredient.isActive ?? true);
            this.managementMode.set('edit');
            this.facade.refresh();
          }),
          switchMap((ingredient) => {
            if (!ingredient.id) {
              return throwError(() => new Error('Ingrediente criado sem identificador.'));
            }

            return this.loadManagedIngredient$(ingredient.id, ingredient.isActive ?? true);
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (ingredient) => {
            this.managementIngredient.set(ingredient);
            this.managementLoading.set(false);
            this.managementSaving.set(false);
          },
          error: (error: { error?: { detail?: string }; message?: string }) => {
            this.managementError.set(
              error.error?.detail || error.message || 'Nao foi possivel salvar o ingrediente.',
            );
            this.managementLoading.set(false);
            this.managementSaving.set(false);
          },
        });
      return;
    }

    const ingredientId = this.selectedIngredientId();

    if (!ingredientId) {
      this.managementError.set('Nenhum ingrediente foi selecionado para edicao.');
      this.managementSaving.set(false);
      this.managementLoading.set(false);
      return;
    }

    this.ingredientsData
      .updateIngredient(ingredientId, {
        baseUnit: value.baseUnit,
        ingredientCategoryId: value.ingredientCategoryId,
        name: value.name,
      })
      .pipe(
        tap(() => {
          this.facade.refresh();
        }),
        switchMap(() => this.reloadManagedIngredient$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (ingredient) => {
          this.managementIngredient.set(ingredient);
          this.managementLoading.set(false);
          this.managementSaving.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.managementError.set(
            error.error?.detail || error.message || 'Nao foi possivel atualizar o ingrediente.',
          );
          this.managementLoading.set(false);
          this.managementSaving.set(false);
        },
      });
  }

  protected onDeactivateIngredient() {
    const ingredient = this.managementIngredient();

    if (!ingredient?.isActive) {
      return;
    }

    if (!globalThis.confirm(`Deseja desativar o ingrediente "${ingredient.name}"?`)) {
      return;
    }

    this.managementSaving.set(true);
    this.managementError.set(null);

    this.ingredientsData
      .deactivateIngredient(ingredient.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.facade.refresh();
          this.managementSaving.set(false);
          this.closeManagementModal();
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.managementError.set(
            error.error?.detail || error.message || 'Nao foi possivel desativar o ingrediente.',
          );
          this.managementSaving.set(false);
        },
      });
  }

  protected openNewPriceModal() {
    if (!this.managementIngredient()?.id) {
      return;
    }

    this.priceError.set(null);
    this.priceModalMode.set('create');
    this.selectedPriceEntry.set(null);
  }

  protected onEditPrice(price: IngredientManagementHistoryPriceVm) {
    this.priceError.set(null);
    this.priceModalMode.set('edit');
    this.selectedPriceEntry.set(price);
  }

  protected closePriceModal() {
    this.priceModalMode.set(null);
    this.priceError.set(null);
    this.priceSaving.set(false);
    this.selectedPriceEntry.set(null);
  }

  protected onSavePrice(value: IngredientPriceFormValue) {
    const ingredientId = this.selectedIngredientId();
    const priceMode = this.priceModalMode();
    const selectedPriceEntry = this.selectedPriceEntry();

    if (!ingredientId || !priceMode) {
      return;
    }

    if (priceMode === 'edit' && !selectedPriceEntry?.entryId) {
      this.priceError.set('Nenhuma entry de preco foi selecionada para edicao.');
      return;
    }

    this.priceSaving.set(true);
    this.priceError.set(null);

    const request = {
      baseUnitCost: value.baseUnitCost ?? undefined,
      convertedBaseQuantity: value.convertedBaseQuantity ?? undefined,
      isCurrent: true,
      note: value.note,
      purchasePrice: value.purchasePrice ?? undefined,
      purchaseQuantity: value.purchaseQuantity ?? undefined,
      purchaseUnit: value.purchaseUnit,
      supplier: value.supplier,
      validFrom: value.validFrom,
      validTo: value.validTo,
    };

    const operation$ =
      priceMode === 'create'
        ? this.ingredientsData.createIngredientPriceEntry(ingredientId, value.source, request)
        : this.ingredientsData.updateIngredientPriceEntry(
            ingredientId,
            selectedPriceEntry!.entryId,
            selectedPriceEntry!.source,
            request,
          );

    operation$
      .pipe(
        tap(() => {
          this.facade.refresh();
        }),
        switchMap(() => this.reloadManagedIngredient$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (ingredient) => {
          this.managementIngredient.set(ingredient);
          this.managementLoading.set(false);
          this.priceSaving.set(false);
          this.closePriceModal();
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.priceError.set(
            error.error?.detail || error.message || 'Nao foi possivel salvar a entry de preco.',
          );
          this.managementLoading.set(false);
          this.priceSaving.set(false);
        },
      });
  }

  protected onDeactivatePrice(price: IngredientManagementHistoryPriceVm) {
    const ingredientId = this.selectedIngredientId();

    if (!ingredientId || !price.isActive) {
      return;
    }

    if (!globalThis.confirm('Deseja desativar esta entry de preco?')) {
      return;
    }

    this.managementSaving.set(true);
    this.managementError.set(null);

    this.ingredientsData
      .deactivateIngredientPriceEntry(ingredientId, price.entryId, price.source)
      .pipe(
        tap(() => {
          this.facade.refresh();
        }),
        switchMap(() => this.reloadManagedIngredient$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (ingredient) => {
          this.managementIngredient.set(ingredient);
          this.managementLoading.set(false);
          this.managementSaving.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.managementError.set(
            error.error?.detail || error.message || 'Nao foi possivel desativar a entry de preco.',
          );
          this.managementLoading.set(false);
          this.managementSaving.set(false);
        },
      });
  }

  private loadManagedIngredient(ingredientId: string, isActive: boolean) {
    this.loadManagedIngredient$(ingredientId, isActive)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ingredient) => {
          this.managementIngredient.set(ingredient);
          this.managementLoading.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.managementError.set(
            error.error?.detail || error.message || 'Nao foi possivel carregar o ingrediente.',
          );
          this.managementLoading.set(false);
        },
      });
  }

  private loadManagedIngredient$(ingredientId: string, isActive: boolean) {
    return this.ingredientsData
      .getManagedIngredient(ingredientId)
      .pipe(
        tap(() => {
          this.selectedIngredientId.set(ingredientId);
          this.selectedIngredientIsActive.set(isActive);
        }),
        map((ingredient) => this.mapManagedIngredient(ingredient, isActive)),
      );
  }

  private reloadManagedIngredient$() {
    const ingredientId = this.selectedIngredientId();

    if (!ingredientId) {
      return throwError(() => new Error('Nenhum ingrediente esta selecionado.'));
    }

    this.managementLoading.set(true);
    return this.loadManagedIngredient$(ingredientId, this.selectedIngredientIsActive());
  }

  private mapManagedIngredient(
    ingredient: ManagedIngredientResponse,
    isActive: boolean,
  ): IngredientManagementDetailVm {
    const historyPrices = [...(ingredient.historyPrices ?? [])]
      .map((item) => this.mapManagedIngredientHistoryPrice(item))
      .sort((left, right) => this.toTimestamp(right.validFrom) - this.toTimestamp(left.validFrom));
    const currentPrice = this.resolveCurrentPrice(historyPrices);

    return {
      baseUnit: ingredient.baseUnit?.trim() || 'Sem unidade base',
      categoryId: ingredient.category?.id ?? '',
      categoryLabel: ingredient.category?.name?.trim() || 'Sem categoria',
      currentPriceLabel: currentPrice?.baseUnitCostLabel ?? 'Sem preco definido',
      currentPriceScope: currentPrice?.source ?? null,
      historyPrices,
      id: ingredient.id ?? '',
      isActive,
      name: ingredient.name?.trim() || 'Ingrediente sem nome',
    };
  }

  private mapManagedIngredientHistoryPrice(
    item: ManagedIngredientHistoryPriceResponse,
  ): IngredientManagementHistoryPriceVm {
    const source =
      item.source === IngredientPriceSourceResponse.Store ? IngredientPriceSourceResponse.Store : IngredientPriceSourceResponse.Organization;
    const purchaseSummaryLabel =
      item.purchasePrice !== null &&
      item.purchasePrice !== undefined &&
      item.purchaseQuantity !== null &&
      item.purchaseQuantity !== undefined &&
      item.purchaseUnit
        ? `${this.formatCurrency(item.purchasePrice)} · ${this.formatNumber(item.purchaseQuantity)} ${item.purchaseUnit}`
        : 'Compra sem detalhes';

    return {
      baseUnitCost: item.baseUnitCost ?? null,
      baseUnitCostLabel:
        item.baseUnitCost !== null && item.baseUnitCost !== undefined
          ? this.formatCurrency(item.baseUnitCost)
          : 'Sem preco definido',
      convertedBaseQuantity: item.convertedBaseQuantity ?? null,
      entryId: item.entryId ?? `${source}-${item.validFrom ?? 'price'}`,
      isActive: item.isActive ?? true,
      isCurrent: item.isCurrent ?? false,
      note: item.note?.trim() || null,
      purchasePrice: item.purchasePrice ?? null,
      purchaseQuantity: item.purchaseQuantity ?? null,
      purchaseSummaryLabel,
      purchaseUnit: item.purchaseUnit?.trim() || null,
      source,
      sourceLabel: source === 'store' ? 'Loja' : 'Organizacao',
      statusLabel: item.isActive === false ? 'Inativo' : 'Ativo',
      supplier: item.supplier?.trim() || null,
      validFrom: item.validFrom ?? null,
      validFromLabel: this.formatDateTime(item.validFrom),
      validTo: item.validTo ?? null,
      validToLabel: this.formatValidTo(item.validTo),
    };
  }

  private resolveCurrentPrice(historyPrices: readonly IngredientManagementHistoryPriceVm[]) {
    const activePrices = historyPrices.filter((price) => price.isActive);
    const sortedStorePrices = activePrices
      .filter((price) => price.source === 'store')
      .sort((left, right) => this.toTimestamp(right.validFrom) - this.toTimestamp(left.validFrom));

    if (sortedStorePrices[0]) {
      return sortedStorePrices[0];
    }

    return activePrices
      .filter((price) => price.source === 'organization')
      .sort((left, right) => this.toTimestamp(right.validFrom) - this.toTimestamp(left.validFrom))[0];
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      currency: 'BRL',
      style: 'currency',
    }).format(value);
  }

  private formatDateTime(value: string | null | undefined) {
    if (!value) {
      return 'Nao informado';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Nao informado';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private formatNumber(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 4,
    }).format(value);
  }

  private formatValidTo(value: string | null | undefined) {
    return value ? this.formatDateTime(value) : 'Sem validade';
  }

  private toTimestamp(value: string | null) {
    if (!value) {
      return 0;
    }

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
