import { TestBed } from '@angular/core/testing';
import { IngredientsCatalogPaginationVm } from '../../models/ingredient-filter.model';
import { IngredientListItem } from '../../models/ingredient.model';
import { IngredientsTableComponent } from './ingredients-table.component';

const PAGINATION: IngredientsCatalogPaginationVm = {
  currentPage: 1,
  endItem: 2,
  pageNumbers: [1],
  pageSize: 8,
  startItem: 1,
  totalItems: 2,
  totalPages: 1,
};

const ROWS: readonly IngredientListItem[] = [
  {
    actionsEnabled: true,
    baseUnitLabel: 'kg',
    categoryId: 'proteins',
    categoryLabel: 'Proteinas',
    code: 'ABC123',
    hasPrice: false,
    history: {
      label: 'Sem historico',
      points: null,
    },
    id: 'ingredient-1',
    isActive: true,
    name: 'Salmao Chileno',
    priceLabel: 'Sem preco definido',
    priceScope: null,
    priceValue: null,
    statusLabel: 'Ativo',
    thumbnailUrl: null,
  },
  {
    actionsEnabled: true,
    baseUnitLabel: 'kg',
    categoryId: 'vegetables',
    categoryLabel: 'Hortifruti',
    code: 'XYZ999',
    hasPrice: false,
    history: {
      label: 'Sem historico',
      points: null,
    },
    id: 'ingredient-2',
    isActive: false,
    name: 'Cenoura Baby',
    priceLabel: 'Sem preco definido',
    priceScope: null,
    priceValue: null,
    statusLabel: 'Inativo',
    thumbnailUrl: null,
  },
];

describe('IngredientsTableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsTableComponent],
    }).compileComponents();
  });

  it('renders rows with explicit empty states and inactive styling', () => {
    const fixture = TestBed.createComponent(IngredientsTableComponent);
    fixture.componentRef.setInput('emptyMessage', 'Nenhum item');
    fixture.componentRef.setInput('error', null);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('pagination', PAGINATION);
    fixture.componentRef.setInput('rows', ROWS);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sem preco definido');
    expect(fixture.nativeElement.textContent).toContain('Sem historico');
    expect(fixture.nativeElement.textContent).toContain('SC');
    expect(fixture.nativeElement.textContent).toContain('CB');

    const tableRows = fixture.nativeElement.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>;
    expect(tableRows[1].classList.contains('opacity-60')).toBe(true);
  });

  it('renders loading and error states', () => {
    const fixture = TestBed.createComponent(IngredientsTableComponent);
    fixture.componentRef.setInput('emptyMessage', 'Nenhum item');
    fixture.componentRef.setInput('pagination', PAGINATION);
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Carregando catalogo de ingredientes');

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', 'Falha ao carregar');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Falha ao carregar');
  });
});
