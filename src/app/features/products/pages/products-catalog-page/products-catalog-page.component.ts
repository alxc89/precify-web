import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { ProductsFiltersComponent } from '../../components/products-filters/products-filters.component';
import { ProductsGridComponent } from '../../components/products-grid/products-grid.component';
import { ProductsPageHeaderComponent } from '../../components/products-page-header/products-page-header.component';
import { ProductsSummaryCardComponent } from '../../components/products-summary-card/products-summary-card.component';
import { ProductsCatalogFacade } from '../../facades/products-catalog.facade';

@Component({
  selector: 'app-products-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProductsFiltersComponent,
    ProductsGridComponent,
    ProductsPageHeaderComponent,
    ProductsSummaryCardComponent,
  ],
  providers: [ProductsCatalogFacade],
  templateUrl: './products-catalog-page.component.html',
})
export class ProductsCatalogPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly topbarSearch = inject(TopbarSearchService);
  private readonly facade = inject(ProductsCatalogFacade);

  protected readonly vm = this.facade.vm;

  constructor() {
    this.topbarSearch.configure({
      ariaLabel: 'Buscar no catálogo de produtos',
      placeholder: 'Buscar no catálogo...',
      visible: true,
    });

    effect(() => {
      this.facade.setSearchTerm(this.topbarSearch.query());
    });

    this.destroyRef.onDestroy(() => {
      this.topbarSearch.reset();
    });
  }

  protected onCreateProduct() {}

  protected onCategoryChange(value: string) {
    this.facade.setCategoryFilter(value);
  }

  protected onOpenProductActions(_productId: string) {}

  protected onPageChange(page: number) {
    this.facade.setPage(page);
  }

  protected onStatusChange(value: string) {
    this.facade.setStatusFilter(value);
  }
}
