import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [ngClass]="[
        className,
        'button font_oswald',
        'button_' + buttonStyle,
        'button_' + mode,
        'font_' + fontSize,
        icon && !caption ? 'button_icon icon icon_' + iconSize : ''
      ]"
      (click)="onClick.emit()">
      {{ caption }}
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() caption?: string;
  @Input() disabled = false;
  @Input() className = '';
  @Input() buttonStyle: 'accent' | 'secondary' = 'accent';
  @Input() mode: 'default' | 'leftSkew' | 'rightSkew' = 'default';
  @Input() fontSize: 'xs' | 'm' | 'l' | 'xl' = 'l';
  @Input() icon?: any;
  @Input() iconSize: 's' | 'm' = 'm';
  @Input() type: 'button' | 'submit' = 'button';

  @Output() onClick = new EventEmitter<void>();
}
