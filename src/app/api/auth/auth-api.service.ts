import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApiService} from '../base-api.service';
import {AuthResponseDto} from '../../../DTO/AuthResponse.dto';
import {LoginDto} from '../../../DTO/Login.dto';
import {RegistrationDto} from '../../../DTO/Registration.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService extends BaseApiService {

  registration(dto: RegistrationDto): Observable<AuthResponseDto> {
    return this.post<AuthResponseDto>('/auth/registration', dto);
  }

  login(dto: LoginDto): Observable<AuthResponseDto> {
    return this.post<AuthResponseDto>('/auth/login', dto);
  }
}
