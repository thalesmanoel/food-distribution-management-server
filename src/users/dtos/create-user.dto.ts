import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

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

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
