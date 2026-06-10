import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'joao.silva@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isActive?: boolean;
}
