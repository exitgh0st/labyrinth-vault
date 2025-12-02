import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { UserApi } from '../../services/user-api';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.html',
  styleUrls: ['./user-details.scss']
})
export class UserDetails {
  private route = inject(ActivatedRoute);
  private params = toSignal(this.route.params);

  // Component state
  user = signal<User | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private userApi: UserApi,
    private router: Router
  ) {
    // Auto-load user when userId changes
    effect(() => {
      const userId = this.params()?.['id'];
      if (userId) {
        this.loadUser(userId);
      }
    });
  }
  
  private loadUser(userId: string) {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.userApi.getUserById(userId).subscribe({
      next: (userData) => {
        this.user.set(userData ?? null);
        this.error.set(null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.error.set('Failed to load user. Please try again.');
        this.user.set(null);
        this.isLoading.set(false);
      }
    });
  }
  
  onEdit(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.router.navigate(['/users', currentUser.id, 'edit']);
    }
  }
  
  async onDelete() {
    const currentUser = this.user();
    if (!currentUser) return;

    Swal.fire({
      title: `Are you sure you want to delete ${this.getFullName(currentUser)}?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      heightAuto: false
    }).then(result => {
      if (result.isConfirmed) {
        this.isLoading.set(true);
        this.userApi.deleteUser(currentUser.id).subscribe({
          next: () => {
            this.isLoading.set(false);
            Swal.fire({
              title: 'Deleted!',
              text: 'User has been deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              heightAuto: false
            });
            this.router.navigate(['/users']);
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Failed to delete user:', err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete user. Please try again.',
              icon: 'error',
              heightAuto: false
            });
          }
        });
      }
    });
  }
  
  onToggleActive() {
    const currentUser = this.user();
    if (!currentUser) return;

    const action = currentUser.isActive ? 'deactivate' : 'activate';
    Swal.fire({
      title: `Are you sure you want to ${action} ${this.getFullName(currentUser)}?`,
      text: currentUser.isActive
        ? 'They will not be able to log in.'
        : '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
      heightAuto: false
    }).then(result => {
      if (!result.isConfirmed) return;

      this.isLoading.set(true);
      this.userApi.updateUser(currentUser.id, {
        isActive: !currentUser.isActive
      }).subscribe({
        next: (updatedUser) => {
          this.user.set(updatedUser);
          this.isLoading.set(false);
          Swal.fire({
            title: currentUser.isActive ? 'Deactivated!' : 'Activated!',
            text: `User has been ${action}d successfully.`,
            icon: 'success',
            timer: 1200,
            showConfirmButton: false,
            heightAuto: false
          });
        },
        error: (err) => {
          console.error(`Failed to ${action} user:`, err);
          Swal.fire({
            title: 'Error!',
            text: `Failed to ${action} user. Please try again.`,
            icon: 'error',
            heightAuto: false
          });
          this.isLoading.set(false);
        }
      });
    });
  }
  
  onBackToList(): void {
    this.router.navigate(['/users']);
  }
  
  // Helper methods
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  }
  
  getInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.displayName) {
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  }
  
  getFullName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.displayName || 'No name set';
  }
  
  getAccountStatus(user: User): { label: string; class: string } {
    if (user.isDeleted) {
      return { label: 'Deleted', class: 'status-deleted' };
    }
    if (!user.isActive) {
      return { label: 'Inactive', class: 'status-inactive' };
    }
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return { label: 'Locked', class: 'status-locked' };
    }
    if (!user.emailVerified) {
      return { label: 'Unverified', class: 'status-unverified' };
    }
    return { label: 'Active', class: 'status-active' };
  }
}