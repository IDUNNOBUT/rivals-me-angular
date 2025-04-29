import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateInputComponent } from '../date-input';
import { SelectorComponent, ISelectorItem } from '../selector';
import { SkeletonComponent } from '../skeleton';
import { SwitchComponent } from '../switch';
import { ScoreComponent, ScoreValue } from '../score';

@Component({
  selector: 'app-components-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DateInputComponent, 
    SelectorComponent, 
    SkeletonComponent, 
    SwitchComponent, 
    ScoreComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <div class="demo-container">
      <h2>Components Demo</h2>
      
      <section>
        <h3>DateInput Component</h3>
        <div class="component-row">
          <div>
            <p>Default:</p>
            <app-date-input [value]="dateValue" (valueChange)="onDateChange($event)"></app-date-input>
          </div>
          <div>
            <p>With caption (left):</p>
            <app-date-input 
              caption="Select date" 
              [value]="dateValue"
              (valueChange)="onDateChange($event)">
            </app-date-input>
          </div>
          <div>
            <p>With caption (top):</p>
            <app-date-input 
              caption="Select date" 
              captionPosition="top"
              [value]="dateValue"
              (valueChange)="onDateChange($event)">
            </app-date-input>
          </div>
          <div>
            <p>Readonly:</p>
            <app-date-input 
              [readonly]="true" 
              [value]="dateValue">
            </app-date-input>
          </div>
        </div>
      </section>
      
      <section>
        <h3>Selector Component</h3>
        <div class="component-row">
          <div>
            <p>Default:</p>
            <app-selector
              [data]="selectorItems"
              (valueChange)="onSelectorChange($event)">
            </app-selector>
          </div>
          <div>
            <p>With caption (left):</p>
            <app-selector
              caption="Choose hero"
              [data]="selectorItems"
              (valueChange)="onSelectorChange($event)">
            </app-selector>
          </div>
          <div>
            <p>With caption (top):</p>
            <app-selector
              caption="Choose hero"
              captionPosition="top"
              [data]="selectorItems"
              (valueChange)="onSelectorChange($event)">
            </app-selector>
          </div>
          <div>
            <p>With selected value:</p>
            <app-selector
              [data]="selectorItems"
              [value]="selectedItem"
              (valueChange)="onSelectorChange($event)">
            </app-selector>
          </div>
        </div>
      </section>
      
      <section>
        <h3>Skeleton Component</h3>
        <div class="component-row">
          <div style="width: 200px; height: 40px;">
            <p>Default:</p>
            <app-skeleton></app-skeleton>
          </div>
          <div style="width: 200px; height: 40px;">
            <p>Medium height:</p>
            <app-skeleton height="m"></app-skeleton>
          </div>
          <div style="width: 200px; height: 80px;">
            <p>Large height:</p>
            <app-skeleton height="l"></app-skeleton>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; width: 200px; height: 80px;">
            <p>Grid:</p>
            <app-skeleton [grid]="true"></app-skeleton>
          </div>
        </div>
      </section>
      
      <section>
        <h3>Switch Component</h3>
        <div class="component-row">
          <div>
            <p>Default ({{ switchValue ? 'On' : 'Off' }}):</p>
            <app-switch
              [checked]="switchValue"
              (valueChange)="onSwitchChange($event)">
            </app-switch>
          </div>
          <div>
            <p>With caption (left):</p>
            <app-switch
              caption="Toggle me"
              [checked]="switchValue"
              (valueChange)="onSwitchChange($event)">
            </app-switch>
          </div>
          <div>
            <p>With caption (top):</p>
            <app-switch
              caption="Toggle me"
              captionPosition="top"
              [checked]="switchValue"
              (valueChange)="onSwitchChange($event)">
            </app-switch>
          </div>
          <div>
            <p>Readonly:</p>
            <app-switch
              [readonly]="true"
              [checked]="switchValue">
            </app-switch>
          </div>
        </div>
      </section>
      
      <section>
        <h3>Score Component</h3>
        <div class="component-row">
          <div>
            <p>Editable:</p>
            <app-score
              [scoreValue]="scoreValue"
              (valueChange)="onScoreChange($event)">
            </app-score>
          </div>
          <div>
            <p>Readonly:</p>
            <app-score
              [readonly]="true"
              [scoreValue]="scoreValue">
            </app-score>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    
    h2 {
      margin-bottom: 20px;
    }
    
    h3 {
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    
    .component-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .component-row > div {
      padding: 10px;
      border: 1px dashed #ddd;
      border-radius: 5px;
    }
    
    p {
      margin-bottom: 10px;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class ComponentsDemoComponent {
  dateValue: string = new Date().toISOString().split('T')[0];
  
  selectorItems: ISelectorItem[] = [
    { id: '1', name: 'Hero 1' },
    { id: '2', name: 'Hero 2' },
    { id: '3', name: 'Hero 3' },
    { id: '4', name: 'Hero 4' }
  ];
  selectedItem: string = '1';
  
  switchValue: boolean = true;
  
  scoreValue: ScoreValue = {
    kills: 7,
    deaths: 3,
    assists: 12
  };
  
  onDateChange(value: string): void {
    console.log('Date changed:', value);
    this.dateValue = value;
  }
  
  onSelectorChange(value: ISelectorItem): void {
    console.log('Selector changed:', value);
    this.selectedItem = value.id as string;
  }
  
  onSwitchChange(value: boolean): void {
    console.log('Switch changed:', value);
    this.switchValue = value;
  }
  
  onScoreChange(value: ScoreValue): void {
    console.log('Score changed:', value);
    this.scoreValue = value;
  }
} 