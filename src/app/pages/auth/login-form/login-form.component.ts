import {Component, EventEmitter, Output, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonComponent} from '../../../components/button';
import {InputComponent} from '../../../components/input';
import {ValidatedFieldComponent} from '../../../components/validated-field';
import {LoginDto} from '../../../../DTO/Login.dto';
import {AuthApiService} from '../../../api/auth';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';

const validationMessages = {
  email: {
    required: 'Email is required',
    email: 'Please enter a valid email address'
  },
  password: {
    required: 'Password is required',
    minlength: 'Password must be at least 6 characters long'
  }
};

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    ValidatedFieldComponent
  ],
  template: `
    <form class="auth__form block" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <app-validated-field
        [control]="loginForm.get('email')"
        [validationMessages]="emailValidationMessages">
        <app-input
          caption="Email"
          placeholder="Email"
          formControlName="email">
        </app-input>
      </app-validated-field>

      <app-validated-field
        [control]="loginForm.get('password')"
        [validationMessages]="passwordValidationMessages">
        <app-input
          type="password"
          caption="Password"
          placeholder="Password"
          formControlName="password">
        </app-input>
      </app-validated-field>

      <div class="auth__form-actions">
        <app-button
          caption="&lt;"
          (onClick)="goBack()">
        </app-button>
        <app-button
          type="submit"
          caption="Log in"
          mode="leftSkew">
        </app-button>
      </div>
      <div *ngIf="error" class="auth__form-error font_warning font_l font_roboto">{{ error }}</div>
    </form>
  `,
  styles: [`
    .auth__form {
      align-items: end;

      .auth__form-actions {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }
  `]
})
export class LoginFormComponent {
  @Output() backClick = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  private userService = inject(UserService);
  private router = inject(Router);

  loginForm: FormGroup;
  error: string | null = null;

  emailValidationMessages = validationMessages.email;
  passwordValidationMessages = validationMessages.password;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const loginData: LoginDto = this.loginForm.value;

    this.authApiService.login(loginData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.accessToken);
        this.userService.setUser(response.user);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred during login';
      }
    });
  }

  goBack(): void {
    this.backClick.emit();
  }
}
