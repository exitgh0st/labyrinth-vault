import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '@labyrinth-team/ng-admin-core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    expect(component.registerForm.get('acceptTerms')?.value).toBe(false);
  });

  it('should validate required fields', () => {
    const form = component.registerForm;

    expect(form.valid).toBe(false);

    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true
    });

    expect(form.valid).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password strength', () => {
    const passwordControl = component.registerForm.get('password');

    passwordControl?.setValue('weak');
    expect(passwordControl?.hasError('passwordStrength')).toBe(true);

    passwordControl?.setValue('StrongP@ss123');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should validate password match', () => {
    const form = component.registerForm;

    form.patchValue({
      password: 'Password123!',
      confirmPassword: 'DifferentPass123!'
    });

    expect(form.hasError('passwordMismatch')).toBe(true);

    form.patchValue({
      confirmPassword: 'Password123!'
    });

    expect(form.hasError('passwordMismatch')).toBe(false);
  });

  it('should require terms acceptance', () => {
    const termsControl = component.registerForm.get('acceptTerms');

    termsControl?.setValue(false);
    expect(termsControl?.hasError('required')).toBe(true);

    termsControl?.setValue(true);
    expect(termsControl?.valid).toBe(true);
  });

  it('should not submit if form is invalid', () => {
    component.registerForm.patchValue({
      firstName: 'J',
      email: 'invalid-email',
      password: 'weak'
    });

    component.onSubmit();

    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should submit valid form', () => {
    mockAuthService.register.and.returnValue(of({
      accessToken: 'token',
      user: {
        id: '1',
        email: 'john@example.com',
        emailVerified: false,
        isActive: true,
        isDeleted: false,
        emailVerifiedAt: null,
        firstName: 'John',
        lastName: 'Doe'
      }
    }));

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true
    });

    component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalled();
  });

  it('should handle registration error', () => {
    const errorResponse = { status: 409, error: { message: 'Email already exists' } };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'existing@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Email already exists');
  });

  it('should calculate password strength correctly', () => {
    component.registerForm.patchValue({ password: '' });
    expect(component.getPasswordStrength()).toBe(0);

    component.registerForm.patchValue({ password: 'weakpass' });
    expect(component.getPasswordStrength()).toBeGreaterThan(0);

    component.registerForm.patchValue({ password: 'StrongP@ss123' });
    expect(component.getPasswordStrength()).toBe(100);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);

    expect(component.hideConfirmPassword()).toBe(true);
    component.toggleConfirmPasswordVisibility();
    expect(component.hideConfirmPassword()).toBe(false);
  });
});
