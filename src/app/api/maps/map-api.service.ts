import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApiService} from '../base-api.service';
import {MapDto} from '../../../DTO/Map.dto';

@Injectable({
  providedIn: 'root'
})
export class MapApiService extends BaseApiService {

  getMaps(): Observable<MapDto[]> {
    return this.get<MapDto[]>('/maps');
  }
}
