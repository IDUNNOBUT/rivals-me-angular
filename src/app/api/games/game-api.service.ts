import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApiService} from '../base-api.service';
import {GameDto, CreateGameDto, UpdateGameDto, GameFilterDto} from '../../../DTO/Game.dto';
import {PaginationResponseDto, PaginationDto} from '../../../DTO/Pagination.dto';
import {HeroTopDto} from '../../../DTO/TopList.dto';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GameApiService extends BaseApiService {

  getGames(filter: GameFilterDto, pagination?: PaginationDto): Observable<PaginationResponseDto<GameDto[]>> {
    const params = new HttpParams({fromObject: {...filter, ...pagination}});
    return this.get<PaginationResponseDto<GameDto[]>>('/games', {params});
  }

  createGame(dto: CreateGameDto): Observable<GameDto> {
    return this.post<GameDto>('/games', dto, {});
  }

  updateGame(id: string, dto: UpdateGameDto): Observable<GameDto> {
    return this.patch<GameDto>(`/games/${id}`, dto, {});
  }

  deleteGame(id: string): Observable<GameDto> {
    return this.delete<GameDto>(`/games/${id}`, {});
  }

  getHeroTop(): Observable<HeroTopDto[]> {
    return this.get<HeroTopDto[]>('/games/top', {});
  }

  getUserStats(id?: string): Observable<{ labels: string[], data: number[] }> {
    const params = id ? new HttpParams().set('id', id) : undefined;
    return this.get<{ labels: string[], data: number[] }>('/games/stat', params ? {params} : {});
  }

  getUserOverall(id?: string): Observable<{ totalGames: number, winRate: number }> {
    const params = id ? new HttpParams().set('id', id) : undefined;
    return this.get<{ totalGames: number, winRate: number }>('/games/overall', params ? {params} : {});
  }
}
