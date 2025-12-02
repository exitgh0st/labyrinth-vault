import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, PermissionService } from 'ng-admin-core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.scss'
})
export class Unauthorized {
  private router = inject(Router);
  private location = inject(Location);
  protected authService = inject(AuthService);
  protected permissionService = inject(PermissionService);

  goBack(): void {
    this.location.back();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
