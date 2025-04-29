import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../button';
import { InputComponent } from '../input';
import { UserService } from '../../services/user.service';
import { UserApiService } from '../../api/users';
import { UserDto } from '../../../DTO/User.dto';
import { ValidatedFieldComponent } from '../validated-field';

const validationMessages = {
  name: {
    required: 'Username is required',
    minlength: 'Username must be at least 3 characters long',
    maxlength: 'Username must be no more than 20 characters long'
  },
  password: {
    required: 'Password is required',
    minlength: 'Password must be at least 6 characters long',
    maxlength: 'Password must be no more than 20 characters long'
  }
};

@Component({
  selector: 'app-user-stack',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    ValidatedFieldComponent
  ],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-stack">
      <div class="user-stack__header">
        <div class="user-stack__header-title font_accent font_xl">User Settings</div>
        <div class="user-stack__header-actions">
          <app-button
            *ngIf="edit"
            type="submit"
            [icon]="true"
            buttonStyle="secondary"
          >
            <img src="save.svg" alt="save"/>
          </app-button>
          <app-button
            *ngIf="!edit"
            [icon]="true"
            buttonStyle="secondary"
            (onClick)="toggleEdit()"
          >
            <img src="edit.svg" alt="edit"/>
          </app-button>
          <app-button
            [icon]="true"
            buttonStyle="secondary"
            (onClick)="close()"
          >
            <img src="cross.svg" alt="close"/>
          </app-button>
        </div>
      </div>

      <div class="user-stack__body">
        <app-validated-field
          [control]="userForm.get('name')"
          [validationMessages]="nameValidationMessages">
          <app-input
            caption="Username"
            placeholder="Enter your username"
            [isReadonly]="!edit"
            formControlName="name"
          ></app-input>
        </app-validated-field>

        <ng-container *ngIf="edit">
          <ng-container *ngIf="editPassword; else editPasswordButton">
            <div class="user-stack__password">
              <app-validated-field
                [control]="userForm.get('password')"
                [validationMessages]="passwordValidationMessages">
                <app-input
                  caption="Password"
                  placeholder="Enter new password"
                  type="password"
                  formControlName="password"
                ></app-input>
              </app-validated-field>

              <app-button
                caption="Cancel change"
                fontSize="xs"
                buttonStyle="secondary"
                (onClick)="togglePasswordEdit()"
              ></app-button>
            </div>
          </ng-container>

          <ng-template #editPasswordButton>
            <app-button
              class="user-stack__button"
              caption="Edit password"
              buttonStyle="secondary"
              (onClick)="togglePasswordEdit()"
            >
              <img src="edit.svg" alt="edit"/>
            </app-button>
          </ng-template>
        </ng-container>

        <app-button
          class="user-stack__button"
          buttonStyle="secondary"
          caption="Log out"
          (onClick)="logout()"
        ></app-button>

        <app-button
          class="user-stack__button"
          [icon]="true"
          buttonStyle="secondary"
          caption="Delete account"
          (onClick)="deleteAccount()"
        >
          <img src="trash.svg" alt="delete"/>
        </app-button>
      </div>
    </form>
  `,
  styleUrls: ['./user-stack.component.scss']
})
export class UserStackComponent implements OnInit {
  userForm!: FormGroup;
  edit = false;
  editPassword = false;

  // Create references to validation messages for the template
  nameValidationMessages = validationMessages.name;
  passwordValidationMessages = validationMessages.password;

  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private userApiService = inject(UserApiService);

  constructor() {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const user = this.userService.user();
    this.userForm = this.formBuilder.group({
      name: [
        user?.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20)
        ]
      ],
      password: [
        '',
        [
          Validators.minLength(6),
          Validators.maxLength(20)
        ]
      ]
    });

    if (!this.edit) {
      this.userForm.get('name')?.disable();
    }
  }

  toggleEdit(): void {
    this.edit = !this.edit;

    if (this.edit) {
      this.userForm.get('name')?.enable();
      this.editPassword = false;
    } else {
      this.userForm.get('name')?.disable();
      this.resetForm();
    }
  }

  togglePasswordEdit(): void {
    this.editPassword = !this.editPassword;

    if (this.editPassword) {
      // Add required validator when password field is active
      this.userForm.get('password')?.addValidators(Validators.required);
    } else {
      // Remove required validator when password field is not being edited
      this.userForm.get('password')?.removeValidators(Validators.required);
      this.userForm.get('password')?.reset('');
    }

    // Update validators and form state
    this.userForm.get('password')?.updateValueAndValidity();
  }

  resetForm(): void {
    const user = this.userService.user();
    this.userForm.get('name')?.setValue(user?.name || '');
    this.userForm.get('password')?.setValue('');
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const user = this.userService.user();
    const updateData: Record<string, string> = {};

    if (this.userForm.get('name')?.value !== user?.name) {
      updateData['name'] = this.userForm.get('name')?.value;
    }

    if (this.editPassword && this.userForm.get('password')?.value !== '') {
      updateData['password'] = this.userForm.get('password')?.value;
    }

    if (Object.keys(updateData).length === 0) return;

    this.userApiService.updateUser(updateData).subscribe({
      next: (user: UserDto) => {
        this.userService.setUser(user);
        this.toggleEdit();
        this.close();
      },
      error: (error) => {
        console.error('Failed to update user:', error);
        alert(error.message || 'An error occurred');
      }
    });
  }

  logout(): void {
    this.userService.logout();
    this.close();
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.userApiService.deleteUser().subscribe({
        next: () => {
          this.userService.logout();
          this.close();
        },
        error: (error) => {
          console.error('Failed to delete account:', error);
          alert(error.message || 'An error occurred');
        }
      });
    }
  }

  close(): void {
    // The close method will be injected by the stack service
  }
}
