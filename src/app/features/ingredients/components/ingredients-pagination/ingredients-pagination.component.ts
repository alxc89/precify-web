import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { IngredientsCatalogPaginationVm } from '../../models/ingredient-filter.model';
import { hlm } from '../../../../lib/utils';

@Component({
  selector: 'app-ingredients-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './ingredients-pagination.component.html',
  styleUrl: './ingredients-pagination.component.scss',
})
export class IngredientsPaginationComponent {
  readonly pagination = input.required<IngredientsCatalogPaginationVm>();

  readonly pageChange = output<number>();

  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;

  protected readonly canGoBack = computed(() => this.pagination().currentPage > 1);
  protected readonly canGoForward = computed(
    () => this.pagination().currentPage < this.pagination().totalPages,
  );

  protected pageButtonClass(page: number) {
    return hlm(
      'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#004f38]',
      this.pagination().currentPage === page
        ? 'bg-[#004f38] text-white'
        : 'bg-[#c9f8e2] text-[#3f4943] hover:bg-emerald-100',
    );
  }
}
