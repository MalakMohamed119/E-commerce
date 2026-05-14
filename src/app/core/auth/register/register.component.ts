import { AuthService } from './../auth.service';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LoginComponent } from '../login/login.component';

@Component({
  
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
})
export class RegisterComponent {
msgERror:string="";
isLoading:boolean=false;
success:boolean=false;
showPassword:boolean=false;
showRePassword:boolean=false;
private readonly authService= inject(AuthService);
private readonly router= inject(Router);
  registerForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(20)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)]),
    rePassword: new FormControl(null, [Validators.required]),
  }, { validators: this.confirmPassword });

 confirmPassword(group: AbstractControl) {
    let password = group.get('password')?.value;
    let rePassword = group.get('rePassword')?.value;
    return password === rePassword ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRePasswordVisibility(): void {
    this.showRePassword = !this.showRePassword;
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading=true
    this.authService.registerForm(this.registerForm.value).subscribe({
      next:(res)=>{
        console.log(res)
        if (res.message==="success"){
             setTimeout(() => {
              this.router.navigate(["/login"])

             }, 2000);
        }
        this.isLoading=false
        this.success=true
      },
      error:(err)=>{
        console.log(err)
       this.msgERror= err.error.message
       this.isLoading=false

      }
    })
    }
    else{
      this.registerForm.markAllAsTouched()
    }
  }
}
