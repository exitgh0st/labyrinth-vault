import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionTimeoutWarning } from './session-timeout-warning';

describe('SessionTimeoutWarning', () => {
  let component: SessionTimeoutWarning;
  let fixture: ComponentFixture<SessionTimeoutWarning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionTimeoutWarning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionTimeoutWarning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
