import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { hlm } from '../../../lib/utils';

export type PriceScopeBadgeScope = 'organization' | 'store';

@Component({
  selector: 'app-price-scope-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (scope()) {
      <span [class]="badgeClass()">{{ label() }}</span>
    }
  `,
})
export class PriceScopeBadgeComponent {
  readonly scope = input<PriceScopeBadgeScope | null>(null);

  protected readonly label = computed(() =>
    this.scope() === 'store' ? 'ESTA LOJA' : 'ORGANIZACAO',
  );

  protected readonly badgeClass = computed(() =>
    hlm(
      'mt-1 inline-flex w-fit rounded-sm px-1.5 py-0.5 text-[9px] font-bold text-white',
      this.scope() === 'store' ? 'bg-[#9c4400]' : 'bg-[#004f38]',
    ),
  );
}
