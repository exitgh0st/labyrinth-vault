import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ListQuery, ListResponse } from '@labyrinth-team/ng-admin-core';
import { Session } from '../models/session';

/**
 * Extended query interface for session filtering
 */
export interface SessionListQuery extends ListQuery {
  userId?: string;
  isRevoked?: boolean;
  ipAddress?: string;
}

/**
 * Session API service for managing user sessions
 * Handles both user's personal sessions and admin operations
 */
@Injectable({
  providedIn: 'root'
})
export class SessionApi {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Signal to store active sessions for the current user
   * Used for caching and reactive updates
   */
  activeSessions = signal<Session[]>([]);

  // ============================================
  // User's Personal Session Methods
  // ============================================

  /**
   * Get all active sessions for the current user
   */
  getMyActiveSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.apiUrl}/auth/sessions`,
      { withCredentials: true }
    );
  }

  /**
   * Revoke a specific session (user's own)
   */
  revokeMySession(sessionId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/auth/${sessionId}/revoke`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Logout from all devices (user's own sessions)
   */
  logoutAllMyDevices(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/auth/logout-all`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Load active sessions and update the signal
   * Convenience method for components
   */
  loadMyActiveSessions(): void {
    this.getMyActiveSessions().subscribe({
      next: (sessions) => this.activeSessions.set(sessions),
      error: (error) => console.error('Failed to load sessions:', error)
    });
  }

  // ============================================
  // Admin Session Management Methods
  // ============================================

  /**
   * Get all sessions with optional filtering (Admin only)
   */
  getAllSessions(query?: SessionListQuery): Observable<ListResponse<Session>> {
    let params = new HttpParams();

    if (query?.skip !== undefined) {
      params = params.set('skip', query.skip.toString());
    }
    if (query?.take !== undefined) {
      params = params.set('take', query.take.toString());
    }
    if (query?.userId) {
      params = params.set('userId', query.userId);
    }
    if (query?.isRevoked !== undefined) {
      params = params.set('isRevoked', query.isRevoked.toString());
    }
    if (query?.ipAddress) {
      params = params.set('ipAddress', query.ipAddress);
    }

    return this.http.get<ListResponse<Session>>(
      `${this.apiUrl}/sessions`,
      { params, withCredentials: true }
    );
  }

  /**
   * Revoke a specific session (Admin only)
   */
  revokeSession(sessionId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/sessions/${sessionId}/revoke`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Revoke all sessions for a specific user (Admin only)
   */
  revokeAllUserSessions(userId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/sessions/user/${userId}/revoke-all`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Delete a specific session (Admin only)
   */
  deleteSession(sessionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/sessions/${sessionId}`,
      { withCredentials: true }
    );
  }

  /**
   * Cleanup expired sessions (Admin only)
   */
  cleanupExpiredSessions(): Observable<{ count: number }> {
    return this.http.delete<{ count: number }>(
      `${this.apiUrl}/sessions/cleanup/expired`,
      { withCredentials: true }
    );
  }

  /**
   * Cleanup revoked sessions older than specified days (Admin only)
   */
  cleanupRevokedSessions(days: number = 1): Observable<{ count: number }> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.delete<{ count: number }>(
      `${this.apiUrl}/sessions/cleanup/revoked`,
      { params, withCredentials: true }
    );
  }
}
