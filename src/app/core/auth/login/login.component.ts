import { subscribeOn, Subscription } from 'rxjs';
import { AuthService } from './../auth.service';
import { Component, inject } from '@angular/core';
import {  FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
})
export class LoginComponent {
  errorMessage: string = '';
  isLoading:boolean=false
  success:boolean=false
  showPassword:boolean=false
  private readonly authService= inject(AuthService)
  private readonly router= inject(Router)
  private readonly fb= inject(FormBuilder)
    loginForm: FormGroup = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)]),
    },);
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
    submitForm(): void {
      if (this.loginForm.valid) {
        this.isLoading=true
        this.authService.loginForm(this.loginForm.value).subscribe({
        next:(res)=>{
          console.log(res)
          if (res.message==="success"){
            if (res.token) {
              this.authService.saveToken(res.token);
            }
            this.success=true
            setTimeout(() => {
              this.router.navigate(["/home"])
            }, 1000);
          }
          this.isLoading=false
        },
        error:(err)=>{
          console.log(err)
         this.errorMessage = err.error.message || 'Login failed. Please try again.';
         this.isLoading=false
        }
      })
      }
      else{
        this.loginForm.markAllAsTouched()
      }
    }
  }