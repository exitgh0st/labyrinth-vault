import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService, PermissionService, CanDirective } from 'ng-admin-core';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  permissions?: string[];
  roles?: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    CanDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  protected authService = inject(AuthService);
  protected permissionService = inject(PermissionService);

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  userName = computed(() => {
    const user = this.authService.user();
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.email?.split('@')[0] || 'User';
  });

  stats: StatCard[] = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: 'people',
      color: '#667eea',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Active Sessions',
      value: '456',
      icon: 'trending_up',
      color: '#4caf50',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Pending Tasks',
      value: '23',
      icon: 'assignment',
      color: '#ff9800',
      trend: { value: 5, isPositive: false }
    },
    {
      title: 'Total Revenue',
      value: '$45.6k',
      icon: 'attach_money',
      color: '#2196f3',
      trend: { value: 15, isPositive: true }
    }
  ];

  quickActions: QuickAction[] = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: 'manage_accounts',
      route: '/admin/users',
      color: '#667eea',
      roles: ['ADMIN']
    },
    {
      title: 'Reports',
      description: 'View analytics and reports',
      icon: 'assessment',
      route: '/reports',
      color: '#4caf50',
    },
    {
      title: 'Settings',
      description: 'Configure application settings',
      icon: 'settings',
      route: '/settings',
      color: '#ff9800',
      roles: ['ADMIN']
    },
    {
      title: 'Profile',
      description: 'Update your profile information',
      icon: 'person',
      route: '/profile',
      color: '#2196f3'
    }
  ];

  recentActivities = signal([
    {
      icon: 'login',
      title: 'Logged in',
      description: 'You logged into the system',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      color: '#4caf50'
    },
    {
      icon: 'edit',
      title: 'Profile updated',
      description: 'You updated your profile information',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      color: '#2196f3'
    },
    {
      icon: 'notification_important',
      title: 'New notification',
      description: 'You have a new notification',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      color: '#ff9800'
    }
  ]);

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  canAccessAction(action: QuickAction): boolean {
    if (!action.roles && !action.permissions) {
      return true;
    }
    return this.permissionService.can({
      roles: action.roles,
      permissions: action.permissions
    });
  }
}
