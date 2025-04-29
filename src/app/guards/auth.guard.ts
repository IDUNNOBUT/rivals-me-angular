import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {map, tap} from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.checkAuth().pipe(
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/auth']);
      }
    })
  );
};

export const authRedirectGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.checkAuth().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        router.navigate(['']);
        return false;
      }
      return true;
    })
  );
};
