import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  host: {
    class: 'block w-full',
  },
  template: `
    <label class="relative block w-full">
      <span class="sr-only">{{ ariaLabel() }}</span>
      <lucide-icon
        [img]="Search"
        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-800/40"
      />
      <input
        [attr.aria-label]="ariaLabel()"
        [id]="inputId()"
        [placeholder]="placeholder()"
        [value]="value()"
        class="w-full rounded-xl bg-[#c3f3dd] py-2 pl-10 pr-4 text-sm text-[#002116] placeholder:text-emerald-800/30 focus:outline-none focus:ring-2 focus:ring-[#004f38]"
        type="search"
        (input)="onInput($event)"
      />
    </label>
  `,
})
export class SearchInputComponent {
  readonly ariaLabel = input('Buscar');
  readonly inputId = input('topbar-search-input');
  readonly placeholder = input('Buscar...');
  readonly value = input('');

  readonly valueChange = output<string>();

  protected readonly Search = Search;

  protected onInput(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
