import {
  Component,
  ContentChild,
  Input,
  AfterContentInit,
  ChangeDetectorRef
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AbstractControl} from '@angular/forms';
import {InputComponent} from '../input';
import {SelectorComponent} from '../selector';

@Component({
  selector: 'app-validated-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="field" [class.error]="showError">
      <ng-content></ng-content>
      <div *ngIf="showError" class="error-message font_warning">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .field {
      position: relative;
      display: inline-block;
      width: fit-content;

      &.error {
        &::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid var(--warning);
          border-radius: .625rem;
          pointer-events: none;
        }
      }
    }

    .error-message {
      position: absolute;
      top: calc(100% + .5rem);
      left: 0;
      padding: .25rem .5rem;
      background: var(--gray);
      border-radius: .5rem;
      z-index: 10;
      animation: fadeOut 0.5s ease-in-out 3s forwards;

      &::after {
        content: '';
        position: absolute;
        left: calc(50% - .25rem);
        top: -.5rem;
        width: 0;
        height: 0;
        border-left: .5rem solid transparent;
        border-right: .5rem solid transparent;
        border-bottom: .5rem solid var(--gray);
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
        visibility: hidden;
      }
    }
  `]
})
export class ValidatedFieldComponent implements AfterContentInit {
  @Input() control!: AbstractControl | null;
  @Input() validationMessages: { [key: string]: string } = {};

  @ContentChild(InputComponent) input!: InputComponent;
  @ContentChild(SelectorComponent) selector!: SelectorComponent;

  showError = false;
  errorMessage = '';

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngAfterContentInit() {
    if (!this.control) {
      console.error('No form control provided to ValidatedField');
      return;
    }

    this.control.statusChanges.subscribe(() => {
      this.checkErrors();
    });

    if (this.input) {
      const originalBlur = this.input.handleBlur;
      this.input.handleBlur = () => {
        originalBlur.call(this.input);
        this.checkErrors();
      };
    }

    if (this.selector) {
      this.selector.valueChange.subscribe(() => {
        if (this.control) {
          this.control.markAsTouched();
          this.checkErrors();
        }
      });

      const originalToggleDropdown = this.selector.toggleDropdown;
      this.selector.toggleDropdown = () => {
        originalToggleDropdown.call(this.selector);
        if (this.control && !this.control.touched) {
          this.control.markAsTouched();
          this.checkErrors();
        }
      };
    }
  }

  public checkErrors() {
    if (!this.control) return;

    if (this.control.invalid && (this.control.touched || this.control.dirty)) {
      const errors = this.control.errors;
      if (errors) {
        for (const key in errors) {
          if (this.validationMessages[key]) {
            this.errorMessage = this.validationMessages[key];
            this.showError = true;
            this.cdr.detectChanges();
            return;
          }
        }
      }
    }

    this.showError = false;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }
}
