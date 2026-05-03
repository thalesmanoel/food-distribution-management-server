import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  product_id!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  price!: number;

  @IsNumber()
  discount?: number;

  @IsString()
  typeDiscount?: string;

  @IsBoolean()
  isBonus?: boolean;
}

export class CreateOrderDto {
  @IsString()
  customer_id!: string;

  @IsString()
  user_id!: string;

  @IsString()
  status!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
