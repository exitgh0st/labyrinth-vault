import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Profile } from './profile';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthService } from '@labyrinth-team/ng-admin-core';
import { signal } from '@angular/core';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['updateUser'], {
      user: signal({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: [
          {
            id: 1,
            name: 'user',
            permissions: [
              { id: 1, name: 'read:profile' }
            ]
          }
        ],
        createdAt: new Date('2024-01-01')
      }),
      isAuthenticated: signal(true)
    });

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideAnimations(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(component.profileForm.get('firstName')?.value).toBe('John');
    expect(component.profileForm.get('lastName')?.value).toBe('Doe');
    expect(component.profileForm.get('email')?.value).toBe('test@example.com');
  });

  it('should toggle edit mode', () => {
    expect(component.isEditing()).toBe(false);
    component.toggleEdit();
    expect(component.isEditing()).toBe(true);
    component.toggleEdit();
    expect(component.isEditing()).toBe(false);
  });

  it('should validate form fields', () => {
    const form = component.profileForm;
    form.patchValue({
      firstName: '',
      lastName: '',
    });

    expect(form.invalid).toBe(true);
    expect(form.get('firstName')?.hasError('required')).toBe(true);
  });

  it('should save profile when valid', (done) => {
    component.isEditing.set(true);
    component.profileForm.patchValue({
      firstName: 'Jane',
      lastName: 'Smith',
    });

    component.saveProfile();
    expect(component.isSaving()).toBe(true);

    setTimeout(() => {
      expect(mockAuthService.updateUser).toHaveBeenCalled();
      expect(component.isSaving()).toBe(false);
      expect(component.isEditing()).toBe(false);
      done();
    }, 1100);
  });

  it('should validate password match', () => {
    component.passwordForm.patchValue({
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'differentpassword'
    });

    component.changePassword();
    expect(component.passwordForm.get('confirmPassword')?.hasError('mismatch')).toBe(true);
  });

  it('should compute user roles correctly', () => {
    const roles = component.userRoles();
    expect(roles).toContain('user');
    expect(roles.length).toBe(1);
  });

  it('should compute user permissions correctly', () => {
    const permissions = component.userPermissions();
    expect(permissions).toContain('read:profile');
    expect(permissions.length).toBeGreaterThan(0);
  });
});
