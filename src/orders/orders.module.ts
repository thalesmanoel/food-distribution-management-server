import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { StockMovementsModule } from 'src/stock-movements/stock-movements.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), StockMovementsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
