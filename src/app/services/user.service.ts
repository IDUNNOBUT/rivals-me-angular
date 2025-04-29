import {Injectable, computed, signal} from '@angular/core';
import {UserDto} from '../../DTO/User.dto';
import {UserApiService} from '../api/users';
import {Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable, catchError, map, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly _user = signal<UserDto | null>(null);

  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._user());
  readonly userId = computed(() => this._user()?.id);
  readonly userName = computed(() => this._user()?.name);

  constructor(
    private userApiService: UserApiService,
    private router: Router
  ) {
    this.initUser();
  }

  private initUser(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.userApiService.getUser()
        .pipe(
          takeUntilDestroyed(),
          catchError(() => {
            this.logout();
            return of(null);
          })
        )
        .subscribe(user => {
          if (user) {
            this._user.set(user);
          }
        });
    }
  }

  setUser(user: UserDto): void {
    this._user.set(user);
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

  checkAuth(): Observable<boolean> {
    if (this.isAuthenticated()) {
      return of(true);
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return of(false);
    }

    return this.userApiService.getUser().pipe(
      map(user => {
        this._user.set(user);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }
}
