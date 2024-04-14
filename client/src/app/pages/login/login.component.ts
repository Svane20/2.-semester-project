import { Component, inject, OnInit } from '@angular/core';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormField, MatInput, MatIcon, MatPrefix, MatLabel, MatSuffix, AsyncPipe, ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public hidePassword = true;

  public form: FormGroup;
  public processingRequest = new BehaviorSubject<boolean>(false);
  public requestError = new BehaviorSubject('');
  public invalidCredentials = new BehaviorSubject<boolean>(false);

  private fb = inject(FormBuilder);
  private matSnackBar = inject(MatSnackBar);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  public login(event: Event): void {
    if (this.processingRequest.getValue()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.requestError.next('');
    this.invalidCredentials.next(false);

    if (this.form.valid) {
      this.processingRequest.next(true);
      const username = this.form.get('username').value as string;
      const password = this.form.get('password').value as string;

      this.authService.login(username, password).subscribe({
        next: () => {
          this.processingRequest.next(false);
          this.matSnackBar.open('You have successfully logged in', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
          this.router.navigate(['/']);
        },
        error: err => {
          this.processingRequest.next(false);
          if (err.status === 400) {
            this.invalidCredentials.next(true);
          } else {
            this.requestError.next(err.message);
          }
        },
      });
    }
  }
}
