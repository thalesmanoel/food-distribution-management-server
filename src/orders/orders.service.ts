import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { StockMovementsService } from 'src/stock-movements/stock-movements.service';
import { StockMovementType } from 'src/stock-movements/enums/stock-movement-type.enum';
import { StockMovementDirection } from 'src/stock-movements/enums/stock-movement-direction.enum';
import { StockMovementOrigin } from 'src/stock-movements/enums/stock-movement-origin.enum';
import { StatusOrder } from './enums/status-order.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private dataSource: DataSource,
    private stockMovementsService: StockMovementsService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['items'],
    });
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  async create(data: CreateOrderDto): Promise<Order> {
    const total = data.items.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity;

      const discount = item.discount || 0;

      return acc + (itemTotal - discount);
    }, 0);

    return this.dataSource.transaction(async (manager) => {
      const ordersRepository = manager.getRepository(Order);
      const order = ordersRepository.create({
        customer_id: data.customer_id,
        user_id: data.user_id,
        status: data.status,
        total,
        items: data.items,
      });

      const savedOrder = await ordersRepository.save(order);
      const movementType = this.getOrderMovementType(savedOrder.status);

      if (movementType) {
        await this.moveOrderItems(savedOrder, movementType, manager);
      }

      return savedOrder;
    });
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const ordersRepository = manager.getRepository(Order);
      const order = await ordersRepository.findOne({
        where: { id },
        relations: ['items'],
      });

      if (!order) {
        throw new NotFoundException('Pedido nao encontrado');
      }

      if (this.getOrderMovementType(order.status)) {
        await this.cancelOrderReservations(order, manager);
      }

      await ordersRepository.delete(order.id);
    });
  }

  private getOrderMovementType(status: StatusOrder): StockMovementType | null {
    if ([StatusOrder.CANCELLED, StatusOrder.REJECTED].includes(status)) {
      return null;
    }

    if ([StatusOrder.COMPLETED, StatusOrder.DELIVERED].includes(status)) {
      return StockMovementType.EXIT;
    }

    if (status === StatusOrder.PROCESSING) {
      return StockMovementType.SEPARATION;
    }

    return StockMovementType.RESERVATION;
  }

  private async moveOrderItems(
    order: Order,
    movementType: StockMovementType,
    manager: EntityManager,
  ): Promise<void> {
    for (const item of this.getItemsInLockOrder(order)) {
      await this.stockMovementsService.create(
        {
          product_id: item.product_id,
          quantity: item.quantity,
          type: movementType,
          direction: StockMovementDirection.OUT,
          origin: StockMovementOrigin.ORDER,
          order_id: order.id,
          order_item_id: item.id,
          responsible_user_id: order.user_id,
          source_reference_id: order.id,
          operation_key: `order:${order.id}:item:${item.id}:${movementType}`,
          notes: 'Movimentacao criada na inclusao do pedido',
        },
        manager,
      );
    }
  }

  private async cancelOrderReservations(
    order: Order,
    manager: EntityManager,
  ): Promise<void> {
    for (const item of this.getItemsInLockOrder(order)) {
      await this.stockMovementsService.create(
        {
          product_id: item.product_id,
          quantity: item.quantity,
          type: StockMovementType.CANCELLATION,
          direction: StockMovementDirection.IN,
          origin: StockMovementOrigin.CANCELLATION,
          order_id: order.id,
          order_item_id: item.id,
          responsible_user_id: order.user_id,
          source_reference_id: order.id,
          operation_key: `order:${order.id}:item:${item.id}:cancellation`,
          notes: 'Reserva cancelada pela exclusao do pedido',
        },
        manager,
      );
    }
  }

  private getItemsInLockOrder(order: Order): Order['items'] {
    return [...order.items].sort((first, second) =>
      first.product_id.localeCompare(second.product_id),
    );
  }
}
