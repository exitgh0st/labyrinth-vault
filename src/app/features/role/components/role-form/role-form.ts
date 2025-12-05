import { Component, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Role } from '../../models/role.model';
import { ZodValidators, roleFormSchema } from '@labyrinth-team/ng-admin-core';
import { ValidationMessageService } from '@labyrinth-team/ng-admin-core';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './role-form.html',
  styleUrls: ['./role-form.scss']
})
export class RoleForm {
  private fb = inject(FormBuilder);
  protected validationService = inject(ValidationMessageService);

  // Inputs
  role = input<Role | null>(null);
  isEditMode = input<boolean>(false);
  isLoading = input<boolean>(false);

  // Outputs
  formSubmit = output<Partial<Role>>();
  formCancel = output<void>();

  roleForm: FormGroup;

  constructor() {
    this.roleForm = this.createForm();

    // Effect to populate form when role changes
    effect(() => {
      const roleData = this.role();
      if (roleData) {
        this.populateForm(roleData);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: [''],
      description: [''],
      isActive: [true]
    }, {
      validators: ZodValidators.formGroup(roleFormSchema)
    });
  }

  private populateForm(role: Role): void {
    this.roleForm.patchValue({
      name: role.name,
      description: role.description || '',
      isActive: role.isActive ?? true
    });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const formData: Partial<Role> = {
      name: this.roleForm.value.name,
      description: this.roleForm.value.description,
      isActive: this.roleForm.value.isActive
    };

    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  getFieldError(fieldName: string): string {
    const control = this.roleForm.get(fieldName);
    return this.validationService.getErrorMessage(control);
  }
}