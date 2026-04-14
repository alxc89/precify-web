import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ProductsFiltersComponent } from './products-filters.component';

describe('ProductsFiltersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFiltersComponent],
    }).compileComponents();
  });

  it('renders filters and emits category and status changes', () => {
    const fixture = TestBed.createComponent(ProductsFiltersComponent);
    const categorySpy = vi.spyOn(fixture.componentInstance.categoryChange, 'emit');
    const statusSpy = vi.spyOn(fixture.componentInstance.statusChange, 'emit');

    fixture.componentRef.setInput('categories', [
      { label: 'Todas as Categorias', value: 'all' },
      { label: 'Entradas', value: 'entradas' },
    ]);
    fixture.componentRef.setInput('selectedCategory', 'all');
    fixture.componentRef.setInput('selectedStatus', 'all');
    fixture.componentRef.setInput('statusOptions', [
      { label: 'Todos', value: 'all' },
      { label: 'Ativos', value: 'active' },
    ]);
    fixture.detectChanges();

    const categoryButtons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    categoryButtons[1].click();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'active';
    select.dispatchEvent(new Event('change'));

    expect(categorySpy).toHaveBeenCalledWith('entradas');
    expect(statusSpy).toHaveBeenCalledWith('active');
  });
});
