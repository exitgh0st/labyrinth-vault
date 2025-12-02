import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SessionInfo {
  id: number;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt: string;
  isRevoked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SessionStore {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  activeSessions = signal<SessionInfo[]>([]);

  /**
   * Get all active sessions for current user
   */
  getActiveSessions(): Observable<SessionInfo[]> {
    return this.http.get<SessionInfo[]>(
      `${this.apiUrl}/auth/sessions`,
      { withCredentials: true }
    );
  }

  /**
   * Revoke a specific session
   */
  revokeSession(sessionId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/auth/${sessionId}/revoke`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Logout from all devices
   */
  logoutAllDevices(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/auth/logout-all`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Load active sessions
   */
  loadActiveSessions(): void {
    this.getActiveSessions().subscribe({
      next: (sessions) => this.activeSessions.set(sessions),
      error: (error) => console.error('Failed to load sessions:', error)
    });
  }
}