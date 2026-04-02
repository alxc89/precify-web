import { TestBed } from '@angular/core/testing';
import { PriceScopeBadgeComponent } from './price-scope-badge.component';

describe('PriceScopeBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceScopeBadgeComponent],
    }).compileComponents();
  });

  it('renders the store scope badge', () => {
    const fixture = TestBed.createComponent(PriceScopeBadgeComponent);
    fixture.componentRef.setInput('scope', 'store');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('ESTA LOJA');
  });

  it('does not render when scope is absent', () => {
    const fixture = TestBed.createComponent(PriceScopeBadgeComponent);
    fixture.componentRef.setInput('scope', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
