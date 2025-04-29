import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { LoginDto } from '../../../DTO/Login.dto';
import { RegistrationDto } from '../../../DTO/Registration.dto';
import { AuthApiService } from '../../api/auth/auth-api.service';
import { UserService } from '../../services/user.service';
import { ButtonComponent } from '../../components/button';
import { LoginFormComponent } from './login-form';
import { RegisterFormComponent } from './register-form';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonComponent,
    LoginFormComponent,
    RegisterFormComponent,
    NgOptimizedImage
  ],
  template: `
    <div class="auth">
      <div class="auth__content">
        <div class="auth__image">
          <img height="220" width="580" [ngSrc]="'rivals-logo.webp'" alt="logo" priority />
        </div>
        
        @if (!isLoginFormVisible() && !isRegisterFormVisible()) {
          <h1 class="auth__title block font_roboto font_xl">
            <div>
              <span class="auth__title_accent font_oswald font_accent">Rivals.me</span>
              &nbsp;- сервис по отслеживанию игровой статистики в сессиях многопользовательского геройского шутера
              Marvel Rivals
            </div>
          </h1>
          <app-button
            caption="Log in"
            mode="rightSkew"
            [icon]="true"
            (onClick)="showLoginForm()">
            <img src="user.svg" alt="login"/>
          </app-button>
          <app-button
            caption="New acc"
            mode="leftSkew"
            [icon]="true"
            (onClick)="showRegisterForm()">
            <img src="new-user.svg" alt="new-acc"/>
          </app-button>
        }
        
        @if (isLoginFormVisible()) {
          <app-login-form
            (backClick)="goToDefaultScreen()">
          </app-login-form>
        }
        
        @if (isRegisterFormVisible()) {
          <app-register-form
            (backClick)="goToDefaultScreen()">
          </app-register-form>
        }
        
      </div>
      <img
        class="auth__background"
        [src]="apiUrl + '/public/background.webp'"/>
    </div>
  `,
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  private authApiService = inject(AuthApiService);
  private userService = inject(UserService);
  protected apiUrl = environment.apiUrl;
  
  private _isLoginFormVisible = signal(false);
  private _isRegisterFormVisible = signal(false);
  
  protected isLoginFormVisible = this._isLoginFormVisible.asReadonly();
  protected isRegisterFormVisible = this._isRegisterFormVisible.asReadonly();
  
  protected showLoginForm(): void {
    this._isLoginFormVisible.set(true);
    this._isRegisterFormVisible.set(false);
  }
  
  protected showRegisterForm(): void {
    this._isLoginFormVisible.set(false);
    this._isRegisterFormVisible.set(true);
  }
  
  protected goToDefaultScreen(): void {
    this._isLoginFormVisible.set(false);
    this._isRegisterFormVisible.set(false);
  }
  
  protected onLogin(loginData: LoginDto): void {
    this.authApiService.login(loginData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.accessToken);
        this.userService.setUser(response.user);
      },
      error: (error) => {
        console.error('Ошибка входа:', error);
      }
    });
  }
  
  protected onRegister(registrationData: RegistrationDto): void {
    this.authApiService.registration(registrationData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.accessToken);
        this.userService.setUser(response.user);
      },
      error: (error) => {
        console.error('Ошибка регистрации:', error);
      }
    });
  }
} 