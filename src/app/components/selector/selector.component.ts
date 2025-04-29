import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  HostListener,
  ElementRef,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {NgClass, NgIf, NgFor} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

export interface ISelectorItem {
  id: string | boolean | number | undefined;
  name: string;
}

const DEFAULT_RESET_VALUE: ISelectorItem = {
  id: undefined,
  name: "All"
};

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [NgClass, NgIf, NgFor],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorComponent),
      multi: true
    }
  ],
  template: `
    <div
      [ngClass]="[
        className,
        'selector',
        'selector__wrapper font_m',
        'selector__wrapper_caption-' + captionPosition
      ]">
      {{ caption }}
      <div
        [ngClass]="['selector__content font_xs font_nunito font_white', isOpen ? 'selector__content_open' : '']"
        (click)="toggleDropdown()">
        <span class="selector__value">{{ getSelectedItemName() }}</span>
        <img
          src="arrow.svg"
          [ngClass]="['selector__arrow', isOpen ? 'selector__arrow_open' : '']"
          alt="arrow"
        />
        <div *ngIf="isOpen" class="selector__items">
          <div
            *ngFor="let item of items"
            [title]="item.name"
            [ngClass]="['selector__item', item.id === selectedItem?.id ? 'selector__item_selected font_accent' : '']"
            (click)="selectItem(item)">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./selector.component.scss']
})
export class SelectorComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() className = '';
  @Input() caption?: string;
  @Input() captionPosition: 'left' | 'top' = 'left';
  @Input() data: ISelectorItem[] = [];
  @Input() resetValue: ISelectorItem = DEFAULT_RESET_VALUE;

  @Output() valueChange = new EventEmitter<ISelectorItem>();

  isOpen = false;
  items: ISelectorItem[] = [];
  selectedItem?: ISelectorItem;

  private onChange: any = () => {
  };
  private onTouched: any = () => {
  };

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.updateItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateItems();
    }
  }

  private updateItems(): void {
    this.items = [this.resetValue, ...this.data];

    // Preserve selected item or use reset value
    if (!this.selectedItem || !this.items.some(item => item.id === this.selectedItem?.id)) {
      this.selectedItem = this.resetValue;
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    if (!this.isOpen) {
      this.isOpen = true;
    }
  }

  selectItem(item: ISelectorItem): void {
    this.selectedItem = item;
    this.isOpen = false;
    this.onChange(item);
    this.valueChange.emit(item);
    this.onTouched();
  }

  getSelectedItemName(): string {
    return this.selectedItem?.name || this.resetValue.name;
  }

  writeValue(value: ISelectorItem | string | boolean | number | undefined): void {
    if (value === undefined || value === null) {
      this.selectedItem = this.resetValue;
      return;
    }

    if (typeof value === 'object' && 'id' in value) {
      this.selectedItem = value;
    } else {
      this.selectedItem = this.items.find(item => item.id === value) || this.resetValue;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
  }
}
