import { TestBed } from '@angular/core/testing';
import { IngredientsPageHeaderComponent } from './ingredients-page-header.component';

describe('IngredientsPageHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsPageHeaderComponent],
    }).compileComponents();
  });

  it('renders breadcrumb, title and emits the primary action', () => {
    const fixture = TestBed.createComponent(IngredientsPageHeaderComponent);
    const emitted: boolean[] = [];

    fixture.componentInstance.createIngredient.subscribe(() => emitted.push(true));
    fixture.componentRef.setInput('description', 'Descricao do catalogo');
    fixture.componentRef.setInput('title', 'Gestao de Insumos');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Catalogo de Ingredientes');
    expect(fixture.nativeElement.textContent).toContain('Gestao de Insumos');

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitted).toEqual([true]);
  });
});
