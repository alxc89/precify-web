import { TestBed } from '@angular/core/testing';
import { IngredientsFiltersComponent } from './ingredients-filters.component';

describe('IngredientsFiltersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsFiltersComponent],
    }).compileComponents();
  });

  it('emits category and status actions with accessible controls', () => {
    const fixture = TestBed.createComponent(IngredientsFiltersComponent);
    let selectedCategory = '';
    let selectedStatus = '';

    fixture.componentInstance.categoryChange.subscribe((value) => {
      selectedCategory = value;
    });
    fixture.componentInstance.statusChange.subscribe((value) => {
      selectedStatus = value;
    });

    fixture.componentRef.setInput('categories', [
      { id: 'all', label: 'Todos' },
      { id: 'proteins', label: 'Proteinas' },
    ]);
    fixture.componentRef.setInput('selectedCategoryId', 'all');
    fixture.componentRef.setInput('statusFilter', 'active');
    fixture.detectChanges();

    const categoryButtons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    const label = fixture.nativeElement.querySelector(
      'label[for="ingredient-status-filter"]',
    ) as HTMLLabelElement | null;

    categoryButtons[1].click();
    select.value = 'inactive';
    select.dispatchEvent(new Event('change'));

    expect(label?.textContent).toContain('Status:');
    expect(selectedCategory).toBe('proteins');
    expect(selectedStatus).toBe('inactive');
    expect(fixture.nativeElement.textContent).not.toContain('Limpar');
    expect(select.querySelectorAll('option').length).toBe(2);
  });
});
