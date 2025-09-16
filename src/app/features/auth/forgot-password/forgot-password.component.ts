import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  forgotPasswordForm: FormGroup;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in, redirect to home
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        console.log('User already logged in, redirecting to home');
        this.router.navigate(['/home']);
      }
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.message = '';

      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = 'Reset code sent to your email successfully!';
          this.messageType = 'success';
          console.log('Forgot password response:', response);
          
          // Navigate to reset password page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/reset-password'], { 
              queryParams: { email: email } 
            });
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.messageType = 'error';
          
          if (error.error?.message) {
            this.message = error.error.message;
          } else {
            this.message = 'Failed to send reset code. Please try again.';
          }
          
          console.error('Forgot password error:', error);
        }
      });
    }
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }
}
