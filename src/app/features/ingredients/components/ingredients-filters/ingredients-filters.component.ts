import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { IngredientCategoryFilterOption, IngredientStatusFilter } from '../../models/ingredient-filter.model';
import { hlm } from '../../../../lib/utils';

@Component({
  selector: 'app-ingredients-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'col-span-12 xl:col-span-8',
  },
  imports: [LucideAngularModule],
  templateUrl: './ingredients-filters.component.html',
  styleUrl: './ingredients-filters.component.scss',
})
export class IngredientsFiltersComponent {
  readonly categories = input.required<readonly IngredientCategoryFilterOption[]>();
  readonly selectedCategoryId = input.required<string>();
  readonly statusFilter = input.required<IngredientStatusFilter>();

  readonly categoryChange = output<string>();
  readonly statusChange = output<IngredientStatusFilter>();

  protected readonly ChevronDown = ChevronDown;

  protected categoryClass(categoryId: string) {
    return hlm(
      'rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#004f38] focus:ring-offset-2 focus:ring-offset-white',
      this.selectedCategoryId() === categoryId
        ? 'bg-[#004f38] text-white'
        : 'bg-[#c9f8e2] text-[#3f4943] hover:bg-emerald-100',
    );
  }

  protected onStatusChange(event: Event) {
    this.statusChange.emit((event.target as HTMLSelectElement).value as IngredientStatusFilter);
  }
}
