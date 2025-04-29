import {Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SkeletonComponent} from '../skeleton';
import {ApiService, ApiState} from '../../services/api.service';
import {GameApiService} from '../../api/games';
import {environment} from '../../../environments/environment';
import {Observable, firstValueFrom, BehaviorSubject, switchMap} from 'rxjs';
import {
  ChartConfiguration,
  ChartOptions,
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController
} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

interface IResponse {
  labels: string[];
  data: number[];
}

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController
);

@Component({
  selector: 'app-month-stat',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, BaseChartDirective],
  templateUrl: './month-stat.component.html',
  styleUrls: ['./month-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthStatComponent implements OnChanges {
  @Input() className = '';
  @Input() userId?: string;

  apiState$!: Observable<ApiState<IResponse>>;
  apiUrl = environment.apiUrl;

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {duration: 0},
    plugins: {
      legend: {display: false},
      tooltip: {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim(),
        padding: 12,
        titleSpacing: 0,
        titleMarginBottom: 0,
        bodyFont: {size: 14, family: 'Roboto'},
        displayColors: false,
        callbacks: {
          title: () => '',
          label: (context: any) => `${context.label}: ${context.formattedValue}`,
        }
      }
    },
    scales: {
      x: {
        border: {display: false},
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--gray').trim(),
        },
        ticks: {display: false}
      },
      y: {
        type: 'linear',
        border: {display: false},
        grid: {
          color: (context: any) => {
            if (context.tick.value === 0) {
              return getComputedStyle(document.documentElement).getPropertyValue('--black').trim();
            }
            return getComputedStyle(document.documentElement).getPropertyValue('--gray').trim();
          }
        },
        ticks: {
          font: {family: 'Roboto', size: 14},
          stepSize: 1,
          callback: (value: any) => Math.round(Number(value))
        }
      }
    }
  };

  chartData: ChartConfiguration<'line'>['data'] = {labels: [], datasets: []};

  private userId$ = new BehaviorSubject<string | undefined>(undefined);

  constructor(private api: ApiService, private gameApi: GameApiService) {
    this.setupApiState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      this.userId$.next(this.userId);
    }
  }

  reload(): void {
    // Force a reload of the data while maintaining the current userId
    this.userId$.next(this.userId);
  }

  private setupApiState(): void {
    this.apiState$ = this.userId$.pipe(
      switchMap(userId =>
        this.api.fetch<IResponse>(
          () => firstValueFrom(this.gameApi.getUserStats(userId))
        )
      )
    );

    this.apiState$.subscribe(state => {
      if (state.data) {
        this.chartData = {
          labels: state.data.labels,
          datasets: [
            {
              data: state.data.data,
              borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
              backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            }
          ]
        };
      }
    });
  }
}
