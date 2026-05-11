import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { TypeDiscount } from '../enums/type-discount.enum';
import { Product } from 'src/products/entities/product.entity';
import { decimalColumn } from 'src/commons/database/columns/decimal.column';
import { AppBaseEntity } from 'src/commons/base/base.entity';

@Entity('order_items')
export class OrderItem extends AppBaseEntity {
  @Column({ ...decimalColumn, default: 0 })
  discount!: number;

  @Column({
    type: 'enum',
    enum: TypeDiscount,
    default: TypeDiscount.NONE,
  })
  type_discount!: TypeDiscount;

  @Column({ type: 'boolean', default: false })
  is_bonus!: boolean;

  @Column({ type: 'int' })
  quantity!: number;

  @Column(decimalColumn)
  price!: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'uuid' })
  product_id!: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ type: 'uuid' })
  order_id!: string;
}
