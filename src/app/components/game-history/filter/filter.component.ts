import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DateInputComponent} from '../../date-input';
import {SelectorComponent} from '../../selector';
import {ButtonComponent} from '../../button';
import {HeroApiService} from '../../../api/heroes';
import {MapApiService} from '../../../api/maps';
import {ApiService} from '../../../services/api.service';
import {GameFilterDto} from '../../../../DTO/Game.dto';
import {ISelectorItem} from '../../selector';
import {HeroDto} from '../../../../DTO/Hero.dto';
import {MapDto} from '../../../../DTO/Map.dto';
import {firstValueFrom} from 'rxjs';

const GAME_MODES = [
  {id: true, name: "Ranked"},
  {id: false, name: "QP"}
];

const RESULTS = [
  {id: true, name: "Win"},
  {id: false, name: "Lose"}
];

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DateInputComponent,
    SelectorComponent,
    ButtonComponent
  ],
  template: `
    <div class="filter" [class]="className" [formGroup]="filterForm">
      <app-date-input
        caption="Date"
        captionPosition="top"
        class="filter__item"
        formControlName="date">
      </app-date-input>

      <app-selector
        caption="Game mode"
        captionPosition="top"
        class="filter__item"
        formControlName="ranked"
        [data]="gameModes"
        [resetValue]="resetValue">
      </app-selector>

      <app-selector
        caption="Result"
        captionPosition="top"
        class="filter__item"
        formControlName="win"
        [data]="results"
        [resetValue]="resetValue">
      </app-selector>

      <app-selector
        caption="Hero"
        captionPosition="top"
        class="filter__item"
        formControlName="hero"
        [data]="heroes"
        [resetValue]="resetValue">
      </app-selector>
      <app-selector
        caption="Map"
        captionPosition="top"
        class="filter__item"
        formControlName="map"
        [data]="maps"
        [resetValue]="resetValue">
      </app-selector>

      <app-button
        class="filter__button"
        [icon]="true"
        buttonStyle="secondary"
        (onClick)="applyFilter()">
        <img src="search.svg" alt="search"/>
      </app-button>

      <app-button
        *ngIf="hasFilters"
        class="filter__button"
        [icon]="true"
        buttonStyle="secondary"
        (onClick)="clearFilters()">
        <img src="cross.svg" alt="clear"/>
      </app-button>
    </div>
  `,
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() className = '';
  @Input() initialFilter: GameFilterDto = {};
  @Output() filterChanged = new EventEmitter<GameFilterDto>();

  filterForm!: FormGroup;
  heroes: ISelectorItem[] = [];
  maps: ISelectorItem[] = [];
  gameModes = GAME_MODES;
  results = RESULTS;

  isLoadingHeroes = false;
  isLoadingMaps = false;

  resetValue: ISelectorItem = {
    id: undefined,
    name: 'Any'
  };

  constructor(
    private formBuilder: FormBuilder,
    private heroApiService: HeroApiService,
    private mapApiService: MapApiService,
    private apiService: ApiService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  get hasFilters(): boolean {
    const values = this.filterForm.value;
    return Object.values(values).some(value => value !== null && value !== undefined && value !== '');
  }

  applyFilter(): void {
    const formValue = this.filterForm.value;
    const filter: GameFilterDto = {};

    if (formValue.date) {
      filter.date = formValue.date;
    }

    if (formValue.hero) {
      filter.hero = formValue.hero.id;
    }

    if (formValue.map) {
      filter.map = formValue.map.id;
    }

    if (formValue.ranked !== null && formValue.ranked !== undefined) {
      filter.ranked = formValue.ranked;
    }

    if (formValue.win !== null && formValue.win !== undefined) {
      filter.win = formValue.win;
    }

    this.filterChanged.emit(filter);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filterChanged.emit({});
  }

  private initForm(): void {
    this.filterForm = this.formBuilder.group({
      date: [this.initialFilter.date || null],
      hero: [this.initialFilter.hero || null],
      map: [this.initialFilter.map || null],
      ranked: [this.initialFilter.ranked],
      win: [this.initialFilter.win]
    });
  }

  private loadData(): void {
    // Load heroes
    this.isLoadingHeroes = true;
    this.apiService.fetch<HeroDto[]>(
      () => firstValueFrom(this.heroApiService.getHeroes()),
      'heroes'
    ).subscribe({
      next: (heroState) => {
        if (heroState.data) {
          this.heroes = [...heroState.data.map(hero => ({
            id: hero.id,
            name: hero.name
          }))];
        }
      },
      error: (err) => {
        console.error('Error loading heroes:', err);
      },
      complete: () => {
        this.isLoadingHeroes = false;
      }
    });

    this.isLoadingMaps = true;
    this.apiService.fetch<MapDto[]>(
      () => firstValueFrom(this.mapApiService.getMaps()),
      'maps'
    ).subscribe({
      next: (mapState) => {
        if (mapState.data) {
          this.maps = [...mapState.data.map(map => ({
            id: map.id,
            name: map.name
          }))];
        }
      },
      error: (err) => {
        console.error('Error loading maps:', err);
      },
      complete: () => {
        this.isLoadingMaps = false;
      }
    });
  }
}
