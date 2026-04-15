import { TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();
  });

  it('renders fallback card information for products without commercial metrics', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);

    fixture.componentRef.setInput('item', {
      actionsEnabled: false,
      categoryId: 'uncategorized',
      categoryLabel: 'Sem categoria',
      code: 'PRD-001',
      description: null,
      id: 'product-1',
      isActive: true,
      name: 'Salmão grelhado',
      photoUrl: null,
      priceHeading: 'Preço de venda',
      priceValueLabel: 'Não configurado',
      secondaryLabel: 'Atualizado',
      secondaryValueLabel: '14/04/2026',
      statusLabel: 'Ativo',
      statusTone: 'active',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Salmão grelhado');
    expect(fixture.nativeElement.textContent).toContain('Sem categoria');
    expect(fixture.nativeElement.textContent).toContain('Sem imagem');
    expect(fixture.nativeElement.textContent).toContain('Não configurado');
    expect(fixture.nativeElement.textContent).toContain('14/04/2026');
  });

  it('falls back to the placeholder when the image fails to load', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);

    fixture.componentRef.setInput('item', {
      actionsEnabled: false,
      categoryId: 'uncategorized',
      categoryLabel: 'Sem categoria',
      code: 'PRD-002',
      description: null,
      id: 'product-2',
      isActive: true,
      name: 'Risoto de cogumelos',
      photoUrl: 'https://example.com/product.jpg',
      priceHeading: 'Preço de venda',
      priceValueLabel: 'Não configurado',
      secondaryLabel: 'Atualizado',
      secondaryValueLabel: '14/04/2026',
      statusLabel: 'Ativo',
      statusTone: 'active',
    });
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sem imagem');
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });
});
