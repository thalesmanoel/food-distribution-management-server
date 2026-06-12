import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 'Operacao realizada com sucesso' })
  message!: string;

  @ApiProperty({ required: false })
  data?: T;
}
