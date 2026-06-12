import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'd2f18216-cb15-4cfe-8f7b-0cc7a66dbd3a' })
  id!: string;

  @ApiProperty({ example: 'Joao Silva' })
  name!: string;

  @ApiProperty({ example: 'joao.silva@example.com' })
  email!: string;

  @ApiProperty({ example: true })
  isActive?: boolean;
}
