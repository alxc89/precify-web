import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import {
  IngredientManagementDetailVm,
  IngredientManagementHistoryPriceVm,
} from '../../models/ingredient-management.model';
import { IngredientManagementModalComponent } from './ingredient-management-modal.component';

const CATEGORIES = [
  { id: 'cat-1', label: 'Biscoitos' },
  { id: 'cat-2', label: 'Laticinios' },
] as const;

const HISTORY_PRICE: IngredientManagementHistoryPriceVm = {
  baseUnitCost: 30,
  baseUnitCostLabel: 'R$ 30,00',
  convertedBaseQuantity: 2,
  entryId: 'price-1',
  isActive: true,
  isCurrent: true,
  note: null,
  purchasePrice: 60,
  purchaseQuantity: 2,
  purchaseSummaryLabel: 'R$ 60,00 · 2 cx',
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

const INGREDIENT: IngredientManagementDetailVm = {
  baseUnit: 'kg',
  categoryId: 'cat-1',
  categoryLabel: 'Biscoitos',
  currentPriceLabel: 'R$ 30,00',
  currentPriceScope: 'store',
  historyPrices: [HISTORY_PRICE],
  id: 'ingredient-1',
  isActive: true,
  name: 'Biscoito Negresco',
};

describe('IngredientManagementModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientManagementModalComponent],
    }).compileComponents();
  });

  it('submits the trimmed ingredient payload in create mode', () => {
    const fixture = TestBed.createComponent(IngredientManagementModalComponent);
    const saveSpy = vi.spyOn(fixture.componentInstance.saveIngredient, 'emit');

    fixture.componentRef.setInput('categories', CATEGORIES);
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('saving', false);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const nameInput = fixture.nativeElement.querySelector(
      '[formControlName="name"]',
    ) as HTMLInputElement;
    const categorySelect = fixture.nativeElement.querySelector(
      '[formControlName="ingredientCategoryId"]',
    ) as HTMLSelectElement;
    const baseUnitInput = fixture.nativeElement.querySelector(
      '[formControlName="baseUnit"]',
    ) as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    nameInput.value = '  Biscoito Negresco  ';
    nameInput.dispatchEvent(new Event('input'));
    categorySelect.value = 'cat-2';
    categorySelect.dispatchEvent(new Event('change'));
    baseUnitInput.value = '  kg  ';
    baseUnitInput.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(saveSpy).toHaveBeenCalledWith({
      baseUnit: 'kg',
      ingredientCategoryId: 'cat-2',
      name: 'Biscoito Negresco',
    });
    expect(fixture.nativeElement.textContent).toContain('Novo Ingrediente');
  });

  it('renders history actions and emits price management events in edit mode', () => {
    const fixture = TestBed.createComponent(IngredientManagementModalComponent);
    const openNewPriceSpy = vi.spyOn(fixture.componentInstance.openNewPrice, 'emit');
    const editPriceSpy = vi.spyOn(fixture.componentInstance.editPrice, 'emit');
    const deactivatePriceSpy = vi.spyOn(fixture.componentInstance.deactivatePrice, 'emit');

    fixture.componentRef.setInput('categories', CATEGORIES);
    fixture.componentRef.setInput('ingredient', INGREDIENT);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('saving', false);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const newPriceButton = buttons.find((button) => button.textContent?.includes('Novo'));
    const editButton = buttons.find((button) => button.textContent?.trim() === 'Editar');
    const deactivateButton = buttons.find((button) => button.textContent?.trim() === 'Desativar');

    newPriceButton?.click();
    editButton?.click();
    deactivateButton?.click();

    expect(fixture.nativeElement.textContent).toContain('R$ 30,00');
    expect(fixture.nativeElement.textContent).toContain('Historico de precos');
    expect(openNewPriceSpy).toHaveBeenCalledOnce();
    expect(editPriceSpy).toHaveBeenCalledWith(HISTORY_PRICE);
    expect(deactivatePriceSpy).toHaveBeenCalledWith(HISTORY_PRICE);
  });

  it('toggles the history list visibility without replacing the existing listing', () => {
    const fixture = TestBed.createComponent(IngredientManagementModalComponent);

    fixture.componentRef.setInput('categories', CATEGORIES);
    fixture.componentRef.setInput('ingredient', INGREDIENT);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('saving', false);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const toggleButton = (
      Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      ) as HTMLButtonElement[]
    ).find(
      (button) =>
        button.getAttribute('aria-label')?.includes('histórico') ||
        button.getAttribute('aria-label')?.includes('historico'),
    );

    expect(fixture.nativeElement.textContent).toContain('Entries de preco do ingrediente');
    expect(
      (
        Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]
      ).some((button) => button.textContent?.trim() === 'Editar'),
    ).toBe(true);

    toggleButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Entries de preco do ingrediente');
    expect(
      (
        Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]
      ).some((button) => button.textContent?.trim() === 'Editar'),
    ).toBe(false);
  });
});
