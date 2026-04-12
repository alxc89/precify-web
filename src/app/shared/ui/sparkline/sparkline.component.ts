import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface SparklineBar {
  readonly height: number;
  readonly opacity: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hasPoints()) {
      <svg
        [attr.aria-label]="ariaLabel()"
        class="h-8 w-24 overflow-visible"
        role="img"
        viewBox="0 0 100 24"
      >
        @for (bar of bars(); track $index) {
          <rect
            [attr.height]="bar.height"
            [attr.opacity]="bar.opacity"
            [attr.rx]="1.5"
            [attr.ry]="1.5"
            [attr.width]="bar.width"
            [attr.x]="bar.x"
            [attr.y]="bar.y"
            fill="#004f38"
          />
        }
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

  protected readonly hasPoints = computed(() => (this.points()?.length ?? 0) > 0);

  protected readonly ariaLabel = computed(() => 'Historico de preco dos ultimos 30 dias');

  protected readonly bars = computed<readonly SparklineBar[]>(() => {
    const points = this.points() ?? [];

    if (points.length === 0) {
      return [];
    }

    const chartHeight = 18;
    const chartWidth = 96;
    const gap = points.length > 12 ? 1.5 : 2.5;
    const width = Math.max(1.5, (chartWidth - gap * (points.length - 1)) / points.length);
    const max = Math.max(...points, 0);

    return points
      .map((point, index) => {
        const height = Math.max(3, max === 0 ? 3 : (point / max) * chartHeight);
        const x = 2 + index * (width + gap);
        const y = 22 - height;

        return {
          height: Number(height.toFixed(2)),
          opacity: Number((0.45 + (index + 1) / points.length / 2).toFixed(2)),
          width: Number(width.toFixed(2)),
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
        };
      });
  });
}
