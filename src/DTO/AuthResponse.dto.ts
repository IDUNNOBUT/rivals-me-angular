import {UserDto} from './User.dto';

export type AuthResponseDto = {
  accessToken: string;
  user: UserDto;
}
