import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopListComponent } from '../../components/top-list';
import { MonthStatComponent } from '../../components/month-stat';
import { GameHistoryComponent } from '../../components/game-history';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TopListComponent, MonthStatComponent, GameHistoryComponent],
  template: `
    <div class="home">
      <div class="home__first-column">
        <section class="home__item block">
          <h2 class="block__title">Hero hot list</h2>
          <app-top-list #topList></app-top-list>
        </section>
        <section class="home__item block">
          <h2 class="block__title">Last month stat</h2>
          <app-month-stat #monthStat></app-month-stat>
        </section>
      </div>
      <section class="home__item home__item_big block">
        <h2 class="block__title">History</h2>
        <app-game-history
          class="home__history"
          [onResult]="onResultCallback">
        </app-game-history>
      </section>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private userService = inject(UserService);

  @ViewChild('topList') topListComponent!: TopListComponent;
  @ViewChild('monthStat') monthStatComponent!: MonthStatComponent;

  onResultCallback = () => {
    if (this.topListComponent) this.reloadTopList();
    if (this.monthStatComponent) this.reloadMonthStat();
  };

  private reloadTopList(): void {
    this.topListComponent.reload();
  }

  private reloadMonthStat(): void {
    this.monthStatComponent.reload();
  }
}
