import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponse } from 'src/commons/interfaces/paginated-response.interface';
import { paginate } from 'src/commons/utils/paginate.utils';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { StockMovementQueryDto } from './dtos/stock-movement-query.dto';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementDirection } from './enums/stock-movement-direction.enum';
import { StockMovementOrigin } from './enums/stock-movement-origin.enum';
import { StockMovementType } from './enums/stock-movement-type.enum';
import { RegisterStockMovementInput } from './interfaces/register-stock-movement.interface';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementsRepository: Repository<StockMovement>,
    private dataSource: DataSource,
  ) {}

  async findAll(
    query: StockMovementQueryDto,
  ): Promise<PaginatedResponse<StockMovement>> {
    const queryBuilder = this.stockMovementsRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.order', 'order')
      .leftJoinAndSelect('movement.orderItem', 'orderItem')
      .orderBy('movement.occurred_at', 'DESC');

    if (query.product_id) {
      queryBuilder.andWhere('movement.product_id = :productId', {
        productId: query.product_id,
      });
    }

    if (query.order_id) {
      queryBuilder.andWhere('movement.order_id = :orderId', {
        orderId: query.order_id,
      });
    }

    if (query.responsible_user_id) {
      queryBuilder.andWhere(
        'movement.responsible_user_id = :responsibleUserId',
        { responsibleUserId: query.responsible_user_id },
      );
    }

    if (query.type) {
      queryBuilder.andWhere('movement.type = :type', { type: query.type });
    }

    if (query.direction) {
      queryBuilder.andWhere('movement.direction = :direction', {
        direction: query.direction,
      });
    }

    if (query.origin) {
      queryBuilder.andWhere('movement.origin = :origin', {
        origin: query.origin,
      });
    }

    if (query.occurred_from) {
      queryBuilder.andWhere('movement.occurred_at >= :occurredFrom', {
        occurredFrom: query.occurred_from,
      });
    }

    if (query.occurred_to) {
      queryBuilder.andWhere('movement.occurred_at <= :occurredTo', {
        occurredTo: query.occurred_to,
      });
    }

    return paginate(queryBuilder, query);
  }

  async findById(id: string): Promise<StockMovement> {
    const movement = await this.stockMovementsRepository.findOne({
      where: { id },
      relations: ['product', 'order', 'orderItem'],
    });

    if (!movement) {
      throw new NotFoundException('Movimentacao de estoque nao encontrada');
    }

    return movement;
  }

  async create(
    data: RegisterStockMovementInput,
    entityManager?: EntityManager,
  ): Promise<StockMovement> {
    if (entityManager) {
      return this.createWithManager(data, entityManager);
    }

    return this.dataSource.transaction((manager) =>
      this.createWithManager(data, manager),
    );
  }

  private async createWithManager(
    data: RegisterStockMovementInput,
    manager: EntityManager,
  ): Promise<StockMovement> {
    this.validateMovement(data);

    const movementRepository = manager.getRepository(StockMovement);

    if (data.operation_key) {
      const existingMovement = await movementRepository.findOneBy({
        operation_key: data.operation_key,
      });

      if (existingMovement) {
        throw new ConflictException(
          'Ja existe uma movimentacao para esta operacao',
        );
      }
    }

    const productRepository = manager.getRepository(Product);
    const product = await productRepository.findOne({
      where: { id: data.product_id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    await this.validateRelations(data, manager);

    const previousBalance = product.stockQuantity ?? 0;
    const resultingBalance =
      data.direction === StockMovementDirection.IN
        ? previousBalance + data.quantity
        : previousBalance - data.quantity;

    if (resultingBalance < 0) {
      throw new BadRequestException(
        `Estoque insuficiente. Saldo disponivel: ${previousBalance}`,
      );
    }

    product.stockQuantity = resultingBalance;
    await productRepository.save(product);

    const movement = movementRepository.create({
      ...data,
      previous_balance: previousBalance,
      resulting_balance: resultingBalance,
      source_reference_id: data.source_reference_id ?? data.order_id,
    });

    try {
      return await movementRepository.save(movement);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Ja existe uma movimentacao para esta operacao',
        );
      }

      throw error;
    }
  }

  private validateMovement(data: RegisterStockMovementInput): void {
    if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
      throw new BadRequestException(
        'A quantidade movimentada deve ser um inteiro positivo',
      );
    }

    const inboundTypes = [
      StockMovementType.ENTRY,
      StockMovementType.CANCELLATION,
      StockMovementType.RETURN,
    ];
    const outboundTypes = [
      StockMovementType.EXIT,
      StockMovementType.RESERVATION,
      StockMovementType.SEPARATION,
      StockMovementType.WRITE_OFF,
    ];

    if (
      inboundTypes.includes(data.type) &&
      data.direction !== StockMovementDirection.IN
    ) {
      throw new BadRequestException(
        'O tipo informado exige uma movimentacao de entrada',
      );
    }

    if (
      outboundTypes.includes(data.type) &&
      data.direction !== StockMovementDirection.OUT
    ) {
      throw new BadRequestException(
        'O tipo informado exige uma movimentacao de saida',
      );
    }

    if (data.origin === StockMovementOrigin.ORDER && !data.order_id) {
      throw new BadRequestException(
        'Movimentacoes originadas por pedido exigem order_id',
      );
    }

    if (data.order_item_id && !data.order_id) {
      throw new BadRequestException('order_item_id exige order_id');
    }
  }

  private async validateRelations(
    data: RegisterStockMovementInput,
    manager: EntityManager,
  ): Promise<void> {
    if (data.order_id) {
      const order = await manager.getRepository(Order).findOneBy({
        id: data.order_id,
      });

      if (!order) {
        throw new NotFoundException('Pedido nao encontrado');
      }
    }

    if (data.order_item_id) {
      const orderItem = await manager.getRepository(OrderItem).findOneBy({
        id: data.order_item_id,
      });

      if (!orderItem) {
        throw new NotFoundException('Item do pedido nao encontrado');
      }

      if (
        orderItem.order_id !== data.order_id ||
        orderItem.product_id !== data.product_id
      ) {
        throw new BadRequestException(
          'O item do pedido nao corresponde ao pedido e produto informados',
        );
      }
    }

    if (data.responsible_user_id) {
      const user = await manager.getRepository(User).findOneBy({
        id: data.responsible_user_id,
      });

      if (!user) {
        throw new NotFoundException('Usuario responsavel nao encontrado');
      }
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    return (error.driverError as { code?: string }).code === '23505';
  }
}
