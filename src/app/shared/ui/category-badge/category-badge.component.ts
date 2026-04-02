import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { hlm } from '../../../lib/utils';

type CategoryTone = 'blue' | 'green' | 'yellow' | 'orange' | 'emerald';

const CATEGORY_TONE_CLASSES: Record<CategoryTone, string> = {
  blue: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-amber-100 text-amber-700',
};

@Component({
  selector: 'app-category-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="badgeClass()"
    >
      {{ label() }}
    </span>
  `,
})
export class CategoryBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<CategoryTone | null>(null);

  protected readonly badgeClass = computed(() => {
    const label = this.label().toLowerCase();
    const tone =
      this.tone() ??
      (label.includes('prote')
        ? 'blue'
        : label.includes('latic')
          ? 'yellow'
          : label.includes('hort')
            ? 'green'
            : label.includes('merc')
              ? 'orange'
              : 'emerald');

    return hlm(
      'inline-flex rounded-md px-2 py-1 text-xs font-semibold',
      CATEGORY_TONE_CLASSES[tone],
    );
  });
}
