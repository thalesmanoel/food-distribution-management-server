import { IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  sku!: string;

  @IsString()
  description!: string;

  @IsNumber()
  price?: number;

  @IsString()
  supplierId!: string;
}
