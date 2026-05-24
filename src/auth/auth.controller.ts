import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: LoginDto,
  ): Promise<ApiResponseDto<AuthResponseDto>> {
    const auth = await this.authService.login(body);

    return {
      message: 'Login realizado com sucesso',
      data: auth,
    };
  }
}
