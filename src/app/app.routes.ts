import { Routes } from '@angular/router';
import { authGuard, roleGuard } from 'ng-admin-core';
import { RoleEnum } from './features/role/enums/role.enum';

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
    loadComponent: () => import('./features/profile/pages/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },

  // Reports route (requires specific permission)
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/pages/reports/reports').then(m => m.Reports),
    canActivate: [authGuard, roleGuard([RoleEnum.ADMIN])]
  },

  // Settings route (requires specific permission)
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/pages/settings/settings').then(m => m.Settings),
    canActivate: [authGuard, roleGuard(undefined)]
  },

  // User management routes (requires admin role)
  {
    path: 'admin/users',
    loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES),
    // canActivate: [authGuard, roleGuard([RoleEnum.ADMIN])]
  },

  // Role management routes (requires admin role)
  {
    path: 'admin/roles',
    loadChildren: () => import('./features/role/role.routes').then(m => m.ROLE_ROUTES),
    canActivate: [authGuard, roleGuard([RoleEnum.ADMIN])]
  },

  // User's personal sessions
  {
    path: 'sessions',
    loadComponent: () => import('./features/session/pages/sessions/sessions').then(m => m.Sessions),
    canActivate: [authGuard]
  },

  // Session management routes (requires admin role)
  {
    path: 'admin/sessions',
    loadChildren: () => import('./features/session/session.routes').then(m => m.SESSION_ROUTES),
    canActivate: [authGuard, roleGuard([RoleEnum.ADMIN])]
  },

  // Admin settings (requires admin role and settings permission)
  {
    path: 'admin/settings',
    loadComponent: () => import('./features/admin-settings/pages/admin-settings/admin-settings').then(m => m.AdminSettings),
    canActivate: [authGuard, roleGuard([RoleEnum.ADMIN])]
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
