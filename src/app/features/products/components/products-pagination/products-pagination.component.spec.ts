import { TestBed } from '@angular/core/testing';
import { ProductsPaginationComponent } from './products-pagination.component';

describe('ProductsPaginationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPaginationComponent],
    }).compileComponents();
  });

  it('emits the selected page when navigating forward', () => {
    const fixture = TestBed.createComponent(ProductsPaginationComponent);
    const emittedPages: number[] = [];

    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentInstance.pageChange.subscribe((page) => emittedPages.push(page));
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    buttons.at(-1)?.click();

    expect(emittedPages).toEqual([2]);
  });
});
