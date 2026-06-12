import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { PaginationQueryDto } from 'src/commons/dtos/pagination-query.dto';
import { PaginatedResponse } from 'src/commons/interfaces/paginated-response.interface';
import {
  ApiCreateUser,
  ApiDeleteUser,
  ApiFindAllUsers,
  ApiFindUserById,
  ApiUpdateUser,
  ApiUsersController,
} from './decorators/users-swagger.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/reponse-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@ApiUsersController()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiCreateUser()
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
  @ApiFindAllUsers()
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<ApiResponseDto<PaginatedResponse<UserResponseDto>>> {
    const users = await this.usersService.findAll(paginationDto);
    return {
      message: 'Usuários encontrados com sucesso',
      data: users,
    };
  }

  @Get(':id')
  @ApiFindUserById()
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.findById(id);
    return {
      message: 'Usuário encontrado com sucesso',
      data: user,
    };
  }

  @Put(':id')
  @ApiUpdateUser()
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
  @ApiDeleteUser()
  async delete(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.usersService.delete(id);
    return {
      message: 'Usuário deletado com sucesso',
      data: null,
    };
  }
}
