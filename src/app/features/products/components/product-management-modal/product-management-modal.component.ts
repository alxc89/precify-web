import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChevronDown, Loader2, LucideAngularModule, Plus, RefreshCcw, Trash2, X } from 'lucide-angular';
import {
  ProductIngredientOption,
  ProductManagementDetailVm,
  ProductManagementFormValue,
  ProductManagementModalMode,
} from '../../models/product-management.model';

@Component({
  selector: 'app-product-management-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './product-management-modal.component.html',
})
export class ProductManagementModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly error = input<string | null>(null);
  readonly ingredientOptions = input.required<readonly ProductIngredientOption[]>();
  readonly loading = input(false);
  readonly mode = input.required<ProductManagementModalMode>();
  readonly product = input<ProductManagementDetailVm | null>(null);
  readonly saving = input(false);

  readonly close = output<void>();
  readonly saveProduct = output<ProductManagementFormValue>();
  readonly toggleProductStatus = output<void>();

  readonly productForm = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(60)]],
    description: ['', Validators.maxLength(500)],
    ingredients: this.fb.array([] as ReturnType<ProductManagementModalComponent['createIngredientGroup']>[]),
    name: ['', [Validators.required, Validators.maxLength(160)]],
    photoUrl: ['', Validators.maxLength(500)],
  });

  protected readonly ChevronDown = ChevronDown;
  protected readonly Loader2 = Loader2;
  protected readonly Plus = Plus;
  protected readonly RefreshCcw = RefreshCcw;
  protected readonly Trash2 = Trash2;
  protected readonly X = X;
  protected readonly technicalSheetExpanded = signal(true);
  protected readonly dialogTitle = computed(() =>
    this.mode() === 'create' ? 'Novo Produto' : 'Editar Produto',
  );
  protected readonly statusActionLabel = computed(() =>
    this.product()?.isActive ? 'Desativar produto' : 'Reativar produto',
  );
  protected readonly statusHelperLabel = computed(() => 'Desativar Produto');
  protected readonly statusToggleAriaLabel = computed(() =>
    this.product()?.isActive ? 'Desativar produto' : 'Reativar produto',
  );
  protected readonly technicalSheetSectionAriaLabel = computed(() =>
    this.technicalSheetExpanded() ? 'Ocultar ficha técnica' : 'Mostrar ficha técnica',
  );
  protected readonly technicalSheetSummaryLabel = computed(() => {
    const count = this.ingredientControls().length;
    return count === 1 ? '1 item configurado' : `${count} itens configurados`;
  });

  constructor() {
    effect(() => {
      const mode = this.mode();
      const product = this.product();

      if (mode === 'create') {
        this.productForm.reset(
          {
            code: '',
            description: '',
            name: '',
            photoUrl: '',
          },
          { emitEvent: false },
        );
        this.replaceIngredientRows([]);
        return;
      }

      if (!product) {
        return;
      }

      this.productForm.reset(
        {
          code: product.code,
          description: product.description ?? '',
          name: product.name,
          photoUrl: product.photoUrl ?? '',
        },
        { emitEvent: false },
      );
      this.replaceIngredientRows(
        product.technicalSheet.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity ?? 0,
        })),
      );
    });
  }

  protected ingredientControls() {
    return this.ingredientsArray.controls;
  }

  protected addIngredientRow() {
    this.ingredientsArray.push(this.createIngredientGroup());
  }

  protected removeIngredientRow(index: number) {
    this.ingredientsArray.removeAt(index);
  }

  protected toggleTechnicalSheetSection() {
    this.technicalSheetExpanded.update((current) => !current);
  }

  protected resolveIngredientOption(ingredientId: string | null | undefined) {
    if (!ingredientId) {
      return null;
    }

    return this.ingredientOptions().find((option) => option.id === ingredientId) ?? null;
  }

  protected submit() {
    if (this.productForm.invalid || this.loading() || this.saving()) {
      this.productForm.markAllAsTouched();
      this.ingredientsArray.markAllAsTouched();
      return;
    }

    const value = this.productForm.getRawValue();

    this.saveProduct.emit({
      code: value.code.trim(),
      description: value.description.trim() || null,
      ingredients: value.ingredients.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
      })),
      name: value.name.trim(),
      photoUrl: value.photoUrl.trim() || null,
    });
  }

  private get ingredientsArray() {
    return this.productForm.controls.ingredients;
  }

  private createIngredientGroup(value?: { ingredientId?: string; quantity?: number }) {
    return this.fb.group({
      ingredientId: [value?.ingredientId ?? '', Validators.required],
      quantity: [
        value?.quantity ?? 1,
        [Validators.required, Validators.min(0.0001)],
      ],
    });
  }

  private replaceIngredientRows(values: readonly { ingredientId?: string; quantity?: number }[]) {
    this.ingredientsArray.clear();

    values.forEach((value) => {
      this.ingredientsArray.push(this.createIngredientGroup(value));
    });
  }
}
