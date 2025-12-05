import { Component, effect, inject, signal } from '@angular/core';
import { UserApi } from '../../services/user-api';
import { RoleApi } from '../../../role/services/role-api';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../../../role/models/role.model';
import { User } from '../../models/user.model';
import { UserForm } from '../../components/user-form/user-form';
import { toSignal } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { AuthService, ListResponse } from '@labyrinth-team/ng-admin-core';

@Component({
  selector: 'app-user-edit',
  imports: [UserForm],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.scss',
})
export class UserEdit {
  private route = inject(ActivatedRoute);
  private params = toSignal(this.route.params);
  private userApi = inject(UserApi);
  private roleApi = inject(RoleApi);
  private router = inject(Router);
  private authService = inject(AuthService);

  user = signal<User | null>(null);
  availableRoles = signal<Role[]>([]);
  isLoading = signal(false);

  constructor(
  ) {
    // Load data when userId changes
    effect(() => {
      const userId = this.params()?.['id'];
      if (userId) {
        this.loadUser(userId);
        this.loadRoles();
      }
    });
  }

  loadUser(userId: string): void {
    this.isLoading.set(true);
    this.userApi.getById(userId).subscribe({
      next: (userData: User) => {
        this.user.set(userData);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load user:', error);
        this.user.set(null);
        this.isLoading.set(false);
      }
    });
  }

  loadRoles(): void {
    this.roleApi.getAll().subscribe({
      next: (response: ListResponse<Role>) => {
        this.availableRoles.set(response.data || []);
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
  }

  handleUpdate(userData: Partial<User>): void {
    const currentUser = this.user();
    if (!currentUser) return;

    this.isLoading.set(true);
    this.userApi.update(currentUser.id, userData).subscribe({
      next: (updatedUser: User) => {
        this.isLoading.set(false);

        if (updatedUser.id === this.authService.user()?.id) {
          this.authService.updateUser(updatedUser);
        }

        Swal.fire({
          title: 'Success!',
          text: 'User updated successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false
        }).then(() => {
          this.router.navigate(['admin/users', currentUser.id]);
        });
      },
      error: (error) => {
        console.error('Failed to update user:', error);
        alert('Failed to update user. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  handleCancel(): void {
    this.router.navigate(['admin/users']);
  }
}
