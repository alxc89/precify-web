import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { hlm } from '../../../../lib/utils';

interface ProductFilterOption {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-products-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './products-filters.component.html',
})
export class ProductsFiltersComponent {
  readonly categories = input.required<readonly ProductFilterOption[]>();
  readonly selectedCategory = input.required<string>();
  readonly selectedStatus = input.required<string>();
  readonly statusOptions = input.required<readonly ProductFilterOption[]>();

  readonly categoryChange = output<string>();
  readonly statusChange = output<string>();

  protected readonly ChevronDown = ChevronDown;

  protected categoryClass(categoryId: string) {
    const active = this.selectedCategory() === categoryId;
    return hlm(
      'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
      active
        ? 'bg-[#004f38] text-white shadow-lg shadow-emerald-900/20'
        : 'bg-[#e7fff2] text-[#004f38] hover:bg-emerald-100',
    );
  }

  protected onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement | null)?.value ?? 'all';
    this.statusChange.emit(value);
  }
}
