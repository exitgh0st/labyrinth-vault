import { Component, effect, inject, signal } from '@angular/core';
import { RoleApi } from '../../services/role-api';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../../models/role.model';
import { RoleForm } from '../../components/role-form/role-form';
import { toSignal } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-edit',
  imports: [RoleForm],
  templateUrl: './role-edit.html',
  styleUrl: './role-edit.scss',
})
export class RoleEdit {
  private route = inject(ActivatedRoute);
  private params = toSignal(this.route.params);
  private roleApi = inject(RoleApi);
  private router = inject(Router);

  role = signal<Role | null>(null);
  isLoading = signal(false);

  constructor() {
    // Load data when roleId changes
    effect(() => {
      const roleId = this.params()?.['id'];
      if (roleId) {
        this.loadRole(Number(roleId));
      }
    });
  }

  loadRole(roleId: number): void {
    this.isLoading.set(true);
    this.roleApi.getById(roleId).subscribe({
      next: (roleData: Role) => {
        this.role.set(roleData);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load role:', error);
        this.role.set(null);
        this.isLoading.set(false);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load role. Please try again.',
          icon: 'error',
          heightAuto: false
        });
      }
    });
  }

  handleUpdate(roleData: Partial<Role>): void {
    const currentRole = this.role();
    if (!currentRole) return;

    this.isLoading.set(true);
    this.roleApi.update(currentRole.id, roleData).subscribe({
      next: (updatedRole: Role) => {
        this.isLoading.set(false);
        Swal.fire({
          title: 'Success!',
          text: 'Role updated successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false
        }).then(() => {
          this.router.navigate(['/roles']);
        });
      },
      error: (error) => {
        console.error('Failed to update role:', error);
        this.isLoading.set(false);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update role. Please try again.',
          icon: 'error',
          heightAuto: false
        });
      }
    });
  }

  handleCancel(): void {
    this.router.navigate(['/roles']);
  }
}