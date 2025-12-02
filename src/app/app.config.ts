import {
  ApplicationConfig, inject, PLATFORM_ID, provideAppInitializer,
  provideBrowserGlobalErrorListeners, provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AppInitializer } from './core/services/app-initializer';
import { authInterceptor, provideAdminCore, provideAuth } from 'ng-admin-core';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAdminCore({
      apiBaseUrl: environment.apiUrl
    }),
    provideAuth({
      token: {
        storage: 'memory',
      },
      session: {
        inactivityTimeout: 30 * 60 * 1000, // 30 minutes
        refreshBeforeExpiry: 2 * 60 * 1000, // 2 minutes
      },
      routes: {
        afterLogin: '/dashboard',
        afterLogout: '/login',
      }
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideAppInitializer(() => {
      const appInitializer = inject(AppInitializer);

      return appInitializer.initialize();
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
