import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  profileForm: FormGroup;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  currentUser: any = null;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    // Get current user data if available
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        console.log('Load user data response:', response);
        if (response && response.data) {
          this.currentUser = response.data;
          this.profileForm.patchValue({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || ''
          });
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        // If we can't load user data, just continue with empty form
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.message = '';

      const updateData = {
        name: this.profileForm.get('name')?.value,
        email: this.profileForm.get('email')?.value,
        phone: this.profileForm.get('phone')?.value
      };

      this.authService.updateUserData(updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = 'Profile updated successfully!';
          this.messageType = 'success';
          console.log('Profile update response:', response);
          
          // Update current user data
          if (response && response.data) {
            this.currentUser = response.data;
          } else if (response.user) {
            this.currentUser = response.user;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.messageType = 'error';
          
          if (error.error?.message) {
            this.message = error.error.message;
          } else {
            this.message = 'Failed to update profile. Please try again.';
          }
          
          console.error('Profile update error:', error);
        }
      });
    }
  }

  get name() {
    return this.profileForm.get('name');
  }

  get email() {
    return this.profileForm.get('email');
  }

  get phone() {
    return this.profileForm.get('phone');
  }
}
