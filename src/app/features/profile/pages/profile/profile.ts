import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService, ZodValidators, ValidationMessageService, DialogService } from '@labyrinth-team/ng-admin-core';
import { UserApi } from '../../../user/services/user-api';
import { profileUpdateSchema, passwordChangeSchema } from '../../../../shared/schemas/validation.schemas';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  private fb = inject(FormBuilder);
  protected authService = inject(AuthService);
  protected userApi = inject(UserApi);
  protected validationService = inject(ValidationMessageService);
  private dialogService = inject(DialogService);

  isEditing = signal(false);
  isSaving = signal(false);

  user = computed(() => this.authService.user());

  profileForm: FormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: [{ value: '', disabled: true }],
  }, {
    validators: ZodValidators.formGroup(profileUpdateSchema)
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: [''],
    newPassword: [''],
    confirmPassword: [''],
  }, {
    validators: ZodValidators.formGroup(passwordChangeSchema)
  });

  userRoles = computed(() => {
    const user = this.user();
    return user?.roles?.map(r => r.name) || [];
  });

  userPermissions = computed(() => {
    const user = this.user();
    const rolePermissions = user?.roles?.flatMap(r => r.permissions || []) || [];
    const directPermissions = user?.permissions || [];
    const allPermissions = [...rolePermissions, ...directPermissions];

    // Remove duplicates
    const uniquePermissions = Array.from(
      new Set(allPermissions.map(p => p.name))
    );

    return uniquePermissions;
  });

  accountAge = computed(() => {
    const user = this.user();
    if (!user?.createdAt) return 'Unknown';

    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  });

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.loadUserData(); // Reset form
    }
    this.isEditing.update(v => !v);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.controls[key].markAsTouched();
      });
      return;
    }

    const user = this.user();
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    this.isSaving.set(true);

    const formValue = this.profileForm.getRawValue();
    const updateData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
    };

    this.userApi.update(user.id, updateData).subscribe({
      next: async (updatedUser) => {
        // Update auth service user with the response from API
        this.authService.updateUser({
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        });

        await this.dialogService.success('Profile updated successfully');
        this.isSaving.set(false);
        this.isEditing.set(false);
      },
      error: async (error) => {
        console.error('Error saving profile:', error);
        const errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        await this.dialogService.error('Update Failed', errorMessage);
        this.isSaving.set(false);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    const user = this.user();
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    this.userApi.updatePassword(user.id, currentPassword, newPassword).subscribe({
      next: async () => {
        await this.dialogService.success('Password changed successfully');
      },
      error: async (error) => {
        console.error('Error changing password:', error);

        // Handle specific error cases
        if (error.status === 401 || error.status === 400) {
          const errorMessage = error.error?.message || 'Current password is incorrect';
          await this.dialogService.error('Password Change Failed', errorMessage);
          this.passwordForm.controls['currentPassword'].setErrors({
            custom: 'Current password is incorrect'
          });
        } else {
          const errorMessage = error.error?.message || 'Failed to change password. Please try again.';
          await this.dialogService.error('Password Change Failed', errorMessage);
        }
      }
    });
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    return this.validationService.getErrorMessage(control);
  }
}
