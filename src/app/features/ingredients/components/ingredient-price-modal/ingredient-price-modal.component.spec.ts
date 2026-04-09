import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { IngredientManagementHistoryPriceVm } from '../../models/ingredient-management.model';
import { IngredientPriceModalComponent } from './ingredient-price-modal.component';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(value);

const PRICE_ENTRY: IngredientManagementHistoryPriceVm = {
  baseUnitCost: 30,
  baseUnitCostLabel: 'R$ 30,00',
  convertedBaseQuantity: 2,
  entryId: 'price-1',
  isActive: true,
  isCurrent: true,
  note: 'Vigencia principal',
  purchasePrice: 60,
  purchaseQuantity: 1,
  purchaseSummaryLabel: 'R$ 60,00 · 1 cx',
  purchaseUnit: 'cx',
  source: 'store',
  sourceLabel: 'Loja',
  statusLabel: 'Ativo',
  supplier: 'Fornecedor Loja',
  validFrom: '2026-03-28T10:00:00Z',
  validFromLabel: '28/03/2026 07:00',
  validTo: null,
  validToLabel: 'Sem validade',
};

describe('IngredientPriceModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientPriceModalComponent],
    }).compileComponents();
  });

  it('calculates base unit cost and emits the create payload', () => {
    const fixture = TestBed.createComponent(IngredientPriceModalComponent);
    const saveSpy = vi.spyOn(fixture.componentInstance.savePrice, 'emit');

    fixture.componentRef.setInput('baseUnit', 'kg');
    fixture.componentRef.setInput('hasStoreContext', true);
    fixture.componentRef.setInput('ingredientName', 'Biscoito Negresco');
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('saving', false);
    fixture.detectChanges();

    const sourceSelect = fixture.nativeElement.querySelector(
      '[formControlName="source"]',
    ) as HTMLSelectElement;
    const purchaseUnitInput = fixture.nativeElement.querySelector(
      '[formControlName="purchaseUnit"]',
    ) as HTMLInputElement;
    const purchaseQuantityInput = fixture.nativeElement.querySelector(
      '[formControlName="purchaseQuantity"]',
    ) as HTMLInputElement;
    const convertedBaseQuantityInput = fixture.nativeElement.querySelector(
      '[formControlName="convertedBaseQuantity"]',
    ) as HTMLInputElement;
    const purchasePriceInput = fixture.nativeElement.querySelector(
      '[formControlName="purchasePrice"]',
    ) as HTMLInputElement;
    const validFromInput = fixture.nativeElement.querySelector(
      '[formControlName="validFrom"]',
    ) as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    sourceSelect.value = 'store';
    sourceSelect.dispatchEvent(new Event('change'));
    purchaseUnitInput.value = 'cx';
    purchaseUnitInput.dispatchEvent(new Event('input'));
    purchaseQuantityInput.value = '1';
    purchaseQuantityInput.dispatchEvent(new Event('input'));
    convertedBaseQuantityInput.value = '2';
    convertedBaseQuantityInput.dispatchEvent(new Event('input'));
    purchasePriceInput.value = '60';
    purchasePriceInput.dispatchEvent(new Event('input'));
    validFromInput.value = '2026-03-28T10:00';
    validFromInput.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(formatCurrency(30));
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUnitCost: 30,
        convertedBaseQuantity: 2,
        purchasePrice: 60,
        purchaseQuantity: 1,
        purchaseUnit: 'cx',
        source: 'store',
        validFrom: new Date('2026-03-28T10:00').toISOString(),
      }),
    );
  });

  it('preloads the selected entry and locks the source in edit mode', () => {
    const fixture = TestBed.createComponent(IngredientPriceModalComponent);

    fixture.componentRef.setInput('baseUnit', 'kg');
    fixture.componentRef.setInput('hasStoreContext', true);
    fixture.componentRef.setInput('ingredientName', 'Biscoito Negresco');
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('price', PRICE_ENTRY);
    fixture.componentRef.setInput('saving', false);
    fixture.detectChanges();

    const sourceSelect = fixture.nativeElement.querySelector(
      '[formControlName="source"]',
    ) as HTMLSelectElement;
    const purchaseUnitInput = fixture.nativeElement.querySelector(
      '[formControlName="purchaseUnit"]',
    ) as HTMLInputElement;

    expect(sourceSelect.disabled).toBe(true);
    expect(purchaseUnitInput.value).toBe('cx');
    expect(fixture.nativeElement.textContent).toContain('Editar preco');
  });
});
