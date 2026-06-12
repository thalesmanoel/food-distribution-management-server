import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { PaginatedResponse } from 'src/commons/interfaces/paginated-response.interface';
import { CreateStockMovementDto } from './dtos/create-stock-movement.dto';
import { StockMovementQueryDto } from './dtos/stock-movement-query.dto';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementsService } from './stock-movements.service';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  async create(
    @Body() body: CreateStockMovementDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponseDto<StockMovement>> {
    const responsibleUserId = request.user?.sub;

    if (!responsibleUserId) {
      throw new UnauthorizedException('Usuario autenticado nao encontrado');
    }

    const movement = await this.stockMovementsService.create({
      ...body,
      responsible_user_id: responsibleUserId,
    });

    return {
      message: 'Movimentacao de estoque registrada com sucesso',
      data: movement,
    };
  }

  @Get()
  async findAll(
    @Query() query: StockMovementQueryDto,
  ): Promise<ApiResponseDto<PaginatedResponse<StockMovement>>> {
    const movements = await this.stockMovementsService.findAll(query);

    return {
      message: 'Movimentacoes de estoque encontradas com sucesso',
      data: movements,
    };
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<StockMovement>> {
    const movement = await this.stockMovementsService.findById(id);

    return {
      message: 'Movimentacao de estoque encontrada com sucesso',
      data: movement,
    };
  }
}
