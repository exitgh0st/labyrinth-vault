import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionApi } from '../../services/session-api';
import { Session } from '../../models/session';
import { DialogService, NotificationService, SkeletonLoader, EmptyState } from '@labyrinth-team/ng-admin-core';

/**
 * Sessions list page component with Material table
 */
@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    SkeletonLoader,
    EmptyState
  ],
  templateUrl: './sessions.html',
  styleUrl: './sessions.scss',
})
export class Sessions {
  protected sessionApi = inject(SessionApi);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);

  loading = signal(false);

  /**
   * Columns to display in the table
   */
  displayedColumns = ['device', 'ipAddress', 'lastUsed', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadSessions();
  }

  /**
   * Load active sessions
   */
  loadSessions(): void {
    this.loading.set(true);
    this.sessionApi.getMyActiveSessions().subscribe({
      next: (sessions) => {
        this.sessionApi.activeSessions.set(sessions);
        this.loading.set(false);
      },
      error: (error) => {
        this.notificationService.error('Failed to load sessions');
        this.loading.set(false);
        console.error('Failed to load sessions:', error);
      }
    });
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: number): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Revoke Session?',
      text: 'This will log out this device.',
      icon: 'warning',
      confirmButtonText: 'Yes, revoke',
    });

    if (confirmed) {
      this.sessionApi.revokeMySession(sessionId).subscribe({
        next: () => {
          this.notificationService.success('Session revoked successfully');
          this.loadSessions();
        },
        error: (error) => {
          this.notificationService.error('Failed to revoke session');
          console.error(error);
        }
      });
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Logout All Devices?',
      text: 'You will be logged out from all devices.',
      icon: 'warning',
      confirmButtonText: 'Yes, logout all',
    });

    if (confirmed) {
      this.sessionApi.logoutAllMyDevices().subscribe({
        next: () => {
          this.notificationService.success('Logged out from all devices');
        },
        error: (error) => {
          this.notificationService.error('Failed to logout from all devices');
          console.error(error);
        }
      });
    }
  }

  /**
   * Get device information from user agent
   */
  getDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';
    // Simple parser - use ua-parser-js in production
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    return 'Web Browser';
  }

  /**
   * Get device icon based on user agent
   */
  getDeviceIcon(userAgent?: string): string {
    if (!userAgent) return 'devices';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'smartphone';
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'tablet';
    }
    return 'computer';
  }

  /**
   * Format date for display
   */
  formatDate(date?: string): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
