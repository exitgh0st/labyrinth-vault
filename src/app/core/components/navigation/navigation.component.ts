import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, PermissionService, BreakpointService } from 'ng-admin-core';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
  permissions?: string[];
  children?: NavItem[];
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);
  protected permissionService = inject(PermissionService);
  private breakpointService = inject(BreakpointService);

  sidenavOpened = signal(false);
  sidenavCollapsed = signal(false);

  isMobile = this.breakpointService.isMobile;

  sidenavOpen = computed(() => {
    if (this.isMobile()) {
      return this.sidenavOpened();
    }
    return true; // Always open on desktop
  });

  userName = computed(() => {
    const user = this.authService.user();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.email?.split('@')[0] || 'User';
  });

  userInitials = computed(() => {
    const user = this.authService.user();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  });

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Profile',
      route: '/profile',
      icon: 'person'
    },
    {
      label: 'Reports',
      route: '/reports',
      icon: 'assessment',
      roles: ['ADMIN']
    },
    {
      label: 'Admin',
      route: '/admin',
      icon: 'admin_panel_settings',
      roles: ['ADMIN'],
      children: [
        {
          label: 'Users',
          route: '/admin/users',
          icon: 'people',
        },
        {
          label: 'Roles',
          route: '/admin/roles',
          icon: 'badge',
        },
        {
          label: 'Sessions',
          route: '/admin/sessions',
          icon: 'history',
          roles: ['ADMIN']
        },
        {
          label: 'Settings',
          route: '/admin/settings',
          icon: 'settings',
        }
      ]
    }
  ];

  canAccessNavItem(item: NavItem): boolean {
    if (!item.roles && !item.permissions) {
      return true;
    }
    return this.permissionService.can({
      roles: item.roles,
      permissions: item.permissions
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened.update(value => !value);
  }

  toggleSidenavCollapse(): void {
    if (this.isMobile()) {
      this.sidenavOpened.update(value => !value);
    } else {
      this.sidenavCollapsed.update(value => !value);
    }
  }

  onSidenavClosed(): void {
    this.sidenavOpened.set(false);
  }

  closeSidenav(): void {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeSidenav();
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.closeSidenav();
  }
}
