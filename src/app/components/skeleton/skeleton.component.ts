import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      [ngClass]="[
        className,
        'skeleton',
        grid ? 'skeleton_grid' : '',
        height ? 'skeleton_' + height : ''
      ]">
    </div>
  `,
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent {
  @Input() className = '';
  @Input() grid = false;
  @Input() height?: 'm' | 'l';
}
