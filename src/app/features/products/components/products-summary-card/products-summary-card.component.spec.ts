import { TestBed } from '@angular/core/testing';
import { ProductsSummaryCardComponent } from './products-summary-card.component';

describe('ProductsSummaryCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsSummaryCardComponent],
    }).compileComponents();
  });

  it('renders the summary values', () => {
    const fixture = TestBed.createComponent(ProductsSummaryCardComponent);

    fixture.componentRef.setInput('totalProducts', 128);
    fixture.componentRef.setInput('activeProducts', 96);
    fixture.componentRef.setInput('inactiveProducts', 12);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Resumo do Catálogo');
    expect(fixture.nativeElement.textContent).toContain('128');
    expect(fixture.nativeElement.textContent).toContain('96');
    expect(fixture.nativeElement.textContent).toContain('12');
  });
});
