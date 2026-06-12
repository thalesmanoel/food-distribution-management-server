import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/commons/dtos/pagination-query.dto';
import { StockMovementDirection } from '../enums/stock-movement-direction.enum';
import { StockMovementOrigin } from '../enums/stock-movement-origin.enum';
import { StockMovementType } from '../enums/stock-movement-type.enum';

export class StockMovementQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @IsOptional()
  @IsUUID()
  order_id?: string;

  @IsOptional()
  @IsUUID()
  responsible_user_id?: string;

  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;

  @IsOptional()
  @IsEnum(StockMovementDirection)
  direction?: StockMovementDirection;

  @IsOptional()
  @IsEnum(StockMovementOrigin)
  origin?: StockMovementOrigin;

  @IsOptional()
  @IsDateString()
  occurred_from?: string;

  @IsOptional()
  @IsDateString()
  occurred_to?: string;
}
