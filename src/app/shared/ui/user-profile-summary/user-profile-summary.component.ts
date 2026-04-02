import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-user-profile-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3">
      <div class="text-right">
        <p class="text-xs font-bold leading-none text-[#002116]">{{ name() }}</p>
        <p class="text-[10px] text-emerald-800/50">{{ subtitle() }}</p>
      </div>

      <div
        [attr.aria-label]="'Perfil de ' + name()"
        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#004f38]/20 bg-white text-sm font-black uppercase text-[#004f38]"
        role="img"
      >
        {{ initials() }}
      </div>
    </div>
  `,
})
export class UserProfileSummaryComponent {
  readonly name = input.required<string>();
  readonly subtitle = input('Conta autenticada');

  protected readonly initials = computed(() =>
    this.name()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((value) => value[0])
      .join('')
      .toUpperCase(),
  );
}
