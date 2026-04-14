import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  Calculator,
  LayoutDashboard,
  LifeBuoy,
  LucideAngularModule,
  LucideIconData,
  Package,
  ReceiptText,
  Settings,
  UtensilsCrossed,
} from 'lucide-angular';
import { hlm } from '../../../lib/utils';

interface SidebarNavigationItem {
  readonly enabled: boolean;
  readonly exact: boolean;
  readonly icon: LucideIconData;
  readonly label: string;
  readonly path: string | null;
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly supportIcon = LifeBuoy;
  protected readonly logoIcon = UtensilsCrossed;
  protected readonly navigationItems: readonly SidebarNavigationItem[] = [
    {
      enabled: true,
      exact: true,
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/app/dashboard',
    },
    {
      enabled: true,
      exact: true,
      icon: UtensilsCrossed,
      label: 'Ingredientes',
      path: '/app/ingredientes',
    },
    {
      enabled: true,
      exact: true,
      icon: Package,
      label: 'Produtos',
      path: '/app/produtos',
    },
    {
      enabled: false,
      exact: false,
      icon: Calculator,
      label: 'Custo',
      path: null,
    },
    {
      enabled: false,
      exact: false,
      icon: ReceiptText,
      label: 'Vendas',
      path: null,
    },
    {
      enabled: false,
      exact: false,
      icon: Settings,
      label: 'Configuracoes',
      path: null,
    },
  ];

  protected linkClass(active: boolean, enabled: boolean) {
    return hlm(
      'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200',
      active
        ? 'bg-[#004f38] text-white shadow-lg shadow-emerald-900/20'
        : 'text-emerald-800/70',
      enabled ? 'hover:bg-emerald-100 active:translate-x-1' : 'cursor-not-allowed opacity-50',
    );
  }
}
