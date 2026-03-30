import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { 
  LucideAngularModule, 
  LayoutDashboard, 
  Utensils, 
  Package, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Search, 
  Plus, 
  Trash, 
  Edit,
  Compass,
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
        LayoutDashboard, 
        Utensils, 
        Package, 
        Settings, 
        LogOut, 
        ChevronRight, 
        Search, 
        Plus, 
        Trash, 
        Edit,
        Compass,
        Mail,
        Lock,
        Eye,
        EyeOff,
        ArrowRight,
        TriangleAlert,
        Loader2
      })
    )
  ],
};
