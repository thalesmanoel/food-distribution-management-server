import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/reponse-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() body: CreateUserDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.create(body);
    return {
      message: 'Usuário criado com sucesso',
      data: user,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponseDto<UserResponseDto[]>> {
    const users = await this.usersService.findAll();
    return {
      message: 'Usuários encontrados com sucesso',
      data: users,
    };
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<UserResponseDto | null>> {
    const user = await this.usersService.findById(id);
    return {
      message: 'Usuário encontrado com sucesso',
      data: user,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.update(id, body);
    return {
      message: 'Usuário atualizado com sucesso',
      data: user,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.usersService.delete(id);
    return {
      message: 'Usuário deletado com sucesso',
      data: null,
    };
  }
}
