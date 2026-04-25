import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Periodicity,
  StoreFixedCostResponse,
  StoreVariableCostResponse,
  VariableIncidenceType,
  VariableValueType,
} from '../../../../core/api/generated';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { LucideAngularModule, Loader2, X } from 'lucide-angular';

export type CostManagementKind = 'fixed' | 'variable';
export type CostManagementMode = 'create' | 'edit';

export interface FixedCostFormValue {
  readonly amount: number;
  readonly category: string;
  readonly name: string;
  readonly periodicity: Periodicity;
}

export interface VariableCostFormValue {
  readonly amount: number;
  readonly calculationOrder: number | null;
  readonly category: string;
  readonly incidenceType: VariableIncidenceType;
  readonly name: string;
  readonly salesChannelId: string | null;
  readonly valueType: VariableValueType;
}

interface FixedCostFormModel {
  readonly amount: FormControl<number>;
  readonly category: FormControl<string>;
  readonly name: FormControl<string>;
  readonly periodicity: FormControl<Periodicity>;
}

interface VariableCostFormModel {
  readonly amount: FormControl<number>;
  readonly calculationOrder: FormControl<number>;
  readonly category: FormControl<string>;
  readonly incidenceType: FormControl<VariableIncidenceType>;
  readonly name: FormControl<string>;
  readonly salesChannelId: FormControl<string>;
  readonly valueType: FormControl<VariableValueType>;
}

@Component({
  selector: 'app-cost-management-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ReactiveFormsModule, StatusBadgeComponent],
  templateUrl: './cost-management-modal.component.html',
})
export class CostManagementModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly error = input<string | null>(null);
  readonly fixedCost = input<StoreFixedCostResponse | null>(null);
  readonly kind = input.required<CostManagementKind>();
  readonly loading = input(false);
  readonly mode = input.required<CostManagementMode>();
  readonly saving = input(false);
  readonly variableCost = input<StoreVariableCostResponse | null>(null);

  readonly close = output<void>();
  readonly deactivate = output<void>();
  readonly saveFixedCost = output<FixedCostFormValue>();
  readonly saveVariableCost = output<VariableCostFormValue>();

  readonly fixedCostForm: FormGroup<FixedCostFormModel> = this.fb.group({
    amount: this.fb.control(0, { validators: [Validators.required, Validators.min(0.01)] }),
    category: this.fb.control('', { validators: [Validators.required, Validators.maxLength(80)] }),
    name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(120)] }),
    periodicity: this.fb.control<Periodicity>(Periodicity.Monthly, { validators: [Validators.required] }),
  });

  readonly variableCostForm: FormGroup<VariableCostFormModel> = this.fb.group({
    amount: this.fb.control(0, { validators: [Validators.required, Validators.min(0.01)] }),
    calculationOrder: this.fb.control(0),
    category: this.fb.control('', { validators: [Validators.required, Validators.maxLength(80)] }),
    incidenceType: this.fb.control<VariableIncidenceType>(VariableIncidenceType.OnSalesPrice, {
      validators: [Validators.required],
    }),
    name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(120)] }),
    salesChannelId: this.fb.control(''),
    valueType: this.fb.control<VariableValueType>(VariableValueType.Percentage, {
      validators: [Validators.required],
    }),
  });

  protected readonly Loader2 = Loader2;
  protected readonly X = X;
  protected readonly periodicityOptions = Object.values(Periodicity);
  protected readonly incidenceOptions = Object.values(VariableIncidenceType);
  protected readonly valueTypeOptions = Object.values(VariableValueType);
  protected readonly isEditMode = computed(() => this.mode() === 'edit');
  protected readonly dialogTitle = computed(() => {
    const actionLabel = this.mode() === 'create' ? 'Novo' : 'Editar';
    return this.kind() === 'fixed' ? `${actionLabel} Custo Fixo` : `${actionLabel} Custo Variavel`;
  });
  protected readonly dialogSubtitle = computed(() =>
    this.kind() === 'fixed'
      ? 'Cadastre despesas recorrentes da operacao da loja.'
      : 'Cadastre encargos variaveis e percentuais aplicados nas vendas.',
  );
  protected readonly activeStatus = computed(() =>
    this.mode() === 'create'
      ? true
      : this.kind() === 'fixed'
        ? this.fixedCost()?.isActive ?? null
        : this.variableCost()?.isActive ?? null,
  );
  protected readonly deactivateDisabled = computed(() =>
    this.saving() || !this.isEditMode() || this.activeStatus() !== true,
  );
  protected readonly statusToggleAriaLabel = computed(() =>
    this.activeStatus() ? 'Status ativo sem edicao disponivel' : 'Status inativo sem edicao disponivel',
  );

  constructor() {
    effect(() => {
      const kind = this.kind();
      const mode = this.mode();

      if (kind === 'fixed') {
        const cost = this.fixedCost();

        this.fixedCostForm.reset(
          {
            amount: cost?.amount ?? 0,
            category: cost?.category ?? '',
            name: cost?.name ?? '',
            periodicity: cost?.periodicity ?? Periodicity.Monthly,
          },
          { emitEvent: false },
        );
      } else {
        const cost = this.variableCost();

        this.variableCostForm.reset(
          {
            amount: cost?.amount ?? 0,
            calculationOrder: cost?.calculationOrder ?? 0,
            category: cost?.category ?? '',
            incidenceType: cost?.incidenceType ?? VariableIncidenceType.OnSalesPrice,
            name: cost?.name ?? '',
            salesChannelId: cost?.salesChannelId ?? '',
            valueType: cost?.valueType ?? VariableValueType.Percentage,
          },
          { emitEvent: false },
        );
      }

      if (mode === 'create') {
        this.fixedCostForm.markAsPristine();
        this.variableCostForm.markAsPristine();
      }
    });
  }

  protected incidenceTypeLabel(value: VariableIncidenceType) {
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
    }
  }

  protected periodicityLabel(value: Periodicity) {
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
    }
  }

  protected valueTypeLabel(value: VariableValueType) {
    return value === VariableValueType.Percentage ? 'Percentual' : 'Valor fixo';
  }

  protected submit() {
    if (this.kind() === 'fixed') {
      if (this.fixedCostForm.invalid || this.loading() || this.saving()) {
        this.fixedCostForm.markAllAsTouched();
        return;
      }

      const value = this.fixedCostForm.getRawValue();
      this.saveFixedCost.emit({
        amount: value.amount,
        category: value.category.trim(),
        name: value.name.trim(),
        periodicity: value.periodicity,
      });
      return;
    }

    if (this.variableCostForm.invalid || this.loading() || this.saving()) {
      this.variableCostForm.markAllAsTouched();
      return;
    }

    const value = this.variableCostForm.getRawValue();
    this.saveVariableCost.emit({
      amount: value.amount,
      calculationOrder: value.calculationOrder === null ? null : Number(value.calculationOrder),
      category: value.category.trim(),
      incidenceType: value.incidenceType,
      name: value.name.trim(),
      salesChannelId: value.salesChannelId.trim() || null,
      valueType: value.valueType,
    });
  }
}
