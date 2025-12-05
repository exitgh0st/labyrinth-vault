import { Routes } from '@angular/router';

export const SESSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/admin-sessions/admin-sessions').then(m => m.AdminSessions)
  }
];