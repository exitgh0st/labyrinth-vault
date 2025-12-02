import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSettings } from './admin-settings';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('AdminSettings', () => {
  let component: AdminSettings;
  let fixture: ComponentFixture<AdminSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSettings],
      providers: [provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have system form with required fields', () => {
    expect(component.systemForm.get('siteName')?.value).toBe('Labyrinth Vault');
    expect(component.systemForm.get('apiRateLimit')?.value).toBe(100);
  });

  it('should validate forms before saving', () => {
    component.systemForm.patchValue({ siteName: '' });
    component.saveSettings();
    expect(component.isSaving()).toBe(false);
  });

  it('should save settings when forms are valid', (done) => {
    spyOn(console, 'log');
    component.saveSettings();
    expect(component.isSaving()).toBe(true);

    setTimeout(() => {
      expect(component.isSaving()).toBe(false);
      expect(console.log).toHaveBeenCalled();
      done();
    }, 1100);
  });
});
