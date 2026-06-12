import { AppBaseEntity } from 'src/commons/base/base.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Check,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { StockMovementDirection } from '../enums/stock-movement-direction.enum';
import { StockMovementOrigin } from '../enums/stock-movement-origin.enum';
import { StockMovementType } from '../enums/stock-movement-type.enum';

@Entity('stock_movements')
@Index('IDX_stock_movements_product_occurred_at', ['product_id', 'occurred_at'])
@Index('IDX_stock_movements_order_id', ['order_id'])
@Index('IDX_stock_movements_responsible_user_id', ['responsible_user_id'])
@Unique('UQ_stock_movements_operation_key', ['operation_key'])
@Check('CHK_stock_movements_quantity_positive', '"quantity" > 0')
@Check(
  'CHK_stock_movements_previous_balance_non_negative',
  '"previous_balance" >= 0',
)
@Check(
  'CHK_stock_movements_resulting_balance_non_negative',
  '"resulting_balance" >= 0',
)
@Check(
  'CHK_stock_movements_balance_calculation',
  `("direction" = 'in' AND "resulting_balance" = "previous_balance" + "quantity") OR ("direction" = 'out' AND "resulting_balance" = "previous_balance" - "quantity")`,
)
export class StockMovement extends AppBaseEntity {
  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'uuid' })
  product_id!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'enum', enum: StockMovementType })
  type!: StockMovementType;

  @Column({ type: 'enum', enum: StockMovementDirection })
  direction!: StockMovementDirection;

  @Column({ type: 'enum', enum: StockMovementOrigin })
  origin!: StockMovementOrigin;

  @Column({ name: 'previous_balance', type: 'int' })
  previous_balance!: number;

  @Column({ name: 'resulting_balance', type: 'int' })
  resulting_balance!: number;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order?: Order | null;

  @Column({ type: 'uuid', nullable: true })
  order_id?: string | null;

  @ManyToOne(() => OrderItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem?: OrderItem | null;

  @Column({ type: 'uuid', nullable: true })
  order_item_id?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'responsible_user_id' })
  responsibleUser?: User | null;

  @Column({ type: 'uuid', nullable: true })
  responsible_user_id?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source_reference_id?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  operation_key?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp' })
  occurred_at!: Date;
}
