import { TestBed } from '@angular/core/testing';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { ProductsCatalogPageComponent } from './products-catalog-page.component';

describe('ProductsCatalogPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsCatalogPageComponent],
    }).compileComponents();
  });

  it('renders the hero section and product filters', () => {
    const fixture = TestBed.createComponent(ProductsCatalogPageComponent);
    const topbarSearch = TestBed.inject(TopbarSearchService);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Catálogo de Produtos');
    expect(fixture.nativeElement.textContent).toContain('Novo Produto');
    expect(fixture.nativeElement.textContent).toContain('Todas as Categorias');
    expect(fixture.nativeElement.textContent).toContain('Filtrar por:');
    expect(topbarSearch.config().placeholder).toBe('Buscar no catálogo...');
  });
});
