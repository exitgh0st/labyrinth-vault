import { Routes } from '@angular/router';
import { authGuard } from '@labyrinth-team/ng-admin-core';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  }
];
