import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { hlm } from '../../../lib/utils';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="containerClass()">
      <span [class]="dotClass()"></span>
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly active = input<boolean | null>(null);

  protected readonly label = computed(() => {
    const active = this.active();
    if (active === true) {
      return 'Ativo';
    }

    if (active === false) {
      return 'Inativo';
    }

    return 'Indisponivel';
  });

  protected readonly containerClass = computed(() =>
    hlm(
      'inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em]',
      this.active() === true
        ? 'text-emerald-600'
        : this.active() === false
          ? 'text-stone-500'
          : 'text-emerald-900/40',
    ),
  );

  protected readonly dotClass = computed(() =>
    hlm(
      'h-1.5 w-1.5 rounded-full',
      this.active() === true
        ? 'bg-emerald-500'
        : this.active() === false
          ? 'bg-stone-400'
          : 'bg-emerald-900/20',
    ),
  );
}
