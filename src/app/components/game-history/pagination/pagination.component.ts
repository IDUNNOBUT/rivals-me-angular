import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="pagination" [class]="className">
      <button
        class="pagination__arrow font_white font_xs"
        (click)="handlePrevious()"
        [disabled]="currentPage <= 1">
        &lt;
      </button>

      <ng-container *ngFor="let page of visiblePages">
        <ng-container *ngIf="isEllipsis(page)">
          <span class="pagination__ellipsis font_nunito font_xs">...</span>
        </ng-container>

        <ng-container *ngIf="!isEllipsis(page)">
          <button
            class="pagination__page font_white font_xs font_nunito"
            [class.pagination__page_active]="page === currentPage"
            (click)="handlePageClick(page)">
            {{ page }}
          </button>
        </ng-container>
      </ng-container>

      <button
        class="pagination__arrow font_white font_xs"
        (click)="handleNext()"
        [disabled]="currentPage >= pages">
        &gt;
      </button>
    </div>
  `,
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() className = '';
  @Input() pages = 0;
  @Input() currentPage = 1;
  @Output() pageChanged = new EventEmitter<number>();

  visiblePages: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pages'] || changes['currentPage']) {
      this.calculateVisiblePages();
    }
  }

  handlePrevious(): void {
    if (this.currentPage > 1) {
      this.pageChanged.emit(this.currentPage - 1);
    }
  }

  handleNext(): void {
    if (this.currentPage < this.pages) {
      this.pageChanged.emit(this.currentPage + 1);
    }
  }

  handlePageClick(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.pageChanged.emit(page);
    }
  }

  isEllipsis(page: number | string): boolean {
    return page === '...';
  }

  private calculateVisiblePages(): void {
    const result: (number | string)[] = [];

    result.push(1);

    if (this.pages <= 3) {
      for (let i = 2; i <= this.pages; i++) {
        result.push(i);
      }
    } else {
      if (this.currentPage > 2) {
        if (this.currentPage > 3) {
          result.push("...");
        }
        result.push(this.currentPage - 1);
      }

      if (this.currentPage !== 1 && this.currentPage !== this.pages) {
        result.push(this.currentPage);
      }

      if (this.currentPage < this.pages - 1) {
        result.push(this.currentPage + 1);
        if (this.currentPage < this.pages - 2) {
          result.push("...");
        }
      }

      if (this.pages > 1) {
        result.push(this.pages);
      }
    }

    this.visiblePages = result;
  }
}
