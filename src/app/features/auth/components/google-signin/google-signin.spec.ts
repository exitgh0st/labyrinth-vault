import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleSignin } from './google-signin';

describe('GoogleSignin', () => {
  let component: GoogleSignin;
  let fixture: ComponentFixture<GoogleSignin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleSignin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleSignin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
