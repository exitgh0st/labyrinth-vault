import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  private fb = inject(FormBuilder);

  isSaving = signal(false);

  notificationForm: FormGroup = this.fb.group({
    emailNotifications: [true],
    pushNotifications: [false],
    weeklyDigest: [true],
    securityAlerts: [true],
  });

  appearanceForm: FormGroup = this.fb.group({
    theme: ['light'],
    language: ['en'],
    density: ['comfortable'],
  });

  privacyForm: FormGroup = this.fb.group({
    profileVisibility: ['public'],
    showActivity: [true],
    allowMessages: [true],
    dataSharing: [false],
  });

  saveSettings(): void {
    this.isSaving.set(true);

    setTimeout(() => {
      console.log('Notifications:', this.notificationForm.value);
      console.log('Appearance:', this.appearanceForm.value);
      console.log('Privacy:', this.privacyForm.value);
      this.isSaving.set(false);
    }, 1000);
  }

  resetSettings(): void {
    this.notificationForm.reset({
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      securityAlerts: true,
    });
    this.appearanceForm.reset({
      theme: 'light',
      language: 'en',
      density: 'comfortable',
    });
    this.privacyForm.reset({
      profileVisibility: 'public',
      showActivity: true,
      allowMessages: true,
      dataSharing: false,
    });
  }
}
