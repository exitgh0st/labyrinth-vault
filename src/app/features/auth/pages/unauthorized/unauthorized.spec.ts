import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { UnauthorizedComponent } from './unauthorized.component';
import { AuthService, PermissionService } from '@labyrinth-team/ng-admin-core';
import { signal } from '@angular/core';

describe('UnauthorizedComponent', () => {
  let component: UnauthorizedComponent;
  let fixture: ComponentFixture<UnauthorizedComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocation: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated: signal(true),
      user: signal({
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        isActive: true,
        isDeleted: false,
        emailVerifiedAt: null
      })
    });
    mockPermissionService = jasmine.createSpyObj('PermissionService', [], {
      userRoles: signal(['user'])
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);

    mockAuthService.logout.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [
        UnauthorizedComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('should navigate to dashboard when goToDashboard is called', () => {
    component.goToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call logout service when logout is called', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
