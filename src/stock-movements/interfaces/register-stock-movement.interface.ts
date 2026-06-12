import { CreateStockMovementDto } from '../dtos/create-stock-movement.dto';

export interface RegisterStockMovementInput extends CreateStockMovementDto {
  responsible_user_id?: string;
}
