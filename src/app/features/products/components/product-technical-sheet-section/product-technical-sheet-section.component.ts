import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChevronDown, LucideAngularModule, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-angular';
import { ProductIngredientOption } from '../../models/product-management.model';

@Component({
  selector: 'app-product-technical-sheet-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './product-technical-sheet-section.component.html',
})
export class ProductTechnicalSheetSectionComponent {
  readonly editingIngredientIndex = input<number | null>(null);
  readonly expanded = input(true);
  readonly ingredientControls = input.required<readonly FormGroup[]>();
  readonly ingredientOptions = input.required<readonly ProductIngredientOption[]>();
  readonly loading = input(false);
  readonly pendingIngredientControl = input<FormGroup | null>(null);
  readonly saving = input(false);

  readonly addItem = output<void>();
  readonly cancelEditingItem = output<void>();
  readonly cancelPendingItem = output<void>();
  readonly confirmEditingItem = output<void>();
  readonly confirmPendingItem = output<void>();
  readonly editItem = output<number>();
  readonly removeItem = output<number>();
  readonly toggleExpanded = output<void>();

  protected readonly ChevronDown = ChevronDown;
  protected readonly MoreVertical = MoreVertical;
  protected readonly Pencil = Pencil;
  protected readonly Plus = Plus;
  protected readonly Trash2 = Trash2;
  protected readonly sectionAriaLabel = computed(() =>
    this.expanded() ? 'Ocultar ficha técnica' : 'Mostrar ficha técnica',
  );
  protected readonly sectionSummaryLabel = computed(() => {
    const count = this.ingredientControls().length;
    return count === 1 ? '1 item configurado' : `${count} itens configurados`;
  });
  protected readonly hasPendingItem = computed(() => this.pendingIngredientControl() !== null);
  protected readonly hasEditingItem = computed(() => this.editingIngredientIndex() !== null);

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

  protected isEditingRow(index: number) {
    return this.editingIngredientIndex() === index;
  }

  private resolveControl(group: FormGroup | null, controlName: 'ingredientId' | 'quantity') {
    return group?.controls[controlName] as AbstractControl | undefined;
  }
}
