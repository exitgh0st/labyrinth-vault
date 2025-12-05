import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeWhile, timer } from 'rxjs';
import { AuthService } from '@labyrinth-team/ng-admin-core';

/**
 * Session timeout warning component that displays a modal
 * when the user's session is about to expire due to inactivity
 */
@Component({
  selector: 'app-session-timeout-warning',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './session-timeout-warning.html',
  styleUrl: './session-timeout-warning.scss',
})
export class SessionTimeoutWarning {
  private authService = inject(AuthService);
  showWarning = signal(false);
  timeRemaining = signal(0);

  private readonly WARNING_THRESHOLD_MS = 5 * 60 * 1000; // Show warning 5 min before timeout
  private readonly INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 min total

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.startWatchdog();
      }
    });
  }

  /**
   * Start the inactivity watchdog timer
   */
  private startWatchdog(): void {
    timer(this.INACTIVITY_TIMEOUT_MS - this.WARNING_THRESHOLD_MS).subscribe(() => {
      this.showWarning.set(true);
      this.startCountdown();
    });
  }

  /**
   * Start the countdown timer for session expiration
   */
  private startCountdown(): void {
    let remaining = Math.floor(this.WARNING_THRESHOLD_MS / 1000);
    this.timeRemaining.set(remaining);

    const countdown$ = timer(0, 1000).pipe(
      takeWhile(() => remaining > 0 && this.showWarning())
    );

    countdown$.subscribe(() => {
      remaining--;
      this.timeRemaining.set(remaining);

      if (remaining === 0) {
        this.authService.logout().subscribe();
      }
    });
  }

  /**
   * Extend the user's session
   */
  extendSession(): void {
    this.showWarning.set(false);
    this.authService.recordActivity();
  }

  /**
   * Log out the user immediately
   */
  logoutNow(): void {
    this.authService.logout().subscribe();
  }

  /**
   * Get formatted time remaining (MM:SS)
   */
  getFormattedTime(): string {
    const minutes = Math.floor(this.timeRemaining() / 60);
    const seconds = this.timeRemaining() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get progress bar value (0-100)
   */
  getProgress(): number {
    const totalSeconds = this.WARNING_THRESHOLD_MS / 1000;
    return (this.timeRemaining() / totalSeconds) * 100;
  }
}
