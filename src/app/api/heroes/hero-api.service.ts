import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApiService} from '../base-api.service';
import {HeroDto} from '../../../DTO/Hero.dto';

@Injectable({
  providedIn: 'root'
})
export class HeroApiService extends BaseApiService {

  getHeroes(): Observable<HeroDto[]> {
    return this.get<HeroDto[]>('/heroes');
  }
}
