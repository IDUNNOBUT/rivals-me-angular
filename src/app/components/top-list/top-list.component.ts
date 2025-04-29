import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { ApiService, ApiState } from '../../services/api.service';
import { HeroTopDto } from '../../../DTO/TopList.dto';
import { Observable, firstValueFrom, BehaviorSubject, switchMap } from 'rxjs';
import { SkeletonComponent } from '../skeleton';
import { environment } from '../../../environments/environment';
import { GameApiService } from '../../api/games';

@Component({
  selector: 'app-top-list',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, NgOptimizedImage],
  templateUrl: './top-list.component.html',
  styleUrls: ['./top-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopListComponent {
  @Input() className = '';

  apiState$: Observable<ApiState<HeroTopDto[]>>;
  apiUrl = environment.apiUrl;

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(private api: ApiService, private gameApi: GameApiService) {
    this.apiState$ = this.setupApiState();
  }

  reload(): void {
    this.refreshTrigger$.next(undefined);
  }

  private setupApiState(): Observable<ApiState<HeroTopDto[]>> {
    return this.refreshTrigger$.pipe(
      switchMap(() => this.fetchTopList())
    );
  }

  private fetchTopList(): Observable<ApiState<HeroTopDto[]>> {
    return this.api.fetch<HeroTopDto[]>(
      () => firstValueFrom(this.gameApi.getHeroTop())
    );
  }
}
