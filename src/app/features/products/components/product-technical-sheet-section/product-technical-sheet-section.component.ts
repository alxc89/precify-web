import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChevronDown, LucideAngularModule, Plus } from 'lucide-angular';
import { ProductIngredientOption } from '../../models/product-management.model';

@Component({
  selector: 'app-product-technical-sheet-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './product-technical-sheet-section.component.html',
})
export class ProductTechnicalSheetSectionComponent {
  readonly expanded = input(true);
  readonly ingredientControls = input.required<readonly FormGroup[]>();
  readonly ingredientOptions = input.required<readonly ProductIngredientOption[]>();
  readonly loading = input(false);
  readonly pendingIngredientControl = input<FormGroup | null>(null);
  readonly saving = input(false);

  readonly addItem = output<void>();
  readonly cancelPendingItem = output<void>();
  readonly confirmPendingItem = output<void>();
  readonly removeItem = output<number>();
  readonly toggleExpanded = output<void>();

  protected readonly ChevronDown = ChevronDown;
  protected readonly Plus = Plus;
  protected readonly sectionAriaLabel = computed(() =>
    this.expanded() ? 'Ocultar ficha técnica' : 'Mostrar ficha técnica',
  );
  protected readonly sectionSummaryLabel = computed(() => {
    const count = this.ingredientControls().length;
    return count === 1 ? '1 item configurado' : `${count} itens configurados`;
  });
  protected readonly hasPendingItem = computed(() => this.pendingIngredientControl() !== null);

  protected resolveIngredientOption(ingredientId: string | null | undefined) {
    if (!ingredientId) {
      return null;
    }

    return this.ingredientOptions().find((option) => option.id === ingredientId) ?? null;
  }

  protected controlHasError(
    group: FormGroup | null,
    controlName: 'ingredientId' | 'quantity',
    errorKey?: string,
  ) {
    const control = this.resolveControl(group, controlName);

    if (!control || !(control.touched || control.dirty)) {
      return false;
    }

    return errorKey ? !!control.errors?.[errorKey] : control.invalid;
  }

  private resolveControl(group: FormGroup | null, controlName: 'ingredientId' | 'quantity') {
    return group?.controls[controlName] as AbstractControl | undefined;
  }
}
