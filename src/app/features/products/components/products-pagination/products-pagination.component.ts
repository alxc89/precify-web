import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { hlm } from '../../../../lib/utils';

@Component({
  selector: 'app-products-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './products-pagination.component.html',
})
export class ProductsPaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;

  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 3) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    let start = Math.max(1, current - 1);
    let end = Math.min(total, start + 2);

    start = Math.max(1, end - 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  protected pageClass(page: number) {
    return hlm(
      'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#004f38] focus:ring-offset-2 focus:ring-offset-[#e7fff2]',
      page === this.currentPage()
        ? 'bg-emerald-900 text-white shadow-md'
        : 'border border-emerald-100 bg-white text-emerald-900 hover:bg-emerald-50',
    );
  }

  protected goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.pageChange.emit(page);
  }
}
