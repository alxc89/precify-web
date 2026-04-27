import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import {
  Periodicity,
  StoreFixedCostResponse,
  StoreVariableCostResponse,
  VariableIncidenceType,
  VariableValueType,
} from '../../../../core/api/generated';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { SessionService } from '../../../../core/session/session.service';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import {
  CostManagementKind,
  CostManagementModalComponent,
  CostManagementMode,
  FixedCostFormValue,
  VariableCostFormValue,
} from '../../components/cost-management-modal/cost-management-modal.component';
import { CostsDataService } from '../../services/costs.service';

type CostStatusFilter = 'all' | 'active' | 'inactive';

interface FixedCostVm {
  readonly amountLabel: string;
  readonly category: string;
  readonly id: string;
  readonly isActive: boolean;
  readonly monthlyAmount: number;
  readonly monthlyAmountLabel: string;
  readonly name: string;
  readonly periodicityLabel: string;
}

interface VariableCostVm {
  readonly amountLabel: string;
  readonly category: string;
  readonly id: string;
  readonly incidenceLabel: string;
  readonly isActive: boolean;
  readonly name: string;
  readonly orderLabel: string;
  readonly salesChannelLabel: string;
  readonly valueTypeLabel: string;
}

@Component({
  selector: 'app-costs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CostManagementModalComponent, StatusBadgeComponent],
  templateUrl: './costs-page.component.html',
})
export class CostsPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly costsData = inject(CostsDataService);
  private readonly session = inject(SessionService);
  private readonly topbarSearch = inject(TopbarSearchService);

  protected readonly error = signal<string | null>(null);
  protected readonly fixedCosts = signal<readonly StoreFixedCostResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly modalError = signal<string | null>(null);
  protected readonly modalKind = signal<CostManagementKind | null>(null);
  protected readonly modalMode = signal<CostManagementMode | null>(null);
  protected readonly saving = signal(false);
  protected readonly selectedFixedCost = signal<StoreFixedCostResponse | null>(null);
  protected readonly selectedVariableCost = signal<StoreVariableCostResponse | null>(null);
  protected readonly statusFilter = signal<CostStatusFilter>('all');
  protected readonly variableCosts = signal<readonly StoreVariableCostResponse[]>([]);
  protected readonly hasStoreContext = this.session.hasStoreContext;
  protected readonly currentStore = this.session.currentStore;
  protected readonly isModalOpen = computed(() => this.modalKind() !== null && this.modalMode() !== null);

  private readonly searchTerm = computed(() => this.topbarSearch.query().trim().toLocaleLowerCase('pt-BR'));

  protected readonly filteredFixedCosts = computed<readonly FixedCostVm[]>(() =>
    this.fixedCosts()
      .filter((cost) => this.matchesFilters(cost.name, cost.category, cost.isActive ?? false))
      .map((cost) => this.mapFixedCost(cost))
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
  );

  protected readonly filteredVariableCosts = computed<readonly VariableCostVm[]>(() =>
    this.variableCosts()
      .filter((cost) =>
        this.matchesFilters(
          cost.name,
          [cost.category, cost.salesChannelId, cost.incidenceType, cost.valueType]
            .filter((value): value is string => !!value)
            .join(' '),
          cost.isActive ?? false,
        ),
      )
      .map((cost) => this.mapVariableCost(cost))
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
  );

  protected readonly activeFixedCosts = computed(
    () => this.fixedCosts().filter((cost) => cost.isActive).length,
  );
  protected readonly activeVariableCosts = computed(
    () => this.variableCosts().filter((cost) => cost.isActive).length,
  );
  protected readonly estimatedMonthlyFixedCost = computed(() =>
    this.fixedCosts()
      .filter((cost) => cost.isActive)
      .reduce((total, cost) => total + this.toMonthlyAmount(cost.amount ?? 0, cost.periodicity), 0),
  );
  protected readonly estimatedMonthlyFixedCostLabel = computed(() =>
    this.formatCurrency(this.estimatedMonthlyFixedCost()),
  );

  constructor() {
    this.topbarSearch.configure({
      ariaLabel: 'Buscar custos por nome, categoria ou regra',
      placeholder: 'Buscar custos...',
      visible: true,
    });

    effect(() => {
      this.topbarSearch.query();
      this.statusFilter();
    });

    this.destroyRef.onDestroy(() => {
      this.topbarSearch.reset();
    });

    this.loadSnapshot();
  }

  protected openCreateFixedCost() {
    this.modalKind.set('fixed');
    this.modalMode.set('create');
    this.modalError.set(null);
    this.selectedFixedCost.set(null);
    this.selectedVariableCost.set(null);
  }

  protected openCreateVariableCost() {
    this.modalKind.set('variable');
    this.modalMode.set('create');
    this.modalError.set(null);
    this.selectedFixedCost.set(null);
    this.selectedVariableCost.set(null);
  }

  protected openEditFixedCost(costId: string) {
    const cost = this.fixedCosts().find((item) => item.id === costId);

    if (!cost) {
      return;
    }

    this.modalKind.set('fixed');
    this.modalMode.set('edit');
    this.modalError.set(null);
    this.selectedFixedCost.set(cost);
    this.selectedVariableCost.set(null);
  }

  protected openEditVariableCost(costId: string) {
    const cost = this.variableCosts().find((item) => item.id === costId);

    if (!cost) {
      return;
    }

    this.modalKind.set('variable');
    this.modalMode.set('edit');
    this.modalError.set(null);
    this.selectedFixedCost.set(null);
    this.selectedVariableCost.set(cost);
  }

  protected closeModal() {
    this.modalKind.set(null);
    this.modalMode.set(null);
    this.modalError.set(null);
    this.saving.set(false);
    this.selectedFixedCost.set(null);
    this.selectedVariableCost.set(null);
  }

  protected saveFixedCost(value: FixedCostFormValue) {
    const mode = this.modalMode();

    if (mode === null) {
      return;
    }

    this.saving.set(true);
    this.modalError.set(null);

    const request = {
      amount: value.amount,
      category: value.category,
      isActive: value.isActive,
      name: value.name,
      periodicity: value.periodicity,
    };

    const operation =
      mode === 'create'
        ? this.costsData.createFixedCost(request)
        : this.costsData.updateFixedCost(this.selectedFixedCost()?.id ?? '', request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.closeModal();
        this.loadSnapshot();
      },
      error: (error: { error?: { detail?: string }; message?: string }) => {
        this.modalError.set(error.error?.detail || error.message || 'Nao foi possivel salvar o custo fixo.');
        this.saving.set(false);
      },
    });
  }

  protected saveVariableCost(value: VariableCostFormValue) {
    const mode = this.modalMode();

    if (mode === null) {
      return;
    }

    this.saving.set(true);
    this.modalError.set(null);

    const request = {
      amount: value.amount,
      calculationOrder: value.calculationOrder,
      category: value.category,
      incidenceType: value.incidenceType,
      isActive: value.isActive,
      name: value.name,
      salesChannelId: value.salesChannelId,
      valueType: value.valueType,
    };

    const operation =
      mode === 'create'
        ? this.costsData.createVariableCost(request)
        : this.costsData.updateVariableCost(this.selectedVariableCost()?.id ?? '', request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.closeModal();
        this.loadSnapshot();
      },
      error: (error: { error?: { detail?: string }; message?: string }) => {
        this.modalError.set(
          error.error?.detail || error.message || 'Nao foi possivel salvar o custo variavel.',
        );
        this.saving.set(false);
      },
    });
  }

  protected setStatusFilter(filter: CostStatusFilter) {
    this.statusFilter.set(filter);
  }

  protected statusButtonClass(filter: CostStatusFilter) {
    return this.statusFilter() === filter
      ? 'rounded-full bg-[#004f38] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white focus:outline-none focus:ring-2 focus:ring-[#004f38]'
      : 'rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900/60 focus:outline-none focus:ring-2 focus:ring-[#004f38]';
  }

  protected trackById(_: number, item: FixedCostVm | VariableCostVm) {
    return item.id;
  }

  protected variableKindLabel(valueTypeLabel: string, incidenceLabel: string) {
    return `${valueTypeLabel} · ${incidenceLabel}`;
  }

  private loadSnapshot() {
    if (!this.hasStoreContext()) {
      this.fixedCosts.set([]);
      this.variableCosts.set([]);
      this.error.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.costsData
      .getSnapshot()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ fixedCosts, variableCosts }) => {
          this.fixedCosts.set(fixedCosts);
          this.variableCosts.set(variableCosts);
          this.loading.set(false);
        },
        error: (error: { error?: { detail?: string }; message?: string }) => {
          this.fixedCosts.set([]);
          this.variableCosts.set([]);
          this.error.set(
            error.error?.detail || error.message || 'Nao foi possivel carregar os custos da loja.',
          );
          this.loading.set(false);
        },
      });
  }

  private mapFixedCost(cost: StoreFixedCostResponse): FixedCostVm {
    const name = cost.name?.trim() || 'Custo fixo sem nome';
    const amount = cost.amount ?? 0;
    const monthlyAmount = this.toMonthlyAmount(amount, cost.periodicity);

    return {
      amountLabel: this.formatCurrency(amount),
      category: cost.category?.trim() || 'Sem categoria',
      id: cost.id ?? name,
      isActive: cost.isActive ?? false,
      monthlyAmount,
      monthlyAmountLabel: this.formatCurrency(monthlyAmount),
      name,
      periodicityLabel: this.periodicityLabel(cost.periodicity),
    };
  }

  private mapVariableCost(cost: StoreVariableCostResponse): VariableCostVm {
    const name = cost.name?.trim() || 'Custo variavel sem nome';

    return {
      amountLabel: this.variableAmountLabel(cost.amount, cost.valueType),
      category: cost.category?.trim() || 'Sem categoria',
      id: cost.id ?? name,
      incidenceLabel: this.incidenceTypeLabel(cost.incidenceType),
      isActive: cost.isActive ?? false,
      name,
      orderLabel:
        cost.calculationOrder === null || cost.calculationOrder === undefined
          ? 'Sem ordem definida'
          : `Ordem ${cost.calculationOrder}`,
      salesChannelLabel: cost.salesChannelId?.trim() || 'Todos os canais',
      valueTypeLabel: this.valueTypeLabel(cost.valueType),
    };
  }

  private matchesFilters(name: string | null | undefined, extra: string | null | undefined, isActive: boolean) {
    const statusFilter = this.statusFilter();

    if (statusFilter === 'active' && !isActive) {
      return false;
    }

    if (statusFilter === 'inactive' && isActive) {
      return false;
    }

    const searchTerm = this.searchTerm();

    if (!searchTerm) {
      return true;
    }

    return `${name ?? ''} ${extra ?? ''}`.toLocaleLowerCase('pt-BR').includes(searchTerm);
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      currency: 'BRL',
      style: 'currency',
    }).format(value);
  }

  private incidenceTypeLabel(value: VariableIncidenceType | undefined) {
    switch (value) {
      case VariableIncidenceType.OnSalesPrice:
        return 'Sobre preco de venda';
      case VariableIncidenceType.OnCost:
        return 'Sobre custo';
      case VariableIncidenceType.PerOrder:
        return 'Por pedido';
      case VariableIncidenceType.PerItem:
        return 'Por item';
      case VariableIncidenceType.PerProduct:
        return 'Por produto';
      case VariableIncidenceType.PerChannel:
        return 'Por canal';
      default:
        return 'Incidencia nao definida';
    }
  }

  private periodicityLabel(value: Periodicity | undefined) {
    switch (value) {
      case Periodicity.Daily:
        return 'Diario';
      case Periodicity.Weekly:
        return 'Semanal';
      case Periodicity.Biweekly:
        return 'Quinzenal';
      case Periodicity.Monthly:
        return 'Mensal';
      case Periodicity.Annual:
        return 'Anual';
      default:
        return 'Periodicidade nao definida';
    }
  }

  private toMonthlyAmount(amount: number, periodicity: Periodicity | undefined) {
    switch (periodicity) {
      case Periodicity.Daily:
        return amount * 30;
      case Periodicity.Weekly:
        return amount * 4;
      case Periodicity.Biweekly:
        return amount * 2;
      case Periodicity.Monthly:
        return amount;
      case Periodicity.Annual:
        return amount / 12;
      default:
        return amount;
    }
  }

  private valueTypeLabel(value: VariableValueType | undefined) {
    return value === VariableValueType.FixedValue ? 'Valor fixo' : 'Percentual';
  }

  private variableAmountLabel(amount: number | undefined, valueType: VariableValueType | undefined) {
    const safeAmount = amount ?? 0;
    return valueType === VariableValueType.Percentage
      ? `${new Intl.NumberFormat('pt-BR', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        }).format(safeAmount)}%`
      : this.formatCurrency(safeAmount);
  }
}
