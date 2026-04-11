import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { Loader2, LucideAngularModule, X } from 'lucide-angular';
import {
  IngredientManagementHistoryPriceVm,
  IngredientPriceFormValue,
  IngredientPriceModalMode,
} from '../../models/ingredient-management.model';
import { IngredientPriceScope } from '../../models/ingredient.model';

interface IngredientPriceFormGroup {
  readonly convertedBaseQuantity: FormControl<number | null>;
  readonly note: FormControl<string>;
  readonly purchasePrice: FormControl<number | null>;
  readonly purchaseQuantity: FormControl<number | null>;
  readonly purchaseUnit: FormControl<string>;
  readonly source: FormControl<IngredientPriceScope>;
  readonly supplier: FormControl<string>;
  readonly validFrom: FormControl<string>;
  readonly validTo: FormControl<string>;
}

@Component({
  selector: 'app-ingredient-price-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './ingredient-price-modal.component.html',
  styleUrl: './ingredient-price-modal.component.scss',
})
export class IngredientPriceModalComponent {
  readonly baseUnit = input.required<string>();
  readonly error = input<string | null>(null);
  readonly hasStoreContext = input(false);
  readonly ingredientName = input.required<string>();
  readonly mode = input.required<IngredientPriceModalMode>();
  readonly price = input<IngredientManagementHistoryPriceVm | null>(null);
  readonly saving = input(false);

  readonly close = output<void>();
  readonly savePrice = output<IngredientPriceFormValue>();

  readonly priceForm = new FormGroup<IngredientPriceFormGroup>({
    convertedBaseQuantity: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.000001),
    ]),
    note: new FormControl('', { nonNullable: true }),
    purchasePrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    purchaseQuantity: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.000001),
    ]),
    purchaseUnit: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    source: new FormControl<IngredientPriceScope>('organization', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    supplier: new FormControl('', { nonNullable: true }),
    validFrom: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    validTo: new FormControl('', { nonNullable: true }),
  });

  private readonly formValue = toSignal(
    this.priceForm.valueChanges.pipe(startWith(this.priceForm.getRawValue())),
    { initialValue: this.priceForm.getRawValue() },
  );
  private readonly formSyncVersion = signal(0);

  protected readonly Loader2 = Loader2;
  protected readonly X = X;
  protected readonly dialogTitle = computed(() =>
    this.mode() === 'create' ? 'Novo preço' : 'Editar preço',
  );
  protected readonly baseUnitCost = computed(() => {
    this.formSyncVersion();
    this.formValue();

    const { convertedBaseQuantity, purchasePrice } = this.priceForm.getRawValue();

    if (
      purchasePrice === null ||
      purchasePrice === undefined ||
      convertedBaseQuantity === null ||
      convertedBaseQuantity === undefined ||
      convertedBaseQuantity <= 0
    ) {
      return null;
    }

    return Number((purchasePrice / convertedBaseQuantity).toFixed(4));
  });
  protected readonly baseUnitCostLabel = computed(() => {
    const value = this.baseUnitCost();

    if (value === null) {
      return 'Preencha valor pago e quantidade convertida';
    }

    return new Intl.NumberFormat('pt-BR', {
      currency: 'BRL',
      style: 'currency',
    }).format(value);
  });

  constructor() {
    effect(() => {
      const mode = this.mode();
      const price = this.price();
      const defaultSource: IngredientPriceScope = this.hasStoreContext() ? 'store' : 'organization';

      if (mode === 'edit' && price) {
        this.priceForm.reset(
          {
            convertedBaseQuantity: price.convertedBaseQuantity,
            note: price.note ?? '',
            purchasePrice: price.purchasePrice,
            purchaseQuantity: price.purchaseQuantity,
            purchaseUnit: price.purchaseUnit ?? '',
            source: price.source,
            supplier: price.supplier ?? '',
            validFrom: this.toLocalDateTimeInput(price.validFrom),
            validTo: this.toLocalDateTimeInput(price.validTo),
          },
          { emitEvent: false },
        );
        this.priceForm.controls.source.disable({ emitEvent: false });
        this.syncFormComputedState();
        return;
      }

      this.priceForm.reset(
        {
          convertedBaseQuantity: null,
          note: '',
          purchasePrice: null,
          purchaseQuantity: null,
          purchaseUnit: '',
          source: defaultSource,
          supplier: '',
          validFrom: this.toLocalDateTimeInput(new Date().toISOString()),
          validTo: '',
        },
        { emitEvent: false },
      );
      this.priceForm.controls.source.enable({ emitEvent: false });
      this.syncFormComputedState();
    });
  }

  protected submit() {
    if (this.priceForm.invalid || this.saving()) {
      this.priceForm.markAllAsTouched();
      return;
    }

    this.savePrice.emit({
      baseUnitCost: this.baseUnitCost(),
      convertedBaseQuantity: this.priceForm.controls.convertedBaseQuantity.value,
      note: this.normalizeNullable(this.priceForm.controls.note.value),
      purchasePrice: this.priceForm.controls.purchasePrice.value,
      purchaseQuantity: this.priceForm.controls.purchaseQuantity.value,
      purchaseUnit: this.priceForm.controls.purchaseUnit.value.trim(),
      source: this.priceForm.getRawValue().source,
      supplier: this.normalizeNullable(this.priceForm.controls.supplier.value),
      validFrom: this.toIsoString(this.priceForm.controls.validFrom.value) ?? new Date().toISOString(),
      validTo: this.toIsoString(this.priceForm.controls.validTo.value),
    });
  }

  private normalizeNullable(value: string) {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private toIsoString(value: string) {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  private toLocalDateTimeInput(value: string | null | undefined) {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 16);
  }

  private syncFormComputedState() {
    this.formSyncVersion.update((value) => value + 1);
  }
}
