/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Product } from 'src/products/entities/product.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementDirection } from './enums/stock-movement-direction.enum';
import { StockMovementOrigin } from './enums/stock-movement-origin.enum';
import { StockMovementType } from './enums/stock-movement-type.enum';
import { StockMovementsService } from './stock-movements.service';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let product: Product;
  let productRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let transactionMovementRepository: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let manager: {
    getRepository: jest.Mock;
  };

  beforeEach(() => {
    product = {
      id: '102f405b-fc6f-45cd-96cf-3039786e5feb',
      stockQuantity: 5,
    } as Product;

    productRepository = {
      findOne: jest.fn().mockResolvedValue(product),
      save: jest.fn().mockImplementation((value) => Promise.resolve(value)),
    };

    transactionMovementRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((value) => value),
      save: jest
        .fn()
        .mockImplementation((value) =>
          Promise.resolve({ id: 'movement', ...value }),
        ),
    };

    manager = {
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === Product) {
          return productRepository;
        }

        if (entity === StockMovement) {
          return transactionMovementRepository;
        }

        return {
          findOneBy: jest.fn().mockResolvedValue(null),
        };
      }),
    };

    const dataSource = {
      transaction: jest
        .fn()
        .mockImplementation((callback) => callback(manager as EntityManager)),
    } as unknown as DataSource;

    service = new StockMovementsService(
      {} as Repository<StockMovement>,
      dataSource,
    );
  });

  it('registers an entry and updates the product balance atomically', async () => {
    const movement = await service.create({
      product_id: product.id,
      quantity: 3,
      type: StockMovementType.ENTRY,
      direction: StockMovementDirection.IN,
      origin: StockMovementOrigin.PURCHASE,
      operation_key: 'purchase:123',
    });

    expect(product.stockQuantity).toBe(8);
    expect(productRepository.save).toHaveBeenCalledWith(product);
    expect(transactionMovementRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        previous_balance: 5,
        resulting_balance: 8,
      }),
    );
    expect(movement.resulting_balance).toBe(8);
  });

  it('rejects an outbound movement greater than the available balance', async () => {
    await expect(
      service.create({
        product_id: product.id,
        quantity: 6,
        type: StockMovementType.EXIT,
        direction: StockMovementDirection.OUT,
        origin: StockMovementOrigin.OTHER,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(productRepository.save).not.toHaveBeenCalled();
    expect(transactionMovementRepository.save).not.toHaveBeenCalled();
  });

  it('rejects duplicate operation keys before changing the balance', async () => {
    transactionMovementRepository.findOneBy.mockResolvedValue({
      id: 'existing-movement',
    });

    await expect(
      service.create({
        product_id: product.id,
        quantity: 2,
        type: StockMovementType.ENTRY,
        direction: StockMovementDirection.IN,
        origin: StockMovementOrigin.PURCHASE,
        operation_key: 'purchase:123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(productRepository.findOne).not.toHaveBeenCalled();
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a movement type with an incompatible direction', async () => {
    await expect(
      service.create({
        product_id: product.id,
        quantity: 1,
        type: StockMovementType.ENTRY,
        direction: StockMovementDirection.OUT,
        origin: StockMovementOrigin.PURCHASE,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(manager.getRepository).not.toHaveBeenCalled();
  });
});
