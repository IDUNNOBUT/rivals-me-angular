import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApiService} from '../base-api.service';
import {UserDto, UpdateUserDto} from '../../../DTO/User.dto';

@Injectable({
  providedIn: 'root'
})
export class UserApiService extends BaseApiService {

  getUser(id?: string): Observable<UserDto> {
    const endpoint = id ? `/users/${id}` : '/users';
    return this.get<UserDto>(endpoint);
  }

  updateUser(dto: UpdateUserDto): Observable<UserDto> {
    return this.patch<UserDto>('/users', dto);
  }

  deleteUser(): Observable<UserDto> {
    return this.delete<UserDto>('/users');
  }
}
