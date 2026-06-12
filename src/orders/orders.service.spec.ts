/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { StatusOrder } from './enums/status-order.enum';
import { OrdersService } from './orders.service';
import { StockMovementDirection } from 'src/stock-movements/enums/stock-movement-direction.enum';
import { StockMovementType } from 'src/stock-movements/enums/stock-movement-type.enum';
import { StockMovementsService } from 'src/stock-movements/stock-movements.service';
import { DataSource, EntityManager, Repository } from 'typeorm';

describe('OrdersService stock integration', () => {
  let service: OrdersService;
  let ordersRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let stockMovementsService: {
    create: jest.Mock;
  };
  let manager: {
    getRepository: jest.Mock;
  };

  const orderData: CreateOrderDto = {
    customer_id: '9a7c524f-8750-4d24-9447-8b32ea3fcafd',
    user_id: 'bcd3acc8-c13d-40fd-a2a2-7ed15ab0e180',
    status: StatusOrder.PENDING,
    items: [
      {
        product_id: '20480e6d-eb40-4b2c-8486-cc8eb1e06e08',
        quantity: 2,
        price: 10,
        discount: 1,
      },
    ],
  };

  beforeEach(() => {
    ordersRepository = {
      create: jest.fn().mockImplementation((value) => value),
      save: jest.fn().mockImplementation((value) =>
        Promise.resolve({
          id: '5915bf24-bdc4-45d0-a33f-74fc3e5a8b50',
          ...value,
          items: value.items.map((item: object) => ({
            id: 'a27a055b-c90b-4b18-9dae-c28aa4890bf0',
            order_id: '5915bf24-bdc4-45d0-a33f-74fc3e5a8b50',
            ...item,
          })),
        }),
      ),
      findOne: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    stockMovementsService = {
      create: jest.fn().mockResolvedValue({}),
    };

    manager = {
      getRepository: jest.fn().mockReturnValue(ordersRepository),
    };

    const dataSource = {
      transaction: jest
        .fn()
        .mockImplementation((callback) => callback(manager as EntityManager)),
    } as unknown as DataSource;

    service = new OrdersService(
      {} as Repository<Order>,
      dataSource,
      stockMovementsService as unknown as StockMovementsService,
    );
  });

  it('creates a reservation movement for each order item', async () => {
    const order = await service.create(orderData);

    expect(order.total).toBe(19);
    expect(stockMovementsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        product_id: orderData.items[0].product_id,
        quantity: 2,
        type: StockMovementType.RESERVATION,
        direction: StockMovementDirection.OUT,
        order_id: order.id,
        order_item_id: order.items[0].id,
      }),
      manager,
    );
  });

  it('does not reserve stock for a rejected order', async () => {
    await service.create({
      ...orderData,
      status: StatusOrder.REJECTED,
    });

    expect(stockMovementsService.create).not.toHaveBeenCalled();
  });

  it('registers an exit for an order created as delivered', async () => {
    await service.create({
      ...orderData,
      status: StatusOrder.DELIVERED,
    });

    expect(stockMovementsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: StockMovementType.EXIT,
        direction: StockMovementDirection.OUT,
      }),
      manager,
    );
  });

  it('returns reserved stock before deleting an active order', async () => {
    const order = {
      id: '5915bf24-bdc4-45d0-a33f-74fc3e5a8b50',
      user_id: orderData.user_id,
      status: StatusOrder.PENDING,
      items: [
        {
          id: 'a27a055b-c90b-4b18-9dae-c28aa4890bf0',
          product_id: orderData.items[0].product_id,
          quantity: 2,
        },
      ],
    } as Order;
    ordersRepository.findOne.mockResolvedValue(order);

    await service.delete(order.id);

    expect(stockMovementsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: StockMovementType.CANCELLATION,
        direction: StockMovementDirection.IN,
        order_id: order.id,
      }),
      manager,
    );
    expect(ordersRepository.delete).toHaveBeenCalledWith(order.id);
  });
});
