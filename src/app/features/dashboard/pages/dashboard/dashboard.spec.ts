import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { DashboardComponent } from '../../dashboard.component';
import { AuthService, PermissionService } from 'ng-admin-core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: signal(true),
      user: signal({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: true,
        isActive: true,
        isDeleted: false,
        emailVerifiedAt: null
      })
    });

    mockPermissionService = jasmine.createSpyObj('PermissionService', ['can'], {
      userRoles: signal(['admin'])
    });

    mockPermissionService.can.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display greeting based on time', () => {
    const greeting = component.greeting();
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting);
  });

  it('should get user name from firstName or email', () => {
    expect(component.userName()).toBe('John');
  });

  it('should have stats cards', () => {
    expect(component.stats.length).toBeGreaterThan(0);
  });

  it('should have quick actions', () => {
    expect(component.quickActions.length).toBeGreaterThan(0);
  });

  it('should check if user can access action', () => {
    const action = component.quickActions[0];
    const canAccess = component.canAccessAction(action);
    expect(typeof canAccess).toBe('boolean');
  });

  it('should get relative time', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const relativeTime = component.getRelativeTime(fiveMinutesAgo);
    expect(relativeTime).toContain('minute');
  });

  it('should return "Just now" for very recent dates', () => {
    const now = new Date();
    const relativeTime = component.getRelativeTime(now);
    expect(relativeTime).toBe('Just now');
  });
});
