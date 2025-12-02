import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of, BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { NavigationComponent } from './navigation.component';
import { AuthService, PermissionService } from 'ng-admin-core';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
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

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['isMatched', 'observe']);

    mockAuthService.logout.and.returnValue(of(undefined));
    mockPermissionService.can.and.returnValue(true);
    mockBreakpointObserver.isMatched.and.returnValue(false);
    mockBreakpointObserver.observe.and.returnValue(new BehaviorSubject({ matches: false, breakpoints: {} }));

    await TestBed.configureTestingModule({
      imports: [
        NavigationComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: Router, useValue: mockRouter },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name', () => {
    expect(component.userName()).toBe('John Doe');
  });

  it('should display user initials', () => {
    expect(component.userInitials()).toBe('JD');
  });

  it('should toggle sidenav', () => {
    const initialState = component.sidenavOpened();
    component.toggleSidenav();
    expect(component.sidenavOpened()).toBe(!initialState);
  });

  it('should close sidenav on mobile', () => {
    mockBreakpointObserver.isMatched.and.returnValue(true);
    component.sidenavOpened.set(true);
    component.closeSidenav();
    expect(component.sidenavOpened()).toBe(false);
  });

  it('should not close sidenav on desktop', () => {
    mockBreakpointObserver.isMatched.and.returnValue(false);
    component.sidenavOpened.set(true);
    component.closeSidenav();
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should logout user', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should navigate to profile', () => {
    component.navigateToProfile();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should navigate to settings', () => {
    component.navigateToSettings();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings']);
  });

  it('should check if user can access nav item', () => {
    const navItem = component.navItems[0];
    const canAccess = component.canAccessNavItem(navItem);
    expect(typeof canAccess).toBe('boolean');
  });
});
