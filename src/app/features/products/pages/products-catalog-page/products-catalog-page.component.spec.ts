import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { ProductsDataService } from '../../services/products.service';
import { ProductsCatalogPageComponent } from './products-catalog-page.component';

describe('ProductsCatalogPageComponent', () => {
  const getCatalogProducts = vi.fn(() =>
    of([
      {
        code: 'PRD-001',
        id: 'product-1',
        isActive: true,
        name: 'Salmão grelhado',
      },
      {
        code: 'PRD-002',
        id: 'product-2',
        isActive: false,
        name: 'Risoto de cogumelos',
      },
    ]),
  );

  beforeEach(async () => {
    getCatalogProducts.mockClear();

    await TestBed.configureTestingModule({
      imports: [ProductsCatalogPageComponent],
      providers: [
        {
          provide: ProductsDataService,
          useValue: {
            getCatalogProducts,
          },
        },
      ],
    }).compileComponents();
  });

  it('renders the hero section, summary and product cards', () => {
    const fixture = TestBed.createComponent(ProductsCatalogPageComponent);
    const topbarSearch = TestBed.inject(TopbarSearchService);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Catálogo de Produtos');
    expect(fixture.nativeElement.textContent).toContain('Novo Produto');
    expect(fixture.nativeElement.textContent).toContain('Todas as Categorias');
    expect(fixture.nativeElement.textContent).toContain('Resumo do Catálogo');
    expect(fixture.nativeElement.textContent).toContain('Salmão grelhado');
    expect(fixture.nativeElement.textContent).toContain('Risoto de cogumelos');
    expect(topbarSearch.config().placeholder).toBe('Buscar no catálogo...');
  });
});
