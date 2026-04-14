import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-products-summary-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products-summary-card.component.html',
})
export class ProductsSummaryCardComponent {
  readonly activeProducts = input(96);
  readonly inactiveProducts = input(12);
  readonly totalProducts = input(128);
}
