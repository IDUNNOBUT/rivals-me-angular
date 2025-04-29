import {Component, EventEmitter, Output, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import {ButtonComponent} from '../../../components/button';
import {InputComponent} from '../../../components/input';
import {ValidatedFieldComponent} from '../../../components/validated-field';
import {RegistrationDto} from '../../../../DTO/Registration.dto';
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
  },
  nickname: {
    required: 'Nickname is required'
  },
  repeatPassword: {
    required: 'Please confirm your password',
    passwordMismatch: 'Passwords do not match'
  }
};

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    ValidatedFieldComponent
  ],
  template: `
    <form class="auth__form block" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <app-validated-field
        [control]="registerForm.get('nickname')"
        [validationMessages]="nicknameValidationMessages">
        <app-input
          caption="Nickname"
          placeholder="Nickname"
          formControlName="nickname">
        </app-input>
      </app-validated-field>

      <app-validated-field
        [control]="registerForm.get('password')"
        [validationMessages]="passwordValidationMessages">
        <app-input
          type="password"
          caption="Password"
          placeholder="Password"
          formControlName="password">
        </app-input>
      </app-validated-field>

      <app-validated-field
        [control]="registerForm.get('repeatPassword')"
        [validationMessages]="repeatPasswordValidationMessages">
        <app-input
          type="password"
          caption="Repeat"
          placeholder="Repeat pswrd"
          formControlName="repeatPassword">
        </app-input>
      </app-validated-field>

      <app-validated-field
        [control]="registerForm.get('email')"
        [validationMessages]="emailValidationMessages">
        <app-input
          caption="Email"
          placeholder="Email"
          formControlName="email">
        </app-input>
      </app-validated-field>

      <div class="auth__form-actions">
        <app-button
          caption="&lt;"
          (onClick)="goBack()">
        </app-button>
        <app-button
          type="submit"
          caption="Submit"
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
export class RegisterFormComponent {
  @Output() backClick = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  private userService = inject(UserService);
  private router = inject(Router);

  registerForm: FormGroup;
  error: string | null = null;

  emailValidationMessages = validationMessages.email;
  passwordValidationMessages = validationMessages.password;
  nicknameValidationMessages = validationMessages.nickname;
  repeatPasswordValidationMessages = validationMessages.repeatPassword;

  constructor() {
    this.registerForm = this.fb.group({
      nickname: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const repeatPassword = control.get('repeatPassword');

    if (password && repeatPassword && password.value !== repeatPassword.value) {
      repeatPassword.setErrors({passwordMismatch: true});
      return {passwordMismatch: true};
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    const registrationData: RegistrationDto = {
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      name: this.registerForm.get('nickname')?.value
    };

    this.authApiService.registration(registrationData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.accessToken);
        this.userService.setUser(response.user);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred during registration';
      }
    });
  }

  goBack(): void {
    this.backClick.emit();
  }
}
