import { UserResponseDto } from 'src/users/dtos/reponse-user.dto';

export class AuthResponseDto {
  accessToken!: string;
  user!: UserResponseDto;
}
