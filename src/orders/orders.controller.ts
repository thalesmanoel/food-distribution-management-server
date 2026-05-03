import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { Order } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() body: CreateOrderDto): Promise<ApiResponseDto<Order>> {
    const order = await this.ordersService.create(body);

    return {
      message: 'Pedido criado com sucesso',
      data: order,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponseDto<Order[]>> {
    const orders = await this.ordersService.findAll();

    return {
      message: 'Pedidos encontrados com sucesso',
      data: orders,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponseDto<Order>> {
    const order = await this.ordersService.findById(id);

    return {
      message: 'Pedido encontrado com sucesso',
      data: order,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.ordersService.delete(id);

    return {
      message: 'Pedido deletado com sucesso',
      data: null,
    };
  }
}
