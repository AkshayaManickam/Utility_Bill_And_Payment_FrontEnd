import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service'; // Import the AuthService
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  otpForm: FormGroup;
  isOtpGenerated = false;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService // Inject AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    });
  }

  generateOtp() {
    console.log('generateOtp() function is triggered'); // ✅ Debug log
    if (this.loginForm.valid) {
      this.email = this.loginForm.value.email;
  
      this.authService.generateOtp(this.email).subscribe(
        (otpResponse) => {
          if (otpResponse.message === "OTP Sent Successfully") {
            this.isOtpGenerated = true;
            
            // ✅ Auto-fill the OTP field
            this.otpForm.patchValue({ otp: otpResponse.otp });

            this.toastr.success(`OTP has been sent! OTP: ${otpResponse.otp}`, 'Success'); // ✅ Check Toastr
          } else {
            this.toastr.error(otpResponse.message, 'Error');
          }
        },
        (error) => {
          this.toastr.error('Error generating OTP. Try again!', 'Error');
        }
      );
    } else {
      this.toastr.warning('Please enter a valid email.', 'Warning');
    }
  }

  
  

  verifyOtp() {
    if (this.otpForm.valid) {
      const enteredOtp = this.otpForm.value.otp;
      this.authService.verifyOtp(this.email, enteredOtp).subscribe(
        (response) => {
          if (response.valid) {
            this.toastr.success('Login successful!', 'Success');
            this.router.navigate(['/dashboard']);
          } else {
            this.toastr.error('Invalid OTP! Try Again.', 'Error');
          }
        },
        (error) => {
          this.toastr.error('Error verifying OTP. Try again!', 'Error');
        }
      );
    } else {
      this.toastr.warning('Please enter a valid 6-digit OTP.', 'Warning');
    }
  }
}
