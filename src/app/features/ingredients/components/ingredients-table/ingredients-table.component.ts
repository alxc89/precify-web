import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, EllipsisVertical } from 'lucide-angular';
import { CategoryBadgeComponent } from '../../../../shared/ui/category-badge/category-badge.component';
import { PriceScopeBadgeComponent } from '../../../../shared/ui/price-scope-badge/price-scope-badge.component';
import { SparklineComponent } from '../../../../shared/ui/sparkline/sparkline.component';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { IngredientsCatalogPaginationVm } from '../../models/ingredient-filter.model';
import { IngredientListItem } from '../../models/ingredient.model';
import { IngredientsPaginationComponent } from '../ingredients-pagination/ingredients-pagination.component';

@Component({
  selector: 'app-ingredients-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CategoryBadgeComponent,
    IngredientsPaginationComponent,
    LucideAngularModule,
    PriceScopeBadgeComponent,
    SparklineComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './ingredients-table.component.html',
  styleUrl: './ingredients-table.component.scss',
})
export class IngredientsTableComponent {
  readonly emptyMessage = input.required<string>();
  readonly error = input<string | null>(null);
  readonly loading = input(false);
  readonly pagination = input.required<IngredientsCatalogPaginationVm>();
  readonly rows = input.required<readonly IngredientListItem[]>();

  readonly pageChange = output<number>();

  protected readonly EllipsisVertical = EllipsisVertical;

  protected initials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
