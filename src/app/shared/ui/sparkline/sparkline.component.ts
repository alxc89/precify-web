import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hasPoints()) {
      <svg
        [attr.aria-label]="ariaLabel()"
        class="h-6 w-20 overflow-visible"
        role="img"
        viewBox="0 0 100 24"
      >
        <polyline
          [attr.points]="polylinePoints()"
          class="fill-none stroke-[#004f38] stroke-[4]"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    } @else {
      <div
        [attr.aria-label]="emptyLabel()"
        class="flex h-6 w-24 items-center gap-2 text-[11px] font-semibold text-emerald-900/35"
        role="img"
      >
        <span class="h-px flex-1 border-t border-dashed border-emerald-900/20"></span>
        <span>{{ emptyLabel() }}</span>
      </div>
    }
  `,
})
export class SparklineComponent {
  readonly emptyLabel = input('Sem historico');
  readonly points = input<readonly number[] | null>(null);

  protected readonly hasPoints = computed(() => (this.points()?.length ?? 0) > 1);

  protected readonly ariaLabel = computed(() => 'Historico de preco dos ultimos 30 dias');

  protected readonly polylinePoints = computed(() => {
    const points = this.points() ?? [];

    if (points.length < 2) {
      return '';
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    return points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * 100;
        const y = 22 - ((point - min) / range) * 18;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  });
}
