import {Component, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NgClass} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [NgClass, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true
    }
  ],
  template: `
    <label
      [ngClass]="[
        className,
        'date',
        'date__wrapper',
        'date__wrapper_caption-' + captionPosition
      ]">
      {{ caption }}
      <input
        class="date__content font_xs font_nunito font_white"
        type="date"
        [readonly]="readonly"
        [disabled]="isDisabled"
        [(ngModel)]="dateValue"
        (ngModelChange)="onDateChange($event)"
        (blur)="handleBlur()"
      />
    </label>
  `,
  styleUrls: ['./date-input.component.scss']
})
export class DateInputComponent implements ControlValueAccessor {
  @Input() className = '';
  @Input() caption?: string;
  @Input() readonly = false;
  @Input() captionPosition: 'left' | 'top' = 'left';

  @Output() valueChange = new EventEmitter<string>();

  dateValue: string = '';
  isDisabled = false;

  private onChange: any = () => {
  };
  private onTouched: any = () => {
  };

  handleBlur(): void {
    this.onTouched();
  }

  onDateChange(value: string) {
    this.onChange(value);
    this.valueChange.emit(value);
  }

  writeValue(value: string): void {
    this.dateValue = value || '';
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
