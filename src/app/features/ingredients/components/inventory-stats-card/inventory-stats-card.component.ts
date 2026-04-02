import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, DollarSign, TrendingUp } from 'lucide-angular';
import { IngredientInventoryStatsVm } from '../../models/ingredient.model';

@Component({
  selector: 'app-inventory-stats-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  host: {
    class: 'col-span-12 xl:col-span-4',
  },
  templateUrl: './inventory-stats-card.component.html',
  styleUrl: './inventory-stats-card.component.scss',
})
export class InventoryStatsCardComponent {
  readonly vm = input.required<IngredientInventoryStatsVm>();

  protected readonly DollarSign = DollarSign;
  protected readonly TrendingUp = TrendingUp;
}
