import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

import { Customer } from '../customers/entities/customer.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { User } from '../users/entities/user.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';

import { DataSourceOptions, DataSource } from 'typeorm';

config();

const configService = new ConfigService();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.getOrThrow<string>('DB_HOST'),
  port: +configService.getOrThrow<number>('DB_PORT'),
  username: configService.getOrThrow<string>('DB_USERNAME'),
  password: configService.getOrThrow<string>('DB_PASSWORD'),
  database: configService.getOrThrow<string>('DB_NAME'),
  synchronize: false,
  entities: [
    User,
    Product,
    Customer,
    Order,
    OrderItem,
    Supplier,
    StockMovement,
  ],
  migrations: [__dirname + '/migrations/*.ts'],
};

export default new DataSource(dataSourceOptions);
