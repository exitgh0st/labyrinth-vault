import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login';
import { AuthService } from 'ng-admin-core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'login',
      'getOAuthUrl'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');

    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');

    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBe(true);

    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('validpassword');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '123'
    });

    component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should submit valid form', () => {
    mockAuthService.login.and.returnValue(of({
      accessToken: 'token',
      user: { id: '1', email: 'test@example.com', emailVerified: true, isActive: true, isDeleted: false, emailVerifiedAt: null }
    }));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should handle login error', () => {
    const errorResponse = { status: 401, error: { message: 'Invalid credentials' } };
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid email or password');
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBe(true);

    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);

    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(true);
  });

  it('should get OAuth URL for Google', () => {
    mockAuthService.getOAuthUrl.and.returnValue('https://oauth.google.com');

    spyOn(window.location, 'href', 'set');
    component.loginWithGoogle();

    expect(mockAuthService.getOAuthUrl).toHaveBeenCalledWith('google');
  });
});
