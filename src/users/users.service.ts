import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashSync as bcryptHashSync } from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './entities/users.entity';
import { UserResponseDto } from './dtos/reponse-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    }));
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não existe`);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    };
  }

  async create(user: CreateUserDto): Promise<UserResponseDto> {
    const existsUserName = await this.usersRepository.findOneBy({
      name: user.name,
    });
    if (existsUserName) {
      throw new ConflictException(`Usuário com nome ${user.name} já existe`);
    }

    const existsUserEmail = await this.usersRepository.findOneBy({
      email: user.email,
    });
    if (existsUserEmail) {
      throw new ConflictException(`Usuário com email ${user.email} já existe`);
    }

    const passwordHash = bcryptHashSync(user.password, 10);
    user.password = passwordHash;

    const newUser = await this.usersRepository.save(user);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isActive: newUser.isActive,
    };
  }

  async update(id: string, user: UpdateUserDto): Promise<UserResponseDto> {
    const existsUser = await this.usersRepository.findOneBy({ id });
    if (!existsUser) {
      throw new NotFoundException(`Usuário com id ${id} não existe`);
    }

    await this.usersRepository.update(id, user);
    const updatedUser = await this.usersRepository.findOneBy({ id });

    return {
      id,
      name: updatedUser?.name || existsUser.name,
      email: updatedUser?.email || existsUser.email,
      isActive: updatedUser?.isActive ?? existsUser.isActive,
    };
  }

  async delete(id: string): Promise<void> {
    const existsUser = await this.usersRepository.findOneBy({ id });
    if (!existsUser) {
      throw new NotFoundException(`Usuário com id ${id} não existe`);
    }

    await this.usersRepository.delete(id);
  }
}
