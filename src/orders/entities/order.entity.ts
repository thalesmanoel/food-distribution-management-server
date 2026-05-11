import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { decimalColumn } from 'src/commons/database/columns/decimal.column';
import { User } from 'src/users/entities/user.entity';
import { StatusOrder } from '../enums/status-order.enum';
import { AppBaseEntity } from 'src/commons/base/base.entity';

@Entity('orders')
export class Order extends AppBaseEntity {
  @Column(decimalColumn)
  total!: number;

  @Column({
    type: 'enum',
    enum: StatusOrder,
    default: StatusOrder.PENDING,
  })
  status!: StatusOrder;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: ['insert', 'update'],
  })
  items!: OrderItem[];
}
