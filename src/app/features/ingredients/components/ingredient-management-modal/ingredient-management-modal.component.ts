import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChevronDown, Loader2, LucideAngularModule, Plus, X } from 'lucide-angular';
import { IngredientCategoryFilterOption } from '../../models/ingredient-filter.model';
import {
  IngredientManagementDetailVm,
  IngredientManagementFormValue,
  IngredientManagementHistoryPriceVm,
  IngredientManagementModalMode,
} from '../../models/ingredient-management.model';
import { PriceScopeBadgeComponent } from '../../../../shared/ui/price-scope-badge/price-scope-badge.component';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-ingredient-management-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, PriceScopeBadgeComponent, ReactiveFormsModule, StatusBadgeComponent],
  templateUrl: './ingredient-management-modal.component.html',
  styleUrl: './ingredient-management-modal.component.scss',
})
export class IngredientManagementModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly categories = input.required<readonly IngredientCategoryFilterOption[]>();
  readonly error = input<string | null>(null);
  readonly ingredient = input<IngredientManagementDetailVm | null>(null);
  readonly loading = input(false);
  readonly mode = input.required<IngredientManagementModalMode>();
  readonly saving = input(false);

  readonly close = output<void>();
  readonly deactivateIngredient = output<void>();
  readonly deactivatePrice = output<IngredientManagementHistoryPriceVm>();
  readonly editPrice = output<IngredientManagementHistoryPriceVm>();
  readonly openNewPrice = output<void>();
  readonly saveIngredient = output<IngredientManagementFormValue>();

  readonly ingredientForm = this.fb.group({
    baseUnit: ['', [Validators.required, Validators.maxLength(30)]],
    ingredientCategoryId: ['', Validators.required],
    name: ['', [Validators.required, Validators.maxLength(120)]],
  });

  protected readonly historySectionExpanded = signal(true);
  protected readonly ChevronDown = ChevronDown;
  protected readonly Loader2 = Loader2;
  protected readonly Plus = Plus;
  protected readonly X = X;
  protected readonly canManageHistory = computed(() => this.mode() === 'edit' && !!this.ingredient()?.id);
  protected readonly currentPriceLabel = computed(
    () => this.ingredient()?.currentPriceLabel ?? 'Sem preco definido',
  );
  protected readonly currentPriceScope = computed(() => this.ingredient()?.currentPriceScope ?? null);
  protected readonly dialogTitle = computed(() =>
    this.mode() === 'create' ? 'Novo Ingrediente' : 'Editar Ingrediente',
  );
  protected readonly historyPrices = computed(() => this.ingredient()?.historyPrices ?? []);
  protected readonly historySectionAriaLabel = computed(() =>
    this.historySectionExpanded() ? 'Ocultar histórico de preços' : 'Mostrar histórico de preços',
  );
  protected readonly statusToggleAriaLabel = computed(() =>
    this.ingredient()?.isActive ? 'Desativar ingrediente' : 'Reativacao indisponivel',
  );
  protected readonly statusButtonDisabled = computed(() => !this.ingredient()?.isActive);
  protected readonly statusHelperLabel = computed(() =>
    this.ingredient()?.isActive
      ? 'Desativar ingrediente'
      : 'Reativacao indisponivel',
  );

  constructor() {
    effect(() => {
      const mode = this.mode();
      const ingredient = this.ingredient();
      const categories = this.categories();

      if (mode === 'create') {
        this.ingredientForm.reset(
          {
            baseUnit: '',
            ingredientCategoryId: categories[0]?.id ?? '',
            name: '',
          },
          { emitEvent: false },
        );
        return;
      }

      if (!ingredient) {
        return;
      }

      this.ingredientForm.reset(
        {
          baseUnit: ingredient.baseUnit,
          ingredientCategoryId: ingredient.categoryId,
          name: ingredient.name,
        },
        { emitEvent: false },
      );
    });
  }

  protected submit() {
    if (this.ingredientForm.invalid || this.loading() || this.saving()) {
      this.ingredientForm.markAllAsTouched();
      return;
    }

    const value = this.ingredientForm.getRawValue();
    this.saveIngredient.emit({
      baseUnit: value.baseUnit.trim(),
      ingredientCategoryId: value.ingredientCategoryId,
      name: value.name.trim(),
    });
  }

  protected toggleHistorySection() {
    this.historySectionExpanded.update((current) => !current);
  }
}
