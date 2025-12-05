import { Component, inject, signal } from '@angular/core';
import { Role } from '../../../role/models/role.model';
import { UserApi } from '../../services/user-api';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { RoleApi } from '../../../role/services/role-api';
import { UserForm } from '../../components/user-form/user-form';
import Swal from 'sweetalert2';
import { ListResponse } from '@labyrinth-team/ng-admin-core';

@Component({
  selector: 'app-user-create',
  imports: [UserForm],
  templateUrl: './user-create.html',
  styleUrl: './user-create.scss',
})
export class UserCreate {
  availableRoles = signal<Role[]>([]);
  isLoading = signal(false);

  constructor(
    private userApi: UserApi,
    private roleApi: RoleApi,
    private router: Router
  ) {
    this.loadRoles();
  }

  loadRoles() {
    this.roleApi.getAll().subscribe({
      next: (response: ListResponse<Role>) => {
        this.availableRoles.set(response.data || []);
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
  }

  handleCreate(userData: Partial<User>) {
    this.isLoading.set(true);
    this.userApi.create(userData).subscribe({
      next: (newUser: User) => {
        console.log('User created:', newUser);
        this.router.navigate(['admin/users', newUser.id]);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to create user:', error);
        this.isLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Failed to create user',
          text: 'Please try again.',
        });
      }
    });
  }

  handleCancel(): void {
    this.router.navigate(['admin/users']);
  }
}
