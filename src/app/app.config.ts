import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { 
  LucideAngularModule, 
  Bell,
  Calculator,
  ChevronLeft,
  LayoutDashboard, 
  Coins,
  CircleHelp,
  EllipsisVertical,
  LifeBuoy,
  Settings, 
  ChevronRight, 
  Search, 
  Plus, 
  Trash, 
  Edit,
  Compass,
  ReceiptText,
  Store,
  TrendingUp,
  UtensilsCrossed,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TriangleAlert,
  Loader2
} from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/error/error.interceptor';
import { BASE_PATH } from './core/api/generated';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    { provide: BASE_PATH, useValue: 'http://localhost:5038' },
    importProvidersFrom(
      LucideAngularModule.pick({ 
        Bell,
        Calculator,
        ChevronLeft,
        ChevronRight,
        CircleHelp,
        Coins,
        Compass,
        LayoutDashboard,
        Edit,
        EllipsisVertical,
        LifeBuoy,
        Lock,
        Mail,
        Plus,
        ReceiptText,
        Search,
        Settings,
        ArrowRight,
        Eye,
        EyeOff,
        Loader2,
        Store,
        TrendingUp,
        Trash,
        TriangleAlert,
        UtensilsCrossed,
      })
    )
  ],
};
