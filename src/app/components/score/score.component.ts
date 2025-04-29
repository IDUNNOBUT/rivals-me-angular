import {Component, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NgClass, CommonModule} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule} from '@angular/forms';

export interface ScoreValue {
  kills: number;
  deaths: number;
  assists: number;
}

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [NgClass, CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ScoreComponent),
      multi: true
    }
  ],
  template: `
    <div [ngClass]="[className, 'score font_nunito', 'score_' + (readonly ? 'readonly' : 'editable')]">
      <img src="sword.svg" alt="Kills"/>
      <img src="skull.svg" alt="Deaths"/>
      <img src="assist.svg" alt="Assists"/>
      <input
        class="score__input font_xs"
        type="number"
        [ngModel]="scoreValue.kills"
        min="0"
        [disabled]="readonly || isDisabled"
        (ngModelChange)="onKillsChange($event)"/>
      <input
        class="score__input font_xs"
        type="number"
        [ngModel]="scoreValue.deaths"
        min="0"
        [disabled]="readonly || isDisabled"
        (ngModelChange)="onDeathsChange($event)"/>
      <input
        class="score__input font_xs"
        type="number"
        [ngModel]="scoreValue.assists"
        min="0"
        [disabled]="readonly || isDisabled"
        (ngModelChange)="onAssistsChange($event)"/>
    </div>
  `,
  styleUrls: ['./score.component.scss']
})
export class ScoreComponent implements ControlValueAccessor {
  @Input() className = '';
  @Input() readonly = false;

  @Output() valueChange = new EventEmitter<ScoreValue>();

  scoreValue: ScoreValue = {
    kills: 0,
    deaths: 0,
    assists: 0
  };

  isDisabled = false;

  private onChange: any = () => {
  };
  private onTouched: any = () => {
  };

  onKillsChange(value: number): void {
    this.scoreValue = {...this.scoreValue, kills: value};
    this.emitChanges();
  }

  onDeathsChange(value: number): void {
    this.scoreValue = {...this.scoreValue, deaths: value};
    this.emitChanges();
  }

  onAssistsChange(value: number): void {
    this.scoreValue = {...this.scoreValue, assists: value};
    this.emitChanges();
  }

  private emitChanges(): void {
    this.onChange(this.scoreValue);
    this.valueChange.emit(this.scoreValue);
    this.onTouched();
  }

  writeValue(value: ScoreValue): void {
    if (value) {
      this.scoreValue = value;
    }
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
