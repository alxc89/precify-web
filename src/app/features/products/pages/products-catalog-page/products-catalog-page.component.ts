import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  LucideAngularModule,
  Plus,
  ChevronDown,
} from 'lucide-angular';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { hlm } from '../../../../lib/utils';

interface ProductFilterOption {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-products-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './products-catalog-page.component.html',
})
export class ProductsCatalogPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly topbarSearch = inject(TopbarSearchService);

  protected readonly ChevronDown = ChevronDown;
  protected readonly Plus = Plus;

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

  protected onCategoryChange(event: Event) {
    const value = (event.target as HTMLSelectElement | null)?.value ?? 'all';
    this.selectedCategory.set(value);
  }

  protected onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement | null)?.value ?? 'all';
    this.selectedStatus.set(value);
  }

  protected categoryClass(categoryId: string) {
    const active = this.selectedCategory() === categoryId;
    return hlm(
      'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
      active
        ? 'bg-[#004f38] text-white shadow-lg shadow-emerald-900/20'
        : 'bg-[#e7fff2] text-[#004f38] hover:bg-emerald-100',
    );
  }
}
