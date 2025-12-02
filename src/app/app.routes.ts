import { Routes } from '@angular/router';
import { authGuard, roleGuard } from 'ng-admin-core';

export const routes: Routes = [
  // Auth routes (public)
  {
    path: 'auth',
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

  // User management routes (requires admin role)
  {
    path: 'admin/users',
    loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES),
    canActivate: [authGuard, roleGuard(['admin'], ['users:manage'])]
  },

  // Role management routes (requires admin role)
  {
    path: 'admin/roles',
    loadChildren: () => import('./features/role/role.routes').then(m => m.ROLE_ROUTES),
    canActivate: [authGuard, roleGuard(['admin'], ['roles:manage'])]
  },

  // Session management routes (requires admin role)
  {
    path: 'admin/sessions',
    loadChildren: () => import('./features/session/session.routes').then(m => m.SESSION_ROUTES),
    canActivate: [authGuard, roleGuard(['admin'])]
  },

  // Admin settings (requires admin role and settings permission)
  {
    path: 'admin/settings',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard, roleGuard(['admin'], ['settings:edit'])]
  },

  // Default redirect to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Catch-all redirect
  {
    path: '**',
    redirectTo: '/auth/unauthorized'
  }
];
