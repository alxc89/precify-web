import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { ProductsFiltersComponent } from '../../components/products-filters/products-filters.component';
import { ProductsPageHeaderComponent } from '../../components/products-page-header/products-page-header.component';

@Component({
  selector: 'app-products-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductsFiltersComponent, ProductsPageHeaderComponent],
  templateUrl: './products-catalog-page.component.html',
})
export class ProductsCatalogPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly topbarSearch = inject(TopbarSearchService);

  protected readonly categoryOptions: readonly ProductFilterOption[] = [
    { label: 'Todas as Categorias', value: 'all' },
    { label: 'Entradas', value: 'entradas' },
    { label: 'Pratos Principais', value: 'pratos-principais' },
    { label: 'Sobremesas', value: 'sobremesas' },
    { label: 'Bebidas', value: 'bebidas' },
  ];

  protected readonly statusOptions: readonly ProductFilterOption[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Ativos', value: 'active' },
    { label: 'Inativos', value: 'inactive' },
    { label: 'Rascunhos', value: 'draft' },
  ];

  protected readonly selectedCategory = signal('all');
  protected readonly selectedStatus = signal('all');

  constructor() {
    this.topbarSearch.configure({
      ariaLabel: 'Buscar no catálogo de produtos',
      placeholder: 'Buscar no catálogo...',
      visible: true,
    });

    this.destroyRef.onDestroy(() => {
      this.topbarSearch.reset();
    });
  }

  protected onCreateProduct() {}

  protected onStatusChange(value: string) {
    this.selectedStatus.set(value);
  }
}

interface ProductFilterOption {
  readonly label: string;
  readonly value: string;
}
