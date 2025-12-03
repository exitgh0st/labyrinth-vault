import { Component, signal } from '@angular/core';
import { Role } from '../../models/role.model';
import { RoleApi } from '../../services/role-api';
import { Router } from '@angular/router';
import { RoleForm } from '../../components/role-form/role-form';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-create',
  imports: [RoleForm],
  templateUrl: './role-create.html',
  styleUrl: './role-create.scss',
})
export class RoleCreate {
  isLoading = signal(false);

  constructor(
    private roleApi: RoleApi,
    private router: Router
  ) {}

  handleCreate(roleData: Partial<Role>) {
    this.isLoading.set(true);
    this.roleApi.create(roleData).subscribe({
      next: (newRole: Role) => {
        console.log('Role created:', newRole);
        this.isLoading.set(false);
        Swal.fire({
          title: 'Success!',
          text: 'Role created successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false
        }).then(() => {
          this.router.navigate(['/roles']);
        });
      },
      error: (error) => {
        console.error('Failed to create role:', error);
        this.isLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Failed to create role',
          text: 'Please try again.',
          heightAuto: false
        });
      }
    });
  }

  handleCancel(): void {
    this.router.navigate(['/roles']);
  }
}