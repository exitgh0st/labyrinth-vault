import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTabsModule,
  ],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss'
})
export class AdminSettings {
  private fb = inject(FormBuilder);

  isSaving = signal(false);

  systemForm: FormGroup = this.fb.group({
    siteName: ['Labyrinth Vault', Validators.required],
    maintenanceMode: [false],
    registrationEnabled: [true],
    apiRateLimit: [100, [Validators.required, Validators.min(1)]],
    sessionTimeout: [30, [Validators.required, Validators.min(1)]],
  });

  securityForm: FormGroup = this.fb.group({
    twoFactorRequired: [false],
    passwordMinLength: [8, [Validators.required, Validators.min(6)]],
    passwordExpiry: [90, [Validators.required, Validators.min(0)]],
    maxLoginAttempts: [5, [Validators.required, Validators.min(1)]],
    sessionConcurrency: [3, [Validators.required, Validators.min(1)]],
  });

  emailForm: FormGroup = this.fb.group({
    smtpHost: ['smtp.example.com', Validators.required],
    smtpPort: [587, [Validators.required, Validators.min(1)]],
    smtpUser: ['noreply@example.com', [Validators.required, Validators.email]],
    smtpFrom: ['Labyrinth Vault', Validators.required],
  });

  saveSettings(): void {
    if (this.systemForm.invalid || this.securityForm.invalid || this.emailForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    setTimeout(() => {
      console.log('System:', this.systemForm.value);
      console.log('Security:', this.securityForm.value);
      console.log('Email:', this.emailForm.value);
      this.isSaving.set(false);
    }, 1000);
  }
}
