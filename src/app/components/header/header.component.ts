import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {ButtonComponent} from '../button';
import {Location} from '@angular/common';
import {StackOpenerService} from '../../services/stack-opener.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <header class="header">
      <img
        width="95"
        height="36"
        class="header__logo"
        src="rivals-logo.webp"
        alt="logo"
        (click)="navigateToHome()">

      @if (userService.isAuthenticated() && !isAuthPath()) {
        <app-button
          caption="{{ userService.userName() }}"
          mode="leftSkew"
          (onClick)="openUserMenu()">
          <img src="user.svg" alt="user"/>
        </app-button>
      }
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  protected userService = inject(UserService);
  private router = inject(Router);
  private location = inject(Location);
  private stackService = inject(StackOpenerService);

  protected navigateToHome(): void {
    const currentPath = this.location.path();
    if (currentPath !== '/' && currentPath !== '/auth') {
      this.router.navigate(['/']);
    }
  }

  protected isAuthPath(): boolean {
    return this.location.path() === '/auth';
  }

  protected openUserMenu(): void {
    import('../user-stack').then(({ UserStackComponent }) => {
      this.stackService.open(UserStackComponent);
    });
  }
}
