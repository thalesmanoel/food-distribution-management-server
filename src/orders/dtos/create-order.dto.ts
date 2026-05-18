import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { StatusOrder } from '../enums/status-order.enum';
import { TypeDiscount } from '../enums/type-discount.enum';

export class CreateOrderItemDto {
  @IsString()
  product_id!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  price!: number;

  @IsNumber()
  discount?: number;

  @IsEnum(TypeDiscount)
  typeDiscount?: TypeDiscount;

  @IsBoolean()
  isBonus?: boolean;
}

export class CreateOrderDto {
  @IsString()
  customer_id!: string;

  @IsString()
  user_id!: string;

  @IsEnum(StatusOrder)
  status!: StatusOrder;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
