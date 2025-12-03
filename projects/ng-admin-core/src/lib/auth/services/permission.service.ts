/**
 * Permission service - manages user permissions and access control
 * @module auth/services
 */

import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { Permission, PermissionCheckOptions } from '../models/auth.models';

/**
 * Permission service for role-based and permission-based access control
 */
@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private authService = inject(AuthService);

  /**
   * Get current user's roles
   */
  readonly userRoles = computed(() => {
    const user = this.authService.user();
    return user?.roles?.map((r) => r.name) ?? [];
  });

  /**
   * Get current user's permissions
   */
  readonly userPermissions = computed(() => {
    const user = this.authService.user();
    const directPermissions = user?.permissions ?? [];

    // Also get permissions from roles
    const rolePermissions = user?.roles?.flatMap((r) => r.permissions ?? []) ?? [];

    // Combine and deduplicate by permission name
    const allPermissions = [...directPermissions, ...rolePermissions];
    const uniquePermissions = allPermissions.filter(
      (p, index, self) => index === self.findIndex((t) => t.name === p.name)
    );

    return uniquePermissions;
  });

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const permissions = this.userPermissions();
    return permissions.some((p) => p.name === permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  /**
   * Check if user has permission for a specific resource and action
   *
   * @example
   * ```typescript
   * permissionService.hasResourcePermission('users', 'create')
   * permissionService.hasResourcePermission('posts', 'delete')
   * ```
   */
  hasResourcePermission(resource: string, action: string): boolean {
    const permissions = this.userPermissions();
    return permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    return this.authService.hasAllRoles(roles);
  }

  /**
   * Check combined role and permission requirements
   *
   * @param roles - Required roles
   * @param permissions - Required permissions
   * @param options - Check options
   * @returns true if user meets the requirements
   *
   * @example
   * ```typescript
   * // User must have 'admin' role OR 'users:create' permission
   * can({ roles: ['admin'], permissions: ['users:create'] })
   *
   * // User must have 'admin' role AND 'users:create' permission
   * can({ roles: ['admin'], permissions: ['users:create'] }, { requireAll: true })
   * ```
   */
  can(
    requirements: {
      roles?: string[];
      permissions?: string[];
    },
    options: PermissionCheckOptions = {}
  ): boolean {
    const { roles = [], permissions = [] } = requirements;
    const { requireAll = true } = options;

    if (roles.length === 0 && permissions.length === 0) {
      return true; // No requirements, allow access
    }

    const hasRequiredRoles = roles.length === 0 || (
      requireAll ? this.hasAllRoles(roles) : this.hasAnyRole(roles)
    );

    const hasRequiredPermissions = permissions.length === 0 || (
      requireAll ? this.hasAllPermissions(permissions) : this.hasAnyPermission(permissions)
    );

    if (requireAll) {
      return hasRequiredRoles && hasRequiredPermissions;
    } else {
      return hasRequiredRoles || hasRequiredPermissions;
    }
  }

  /**
   * Check if user cannot perform an action (inverse of can)
   */
  cannot(
    requirements: {
      roles?: string[];
      permissions?: string[];
    },
    options: PermissionCheckOptions = {}
  ): boolean {
    return !this.can(requirements, options);
  }

  /**
   * Get all permission names as an array
   */
  getPermissionNames(): string[] {
    return this.userPermissions().map((p) => p.name);
  }

  /**
   * Get all role names as an array
   */
  getRoleNames(): string[] {
    return this.userRoles();
  }

  /**
   * Check if user is an admin (has 'admin' or 'administrator' role)
   */
  isAdmin(): boolean {
    return this.hasAnyRole(['admin', 'administrator', 'superadmin']);
  }

  /**
   * Check if user has permission to access a route
   * Used by route guards
   */
  canActivateRoute(
    requiredRoles?: string[],
    requiredPermissions?: string[],
    requireAll = false
  ): boolean {
    if (!requiredRoles && !requiredPermissions) {
      return true; // No requirements
    }

    return this.can(
      {
        roles: requiredRoles,
        permissions: requiredPermissions,
      },
      { requireAll }
    );
  }
}
