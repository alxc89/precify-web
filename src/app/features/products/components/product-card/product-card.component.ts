import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { ImageOff, LucideAngularModule, MoreVertical, Pencil, Trash2 } from 'lucide-angular';
import { hlm } from '../../../../lib/utils';
import { ProductCardVm } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger, LucideAngularModule],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  readonly item = input.required<ProductCardVm>();

  readonly deleteProduct = output<string>();
  readonly editProduct = output<string>();

  private readonly imageFailed = signal(false);

  protected readonly ImageOff = ImageOff;
  protected readonly MoreVertical = MoreVertical;
  protected readonly Pencil = Pencil;
  protected readonly Trash2 = Trash2;
  protected readonly placeholderMonogram = computed(() => {
    const tokens = this.item()
      .name.split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    const initials = tokens.slice(0, 2).map((token) => token[0]?.toUpperCase() ?? '');

    return initials.join('') || 'PR';
  });

  protected readonly priceValueClass = computed(() =>
    hlm(
      "font-['Manrope'] text-2xl font-black leading-none",
      this.item().priceValueLabel === 'Não configurado'
        ? 'text-emerald-800/35'
        : 'text-emerald-900',
    ),
  );

  protected readonly statusClass = computed(() =>
    hlm(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm',
      this.item().statusTone === 'active' ? 'bg-emerald-900 text-white' : 'bg-[#ba1a1a] text-white',
    ),
  );

  protected readonly statusDotClass = computed(() =>
    hlm(
      'h-1.5 w-1.5 rounded-full',
      this.item().statusTone === 'active' ? 'bg-emerald-400' : 'bg-white',
    ),
  );
  protected readonly showImage = computed(() => !!this.item().photoUrl && !this.imageFailed());

  constructor() {
    effect(() => {
      this.item().photoUrl;
      this.imageFailed.set(false);
    });
  }

  protected onImageError() {
    this.imageFailed.set(true);
  }

  protected onDeleteProduct() {
    if (!this.item().actionsEnabled) {
      return;
    }

    this.deleteProduct.emit(this.item().id);
  }

  protected onEditProduct() {
    if (!this.item().actionsEnabled) {
      return;
    }

    this.editProduct.emit(this.item().id);
  }
}
