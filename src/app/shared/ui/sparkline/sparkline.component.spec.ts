import { TestBed } from '@angular/core/testing';
import { SparklineComponent } from './sparkline.component';

describe('SparklineComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SparklineComponent],
    }).compileComponents();
  });

  it('renders a bar chart when points exist', () => {
    const fixture = TestBed.createComponent(SparklineComponent);
    fixture.componentRef.setInput('points', [10, 12, 14, 13, 15, 16]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('rect').length).toBe(6);
  });

  it('renders the empty state when no points exist', () => {
    const fixture = TestBed.createComponent(SparklineComponent);
    fixture.componentRef.setInput('points', null);
    fixture.componentRef.setInput('emptyLabel', 'Sem historico');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Sem historico');
  });
});
