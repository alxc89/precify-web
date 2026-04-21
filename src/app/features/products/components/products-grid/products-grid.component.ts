import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProductCardVm } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductsPaginationComponent } from '../products-pagination/products-pagination.component';

@Component({
  selector: 'app-products-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, ProductsPaginationComponent],
  templateUrl: './products-grid.component.html',
})
export class ProductsGridComponent {
  readonly currentPage = input.required<number>();
  readonly error = input<string | null>(null);
  readonly items = input.required<readonly ProductCardVm[]>();
  readonly loading = input(false);
  readonly totalItems = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly visibleItems = input.required<number>();

  readonly deleteProduct = output<string>();
  readonly editProduct = output<string>();
  readonly pageChange = output<number>();
}
