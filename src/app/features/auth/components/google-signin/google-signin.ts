import { Component, inject, Input } from '@angular/core';
import { AuthService } from '@labyrinth-team/ng-admin-core';

@Component({
  selector: 'app-google-signin',
  standalone: true,
  imports: [],
  templateUrl: './google-signin.html',
  styleUrl: './google-signin.scss',
})
export class GoogleSignin {
  private authService = inject(AuthService);
  
  @Input() isLoading = false;
  @Input() returnUrl = '/home';

  signInWithGoogle(): void {
    const oauthUrl = this.authService.getOAuthUrl('google');
    // Redirect to Google OAuth
    window.location.href = oauthUrl;
  }
}
