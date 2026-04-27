import { TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();
  });

  it('renders fallback card information for products without total cost', () => {
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
      priceHeading: 'Custo total',
      priceValueLabel: 'Não calculado',
      secondaryLabel: 'Atualizado',
      secondaryValueLabel: '14/04/2026',
      statusLabel: 'Ativo',
      statusTone: 'active',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Salmão grelhado');
    expect(fixture.nativeElement.textContent).toContain('Sem categoria');
    expect(fixture.nativeElement.textContent).toContain('Sem imagem');
    expect(fixture.nativeElement.textContent).toContain('Não calculado');
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
      priceHeading: 'Custo total',
      priceValueLabel: 'Não calculado',
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

  it('emits edit and delete actions from the cdk menu', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    const editSpy = jasmine.createSpy('editSpy');
    const deleteSpy = jasmine.createSpy('deleteSpy');

    fixture.componentRef.setInput('item', {
      actionsEnabled: true,
      categoryId: 'entrees',
      categoryLabel: 'Entradas',
      code: 'PRD-003',
      description: null,
      id: 'product-3',
      isActive: true,
      name: 'Bruschetta',
      photoUrl: null,
      priceHeading: 'Custo total',
      priceValueLabel: 'R$ 32,00',
      secondaryLabel: 'Atualizado',
      secondaryValueLabel: '14/04/2026',
      statusLabel: 'Ativo',
      statusTone: 'active',
    });
    fixture.componentInstance.editProduct.subscribe(editSpy);
    fixture.componentInstance.deleteProduct.subscribe(deleteSpy);
    fixture.detectChanges();

    fixture.componentInstance['onEditProduct']();
    fixture.componentInstance['onDeleteProduct']();

    expect(editSpy).toHaveBeenCalledWith('product-3');
    expect(deleteSpy).toHaveBeenCalledWith('product-3');
  });
});
