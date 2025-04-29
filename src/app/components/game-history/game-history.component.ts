import {Component, Input, OnInit, OnDestroy, inject} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GameApiService} from '../../api/games';
import {ButtonComponent} from '../button';
import {FilterComponent} from './filter';
import {PaginationComponent} from './pagination';
import {ScoreComponent, ScoreValue} from '../score';
import {SkeletonComponent} from '../skeleton';
import {StackOpenerService} from '../../services/stack-opener.service';
import {environment} from '../../../environments/environment';
import {GameDto, GameFilterDto} from '../../../DTO/Game.dto';
import {PaginationResponseDto} from '../../../DTO/Pagination.dto';
import {Subject, takeUntil} from 'rxjs';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-game-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    FilterComponent,
    PaginationComponent,
    ScoreComponent,
    SkeletonComponent,
    NgOptimizedImage
  ],
  template: `
    <div [class]="className + ' game-history'">
      <div [class]="'game-history__toolbar ' + (!userId ? 'game-history__toolbar_edit' : '')">
        <app-button
          *ngIf="!userId"
          caption="Add game"
          buttonStyle="accent"
          mode="rightSkew"
          (onClick)="openGameStack()">
        </app-button>
        <app-filter
          class="game-history__filter"
          [initialFilter]="filter"
          (filterChanged)="handleFilterChange($event)">
        </app-filter>
      </div>
      <app-pagination
        class="game-history__pagination"
        [pages]="totalPages"
        [currentPage]="page"
        (pageChanged)="setPage($event)">
      </app-pagination>
      <div class="game-history__content">
        <div class="game-history__header-row font_white font_oswald font_l">
          <div class="game-history__header">Date</div>
          <div class="game-history__header">Hero</div>
          <div class="game-history__header">Score</div>
          <div class="game-history__header">Result</div>
          <div class="game-history__header game-history__header_additional">Mode</div>
          <div class="game-history__header">Map</div>
        </div>
        <ng-container *ngIf="isLoading">
          <app-skeleton
            *ngFor="let i of [1,2,3,4,5,6]"
            [grid]="true"
            height="l">
          </app-skeleton>
        </ng-container>
        <ng-container *ngIf="!isLoading && games">
          <div
            *ngFor="let game of games"
            class="game-history__item">
            <div class="game-history__item-date font_nunito">
              <div>{{ formatDate(game.date) }}</div>
              <div>{{ game.duration }} min</div>
            </div>
            <div class="game-history__item-hero">
              <div class="game-history__item-hero-image icon icon_l">
                <img
                  width="64"
                  height="64"
                  [ngSrc]="'heroes/' + game.hero.name + '/icon/image'"
                  [alt]="game.hero.name">
              </div>
              <div class="game-history__item-hero-info game-history__item_additional">
                <div class="game-history__item-hero-name font_l">{{ game.hero.name }}</div>
                <div class="game-history__item-hero-role font_nunito">{{ game.hero.role }}</div>
              </div>
            </div>
            <div class="game-history__item-score">
              <app-score
                [readonly]="true"
                [ngModel]="{
                  kills: game.kills,
                  deaths: game.deaths,
                  assists: game.assists
                }">
              </app-score>
            </div>
            <div class="game-history__item-result">
              <div [class]="'game-history__item-result-text font_oswald font_xl ' +
                (game.win ? 'game-history__item-result-text_win font_success' : 'game-history__item-result-text_lose font_warning')">
                {{ game.win ? 'Win' : 'Lose' }}
              </div>
              <div class="game-history__item_mobile">{{ game.ranked ? 'Comp' : 'QP' }}</div>
            </div>
            <div class="game-history__item-game-mode game-history__item_additional font_oswald font_xl">
              {{ game.ranked ? 'Comp' : 'QP' }}
            </div>
            <div class="game-history__item-map">
              <div
                class="game-history__item-map-image"
                [attr.data-tooltip]="game.map.name">
                <img
                  width="160"
                  height="80"
                  [ngSrc]="'maps/' + game.map.name + '/image'"
                  priority
                  ngSrcset="400w, 600w, 800w"
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 160px"
                  [alt]="game.map.name">
              </div>
            </div>
            <div *ngIf="!userId" class="game-history__item-actions">
              <app-button
                buttonStyle="secondary"
                [icon]="true"
                (onClick)="openGameStack(game)">
                <img ngSrc="edit.svg" width="24" height="24" alt="edit"/>
              </app-button>
              <app-button
                buttonStyle="secondary"
                [icon]="true"
                (onClick)="deleteGame(game)">
                <img ngSrc="trash.svg" width="24" height="24" alt="trash"/>
              </app-button>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./game-history.component.scss']
})
export class GameHistoryComponent implements OnInit, OnDestroy {
  @Input() className = '';
  @Input() userId?: string;
  @Input() onResult?: () => void;

  apiUrl = environment.apiUrl;
  games: GameDto[] = [];
  isLoading = true;
  totalPages = 0;
  page = 1;
  filter: GameFilterDto = {};

  private destroy$ = new Subject<void>();
  private gameApiService = inject(GameApiService);
  private stackOpenerService = inject(StackOpenerService);

  ngOnInit(): void {
    this.fetchGames();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    this.fetchGames();
  }

  handleFilterChange(newFilter: GameFilterDto): void {
    this.filter = newFilter;
    this.page = 1;
    this.fetchGames();
  }

  setPage(page: number): void {
    this.page = page;
    this.fetchGames();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  fetchGames(): void {
    this.isLoading = true;

    const queryParams = {
      ...(this.userId && {id: this.userId}),
      ...this.filter,
      page: this.page,
      pageSize: PAGE_SIZE
    };

    this.gameApiService.getGames(queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginationResponseDto<GameDto[]>) => {
          this.games = response.data;
          this.totalPages = response.meta.pages;

          if (response.meta.pages && queryParams.page > response.meta.pages) {
            this.page = 1;
            this.fetchGames();
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  openGameStack(game?: GameDto): void {
    import('../game-stack').then(({ GameStackComponent }) => {
      const handleResult = () => {
        this.fetchGames();
        if (this.onResult) this.onResult();
      };

      const props = {
        game,
        onResult: handleResult
      };

      this.stackOpenerService.open(GameStackComponent, props);
    });
  }

  deleteGame(game: GameDto): void {
    this.gameApiService.deleteGame(game.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.fetchGames();
          if (this.onResult) this.onResult();
        },
        error: (error) => {
          alert(error.message || "An error occurred");
        }
      });
  }
}
