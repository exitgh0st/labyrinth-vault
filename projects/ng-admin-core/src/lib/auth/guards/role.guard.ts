/**
 * Role-based access guard
 * @module core/guards
 */

import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AUTH_CONFIG } from '../config/auth-config';

/**
 * Guard data interface for role guard
 */
export interface RoleGuardData {
  /** Required roles (user must have at least one) */
  roles?: string[];
  /** Required permissions (user must have at least one) */
  permissions?: string[];
  /** If true, user must have ALL specified roles/permissions */
  requireAll?: boolean;
}

/**
 * Factory function to create a role guard with specific requirements
 *
 * @example
 * ```typescript
 * // app.routes.ts
 * import { roleGuard } from '@labyrinth/ng-admin-core';
 *
 * export const routes: Routes = [
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [roleGuard(['admin'])]
 *   },
 *   {
 *     path: 'users',
 *     component: UsersComponent,
 *     canActivate: [roleGuard(['admin', 'manager'])]
 *   }
 * ];
 * ```
 */
export function roleGuard(
  roles?: string[],
  permissions?: string[],
  requireAll = true
): CanActivateFn {
  return (route, state) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    const authConfig = inject(AUTH_CONFIG);

    // Debug logging
    console.log('[RoleGuard] Checking access for route:', state.url);
    console.log('[RoleGuard] Required roles:', roles);
    console.log('[RoleGuard] Required permissions:', permissions);
    console.log('[RoleGuard] User roles:', permissionService.getRoleNames());

    // Check permissions
    const hasAccess = permissionService.canActivateRoute(roles, permissions, requireAll);

    console.log('[RoleGuard] Access granted:', hasAccess);

    if (hasAccess) {
      return true;
    }

    // User doesn't have required permissions
    const unauthorizedRoute = authConfig.routes.unauthorized || '/unauthorized';
    router.navigate([unauthorizedRoute]);
    return false;
  };
}

/**
 * Role guard that reads requirements from route data
 *
 * @example
 * ```typescript
 * // app.routes.ts
 * import { roleGuardWithData } from '@labyrinth/ng-admin-core';
 *
 * export const routes: Routes = [
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [roleGuardWithData],
 *     data: {
 *       roles: ['admin'],
 *       permissions: ['admin:access'],
 *       requireAll: false
 *     }
 *   }
 * ];
 * ```
 */
export const roleGuardWithData: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const authConfig = inject(AUTH_CONFIG);

  // Get requirements from route data
  const data = route.data as RoleGuardData;
  const roles = data.roles;
  const permissions = data.permissions;
  const requireAll = data.requireAll || false;

  // Check permissions
  const hasAccess = permissionService.canActivateRoute(roles, permissions, requireAll);

  if (hasAccess) {
    return true;
  }

  // User doesn't have required permissions
  const unauthorizedRoute = authConfig.routes.unauthorized || '/unauthorized';
  router.navigate([unauthorizedRoute]);
  return false;
};
