import { Routes } from '@angular/router';
import { authGuard, roleGuard } from 'ng-admin-core';

export const routes: Routes = [
  // Auth routes (public)
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Dashboard routes (protected)
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  },

  // Profile route (authentication required)
  {
    path: 'profile',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },

  // Reports route (requires specific permission)
  {
    path: 'reports',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard, roleGuard(undefined, ['reports:view'])]
  },

  // Settings route (requires specific permission)
  {
    path: 'settings',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard, roleGuard(undefined, ['settings:edit'])]
  },

  // Admin routes (requires admin role)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    children: [
      {
        path: 'users',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard),
        // canActivate: [roleGuard(undefined, ['users:manage'])]
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard),
        // canActivate: [roleGuard(undefined, ['roles:manage'])]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard),
        // canActivate: [roleGuard(undefined, ['settings:edit'])]
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
    ]
  },

  // Default redirects
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
