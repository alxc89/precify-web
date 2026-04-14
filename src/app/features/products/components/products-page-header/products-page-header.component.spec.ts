import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ProductsPageHeaderComponent } from './products-page-header.component';

describe('ProductsPageHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPageHeaderComponent],
    }).compileComponents();
  });

  it('renders the title and emits the create action', () => {
    const fixture = TestBed.createComponent(ProductsPageHeaderComponent);
    const createSpy = vi.spyOn(fixture.componentInstance.createProduct, 'emit');

    fixture.componentRef.setInput('title', 'Catálogo de Produtos');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Catálogo de Produtos');

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(createSpy).toHaveBeenCalled();
  });
});
