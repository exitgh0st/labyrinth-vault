import { Component, input, output, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { User } from '../../models/user.model';
import { Role } from '../../../role/models/role.model';
import { ZodValidators, userCreateSchema, userEditSchema } from '@labyrinth/ng-admin-core';
import { ValidationMessageService } from '../../../../core/services/validation-message.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserForm {
  private fb = inject(FormBuilder);
  protected validationService = inject(ValidationMessageService);

  // Inputs
  user = input<User | null>(null);
  availableRoles = input<Role[]>([]);
  isEditMode = input<boolean>(false);
  isLoading = input<boolean>(false);

  // Outputs
  formSubmit = output<Partial<User>>();
  formCancel = output<void>();

  userForm: FormGroup;
  selectedRoles = signal<Role[]>([]);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  roleSearchText = signal('');

  // Filtered roles for autocomplete
  filteredRoles = signal<Role[]>([]);

  constructor() {
    this.userForm = this.createForm();

    // Effect to populate form when user changes
    effect(() => {
      const userData = this.user();
      if (userData) {
        this.populateForm(userData);
      }
    });

    // Effect to update filtered roles when available roles or search text changes
    effect(() => {
      const search = this.roleSearchText().toLowerCase();
      const available = this.availableRoles();
      const selected = this.selectedRoles();

      // Filter out already selected roles and apply search
      const filtered = available.filter(role => {
        const isNotSelected = !selected.some(r => r.id === role.id);
        const matchesSearch = role.name.toLowerCase().includes(search);
        return isNotSelected && matchesSearch;
      });

      this.filteredRoles.set(filtered);
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: [''],
      firstName: [''],
      lastName: [''],
      displayName: [''],
      avatarUrl: [''],
      isActive: [true],
      password: [''],
      confirmPassword: [''],
      roleSearch: [''] // For autocomplete input
    }, {
      validators: ZodValidators.formGroup(this.isEditMode() ? userEditSchema : userCreateSchema)
    });
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      displayName: user.displayName || '',
      avatarUrl: user.avatarUrl || '',
      isActive: user.isActive
    });

    // Set selected roles
    if (user.roles) {
      this.selectedRoles.set(user.roles);
    }

    // Update validators based on edit mode
    this.updateFormValidators();
  }

  private updateFormValidators(): void {
    const schema = this.isEditMode() ? userEditSchema : userCreateSchema;
    this.userForm.setValidators(ZodValidators.formGroup(schema));
    this.userForm.updateValueAndValidity();
  }

  onRoleSearchChange(value: string): void {
    this.roleSearchText.set(value);
  }

  selectRole(role: Role): void {
    const current = this.selectedRoles();
    if (!current.some(r => r.id === role.id)) {
      this.selectedRoles.set([...current, role]);
    }
    // Clear search input
    this.userForm.get('roleSearch')?.setValue('');
    this.roleSearchText.set('');
  }

  removeRole(role: Role): void {
    const current = this.selectedRoles();
    this.selectedRoles.set(current.filter(r => r.id !== role.id));
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (this.selectedRoles().length === 0) {
      // Show error for roles
      return;
    }

    const formData: Partial<User> = {
      email: this.userForm.value.email,
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
      displayName: this.userForm.value.displayName,
      avatarUrl: this.userForm.value.avatarUrl,
      isActive: this.userForm.value.isActive,
    };

    const password = this.userForm.value.password;
    if (password) {
      formData.password = password;
    }

    if (this.selectedRoles().length > 0) {
      formData.roleIds = this.selectedRoles().map(r => r.id);
    }

    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    return this.validationService.getErrorMessage(control);
  }
}
