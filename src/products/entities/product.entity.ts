import { AppBaseEntity } from 'src/commons/base/base.entity';
import { decimalColumn } from 'src/commons/database/columns/decimal.column';
import { Supplier } from 'src/suppliers/entities/supplier.entity';
import { Check, Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('products')
@Check('CHK_products_stock_quantity_non_negative', '"stock_quantity" >= 0')
export class Product extends AppBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  sku!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column(decimalColumn)
  price!: number;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity!: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;

  @Column({ type: 'uuid' })
  supplier_id!: string;
}
