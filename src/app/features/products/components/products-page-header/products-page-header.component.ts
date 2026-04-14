import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-products-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './products-page-header.component.html',
})
export class ProductsPageHeaderComponent {
  readonly title = input.required<string>();

  readonly createProduct = output<void>();

  protected readonly Plus = Plus;
}
