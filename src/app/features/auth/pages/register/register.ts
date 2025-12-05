import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleSignin } from '../../components/google-signin/google-signin';
import { AuthService, ZodValidators, registerSchema } from '@labyrinth-team/ng-admin-core';
import { ValidationMessageService } from '@labyrinth-team/ng-admin-core';
import { passwordSchema } from '../../../../shared/schemas/validation.schemas';

const customRegisterSchema = registerSchema.safeExtend({
  password: passwordSchema,
  confirmPassword: passwordSchema
});

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    GoogleSignin,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  protected validationService = inject(ValidationMessageService);

  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor() {
    this.registerForm = this.fb.group({
      email: [''],
      password: [''],
      confirmPassword: ['']
    }, {
      validators: ZodValidators.formGroup(customRegisterSchema)
    });
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  getFieldError(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    return this.validationService.getErrorMessage(control);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      console.log(this.registerForm);
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Registration failed. Please try again.'
        );
      }
    });
  }
}