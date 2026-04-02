import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-icon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <button
      [attr.aria-label]="label()"
      [disabled]="disabled()"
      class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-emerald-800/60 transition-colors hover:bg-emerald-100/50 hover:text-[#004f38] focus:outline-none focus:ring-2 focus:ring-[#004f38] disabled:cursor-not-allowed disabled:opacity-40"
      type="button"
    >
      <lucide-icon [img]="icon()" class="h-4 w-4" />

      @if (showIndicator()) {
        <span class="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#e7fff2] bg-[#9c4400]"></span>
      }
    </button>
  `,
})
export class IconButtonComponent {
  readonly disabled = input(false);
  readonly icon = input.required<LucideIconData>();
  readonly label = input.required<string>();
  readonly showIndicator = input(false);
}
