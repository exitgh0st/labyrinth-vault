import { Routes } from '@angular/router';
import { guestGuard } from 'ng-admin-core';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized').then(m => m.Unauthorized)
  },
  {
    path: 'google/callback',
    loadComponent: () => import('./components/google-callback/google-callback').then(m => m.GoogleCallback)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
