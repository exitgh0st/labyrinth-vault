import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { DialogService, NotificationService, SkeletonLoader, EmptyState } from 'ng-admin-core';
import { SessionApi, SessionListQuery } from '../../services/session-api';
import { Session } from '../../models/session';

/**
 * Admin Sessions list page component
 * Allows admins to view and manage all user sessions
 */
@Component({
  selector: 'app-admin-sessions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatCardModule,
    SkeletonLoader,
    EmptyState
  ],
  templateUrl: './admin-sessions.html',
  styleUrl: './admin-sessions.scss',
})
export class AdminSessions {
  private sessionApi = inject(SessionApi);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);

  // State signals
  items = signal<Session[]>([]);
  total = signal(0);
  totalActiveSessions = signal(0);
  totalRevokedSessions = signal(0);
  loading = signal(false);
  error = signal('');

  // Pagination signals
  skip = signal(0);
  take = signal(10);

  // Query computed from signals
  query = computed<SessionListQuery>(() => ({
    skip: this.skip(),
    take: this.take()
  }));

  // Computed properties for pagination
  currentPage = computed(() =>
    Math.floor(this.skip() / this.take()) + 1
  );

  /**
   * Columns to display in the table
   */
  displayedColumns = ['user', 'device', 'ipAddress', 'status', 'createdAt', 'lastUsed', 'expiresAt', 'actions'];
  pageSizeOptions = [5, 10, 25, 50];

  ngOnInit(): void {
    this.loadItems();
  }

  /**
   * Loads items from the API using the current query parameters
   */
  loadItems(): void {
    this.loading.set(true);
    this.error.set('');

    this.sessionApi.getAllSessions(this.query()).subscribe({
      next: (response) => {
        this.items.set(response.data || []);
        this.total.set(response.total || 0);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load sessions');
        this.items.set([]); // Ensure items is always an array
        this.loading.set(false);
        this.notificationService.error('Failed to load sessions');
        console.error('Failed to load sessions:', err);
      }
    });

    // Load total active sessions count
    this.sessionApi.getAllSessions({ skip: 0, take: 0, isRevoked: false }).subscribe({
      next: (response) => {
        console.log("TOTAL ACTIVE: ", response);
        this.totalActiveSessions.set(response.total || 0);
      },
      error: (err) => {
        console.error('Failed to load active sessions count:', err);
      }
    });

    // Load total revoked sessions count
    this.sessionApi.getAllSessions({ skip: 0, take: 0, isRevoked: true }).subscribe({
      next: (response) => {
        this.totalRevokedSessions.set(response.total || 0);
      },
      error: (err) => {
        console.error('Failed to load revoked sessions count:', err);
      }
    });
  }

  /**
   * Handle page change event
   */
  onPageChange(event: PageEvent): void {
    this.take.set(event.pageSize);
    this.skip.set(event.pageIndex * event.pageSize);
    this.loadItems();
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: number): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Revoke Session?',
      text: 'This will log out the user from this device.',
      icon: 'warning',
      confirmButtonText: 'Yes, revoke',
    });

    if (confirmed) {
      this.sessionApi.revokeSession(sessionId).subscribe({
        next: () => {
          this.notificationService.success('Session revoked successfully');
          this.loadItems();
        },
        error: (error) => {
          this.notificationService.error('Failed to revoke session');
          console.error('Failed to revoke session:', error);
        }
      });
    }
  }

  /**
   * Delete a specific session
   */
  async deleteSession(sessionId: number): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Delete Session?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      confirmButtonText: 'Yes, delete',
    });

    if (confirmed) {
      this.sessionApi.deleteSession(sessionId).subscribe({
        next: () => {
          this.notificationService.success('Session deleted successfully');
          this.loadItems();
        },
        error: (error) => {
          this.notificationService.error('Failed to delete session');
          console.error('Failed to delete session:', error);
        }
      });
    }
  }

  /**
   * Revoke all sessions for a specific user
   */
  async revokeAllForUser(userId: string): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Revoke All Sessions?',
      text: `This will log out user ${userId} from all devices.`,
      icon: 'warning',
      confirmButtonText: 'Yes, revoke all',
    });

    if (confirmed) {
      this.sessionApi.revokeAllUserSessions(userId).subscribe({
        next: () => {
          this.notificationService.success('All user sessions revoked successfully');
          this.loadItems();
        },
        error: (error) => {
          this.notificationService.error('Failed to revoke user sessions');
          console.error('Failed to revoke user sessions:', error);
        }
      });
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpired(): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Cleanup Expired Sessions?',
      text: 'This will permanently delete all expired sessions.',
      icon: 'info',
      confirmButtonText: 'Yes, cleanup',
    });

    if (confirmed) {
      this.sessionApi.cleanupExpiredSessions().subscribe({
        next: (result) => {
          this.notificationService.success(`${result.count} expired sessions deleted`);
          this.loadItems();
        },
        error: (error) => {
          this.notificationService.error('Failed to cleanup expired sessions');
          console.error('Failed to cleanup expired sessions:', error);
        }
      });
    }
  }

  /**
   * Cleanup revoked sessions
   */
  async cleanupRevoked(): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Cleanup Revoked Sessions?',
      text: 'This will permanently delete revoked sessions older than 30 days.',
      icon: 'info',
      confirmButtonText: 'Yes, cleanup',
    });

    if (confirmed) {
      this.sessionApi.cleanupRevokedSessions().subscribe({
        next: (result) => {
          this.notificationService.success(`${result.count} revoked sessions deleted`);
          this.loadItems();
        },
        error: (error) => {
          this.notificationService.error('Failed to cleanup revoked sessions');
          console.error('Failed to cleanup revoked sessions:', error);
        }
      });
    }
  }

  /**
   * Check if a session is expired
   */
  isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  /**
   * Get device information from user agent
   */
  getDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari Browser';
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

  /**
   * Get user display name with fallback strategy
   */
  getUserDisplayName(session: Session): string {
    if (!session.user) {
      return session.userId;
    }

    // Try displayName first
    if (session.user.displayName) {
      return session.user.displayName;
    }

    // Try firstName + lastName
    if (session.user.firstName || session.user.lastName) {
      return [session.user.firstName, session.user.lastName]
        .filter(Boolean)
        .join(' ');
    }

    // Fallback to email
    if (session.user.email) {
      return session.user.email;
    }

    // Last resort: userId
    return session.userId;
  }
}
