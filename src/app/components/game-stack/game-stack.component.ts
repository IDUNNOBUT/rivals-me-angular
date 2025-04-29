import {Component, Input, OnInit, inject, ViewChildren, QueryList} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl} from '@angular/forms';
import {ButtonComponent} from '../button';
import {InputComponent} from '../input';
import {SwitchComponent} from '../switch';
import {DateInputComponent} from '../date-input';
import {ScoreComponent, ScoreValue} from '../score';
import {SelectorComponent, ISelectorItem} from '../selector';
import {GameApiService} from '../../api/games';
import {HeroApiService} from '../../api/heroes';
import {MapApiService} from '../../api/maps';
import {GameDto, CreateGameDto, UpdateGameDto} from '../../../DTO/Game.dto';
import {ValidatedFieldComponent} from '../validated-field';
import {environment} from '../../../environments/environment';
import {of, catchError, finalize, forkJoin,} from 'rxjs';
import {ApiService} from '../../services/api.service';

const validationMessages = {
  date: {
    required: 'Date is required',
    futureDate: 'Game date cannot be in the future'
  },
  duration: {
    required: 'Duration is required',
    min: 'Duration must be a positive number'
  },
  score: {
    required: 'Score is required',
    invalidScore: 'All score values must be non-negative numbers'
  },
  map: {
    required: 'Map is required',
    invalidSelector: 'Map selection is required'
  },
  hero: {
    required: 'Hero is required',
    invalidSelector: 'Hero selection is required'
  }
};

@Component({
  selector: 'app-game-stack',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SwitchComponent,
    DateInputComponent,
    ScoreComponent,
    SelectorComponent,
    ValidatedFieldComponent,
    NgOptimizedImage
  ],
  template: `
    <form [formGroup]="gameForm" (ngSubmit)="onSubmit()" class="game-stack">
      <div class="game-stack__header">
        <div class="game-stack__header-title font_accent font_xl">
          {{ isEditing ? 'Game Settings' : 'New Game' }}
        </div>
        <div class="game-stack__header-actions">
          <app-button
            type="submit"
            icon="true"
            buttonStyle="secondary"
            [disabled]="isEditing && !hasChanges"
          >
            <img ngSrc="save.svg" width="24" height="24" alt="save"/>
          </app-button>
          <app-button
            icon="true"
            buttonStyle="secondary"
            (onClick)="close()"
          >
            <img ngSrc="cross.svg" width="24" height="24" alt="close"/>
          </app-button>
        </div>
      </div>

      <div class="game-stack__body">
        <app-switch
          caption="Ranked"
          formControlName="ranked"
        ></app-switch>

        <app-switch
          caption="Win"
          formControlName="win"
        ></app-switch>

        <app-validated-field
          [control]="gameForm.get('date')"
          [validationMessages]="dateValidationMessages">
          <app-date-input
            formControlName="date"
          ></app-date-input>
        </app-validated-field>

        <app-validated-field
          [control]="gameForm.get('duration')"
          [validationMessages]="durationValidationMessages">
          <app-input
            class="game-stack__duration"
            type="number"
            caption="Duration"
            placeholder="Enter duration"
            formControlName="duration"
          ></app-input>
        </app-validated-field>

        <app-validated-field
          [control]="gameForm.get('score')"
          [validationMessages]="scoreValidationMessages">
          <app-score
            formControlName="score"
          ></app-score>
        </app-validated-field>

        <div class="game-stack__map-container">
          <ng-container *ngIf="gameForm.get('map')?.value?.id">
            <img
              class="game-stack__map-image"
              width="160"
              height="80"
              [ngSrc]="'maps/' + selectedMap + '/image'"
              ngSrcset="400w, 600w, 800w"
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 160px"
              [alt]="selectedMap"
            />
          </ng-container>

          <app-validated-field
            [control]="gameForm.get('map')"
            [validationMessages]="mapValidationMessages">
            <app-selector
              formControlName="map"
              [data]="maps"
              [resetValue]="resetSelectorValue"
              (valueChange)="onMapChange($event)"
            ></app-selector>
          </app-validated-field>
        </div>

        <app-validated-field
          [control]="gameForm.get('hero')"
          [validationMessages]="heroValidationMessages">
          <app-selector
            formControlName="hero"
            [data]="heroes"
            [resetValue]="resetSelectorValue"
            (valueChange)="onHeroChange($event)"
          ></app-selector>
        </app-validated-field>
      </div>

      <ng-container *ngIf="gameForm.get('hero')?.value?.id">
        <img
          class="game-stack__hero-image"
          width="676"
          height="546"
          [ngSrc]="'heroes/' + selectedHero + '/portrait/image'"
          ngSrcset="400w, 600w, 800w, 1200w"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 600px"
          [alt]="selectedHero"
        />
        <img
          class="game-stack__background"
          fill
          [ngSrc]="'heroes/' + selectedHero + '/background/image'"
          ngSrcset="400w, 600w, 800w, 1200w"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, 100vw"
          [alt]="selectedHero + ' background'"
        />
      </ng-container>
      <div *ngIf="!gameForm.get('hero')?.value?.id" class="game-stack__hero-image"></div>
    </form>
  `,
  styleUrls: ['./game-stack.component.scss']
})
export class GameStackComponent implements OnInit {
  @Input() game?: GameDto;
  @Input() onResult?: () => void;

  @ViewChildren(ValidatedFieldComponent) validatedFields!: QueryList<ValidatedFieldComponent>;

  gameForm!: FormGroup;

  maps: ISelectorItem[] = [];
  heroes: ISelectorItem[] = [];

  selectedMap: string | null = null;
  selectedHero: string | null = null;

  isEditing = false;
  hasChanges = false;
  loading = false;

  apiUrl = environment.apiUrl;

  dateValidationMessages = validationMessages.date;
  durationValidationMessages = validationMessages.duration;
  scoreValidationMessages = validationMessages.score;
  mapValidationMessages = validationMessages.map;
  heroValidationMessages = validationMessages.hero;

  resetSelectorValue: ISelectorItem = {
    id: undefined,
    name: 'Not selected'
  };

  private formBuilder = inject(FormBuilder);
  private gameApiService = inject(GameApiService);
  private heroApiService = inject(HeroApiService);
  private mapApiService = inject(MapApiService);
  private apiService = inject(ApiService);

  constructor() {
  }

  ngOnInit(): void {
    this.initForm();

    if (this.game) {
      this.isEditing = true;
    }

    this.loadData();

    this.gameForm.valueChanges.subscribe(() => {
      this.updateHasChanges();
    });
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    // Initialize with default values or values from the game if editing
    this.gameForm = this.formBuilder.group({
      date: [
        this.game?.date || today,
        [Validators.required, this.futureDateValidator]
      ],
      duration: [
        this.game?.duration || 0,
        [Validators.required, Validators.min(1)]
      ],
      ranked: [
        this.game?.ranked ?? true
      ],
      win: [
        this.game?.win ?? true
      ],
      hero: [
        this.game?.hero?.id || null,
        [this.selectorValidator]
      ],
      map: [
        this.game?.map?.id || null,
        [this.selectorValidator]
      ],
      score: [
        {
          kills: this.game?.kills || 0,
          deaths: this.game?.deaths || 0,
          assists: this.game?.assists || 0
        },
        [this.scoreValidator]
      ]
    });
  }

  private loadData(): void {
    this.loading = true;

    // Загружаем героев и карты параллельно
    forkJoin({
      heroes: this.heroApiService.getHeroes().pipe(
        catchError(error => {
          console.error('Error loading heroes:', error);
          return of([]);
        })
      ),
      maps: this.mapApiService.getMaps().pipe(
        catchError(error => {
          console.error('Error loading maps:', error);
          return of([]);
        })
      )
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: ({heroes, maps}) => {
        this.heroes = heroes.map(hero => ({id: hero.id, name: hero.name}));

        this.maps = maps.map(map => ({id: map.id, name: map.name}));

        if (this.game) {
          setTimeout(() => {
            const heroItem = this.heroes.find(h => h.id === this.game!.hero.id);
            const mapItem = this.maps.find(m => m.id === this.game!.map.id);

            if (heroItem) {
              this.gameForm.get('hero')?.setValue(heroItem);
              this.selectedHero = heroItem.name;
            }

            if (mapItem) {
              this.gameForm.get('map')?.setValue(mapItem);
              this.selectedMap = mapItem.name;
            }

            this.gameForm.updateValueAndValidity();
          }, 0);
        }
      },
      error: (error) => {
        console.error('Error loading data:', error);
      }
    });
  }

  onMapChange(item: ISelectorItem): void {
    if (item && item.name) {
      this.selectedMap = item.name;
    } else {
      this.selectedMap = null;
    }
  }

  onHeroChange(item: ISelectorItem): void {
    if (item && item.name) {
      this.selectedHero = item.name;
    } else {
      this.selectedHero = null;
    }
  }

  private updateHasChanges(): void {
    if (!this.game) {
      this.hasChanges = true;
      return;
    }

    const formValue = this.gameForm.value;
    const score = formValue.score as ScoreValue;

    const heroId = typeof formValue.hero === 'object' && formValue.hero ? formValue.hero.id : formValue.hero;
    const mapId = typeof formValue.map === 'object' && formValue.map ? formValue.map.id : formValue.map;

    this.hasChanges = (
      formValue.ranked !== this.game.ranked ||
      formValue.win !== this.game.win ||
      formValue.date !== this.game.date ||
      formValue.duration !== this.game.duration ||
      mapId !== this.game.map.id ||
      heroId !== this.game.hero.id ||
      score.kills !== this.game.kills ||
      score.deaths !== this.game.deaths ||
      score.assists !== this.game.assists
    );
  }

  futureDateValidator(control: { value: string }): { [key: string]: boolean } | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate.getTime() > today.getTime() ? {'futureDate': true} : null;
  }

  selectorValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;

    if (value === null) {
      return {'invalidSelector': true};
    }

    if (typeof value === 'object') {
      return value.id === undefined ? {'invalidSelector': true} : null;
    }

    return value === undefined ? {'invalidSelector': true} : null;
  }

  scoreValidator(control: { value: ScoreValue }): { [key: string]: boolean } | null {
    if (!control.value) return null;

    const score = control.value;

    if (
      typeof score.kills !== 'number' ||
      typeof score.deaths !== 'number' ||
      typeof score.assists !== 'number' ||
      score.kills < 0 ||
      score.deaths < 0 ||
      score.assists < 0
    ) {
      return {'invalidScore': true};
    }

    return null;
  }

  onSubmit(): void {
    if (this.gameForm.invalid) {
      Object.keys(this.gameForm.controls).forEach(key => {
        const control = this.gameForm.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
        control?.updateValueAndValidity();
      });

      this.gameForm.updateValueAndValidity();

      setTimeout(() => {
        this.validatedFields.forEach(field => {
          field.checkErrors();
        });

        Object.keys(this.gameForm.controls).forEach(key => {
          const control = this.gameForm.get(key);
          if (control?.invalid) {
            console.log(`Field ${key} is invalid with errors:`, control.errors);
          }
        });
      }, 0);

      console.log('Form is invalid:', this.gameForm.errors);
      return;
    }

    if (this.isEditing && !this.hasChanges) return;

    const formValue = this.gameForm.value;
    const score = formValue.score as ScoreValue;

    const heroId = typeof formValue.hero === 'object' ? formValue.hero?.id : formValue.hero;
    const mapId = typeof formValue.map === 'object' ? formValue.map?.id : formValue.map;

    const gameData: CreateGameDto | UpdateGameDto = {
      date: formValue.date,
      duration: formValue.duration,
      ranked: formValue.ranked,
      win: formValue.win,
      hero: heroId,
      map: mapId,
      kills: score.kills,
      deaths: score.deaths,
      assists: score.assists
    };

    if (this.isEditing && this.game) {
      this.gameApiService.updateGame(this.game.id, gameData as UpdateGameDto).subscribe({
        next: () => {
          this.onResult?.();
          this.close()
        },
        error: (error) => {
          console.error('Failed to update game:', error);
          alert(error.message || 'An error occurred');
        }
      });
    } else {
      this.gameApiService.createGame(gameData as CreateGameDto).subscribe({
        next: () => {
          this.onResult?.();
          this.close()
        },
        error: (error) => {
          console.error('Failed to create game:', error);
          alert(error.message || 'An error occurred');
        }
      });
    }
  }

  close(): void {
    // The close method will be injected by the stack service
  }
}
