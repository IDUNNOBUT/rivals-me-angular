import {Component, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NgClass} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule} from '@angular/forms';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [NgClass, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true
    }
  ],
  template: `
    <label
      [ngClass]="[
        className,
        'switch',
        'switch__wrapper',
        'switch__wrapper_caption-' + captionPosition
      ]">
      {{ caption }}
      <input
        class="switch__content"
        type="checkbox"
        name="switch"
        [(ngModel)]="checked"
        (ngModelChange)="onToggle()"
        [disabled]="readonly || isDisabled"
      />
    </label>
  `,
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent implements ControlValueAccessor {
  @Input() className = '';
  @Input() caption?: string;
  @Input() captionPosition: 'left' | 'top' = 'left';
  @Input() readonly = false;

  @Output() valueChange = new EventEmitter<boolean>();

  checked = false;
  isDisabled = false;

  private onChange: any = () => {
  };
  private onTouched: any = () => {
  };

  onToggle(): void {
    if (!this.readonly && !this.isDisabled) {
      this.onChange(this.checked);
      this.valueChange.emit(this.checked);
      this.onTouched();
    }
  }

  // ControlValueAccessor interface
  writeValue(value: boolean): void {
    this.checked = !!value;
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
