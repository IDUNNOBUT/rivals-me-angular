import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';

interface RequestOptions {
  headers?: HttpHeaders;
  params?: any;
  observe: 'body';
}

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  private baseURL = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  protected getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  protected get<T>(endpoint: string, options: Omit<RequestOptions, 'observe'> = {}): import('rxjs').Observable<T> {
    return this.http.get<T>(`${this.baseURL}${endpoint}`, {...options, headers: this.getHeaders(), observe: 'body'});
  }

  protected post<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'observe'> = {}): import('rxjs').Observable<T> {
    return this.http.post<T>(`${this.baseURL}${endpoint}`, data, {
      ...options,
      headers: this.getHeaders(),
      observe: 'body'
    });
  }

  protected put<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'observe'> = {}): import('rxjs').Observable<T> {
    return this.http.put<T>(`${this.baseURL}${endpoint}`, data, {
      ...options,
      headers: this.getHeaders(),
      observe: 'body'
    });
  }

  protected patch<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'observe'> = {}): import('rxjs').Observable<T> {
    return this.http.patch<T>(`${this.baseURL}${endpoint}`, data, {
      ...options,
      headers: this.getHeaders(),
      observe: 'body'
    });
  }

  protected delete<T>(endpoint: string, options: Omit<RequestOptions, 'observe'> = {}): import('rxjs').Observable<T> {
    return this.http.delete<T>(`${this.baseURL}${endpoint}`, {...options, headers: this.getHeaders(), observe: 'body'});
  }
}
