import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/reponse-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() body: CreateUserDto): Promise<void> {
    return this.usersService.create(body);
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponseDto | null> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<void> {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }
}
