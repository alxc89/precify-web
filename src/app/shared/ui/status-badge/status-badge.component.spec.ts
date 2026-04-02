import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();
  });

  it('renders the active state', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ativo');
  });

  it('renders a neutral empty state when activity is unknown', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('active', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Indisponivel');
  });
});
