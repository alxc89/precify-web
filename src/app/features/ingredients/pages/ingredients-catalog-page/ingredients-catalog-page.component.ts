import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { TopbarSearchService } from '../../../../core/layout/topbar/topbar-search.service';
import { IngredientsCatalogFacade } from '../../facades/ingredients-catalog.facade';
import { IngredientsFiltersComponent } from '../../components/ingredients-filters/ingredients-filters.component';
import { IngredientsPageHeaderComponent } from '../../components/ingredients-page-header/ingredients-page-header.component';
import { IngredientsTableComponent } from '../../components/ingredients-table/ingredients-table.component';
import { InventoryStatsCardComponent } from '../../components/inventory-stats-card/inventory-stats-card.component';

@Component({
  selector: 'app-ingredients-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IngredientsFiltersComponent,
    IngredientsPageHeaderComponent,
    IngredientsTableComponent,
    InventoryStatsCardComponent,
  ],
  providers: [IngredientsCatalogFacade],
  templateUrl: './ingredients-catalog-page.component.html',
  styleUrl: './ingredients-catalog-page.component.scss',
})
export class IngredientsCatalogPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly topbarSearch = inject(TopbarSearchService);

  protected readonly facade = inject(IngredientsCatalogFacade);
  protected readonly vm = this.facade.vm;

  constructor() {
    this.topbarSearch.configure({
      ariaLabel: 'Buscar insumos ou categorias',
      placeholder: 'Buscar insumos ou categorias...',
      visible: true,
    });

    effect(() => {
      this.facade.setSearchTerm(this.topbarSearch.query());
    });

    this.destroyRef.onDestroy(() => {
      this.topbarSearch.reset();
    });
  }

  protected onCreateIngredient() {}
}
