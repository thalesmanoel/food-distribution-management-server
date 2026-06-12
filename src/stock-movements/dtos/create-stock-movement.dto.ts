import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { StockMovementDirection } from '../enums/stock-movement-direction.enum';
import { StockMovementOrigin } from '../enums/stock-movement-origin.enum';
import { StockMovementType } from '../enums/stock-movement-type.enum';

export class CreateStockMovementDto {
  @IsUUID()
  product_id!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsEnum(StockMovementType)
  type!: StockMovementType;

  @IsEnum(StockMovementDirection)
  direction!: StockMovementDirection;

  @IsEnum(StockMovementOrigin)
  origin!: StockMovementOrigin;

  @IsOptional()
  @IsUUID()
  order_id?: string;

  @IsOptional()
  @IsUUID()
  order_item_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  source_reference_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  operation_key?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
