import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-ingredients-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './ingredients-page-header.component.html',
  styleUrl: './ingredients-page-header.component.scss',
})
export class IngredientsPageHeaderComponent {
  readonly title = input.required<string>();

  readonly createIngredient = output<void>();

  protected readonly Plus = Plus;
}
