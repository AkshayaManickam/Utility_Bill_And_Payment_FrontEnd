import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent{
  loginForm: FormGroup;
  otpForm: FormGroup;
  isOtpGenerated = false;
  generatedOtp = '';

  constructor(private fb: FormBuilder,private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    });
  }

  generateOtp() {
    if (this.loginForm.valid) {
      this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated OTP:', this.generatedOtp); // In real cases, send OTP to email
      alert(`OTP Sent: ${this.generatedOtp}`);
      this.isOtpGenerated = true;
    } else {
      alert('Enter a valid email');
    }
  }

  verifyOtp() {
    if (this.otpForm.valid && this.otpForm.value.otp === this.generatedOtp) {
      alert('Login Successful!');
      console.log('User logged in successfully');
      this.router.navigate(['/dashboard']);
    } else {
      alert('Invalid OTP! Try Again.');
    }
  }
}
