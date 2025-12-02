import { inject, Injectable } from '@angular/core';
import { AuthService } from 'ng-admin-core';

@Injectable({
  providedIn: 'root',
})
export class AppInitializer {
  authService = inject(AuthService);

  async initialize(): Promise<void> {
    return this.authService.initialize();
  }
}
