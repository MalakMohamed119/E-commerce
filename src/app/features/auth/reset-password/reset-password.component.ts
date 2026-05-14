import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  resetPasswordForm: FormGroup;
  isLoading = false;
  isResending = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  email = '';

  constructor() {
    this.resetPasswordForm = this.fb.group({
      resetCode: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      
      // If no email in query params, redirect to forgot password
      if (!this.email) {
        console.log('No email provided, redirecting to forgot password');
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.message = '';

      const resetCodeValue = this.resetPasswordForm.get('resetCode')?.value;
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;
      
      console.log('=== RESET PASSWORD ATTEMPT ===');
      console.log('Email:', this.email);
      console.log('Reset Code:', resetCodeValue);
      console.log('New Password Length:', newPassword?.length);
      
      // First verify the reset code, then proceed with password reset
      this.verifyResetCode(resetCodeValue, newPassword);
    }
  }

  private verifyResetCode(resetCodeValue: any, newPassword: string): void {
    console.log('=== STEP 1: VERIFY RESET CODE ===');
    
    const verifyPayload = {
      email: this.email,
      resetCode: resetCodeValue?.toString().trim()
    };
    
    console.log('Verify payload:', verifyPayload);
    
    // Try different verification endpoints and formats
    const verifyEndpoints = [
      'auth/verifyResetCode',
      'auth/verify-reset-code',
      'auth/verifyReset',
      'auth/verifyCode',
      'users/verifyResetCode',
      'users/verifyCode',
      'password/verifyResetCode',
      'password/verifyCode',
      'reset/verifyCode',
      'reset/verify'
    ];
    
    const verifyFormats = [
      { email: this.email, resetCode: resetCodeValue?.toString().trim() },
      { email: this.email, resetCode: parseInt(resetCodeValue?.toString().trim() || '0') },
      { email: this.email, code: resetCodeValue?.toString().trim() },
      { email: this.email, code: parseInt(resetCodeValue?.toString().trim() || '0') },
      { resetCode: resetCodeValue?.toString().trim(), email: this.email },
      { code: resetCodeValue?.toString().trim(), email: this.email },
      { resetCode: parseInt(resetCodeValue?.toString().trim() || '0'), email: this.email },
      { code: parseInt(resetCodeValue?.toString().trim() || '0'), email: this.email }
    ];
    
    this.tryVerifyCode(verifyEndpoints, verifyFormats, 0, 0, resetCodeValue, newPassword);
  }

  private tryVerifyCode(endpoints: string[], formats: any[], endpointIndex: number, formatIndex: number, resetCodeValue: any, newPassword: string): void {
    if (endpointIndex >= endpoints.length) {
      console.log('❌ All verification attempts failed, trying direct reset...');
      this.proceedWithPasswordReset(resetCodeValue, newPassword);
      return;
    }
    
    if (formatIndex >= formats.length) {
      // Try next endpoint
      this.tryVerifyCode(endpoints, formats, endpointIndex + 1, 0, resetCodeValue, newPassword);
      return;
    }
    
    const endpoint = endpoints[endpointIndex];
    const format = formats[formatIndex];
    
    console.log(`🔍 Trying verification: ${endpoint} with format ${formatIndex + 1}:`, format);
    console.log(`📡 Full URL: ${this.authService.environment.baseUrl}${endpoint}`);
    
    // Try POST first, then PUT if POST fails
    this.authService.httpClient.post(this.authService.environment.baseUrl + endpoint, format, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (verifyResponse) => {
        console.log(`✅ Reset code verification SUCCESS with POST ${endpoint}:`, verifyResponse);
        this.proceedWithPasswordReset(resetCodeValue, newPassword);
      },
      error: (verifyError) => {
        console.log(`❌ POST verification failed with ${endpoint} format ${formatIndex + 1}:`);
        console.log(`   Status: ${verifyError.status}`);
        console.log(`   Message: ${verifyError.error?.message || verifyError.message}`);
        
        // Try PUT method
        console.log(`🔄 Trying PUT method for ${endpoint}...`);
        this.authService.httpClient.put(this.authService.environment.baseUrl + endpoint, format, {
          headers: { 'Content-Type': 'application/json' }
        }).subscribe({
          next: (verifyResponse2) => {
            console.log(`✅ Reset code verification SUCCESS with PUT ${endpoint}:`, verifyResponse2);
            this.proceedWithPasswordReset(resetCodeValue, newPassword);
          },
          error: (verifyError2) => {
            console.log(`❌ PUT verification also failed with ${endpoint} format ${formatIndex + 1}:`);
            console.log(`   Status: ${verifyError2.status}`);
            console.log(`   Message: ${verifyError2.error?.message || verifyError2.message}`);
            // Try next format
            this.tryVerifyCode(endpoints, formats, endpointIndex, formatIndex + 1, resetCodeValue, newPassword);
          }
        });
      }
    });
  }

  private proceedWithPasswordReset(resetCodeValue: any, newPassword: string): void {
    console.log('=== RESET PASSWORD ===');
    
    const resetData = {
      email: this.email,
      resetCode: resetCodeValue?.toString().trim(),
      newPassword: newPassword
    };

    console.log('Reset password data being sent:', resetData);

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ RESET PASSWORD SUCCESS:', response);
        
        this.messageType = 'success';
        this.message = 'Password reset successfully! Please try logging in with your new password.';
        
        // Clear form fields
        this.resetPasswordForm.reset();
        this.resetPasswordForm.markAsUntouched();
        this.resetPasswordForm.markAsPristine();
        
        // Navigate to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.messageType = 'error';
        
        console.log('❌ Reset password FAILED:', error);
        console.log('Error details:', error.error);
        
        if (error.error?.message) {
          this.message = `Reset failed: ${error.error.message}`;
        } else {
          this.message = 'Reset code verification failed. Please check the code and try again.';
        }
      }
    });
  }

  get resetCode() {
    return this.resetPasswordForm.get('resetCode');
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  onResetCodeInput(event: any): void {
    // Only allow numbers and limit to 6 digits
    const value = event.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    this.resetPasswordForm.patchValue({ resetCode: value });
    console.log('Reset code input:', value);
  }

  resendCode(): void {
    if (!this.email || this.isResending) {
      return;
    }

    this.isResending = true;
    this.message = '';

    console.log('=== RESENDING RESET CODE ===');
    console.log('Email:', this.email);

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isResending = false;
        this.messageType = 'success';
        this.message = 'Reset code sent successfully! Please check your email.';
        console.log('✅ Resend code successful:', response);
      },
      error: (error) => {
        this.isResending = false;
        this.messageType = 'error';
        
        if (error.error?.message) {
          this.message = `Failed to resend code: ${error.error.message}`;
        } else {
          this.message = 'Failed to resend reset code. Please try again.';
        }
        
        console.error('❌ Resend code failed:', error);
      }
    });
  }
}
