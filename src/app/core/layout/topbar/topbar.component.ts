import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Bell, CircleHelp, Store } from 'lucide-angular';
import { SessionService } from '../../session/session.service';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { UserProfileSummaryComponent } from '../../../shared/ui/user-profile-summary/user-profile-summary.component';
import { TopbarSearchService } from './topbar-search.service';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconButtonComponent,
    LucideAngularModule,
    SearchInputComponent,
    UserProfileSummaryComponent,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly session = inject(SessionService);
  private readonly topbarSearch = inject(TopbarSearchService);

  protected readonly Bell = Bell;
  protected readonly CircleHelp = CircleHelp;
  protected readonly Store = Store;
  protected readonly searchConfig = this.topbarSearch.config;

  protected readonly userName = computed(() => this.session.user()?.name?.trim() || 'Conta Precify');
  protected readonly userSubtitle = computed(
    () => this.session.user()?.email?.trim() || 'Sessao autenticada',
  );

  protected updateQuery(value: string) {
    this.topbarSearch.setQuery(value);
  }
}
