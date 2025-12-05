import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@labyrinth-team/ng-admin-core';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [],
  templateUrl: './google-callback.html',
  styleUrl: './google-callback.scss',
})
export class GoogleCallback {
  private authService = inject(AuthService);
  private router = inject(Router);

  error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const success = await this.authService.handleOAuthCallback();
      
      if (!success) {
        this.error.set('Google authentication failed. Please try again.');
        setTimeout(() => this.redirectToLogin(), 3000);
      }
      // If successful, GoogleAuthService will handle navigation
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      this.error.set('An unexpected error occurred. Please try again.');
      setTimeout(() => this.redirectToLogin(), 3000);
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
