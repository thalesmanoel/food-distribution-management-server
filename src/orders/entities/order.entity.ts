import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { decimalColumn } from 'src/commons/database/columns/decimal.column';
import { User } from 'src/users/entities/user.entity';
import { StatusOrder } from '../enums/status-order.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column(decimalColumn)
  total!: number;

  @Column({
    type: 'enum',
    enum: StatusOrder,
    default: StatusOrder.PENDING,
  })
  status!: StatusOrder;

  @CreateDateColumn()
  created_at!: Date;

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
