import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../validators/password-match-validator';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [AsyncPipe, FormsModule, MatFormField, MatIcon, MatInput, MatLabel, MatPrefix, MatSuffix, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  public hidePassword = true;
  public hideConfirmPassword = true;

  public form: FormGroup;
  public processingRequest = new BehaviorSubject<boolean>(false);
  public processingRequestError = new BehaviorSubject<string>('');
  public requestError = new BehaviorSubject<string>('');

  private fb = inject(FormBuilder);
  private matSnackBar = inject(MatSnackBar);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [passwordMatchValidator],
      },
    );
  }

  public signUp(event: Event): void {
    if (this.processingRequest.getValue()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.requestError.next('');
    this.processingRequestError.next('');

    if (this.form.valid) {
      this.processingRequest.next(true);
      const username = this.form.get('username').value as string;
      const password = this.form.get('password').value as string;

      this.authService.signUp(username, password).subscribe({
        next: () => {
          this.processingRequest.next(false);
          this.matSnackBar.open('User was successfully created and logged in', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
          this.router.navigate(['/']);
        },
        error: err => {
          this.processingRequest.next(false);
          if (err.status === 400) {
            this.processingRequestError.next(err.error?.message);
          } else {
            this.requestError.next(err.message);
          }
        },
      });
    }
  }
}
