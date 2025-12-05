import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminSessions } from './admin-sessions';
import { DialogService, NotificationService } from '@labyrinth-team/ng-admin-core';
import { SessionApi } from '../../services/session-api';
import { Session } from '../../models/session';
import { of } from 'rxjs';

describe('AdminSessions', () => {
  let component: AdminSessions;
  let fixture: ComponentFixture<AdminSessions>;
  let mockSessionApi: jasmine.SpyObj<SessionApi>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    // Create mock services
    mockSessionApi = jasmine.createSpyObj('SessionApi', [
      'getAllSessions',
      'revokeSession',
      'revokeAllUserSessions',
      'deleteSession',
      'cleanupExpiredSessions',
      'cleanupRevokedSessions'
    ]);
    mockDialogService = jasmine.createSpyObj('DialogService', ['confirm']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'success',
      'error'
    ]);

    // Setup default mock responses
    mockSessionApi.getAllSessions.and.returnValue(
      of({ data: [], total: 0 })
    );

    await TestBed.configureTestingModule({
      imports: [AdminSessions, BrowserAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SessionApi, useValue: mockSessionApi },
        { provide: DialogService, useValue: mockDialogService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSessions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sessions on init', () => {
    expect(mockSessionApi.getAllSessions).toHaveBeenCalled();
  });

  it('should have correct initial query parameters', () => {
    expect(component.query.skip).toBe(0);
    expect(component.query.take).toBe(10);
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toEqual([
      'user',
      'device',
      'ipAddress',
      'status',
      'createdAt',
      'lastUsed',
      'expiresAt',
      'actions'
    ]);
  });

  it('should load total active sessions count', () => {
    mockSessionApi.getAllSessions.and.returnValue(
      of({ data: [], total: 42 })
    );
    component.loadItems();
    expect(mockSessionApi.getAllSessions).toHaveBeenCalledWith({ skip: 0, take: 0, isRevoked: false });
  });

  it('should load total revoked sessions count', () => {
    mockSessionApi.getAllSessions.and.returnValue(
      of({ data: [], total: 15 })
    );
    component.loadItems();
    expect(mockSessionApi.getAllSessions).toHaveBeenCalledWith({ skip: 0, take: 0, isRevoked: true });
  });

  it('should detect expired sessions', () => {
    const pastDate = new Date(Date.now() - 10000).toISOString();
    const futureDate = new Date(Date.now() + 10000).toISOString();

    expect(component.isExpired(pastDate)).toBe(true);
    expect(component.isExpired(futureDate)).toBe(false);
  });

  it('should get correct device icon for mobile', () => {
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
    expect(component.getDeviceIcon(mobileUA)).toBe('smartphone');
  });

  it('should get correct device icon for desktop', () => {
    const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    expect(component.getDeviceIcon(desktopUA)).toBe('computer');
  });

  it('should get correct device info for Chrome', () => {
    const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124';
    expect(component.getDeviceInfo(chromeUA)).toBe('Chrome Browser');
  });

  it('should handle page change correctly', () => {
    const pageEvent = {
      pageIndex: 2,
      pageSize: 25,
      length: 100
    };

    component.onPageChange(pageEvent as any);

    expect(component.query.take).toBe(25);
    expect(component.query.skip).toBe(50);
    expect(mockSessionApi.getAllSessions).toHaveBeenCalledTimes(2); // Once on init, once on page change
  });

  it('should format date correctly', () => {
    const testDate = '2024-01-15T10:30:00Z';
    const formatted = component.formatDate(testDate);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should return "Never" for empty date', () => {
    expect(component.formatDate(undefined)).toBe('Never');
  });

  it('should call API to revoke session after confirmation', async () => {
    mockDialogService.confirm.and.returnValue(Promise.resolve(true));
    mockSessionApi.revokeSession.and.returnValue(of(undefined));

    await component.revokeSession(123);

    expect(mockDialogService.confirm).toHaveBeenCalled();
    expect(mockSessionApi.revokeSession).toHaveBeenCalledWith(123);
    expect(mockNotificationService.success).toHaveBeenCalled();
  });

  it('should not revoke session if not confirmed', async () => {
    mockDialogService.confirm.and.returnValue(Promise.resolve(false));

    await component.revokeSession(123);

    expect(mockSessionApi.revokeSession).not.toHaveBeenCalled();
  });

  it('should call API to delete session after confirmation', async () => {
    mockDialogService.confirm.and.returnValue(Promise.resolve(true));
    mockSessionApi.deleteSession.and.returnValue(of(undefined));

    await component.deleteSession(456);

    expect(mockDialogService.confirm).toHaveBeenCalled();
    expect(mockSessionApi.deleteSession).toHaveBeenCalledWith(456);
    expect(mockNotificationService.success).toHaveBeenCalled();
  });

  it('should call API to revoke all user sessions after confirmation', async () => {
    mockDialogService.confirm.and.returnValue(Promise.resolve(true));
    mockSessionApi.revokeAllUserSessions.and.returnValue(of(undefined));

    await component.revokeAllForUser('user123');

    expect(mockDialogService.confirm).toHaveBeenCalled();
    expect(mockSessionApi.revokeAllUserSessions).toHaveBeenCalledWith('user123');
    expect(mockNotificationService.success).toHaveBeenCalled();
  });

  it('should call API to cleanup expired sessions after confirmation', async () => {
    mockDialogService.confirm.and.returnValue(Promise.resolve(true));
    mockSessionApi.cleanupExpiredSessions.and.returnValue(of({ deletedCount: 10 }));

    await component.cleanupExpired();

    expect(mockDialogService.confirm).toHaveBeenCalled();
    expect(mockSessionApi.cleanupExpiredSessions).toHaveBeenCalled();
    expect(mockNotificationService.success).toHaveBeenCalledWith('10 expired sessions deleted');
  });

  it('should call API to cleanup revoked sessions after confirmation', async () => {
    mockDialogService.confirm.and.returnValue(Promise.resolve(true));
    mockSessionApi.cleanupRevokedSessions.and.returnValue(of({ deletedCount: 5 }));

    await component.cleanupRevoked();

    expect(mockDialogService.confirm).toHaveBeenCalled();
    expect(mockSessionApi.cleanupRevokedSessions).toHaveBeenCalledWith(30);
    expect(mockNotificationService.success).toHaveBeenCalledWith('5 revoked sessions deleted');
  });

  it('should handle error when loading sessions fails', () => {
    const error = new Error('Network error');
    mockSessionApi.getAllSessions.and.returnValue(
      new Observable(subscriber => subscriber.error(error))
    );

    component.loadItems();

    expect(component.error()).toBe('Failed to load sessions');
    expect(component.loading()).toBe(false);
    expect(mockNotificationService.error).toHaveBeenCalledWith('Failed to load sessions');
  });
});
