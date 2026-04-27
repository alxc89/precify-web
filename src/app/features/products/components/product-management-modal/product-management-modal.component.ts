import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loader2, LucideAngularModule, X } from 'lucide-angular';
import { ProductTechnicalSheetSectionComponent } from '../product-technical-sheet-section/product-technical-sheet-section.component';
import {
  ProductIngredientOption,
  ProductManagementDetailVm,
  ProductManagementFormValue,
  ProductManagementModalMode,
} from '../../models/product-management.model';

@Component({
  selector: 'app-product-management-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ProductTechnicalSheetSectionComponent, ReactiveFormsModule],
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

  protected readonly Loader2 = Loader2;
  protected readonly X = X;
  protected readonly pendingIngredientControl = signal<ReturnType<
    ProductManagementModalComponent['createIngredientGroup']
  > | null>(null);
  protected readonly editingIngredientIndex = signal<number | null>(null);
  private readonly editingIngredientSnapshot = signal<{ ingredientId: string; quantity: number | null } | null>(null);
  protected readonly technicalSheetExpanded = signal(true);
  protected readonly dialogTitle = computed(() =>
    this.mode() === 'create' ? 'Novo Produto' : 'Editar Produto',
  );
  protected readonly statusHelperLabel = computed(() => 'Desativar Produto');
  protected readonly statusToggleAriaLabel = computed(() =>
    this.product()?.isActive ? 'Desativar produto' : 'Reativar produto',
  );

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
        this.pendingIngredientControl.set(null);
        this.editingIngredientIndex.set(null);
        this.editingIngredientSnapshot.set(null);
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
      this.pendingIngredientControl.set(null);
      this.editingIngredientIndex.set(null);
      this.editingIngredientSnapshot.set(null);
      this.replaceIngredientRows(
        product.technicalSheet.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity ?? null,
        })),
      );
    });
  }

  protected ingredientControls() {
    return this.ingredientsArray.controls;
  }

  protected addIngredientRow() {
    if (this.pendingIngredientControl() || this.editingIngredientIndex() !== null) {
      return;
    }

    this.pendingIngredientControl.set(this.createIngredientGroup());
  }

  protected cancelPendingIngredient() {
    this.pendingIngredientControl.set(null);
  }

  protected confirmPendingIngredient() {
    const pendingIngredient = this.pendingIngredientControl();

    if (!pendingIngredient) {
      return;
    }

    if (pendingIngredient.invalid) {
      pendingIngredient.markAllAsTouched();
      return;
    }

    const value = pendingIngredient.getRawValue();
    this.ingredientsArray.push(
      this.createIngredientGroup({
        ingredientId: value.ingredientId,
        quantity: value.quantity ?? undefined,
      }),
    );
    this.pendingIngredientControl.set(null);
  }

  protected startEditingIngredient(index: number) {
    if (this.pendingIngredientControl() || this.editingIngredientIndex() !== null) {
      return;
    }

    const group = this.ingredientsArray.at(index);

    if (!group) {
      return;
    }

    const value = group.getRawValue();
    this.editingIngredientSnapshot.set({
      ingredientId: value.ingredientId,
      quantity: value.quantity ?? null,
    });
    this.editingIngredientIndex.set(index);
  }

  protected cancelEditingIngredient() {
    const index = this.editingIngredientIndex();
    const snapshot = this.editingIngredientSnapshot();

    if (index === null || snapshot === null) {
      return;
    }

    const group = this.ingredientsArray.at(index);

    if (!group) {
      this.editingIngredientIndex.set(null);
      this.editingIngredientSnapshot.set(null);
      return;
    }

    group.reset(snapshot, { emitEvent: false });
    group.markAsPristine();
    group.markAsUntouched();
    this.editingIngredientIndex.set(null);
    this.editingIngredientSnapshot.set(null);
  }

  protected confirmEditingIngredient() {
    const index = this.editingIngredientIndex();

    if (index === null) {
      return;
    }

    const group = this.ingredientsArray.at(index);

    if (!group) {
      this.editingIngredientIndex.set(null);
      this.editingIngredientSnapshot.set(null);
      return;
    }

    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }

    group.markAsDirty();
    this.editingIngredientIndex.set(null);
    this.editingIngredientSnapshot.set(null);
  }

  protected removeIngredientRow(index: number) {
    this.ingredientsArray.removeAt(index);

    const editingIndex = this.editingIngredientIndex();

    if (editingIndex === null) {
      return;
    }

    if (editingIndex === index) {
      this.editingIngredientIndex.set(null);
      this.editingIngredientSnapshot.set(null);
      return;
    }

    if (editingIndex > index) {
      this.editingIngredientIndex.set(editingIndex - 1);
    }
  }

  protected toggleTechnicalSheetSection() {
    this.technicalSheetExpanded.update((current) => !current);
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
        quantity: item.quantity ?? 0,
      })),
      name: value.name.trim(),
      photoUrl: value.photoUrl.trim() || null,
    });
  }

  private get ingredientsArray() {
    return this.productForm.controls.ingredients;
  }

  private createIngredientGroup(value?: { ingredientId?: string; quantity?: number | null }) {
    return this.fb.group({
      ingredientId: [value?.ingredientId ?? '', Validators.required],
      quantity: new FormControl<number | null>(value?.quantity ?? null, [
        Validators.required,
        Validators.min(0.0001),
      ]),
    });
  }

  private replaceIngredientRows(values: readonly { ingredientId?: string; quantity?: number | null }[]) {
    this.ingredientsArray.clear();

    values.forEach((value) => {
      this.ingredientsArray.push(this.createIngredientGroup(value));
    });
  }
}
