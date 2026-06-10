import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/reponse-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { PaginationQueryDto } from 'src/commons/dtos/pagination-query.dto';
import { PaginatedResponse } from 'src/commons/interfaces/paginated-response.interface';
import { Public } from 'src/auth/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        message: 'Usuário criado com sucesso',
        data: {
          id: 'd2f18216-cb15-4cfe-8f7b-0cc7a66dbd3a',
          name: 'João Silva Monteiro',
          email: 'joao.silva@example.com',
          isActive: true,
        },
      },
    },
  })
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
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar usuário por ID',
  })
  @ApiParam({
    name: 'id',
    example: '123',
  })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.usersService.delete(id);
    return {
      message: 'Usuário deletado com sucesso',
      data: null,
    };
  }
}
