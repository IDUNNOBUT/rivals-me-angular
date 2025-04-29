import {Component, Input, Type, ViewChild, ViewContainerRef, ComponentRef, OnInit} from '@angular/core';

@Component({
  selector: 'app-stack-wrapper',
  template: `
    <div class="stack-wrapper stack-wrapper_{{width}}">
      <ng-container #container></ng-container>
    </div>
  `,
  standalone: true,
  styleUrls: ['./stack-wrapper.component.scss']
})
export class StackWrapperComponent implements OnInit {
  @Input() component!: Type<any>;
  @Input() props: any = {};
  @Input() width: 'm' | 'l' = 'm';
  @Input() close!: () => void;

  @ViewChild('container', {read: ViewContainerRef, static: true}) container!: ViewContainerRef;
  private childRef?: ComponentRef<any>;

  ngOnInit() {
    this.container.clear();
    this.childRef = this.container.createComponent(this.component);
    Object.assign(this.childRef.instance, this.props, {close: this.close});
  }
}
