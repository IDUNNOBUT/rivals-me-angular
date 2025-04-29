import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, from, of} from 'rxjs';
import {catchError, finalize, tap} from 'rxjs/operators';

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: any;
}

@Injectable({providedIn: 'root'})
export class ApiService {
  private cache = new Map<string, any>();

  fetch<T>(apiCall: () => Promise<T>, cacheKey?: string): Observable<ApiState<T>> {
    const state$ = new BehaviorSubject<ApiState<T>>({
      data: null,
      isLoading: true,
      error: null,
    });

    if (cacheKey && this.cache.has(cacheKey)) {
      state$.next({
        data: this.cache.get(cacheKey),
        isLoading: false,
        error: null,
      });
      state$.complete();
      return state$.asObservable();
    }

    from(apiCall())
      .pipe(
        tap(response => {
          if (cacheKey) this.cache.set(cacheKey, response);
          state$.next({data: response, isLoading: false, error: null});
        }),
        catchError(error => {
          state$.next({data: null, isLoading: false, error});
          return of();
        }),
        finalize(() => state$.complete())
      )
      .subscribe();

    return state$.asObservable();
  }

  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
