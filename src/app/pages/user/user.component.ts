import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MonthStatComponent} from '../../components/month-stat';
import {GameHistoryComponent} from '../../components/game-history';
import {UserApiService} from '../../api/users';
import {GameApiService} from '../../api/games';
import {UserDto} from '../../../DTO/User.dto';
import {SkeletonComponent} from '../../components/skeleton';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, MonthStatComponent, GameHistoryComponent, SkeletonComponent],
  template: `
    <div class="user">
      <div class="user__first-column">
        <section class="user__item block">
          <h2 *ngIf="!isUserLoading" class="block__title">{{ userData?.name }}</h2>
          <app-skeleton *ngIf="isUserLoading" height="m"></app-skeleton>

          <div class="user__info">
            <ng-container *ngIf="isUserLoading">
              <app-skeleton height="l"></app-skeleton>
            </ng-container>

            <ng-container *ngIf="!isUserLoading">
              <div class="user__info-item">
                <span class="user__info-label">uuid:</span>
                {{ userData?.id }}
              </div>
              <div class="user__info-item">
                <span class="user__info-label">name:</span>
                {{ userData?.name }}
              </div>
              <div class="user__info-item">
                <span class="user__info-label">email:</span>
                {{ userData?.email }}
              </div>
              <div class="user__info-item">
                <span class="user__info-label">registered:</span>
                {{ userData?.registeredAt ? (userData?.registeredAt | date) : 'N/A' }}
              </div>
            </ng-container>

            <ng-container *ngIf="isOverallLoading">
              <app-skeleton height="l"></app-skeleton>
            </ng-container>

            <ng-container *ngIf="!isOverallLoading">
              <div class="user__info-item">
                <span class="user__info-label">total games:</span>
                {{ overallData?.totalGames }}
              </div>
              <div class="user__info-item">
                <span class="user__info-label">win rate:</span>
                {{ overallData?.winRate }}
              </div>
            </ng-container>
          </div>
        </section>
        <section class="user__item block">
          <h2 class="block__title">Last month stat</h2>
          <app-month-stat [userId]="userId"></app-month-stat>
        </section>
      </div>
      <section class="user__item user__item_big block">
        <h2 class="block__title">History</h2>
        <app-game-history [userId]="userId"></app-game-history>
      </section>
    </div>
  `,
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  userId: string = '';
  userData: UserDto | null = null;
  overallData: { totalGames: number, winRate: number } | null = null;

  isUserLoading: boolean = true;
  isOverallLoading: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userApiService: UserApiService,
    private gameApiService: GameApiService
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.userId = params['id'];
      this.loadUserData();
      this.loadOverallData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.isUserLoading = true;
    this.userApiService.getUser(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userData) => {
          this.userData = userData;
          this.isUserLoading = false;
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.isUserLoading = false;
        }
      });
  }

  private loadOverallData(): void {
    this.isOverallLoading = true;
    this.gameApiService.getUserOverall(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (overallData) => {
          this.overallData = overallData;
          this.isOverallLoading = false;
        },
        error: (error) => {
          console.error('Error loading overall data:', error);
          this.isOverallLoading = false;
        }
      });
  }
}
