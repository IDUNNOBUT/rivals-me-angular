import {Component, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NgClass} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NgClass, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <label
      [ngClass]="[
        className,
        'input',
        'input__wrapper font_m',
        'input__wrapper_caption-' + captionPosition
      ]">
      {{ caption }}
      <input
        class="input__content font_xs font_nunito"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [readonly]="isReadonly"
        [required]="required"
        [(ngModel)]="inputValue"
        (ngModelChange)="onInputChange($event)"
        (blur)="handleBlur()"
      />
    </label>
  `,
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements ControlValueAccessor {
  @Input() className = '';
  @Input() caption?: string;
  @Input() placeholder = '';
  @Input() isReadonly = false;
  @Input() captionPosition: 'left' | 'top' = 'left';
  @Input() required = false;
  @Input() type: 'text' | 'password' | 'number' = 'text';

  @Output() valueChange = new EventEmitter<string | number>();

  inputValue: string | number = '';
  isDisabled = false;

  private onChange: any = () => {
  };
  private onTouched: any = () => {
  };

  handleBlur(): void {
    this.onTouched();
  }

  onInputChange(value: string | number) {
    if (this.type === 'number' && typeof value === 'string') {
      if (value === '') {
        this.inputValue = '';
        this.onChange('');
        this.valueChange.emit('');
      } else {
        const num = Number(value);
        if (!isNaN(num)) {
          this.inputValue = num;
          this.onChange(num);
          this.valueChange.emit(num);
        }
      }
    } else {
      this.onChange(value);
      this.valueChange.emit(value);
    }
  }

  writeValue(value: any): void {
    this.inputValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
