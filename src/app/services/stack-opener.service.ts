import {ApplicationRef, Injectable, Injector, Type, ComponentRef} from '@angular/core';
import {DomPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {StackWrapperComponent} from '../components/stack-wrapper/stack-wrapper.component';

interface StackItem {
  id: string;
  portal: ComponentPortal<any>;
  ref: ComponentRef<any>;
}

@Injectable({providedIn: 'root'})
export class StackOpenerService {
  private outlet: DomPortalOutlet | null = null;
  private stack: StackItem[] = [];

  constructor(private injector: Injector, private appRef: ApplicationRef) {
  }

  private getOutlet(): DomPortalOutlet | null {
    if (!this.outlet) {
      const stackDiv = document.getElementById('stack');
      if (!stackDiv) {
        console.error('Stack container not found');
        return null;
      }
      this.outlet = new DomPortalOutlet(stackDiv, null!, this.appRef, this.injector);
    }
    return this.outlet;
  }

  open<T>(component: Type<T>, props: Partial<T> = {}, width: 'm' | 'l' = 'm'): string | null {
    const outlet = this.getOutlet();
    if (!outlet) return null;
    const id = Math.random().toString(36).substr(2, 9);
    const portal = new ComponentPortal(StackWrapperComponent);
    const ref = outlet.attachComponentPortal(portal);
    Object.assign(ref.instance, {
      component,
      props,
      width,
      close: () => this.closeById(id)
    });
    this.stack.push({id, portal, ref});
    return id;
  }

  closeById(id: string): void {
    const idx = this.stack.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.stack[idx].ref.destroy();
      this.stack.splice(idx, 1);
    }
    if (this.stack.length === 0 && this.outlet) {
      this.outlet.detach();
      this.outlet = null;
    }
  }
}
